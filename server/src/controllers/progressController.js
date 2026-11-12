import mongoose from 'mongoose';
import { Attempt, User } from '../models/index.js';
import { BADGES } from '../utils/gamification.js';

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
  res.json({ child, ...(await buildReport(req.params.childId)) });
}

export async function linkChild(req, res) {
  const child = await User.findOne({ email: req.body.email, role: 'student' });
  if (!child) return res.status(404).json({ message: 'Bu e-postaya ait öğrenci bulunamadı.' });
  if (!req.user.children.some((c) => String(c) === String(child._id))) req.user.children.push(child._id);
  await req.user.save();
  res.json({ user: await req.user.populate('children', 'name email grade xp level') });
}

export async function leaderboard(req, res) {
  const grade = Number(req.query.grade) || req.user?.grade || 4;
  const users = await User.find({ role: 'student', grade }).sort('-xp').limit(20).select('name xp grade badges');
  res.json({ grade, users });
}
