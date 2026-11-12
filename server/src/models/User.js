import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['student', 'parent', 'admin'], default: 'student' },
    grade: { type: Number, enum: [4, 5, 6, 7, 8], default: 4 },
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    premiumUntil: { type: Date },
    // Oyunlaştırma
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActiveAt: { type: Date },
    badges: [{ type: String }],
    // Veli paneli için: öğrenciye bağlı veli(ler)
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.virtual('isPremium').get(function () {
  return this.plan === 'premium' && (!this.premiumUntil || this.premiumUntil > new Date());
});

userSchema.virtual('level').get(function () {
  return Math.floor(Math.sqrt(this.xp / 50)) + 1;
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
