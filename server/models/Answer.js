const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema(
  {
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    responseText: { type: String },
    responseOption: { type: String },
    imageUrls: [{ type: String }],
    isCorrect: { type: Boolean },
    points: { type: Number },
    remarks: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Answer', AnswerSchema);

