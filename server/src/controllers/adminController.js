import { Unit, Topic, Question, Game, User } from '../models/index.js';

const models = { units: Unit, topics: Topic, questions: Question, games: Game };

function getModel(req, res) {
  const Model = models[req.params.resource];
  if (!Model) res.status(404).json({ message: 'Geçersiz kaynak.' });
  return Model;
}

export async function list(req, res) {
  const Model = getModel(req, res);
  if (!Model) return;
  const filter = {};
  if (req.query.grade) filter.grade = Number(req.query.grade);
  if (req.query.topic) filter.topic = req.query.topic;
  const q = Model.find(filter).sort('-createdAt').limit(500);
  if (Model === Question) q.select('+correctIndex +solution');
  res.json({ items: await q });
}

export async function create(req, res) {
  const Model = getModel(req, res);
  if (!Model) return;
  const body = Array.isArray(req.body) ? req.body : [req.body]; // toplu yükleme desteği
  const items = await Model.insertMany(body);
  res.status(201).json({ items });
}

export async function update(req, res) {
  const Model = getModel(req, res);
  if (!Model) return;
  const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Kayıt bulunamadı.' });
  res.json({ item });
}

export async function remove(req, res) {
  const Model = getModel(req, res);
  if (!Model) return;
  await Model.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}

export async function stats(_req, res) {
  const [users, premium, topics, questions] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ plan: 'premium' }),
    Topic.countDocuments(),
    Question.countDocuments(),
  ]);
  res.json({ users, premium, topics, questions });
}

export async function listUsers(_req, res) {
  res.json({ items: await User.find().sort('-createdAt').limit(200) });
}

export async function setPlan(req, res) {
  const { plan, months = 1 } = req.body;
  const until = plan === 'premium' ? new Date(Date.now() + months * 30 * 86400000) : undefined;
  const user = await User.findByIdAndUpdate(req.params.id, { plan, premiumUntil: until }, { new: true });
  res.json({ item: user });
}
