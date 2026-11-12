import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema(
  {
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
    grade: { type: Number, enum: [4, 5, 6, 7, 8], required: true, index: true },
    order: { type: Number, default: 0 },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    outcomes: [{ code: String, text: String }], // MEB kazanımları
    summary: { type: String, default: '' }, // Konu özeti (markdown + KaTeX)
    examples: [{ question: String, solution: String }], // Çözümlü örnekler
    worksheetUrl: { type: String, default: '' }, // Konu anlatım föyü (PDF)
    video: {
      url: { type: String, default: '' },
      durationSec: { type: Number, default: 0 },
      isPremium: { type: Boolean, default: false },
    },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Topic', topicSchema);
