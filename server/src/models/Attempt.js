import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    mode: { type: String, enum: ['alistirma', 'test'], default: 'test' },
    answers: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        selected: { type: Number, default: null }, // null = boş
        correct: Boolean,
      },
    ],
    correctCount: Number,
    wrongCount: Number,
    emptyCount: Number,
    score: Number, // 0-100
    durationSec: Number,
    xpEarned: Number,
  },
  { timestamps: true }
);

export default mongoose.model('Attempt', attemptSchema);
