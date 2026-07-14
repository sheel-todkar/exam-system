const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['teacher', 'student'], default: 'student' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);

