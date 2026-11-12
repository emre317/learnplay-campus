/**
 * Örnek veri: gerçek içerikler (Ayşenur) geldiğinde bu dosya ya da
 * yönetim paneli üzerinden toplu yükleme ile değiştirilecek.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User, Unit, Topic, Question, Game, Attempt, StudyDay } from '../models/index.js';
import { dayKey } from '../utils/parentReport.js';

await connectDB(process.env.MONGO_URI);
await Promise.all([Unit, Topic, Question, Game, Attempt, StudyDay].map((M) => M.deleteMany({})));

const admin = await User.findOne({ email: 'admin@learnplay.campus' });
if (!admin) {
  await User.create({ name: 'Yönetici', email: 'admin@learnplay.campus', password: 'admin123', role: 'admin' });
}
let demo = await User.findOne({ email: 'ogrenci@learnplay.campus' });
if (!demo) {
  demo = await User.create({ name: 'Demo Öğrenci', email: 'ogrenci@learnplay.campus', password: 'ogrenci123', grade: 4 });
}
const parent = await User.findOne({ email: 'veli@learnplay.campus' });
if (!parent) {
  await User.create({ name: 'Demo Veli', email: 'veli@learnplay.campus', password: 'veli123', role: 'parent', children: [demo._id] });
}

const u1 = await Unit.create({ grade: 4, order: 1, title: 'Doğal Sayılar', icon: '123', description: 'Basamaklar, okuma-yazma, sıralama ve yuvarlama.' });
const u2 = await Unit.create({ grade: 4, order: 2, title: 'Doğal Sayılarla İşlemler', icon: '±', description: 'Toplama, çıkarma, çarpma ve bölme.' });
const u3 = await Unit.create({ grade: 4, order: 3, title: 'Kesirler', icon: '½', description: 'Basit, bileşik ve tam sayılı kesirler.' });

const t1 = await Topic.create({
  unit: u1._id, grade: 4, order: 1, title: 'Basamak ve Bölük Kavramı', slug: '4-basamak-ve-boluk',
  outcomes: [{ code: 'M.4.1.1.1', text: '4, 5 ve 6 basamaklı doğal sayıları okur ve yazar.' }],
  summary: '## Basamak Değeri\n\nBir rakamın sayı içinde bulunduğu yere göre aldığı değere **basamak değeri** denir.\n\nÖrnek: $345\\,678$ sayısında $4$ rakamının basamak değeri $40\\,000$’dir.',
  examples: [{ question: '$52\\,307$ sayısında $2$ rakamının basamak değeri kaçtır?', solution: '$2$ binler basamağındadır, basamak değeri $2\\,000$’dir.' }],
  video: { url: '', durationSec: 420, isPremium: false },
});
const t2 = await Topic.create({
  unit: u2._id, grade: 4, order: 1, title: 'Çarpma İşlemi', slug: '4-carpma-islemi',
  outcomes: [{ code: 'M.4.1.4.1', text: 'En çok üç basamaklı doğal sayılarla iki basamaklı doğal sayıları çarpar.' }],
  summary: '## Çarpma\n\nÇarpma, tekrarlı toplamadır: $4 \\times 3 = 4 + 4 + 4 = 12$',
  video: { url: '', durationSec: 540, isPremium: true },
});
const t3 = await Topic.create({
  unit: u3._id, grade: 4, order: 1, title: 'Kesir Türleri', slug: '4-kesir-turleri', isPremium: true,
  summary: '## Kesir\n\n$\\frac{3}{4}$ → pay $3$, payda $4$.',
  video: { url: '', durationSec: 600, isPremium: true },
});

await Question.insertMany([
  { topic: t1._id, grade: 4, difficulty: 'kolay', text: '$4\\,582$ sayısında $5$ rakamının basamak değeri kaçtır?', options: ['5', '50', '500', '5000'], correctIndex: 2, solution: '$5$ yüzler basamağında olduğundan basamak değeri $500$’dür.' },
  { topic: t1._id, grade: 4, difficulty: 'kolay', text: '"Yüz yirmi üç bin dört yüz" sayısının rakamla yazılışı hangisidir?', options: ['123 400', '120 340', '123 040', '102 340'], correctIndex: 0, solution: 'Binler bölüğü $123$, birler bölüğü $400$ → $123\\,400$.' },
  { topic: t1._id, grade: 4, difficulty: 'orta', text: '$7\\,0\\_\\,5$ dört basamaklı sayısı $7\\,050$’den büyükse boşluğa en küçük hangi rakam gelir?', options: ['4', '5', '6', '9'], correctIndex: 1, solution: '$7\\,055 > 7\\,050$ olduğundan en küçük rakam $5$’tir.' },
  { topic: t1._id, grade: 4, difficulty: 'zor', text: 'Rakamları farklı 5 basamaklı en büyük çift sayı kaçtır?', options: ['98 764', '98 765', '99 998', '98 760'], correctIndex: 0, solution: 'En büyükten başla: $9,8,7,6$ ve son basamak çift olmalı → $4$: $98\\,764$.' },
  { topic: t1._id, grade: 4, difficulty: 'yeni-nesil', text: 'Bir kumbarada 3 tane 1000 TL, 4 tane 100 TL ve 7 tane 1 TL var. Toplam para kaç TL’dir?', options: ['3 407', '3 470', '3 047', '3 740'], correctIndex: 0, solution: '$3000 + 400 + 7 = 3\\,407$ TL.' },
  { topic: t1._id, grade: 4, difficulty: 'orta', isPremium: true, text: '$650\\,000$ sayısının en yakın yüz bine yuvarlanmış hali?', options: ['600 000', '700 000', '650 000', '660 000'], correctIndex: 1, solution: 'On binler basamağı $5$ olduğundan yukarı yuvarlanır: $700\\,000$.' },
  { topic: t2._id, grade: 4, difficulty: 'kolay', text: '$24 \\times 3$ işleminin sonucu kaçtır?', options: ['62', '72', '74', '84'], correctIndex: 1, solution: '$20\\times3=60$, $4\\times3=12$, $60+12=72$.' },
  { topic: t2._id, grade: 4, difficulty: 'orta', text: '$125 \\times 12$ kaçtır?', options: ['1 250', '1 400', '1 500', '1 512'], correctIndex: 2, solution: '$125\\times12 = 125\\times10 + 125\\times2 = 1250+250 = 1500$.' },
]);

await Game.insertMany([
  { key: 'speed-multiply', title: 'Çarpım Yarışı', description: '60 saniyede olabildiğince çok çarpma işlemi çöz!', grades: [4, 5, 6], isPremium: false },
  { key: 'number-compare', title: 'Büyük mü Küçük mü?', description: 'İki sayıyı hızlıca karşılaştır, seriyi kaçırma.', grades: [4, 5], isPremium: true },
  { key: 'fraction-match', title: 'Kesir Eşleştir', description: 'Kesir ile modelini eşleştir.', grades: [4, 5, 6], isPremium: true },
]);

// Veli paneli için örnek çalışma geçmişi: [kaç gün önce, konu, puan, test süresi (sn), o günkü toplam çalışma (sn)]
const history = [
  [20, t3, 90, 600, 1500],
  [9, t1, 60, 540, 1800],
  [8, t2, 50, 420, 1200],
  [6, t1, 80, 480, 2400],
  [4, t2, 50, 400, 900],
  [3, t1, 100, 450, 3000],
  [1, t2, 70, 380, 2100],
  [0, t2, 50, 360, 1500],
];
for (const [ago, topic, score, durationSec, studySec] of history) {
  const at = new Date(Date.now() - ago * 86400000);
  const correctCount = score / 10;
  await Attempt.create({
    user: demo._id, topic: topic._id, mode: 'test', answers: [],
    correctCount, wrongCount: 10 - correctCount, emptyCount: 0,
    score, durationSec, xpEarned: 0, createdAt: at, updatedAt: at,
  });
  await StudyDay.create({ user: demo._id, day: dayKey(at), seconds: studySec, lastPingAt: at });
}

console.log('✓ Örnek veriler yüklendi.\n  admin@learnplay.campus / admin123\n  ogrenci@learnplay.campus / ogrenci123\n  veli@learnplay.campus / veli123');
await mongoose.disconnect();
