require('dotenv').config();

const crypto = require('crypto');
const mongoose = require('mongoose');
const Answer = require('../models/Answer');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const User = require('../models/User');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required for seeding');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  await Promise.all([
    User.deleteMany({ email: { $in: ['teacher@test.com', 'student@test.com', 'late@test.com'] } }),
    Exam.deleteMany({ title: { $in: ['Quick Science Test', 'Long Math Practice', 'Hidden Draft Exam'] } }),
  ]);
  await Submission.deleteMany({});
  await Answer.deleteMany({});

  const [teacher, student, lateStudent] = await User.insertMany([
    {
      name: 'Anita Teacher',
      email: 'teacher@test.com',
      passwordHash: hashPassword('password123'),
      role: 'teacher',
    },
    {
      name: 'Ravi Student',
      email: 'student@test.com',
      passwordHash: hashPassword('password123'),
      role: 'student',
    },
    {
      name: 'Late Student',
      email: 'late@test.com',
      passwordHash: hashPassword('password123'),
      role: 'student',
    },
  ]);

  const [scienceExam, mathExam, draftExam] = await Exam.insertMany([
    {
      title: 'Quick Science Test',
      teacherId: teacher._id,
      subject: 'Science',
      className: 'Class 8',
      durationMinutes: 2,
      totalMarks: 10,
      passingMarks: 6,
      instructions: 'Fast timer scenario. Submit before two minutes.',
      status: 'published',
    },
    {
      title: 'Long Math Practice',
      teacherId: teacher._id,
      subject: 'Math',
      className: 'Class 9',
      durationMinutes: 30,
      totalMarks: 15,
      passingMarks: 8,
      instructions: 'Normal exam scenario with text and MCQ answers.',
      status: 'published',
    },
    {
      title: 'Hidden Draft Exam',
      teacherId: teacher._id,
      subject: 'History',
      className: 'Class 7',
      durationMinutes: 20,
      totalMarks: 5,
      passingMarks: 3,
      instructions: 'Teachers can see this. Students cannot.',
      status: 'draft',
    },
  ]);

  const [scienceText, scienceMcq, mathText, mathMcq] = await Question.insertMany([
    {
      examId: scienceExam._id,
      prompt: 'Explain evaporation in two lines.',
      type: 'text',
      marks: 5,
    },
    {
      examId: scienceExam._id,
      prompt: 'Water freezes at?',
      type: 'mcq',
      options: ['0 C', '10 C', '50 C', '100 C'],
      marks: 5,
      correctAnswer: '0 C',
    },
    {
      examId: mathExam._id,
      prompt: 'Solve: 12 x 8',
      type: 'text',
      marks: 5,
    },
    {
      examId: mathExam._id,
      prompt: 'Square root of 81?',
      type: 'mcq',
      options: ['7', '8', '9', '10'],
      marks: 10,
      correctAnswer: '9',
    },
    {
      examId: draftExam._id,
      prompt: 'Draft-only question',
      type: 'text',
      marks: 5,
    },
  ]);

  const evaluatedSubmission = await Submission.create({
    examId: mathExam._id,
    studentId: student._id,
    startedAt: new Date(Date.now() - 50 * 60 * 1000),
    submittedAt: new Date(Date.now() - 30 * 60 * 1000),
    expiresAt: new Date(Date.now() - 20 * 60 * 1000),
    evaluationDueAt: new Date(Date.now() + 60 * 60 * 1000),
    score: 13,
    percentage: 87,
    grade: 'B',
    passed: true,
    teacherRemarks: 'Strong work. Review multiplication layout.',
    resultPublished: true,
    status: 'evaluated',
  });
  const evaluatedAnswers = await Answer.insertMany([
    {
      submissionId: evaluatedSubmission._id,
      questionId: mathText._id,
      responseText: '96',
      points: 4,
      remarks: 'Correct answer, show steps next time.',
    },
    {
      submissionId: evaluatedSubmission._id,
      questionId: mathMcq._id,
      responseOption: '9',
      points: 9,
      isCorrect: true,
      remarks: 'Correct.',
    },
  ]);
  evaluatedSubmission.answers = evaluatedAnswers.map((answer) => answer._id);
  await evaluatedSubmission.save();

  const overdueSubmission = await Submission.create({
    examId: scienceExam._id,
    studentId: lateStudent._id,
    startedAt: new Date(Date.now() - 60 * 60 * 1000),
    submittedAt: new Date(Date.now() - 50 * 60 * 1000),
    expiresAt: new Date(Date.now() - 58 * 60 * 1000),
    evaluationDueAt: new Date(Date.now() - 10 * 60 * 1000),
    status: 'submitted',
  });
  const overdueAnswers = await Answer.insertMany([
    {
      submissionId: overdueSubmission._id,
      questionId: scienceText._id,
      responseText: 'Evaporation changes water to vapour.',
    },
    {
      submissionId: overdueSubmission._id,
      questionId: scienceMcq._id,
      responseOption: '0 C',
    },
  ]);
  overdueSubmission.answers = overdueAnswers.map((answer) => answer._id);
  await overdueSubmission.save();

  console.log('Seed complete');
  console.log('Teacher: teacher@test.com / password123');
  console.log('Student: student@test.com / password123');
  console.log('Late student: late@test.com / password123');

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
