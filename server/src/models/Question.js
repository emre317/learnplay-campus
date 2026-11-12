import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
    grade: { type: Number, enum: [4, 5, 6, 7, 8], required: true },
    outcome: { type: String, default: '' }, // kazanım kodu
    difficulty: { type: String, enum: ['kolay', 'orta', 'zor', 'yeni-nesil'], default: 'kolay', index: true },
    text: { type: String, required: true },
    image: { type: String, default: '' },
    options: { type: [String], validate: (v) => v.length >= 2 && v.length <= 5 },
    correctIndex: { type: Number, required: true, select: false },
    solution: { type: String, default: '', select: false },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
