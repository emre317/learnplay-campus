import { Topic, Question, Attempt } from '../models/index.js';
import { awardXp } from '../utils/gamification.js';

const FREE_QUESTION_LIMIT = 5;

/** Alıştırma / test için soruları getirir (doğru cevaplar gönderilmez). */
export async function getQuiz(req, res) {
  const topic = await Topic.findOne({ slug: req.params.slug });
  if (!topic) return res.status(404).json({ message: 'Konu bulunamadı.' });

  const premium = req.user?.isPremium || req.user?.role === 'admin';
  if (topic.isPremium && !premium) {
    return res.status(402).json({ message: 'Bu konu Premium üyelere özeldir.' });
  }

  const filter = { topic: topic._id };
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  if (!premium) filter.isPremium = false;

  const size = Math.min(Number(req.query.size) || 10, 40);
  const limit = premium ? size : Math.min(size, FREE_QUESTION_LIMIT);
  const questions = await Question.aggregate([{ $match: filter }, { $sample: { size: limit } }]).project({
    correctIndex: 0,
    solution: 0,
  });

  res.json({ topic: { _id: topic._id, title: topic.title, slug: topic.slug }, questions, limited: !premium });
}

/** Cevapları değerlendirir, sonucu kaydeder, XP verir ve çözümleri döner. */
export async function submitQuiz(req, res) {
  const { topicId, answers = [], mode = 'test', durationSec = 0 } = req.body;
  const ids = answers.map((a) => a.question);
  const questions = await Question.find({ _id: { $in: ids } }).select('+correctIndex +solution');
  const byId = new Map(questions.map((q) => [String(q._id), q]));

  let correct = 0;
  let wrong = 0;
  let empty = 0;
  const graded = answers
    .filter((a) => byId.has(String(a.question)))
    .map((a) => {
      const q = byId.get(String(a.question));
      const isEmpty = a.selected === null || a.selected === undefined;
      const isCorrect = !isEmpty && Number(a.selected) === q.correctIndex;
      if (isEmpty) empty++;
      else if (isCorrect) correct++;
      else wrong++;
      return { question: q._id, selected: isEmpty ? null : Number(a.selected), correct: isCorrect };
    });

  const total = graded.length || 1;
  const score = Math.round((correct / total) * 100);
  const xpEarned = correct * 10 + (score === 100 ? 25 : 0);

  const attempt = await Attempt.create({
    user: req.user._id,
    topic: topicId,
    mode,
    answers: graded,
    correctCount: correct,
    wrongCount: wrong,
    emptyCount: empty,
    score,
    durationSec,
    xpEarned,
  });

  const newBadges = await awardXp(req.user, xpEarned, { score });

  res.json({
    attempt,
    newBadges,
    user: req.user,
    review: questions.map((q) => ({
      _id: q._id,
      correctIndex: q.correctIndex,
      solution: q.solution,
    })),
  });
}
