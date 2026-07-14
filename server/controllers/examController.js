const Exam = require('../models/Exam');
const Question = require('../models/Question');

async function createExam(req, res) {
  const {
    title,
    subject,
    className,
    description,
    instructions,
    examDate,
    durationMinutes,
    totalMarks,
    passingMarks,
    startAt,
    endAt,
    status = 'draft',
    questions = [],
  } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Exam title is required' });
  }

  const calculatedTotal = questions.reduce(
    (sum, question) => sum + Number(question.marks || 0),
    0
  );
  const exam = await Exam.create({
    title,
    teacherId: req.user.id,
    subject,
    className,
    description,
    instructions,
    examDate,
    durationMinutes,
    totalMarks: Number(totalMarks || calculatedTotal),
    passingMarks: Number(passingMarks || 0),
    startAt,
    endAt,
    status,
  });
  const createdQuestions = await Question.insertMany(
    questions
      .filter((question) => question.prompt)
      .map((question) => ({
        examId: exam._id,
        prompt: question.prompt,
        type: question.type || 'mcq',
        options: question.options || [],
        marks: Number(question.marks || 1),
        correctAnswer: question.correctAnswer,
      }))
  );

  return res.status(201).json({ exam, questions: createdQuestions });
}

async function updateExam(req, res) {
  const { questions, ...examInput } = req.body;
  const exam = await Exam.findOneAndUpdate({ _id: req.params.id, teacherId: req.user.id }, examInput, {
    new: true,
    runValidators: true,
  });

  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  if (Array.isArray(questions)) {
    await Question.deleteMany({ examId: exam._id });
    await Question.insertMany(
      questions
        .filter((question) => question.prompt)
        .map((question) => ({
          examId: exam._id,
          prompt: question.prompt,
          type: question.type || 'mcq',
          options: question.options || [],
          marks: Number(question.marks || 1),
          correctAnswer: question.correctAnswer,
        }))
    );
  }

  return res.json({ exam });
}

async function deleteExam(req, res) {
  const exam = await Exam.findOneAndDelete({ _id: req.params.id, teacherId: req.user.id });

  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  await Question.deleteMany({ examId: exam._id });
  return res.status(204).send();
}

async function listExams(req, res) {
  const query =
    req.user.role === 'teacher'
      ? { teacherId: req.user.id }
      : { status: 'published' };
  const exams = await Exam.find(query).sort({ createdAt: -1 }).lean();
  const examIds = exams.map((exam) => exam._id);
  const questions = await Question.find({ examId: { $in: examIds } }).lean();

  const questionsByExam = questions.reduce((grouped, question) => {
    const key = question.examId.toString();
    grouped[key] = grouped[key] || [];
    grouped[key].push(question);
    return grouped;
  }, {});

  return res.json(
    exams.map((exam) => ({
      ...exam,
      questions: questionsByExam[exam._id.toString()] || [],
    }))
  );
}

module.exports = {
  createExam,
  deleteExam,
  listExams,
  updateExam,
};

