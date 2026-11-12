import { randomInt } from 'node:crypto';
import mongoose from 'mongoose';
import { Attempt, StudyDay, User } from '../models/index.js';
import { BADGES } from '../utils/gamification.js';
import { buildParentReport, dayKey } from '../utils/parentReport.js';

const PING_SEC = 30; // istemci, sayfa görünürken 30 sn'de bir bildirim gönderir

async function buildReport(userId) {
  const id = new mongoose.Types.ObjectId(String(userId));
  const byTopic = await Attempt.aggregate([
    { $match: { user: id } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$topic',
        attempts: { $sum: 1 },
        bestScore: { $max: '$score' },
        avgScore: { $avg: '$score' },
        lastScore: { $first: '$score' },
        totalTime: { $sum: '$durationSec' },
      },
    },
    { $lookup: { from: 'topics', localField: '_id', foreignField: '_id', as: 'topic' } },
    { $unwind: '$topic' },
    { $project: { attempts: 1, bestScore: 1, avgScore: { $round: ['$avgScore', 0] }, lastScore: 1, totalTime: 1, 'topic.title': 1, 'topic.slug': 1, 'topic.grade': 1 } },
  ]);
  const recent = await Attempt.find({ user: id }).sort('-createdAt').limit(10).populate('topic', 'title slug').lean();
  const totalTime = byTopic.reduce((s, t) => s + (t.totalTime || 0), 0);
  return { byTopic, recent, totalTime, weakTopics: byTopic.filter((t) => t.avgScore < 60) };
}

export async function myProgress(req, res) {
  res.json({ ...(await buildReport(req.user._id)), badgeCatalog: BADGES });
}

export async function childProgress(req, res) {
  const isLinked = req.user.children.some((c) => String(c) === req.params.childId);
  if (!isLinked && req.user.role !== 'admin') return res.status(403).json({ message: 'Bu öğrenciye erişiminiz yok.' });
  const child = await User.findById(req.params.childId);
  if (!child) return res.status(404).json({ message: 'Öğrenci bulunamadı.' });
  res.json(await buildParentReport(child));
}

export async function listChildren(req, res) {
  // Yönetici tüm öğrencileri görür; veli yalnızca kendi bağladıklarını
  const filter = req.user.role === 'admin' ? { role: 'student' } : { _id: { $in: req.user.children } };
  const children = await User.find(filter).select('name grade').sort('name');
  res.json({ children });
}

/** Öğrenci konu / test / oyun sayfasındayken çalışma süresini biriktirir. */
export async function heartbeat(req, res) {
  if (req.user.role !== 'student') return res.status(204).end();
  const now = new Date();
  const key = { user: req.user._id, day: dayKey(now) };
  const doc = await StudyDay.findOne(key).select('lastPingAt').lean();
  // Birden fazla sekme açıksa süre iki kez sayılmasın
  if (doc?.lastPingAt && now - doc.lastPingAt < (PING_SEC - 10) * 1000) return res.status(204).end();
  await StudyDay.updateOne(key, { $inc: { seconds: PING_SEC }, $set: { lastPingAt: now } }, { upsert: true });
  res.status(204).end();
}

const CODE_LENGTH = 8;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // karışan karakterler (0/O, 1/I) yok
const newCode = () => Array.from({ length: CODE_LENGTH }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join('');
const normalizeCode = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

/** Öğrencinin veli kodu ve hesabına bağlı veliler. POST ile kod yenilenir (eski kod geçersiz olur). */
export async function myLinkCode(req, res) {
  const me = await User.findById(req.user._id).select('+linkCode');
  if (!me.linkCode || req.method === 'POST') {
    me.linkCode = newCode();
    await me.save();
  }
  const parents = await User.find({ children: me._id }).select('name');
  res.json({ code: me.linkCode, parents: parents.map((p) => ({ _id: p._id, name: p.name })) });
}

export async function linkChild(req, res) {
  const code = normalizeCode(req.body.code);
  if (code.length !== CODE_LENGTH) return res.status(400).json({ message: 'Veli kodu 8 karakter olmalı.' });
  const child = await User.findOne({ linkCode: code, role: 'student' });
  if (!child) return res.status(404).json({ message: 'Veli kodu geçersiz. Kodu öğrencinizin panelinden kontrol edin.' });
  if (!req.user.children.some((c) => String(c) === String(child._id))) req.user.children.push(child._id);
  await req.user.save();
  res.json({ user: await req.user.populate('children', 'name email grade xp level') });
}

export async function leaderboard(req, res) {
  const grade = Number(req.query.grade) || req.user?.grade || 4;
  const users = await User.find({ role: 'student', grade }).sort('-xp').limit(20).select('name xp grade badges');
  res.json({ grade, users });
}
