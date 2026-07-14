const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subject: { type: String },
    className: { type: String },
    description: { type: String },
    instructions: { type: String },
    examDate: { type: Date },
    durationMinutes: { type: Number, default: 60 },
    totalMarks: { type: Number, default: 0 },
    passingMarks: { type: Number, default: 0 },
    startAt: { type: Date },
    endAt: { type: Date },
    status: { type: String, enum: ['draft', 'published', 'unpublished', 'closed'], default: 'draft' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', ExamSchema);

