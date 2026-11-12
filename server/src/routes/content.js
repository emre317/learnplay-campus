import { Router } from 'express';
import * as c from '../controllers/contentController.js';
import * as q from '../controllers/quizController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const r = Router();
r.get('/grades', c.getGrades);
r.get('/grades/:grade', optionalAuth, c.getCurriculum);
r.get('/topics/:slug', optionalAuth, c.getTopic);
r.get('/topics/:slug/quiz', requireAuth, q.getQuiz);
r.post('/quiz/submit', requireAuth, q.submitQuiz);
r.get('/games', optionalAuth, c.getGames);

export default r;
