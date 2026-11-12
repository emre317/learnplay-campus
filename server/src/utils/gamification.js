import { Attempt } from '../models/index.js';

export const BADGES = {
  'ilk-adim': 'İlk Adım — ilk testini tamamladın',
  'tam-puan': 'Kusursuz — bir testten 100 aldın',
  'seri-3': 'Ateşli Seri — 3 gün üst üste çalıştın',
  'seri-7': 'Haftalık Usta — 7 gün üst üste çalıştın',
  'xp-500': 'Yükselen Yıldız — 500 XP',
  'xp-2000': 'Matematik Kahramanı — 2000 XP',
};

const dayDiff = (a, b) => Math.floor((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) -
  Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 86400000);

export async function awardXp(user, xp, { score } = {}) {
  const now = new Date();
  if (!user.lastActiveAt) user.streak = 1;
  else {
    const diff = dayDiff(now, user.lastActiveAt);
    if (diff === 1) user.streak += 1;
    else if (diff > 1) user.streak = 1;
  }
  user.lastActiveAt = now;
  user.xp += xp;

  const earned = [];
  const give = (key) => {
    if (!user.badges.includes(key)) {
      user.badges.push(key);
      earned.push(key);
    }
  };
  if ((await Attempt.countDocuments({ user: user._id })) >= 1) give('ilk-adim');
  if (score === 100) give('tam-puan');
  if (user.streak >= 3) give('seri-3');
  if (user.streak >= 7) give('seri-7');
  if (user.xp >= 500) give('xp-500');
  if (user.xp >= 2000) give('xp-2000');

  await user.save();
  return earned;
}
