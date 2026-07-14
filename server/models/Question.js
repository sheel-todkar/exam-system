const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    prompt: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'text'], default: 'mcq' },
    options: [{ type: String }],
    marks: { type: Number, default: 1 },
    // For scaffolding; for production you would keep answer keys separately.
    correctAnswer: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', QuestionSchema);

