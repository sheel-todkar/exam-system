const Answer = require('../models/Answer');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Submission = require('../models/Submission');

async function evaluateExam(req, res) {
  const { submissionId, evaluations = [], publish = false, teacherRemarks = '' } = req.body;

  if (!submissionId) {
    return res.status(400).json({ message: 'Submission id is required' });
  }

  const submission = await Submission.findById(submissionId).populate('answers');
  if (!submission) {
    return res.status(404).json({ message: 'Submission not found' });
  }

  if (submission.resultPublished) {
    return res.status(409).json({ message: 'Result is already published and cannot be republished' });
  }

  if (submission.evaluationDueAt && submission.evaluationDueAt <= new Date()) {
    return res.status(400).json({ message: 'Evaluation time limit is over' });
  }

  const [exam, questions] = await Promise.all([
    Exam.findById(submission.examId).lean(),
    Question.find({ examId: submission.examId }).lean(),
  ]);
  const answerKey = new Map(questions.map((question) => [question._id.toString(), question]));
  const evaluationMap = new Map(evaluations.map((item) => [item.answerId, item]));
  let score = 0;

  await Promise.all(
    submission.answers.map(async (answer) => {
      const question = answerKey.get(answer.questionId.toString());
      const manualEvaluation = evaluationMap.get(answer._id.toString());
      const response = answer.responseOption || answer.responseText || '';
      const isCorrect =
        manualEvaluation?.points !== undefined
          ? Number(manualEvaluation.points) > 0
          : question?.correctAnswer
            ? response.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
            : false;

      answer.isCorrect = isCorrect;
      answer.points =
        manualEvaluation?.points !== undefined
          ? Number(manualEvaluation.points)
          : isCorrect
            ? Number(question?.marks || 1)
            : 0;
      answer.remarks = manualEvaluation?.remarks || answer.remarks;
      score += answer.points;
      await answer.save();
    })
  );

  const totalMarks = questions.reduce((sum, question) => sum + Number(question.marks || 0), 0);
  submission.score = score;
  submission.percentage = totalMarks ? Math.round((score / totalMarks) * 100) : 0;
  submission.grade =
    submission.percentage >= 90
      ? 'A'
      : submission.percentage >= 75
        ? 'B'
        : submission.percentage >= 60
          ? 'C'
          : submission.percentage >= 40
            ? 'D'
            : 'F';
  submission.passed = score >= Number(exam?.passingMarks || 0);
  submission.teacherRemarks = teacherRemarks;
  submission.resultPublished = Boolean(publish);
  submission.status = 'evaluated';
  await submission.save();

  return res.json({ submission });
}

async function getResults(req, res) {
  const query =
    req.user.role === 'student'
      ? { studentId: req.user.id }
      : req.query.studentId
        ? { studentId: req.query.studentId }
        : {};
  const results = await Submission.find({ ...query, status: 'evaluated', resultPublished: true })
    .sort({ updatedAt: -1 })
    .populate('studentId', 'name email role')
    .populate('examId', 'title')
    .populate({ path: 'answers', populate: { path: 'questionId', select: 'prompt marks' } })
    .lean();

  return res.json(results);
}

module.exports = {
  evaluateExam,
  getResults,
};

