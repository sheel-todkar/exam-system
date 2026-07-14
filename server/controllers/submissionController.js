const Answer = require('../models/Answer');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Submission = require('../models/Submission');

async function startSubmission(req, res) {
  const { examId } = req.body;
  const exam = await Exam.findOne({ _id: examId, status: 'published' });

  if (!exam) {
    return res.status(404).json({ message: 'Published exam not found' });
  }

  const existing = await Submission.findOne({
    examId,
    studentId: req.user.id,
    status: 'draft',
  });

  if (existing && existing.expiresAt > new Date()) {
    return res.json({ submission: existing });
  }

  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + Number(exam.durationMinutes || 60) * 60 * 1000);
  const submission = await Submission.create({
    examId,
    studentId: req.user.id,
    answers: [],
    startedAt,
    expiresAt,
    status: 'draft',
  });

  return res.status(201).json({ submission });
}

async function submitAnswer(req, res) {
  const { examId, submissionId, answers = [] } = req.body;
  const parsedAnswers = typeof answers === 'string' ? JSON.parse(answers) : answers;

  if (!examId || !submissionId || !parsedAnswers.length) {
    return res.status(400).json({ message: 'Exam, student and at least one answer are required' });
  }

  const submission = await Submission.findOne({
    _id: submissionId,
    examId,
    studentId: req.user.id,
    status: 'draft',
  });

  if (!submission) {
    return res.status(404).json({ message: 'Started exam draft not found' });
  }

  if (submission.expiresAt <= new Date()) {
    return res.status(400).json({ message: 'Exam time is over. Submission is locked.' });
  }

  const questions = await Question.find({ examId }).lean();
  const answerKey = new Map(questions.map((question) => [question._id.toString(), question]));
  let score = 0;

  const uploadedImages = (req.files || []).map((file) => `/uploads/answers/${file.filename}`);
  const createdAnswers = await Answer.insertMany(
    parsedAnswers.map((answer, index) => {
      const question = answerKey.get(answer.questionId);
      const response = answer.responseOption || answer.responseText || '';
      const isCorrect = question?.correctAnswer
        ? response.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
        : undefined;
      const points = isCorrect ? Number(question.marks || 1) : 0;
      score += points;

      return {
        submissionId: submission._id,
        questionId: answer.questionId,
        responseText: answer.responseText,
        responseOption: answer.responseOption,
        imageUrls: answer.imageUrls || (uploadedImages[index] ? [uploadedImages[index]] : []),
        isCorrect,
        points,
      };
    })
  );

  submission.answers = createdAnswers.map((answer) => answer._id);
  submission.score = score;
  submission.submittedAt = new Date();
  submission.evaluationDueAt = new Date(
    submission.submittedAt.getTime() + Number(process.env.EVALUATION_LIMIT_MINUTES || 1440) * 60 * 1000
  );
  submission.status = 'submitted';
  await submission.save();

  return res.status(201).json({ submission, answers: createdAnswers });
}

async function listSubmissions(req, res) {
  const query = req.user.role === 'teacher' ? {} : { studentId: req.user.id };
  const submissions = await Submission.find(query)
    .sort({ createdAt: -1 })
    .populate('studentId', 'name email role')
    .populate('examId', 'title status')
    .populate({ path: 'answers', populate: { path: 'questionId', select: 'prompt marks' } })
    .lean();

  return res.json(submissions);
}

module.exports = {
  startSubmission,
  submitAnswer,
  listSubmissions,
};

