const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
    startedAt: { type: Date },
    submittedAt: { type: Date },
    expiresAt: { type: Date },
    evaluationDueAt: { type: Date },
    score: { type: Number },
    percentage: { type: Number },
    grade: { type: String },
    passed: { type: Boolean },
    teacherRemarks: { type: String },
    resultPublished: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'submitted', 'evaluated'], default: 'submitted' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', SubmissionSchema);

