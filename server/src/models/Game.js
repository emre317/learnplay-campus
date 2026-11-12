import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // istemci tarafındaki oyun bileşeni anahtarı
    title: { type: String, required: true },
    description: { type: String, default: '' },
    grades: [{ type: Number, enum: [4, 5, 6, 7, 8] }],
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    isPremium: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Game', gameSchema);
