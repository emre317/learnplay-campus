import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema(
  {
    grade: { type: Number, enum: [4, 5, 6, 7, 8], required: true, index: true },
    order: { type: Number, default: 0 },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '∑' },
  },
  { timestamps: true }
);

export default mongoose.model('Unit', unitSchema);
