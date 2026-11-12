import mongoose from 'mongoose';

/** Öğrencinin bir gündeki toplam çalışma süresi (konu, test ve oyun sayfalarında geçen aktif süre). */
const studyDaySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    day: { type: String, required: true }, // YYYY-MM-DD (Türkiye saati)
    seconds: { type: Number, default: 0 },
    lastPingAt: { type: Date },
  },
  { timestamps: true }
);
studyDaySchema.index({ user: 1, day: 1 }, { unique: true });

export default mongoose.model('StudyDay', studyDaySchema);
