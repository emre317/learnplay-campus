import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as c from '../controllers/progressController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const r = Router();
// Veli kodunun deneme-yanılma ile bulunmasını engeller
const linkLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, message: { message: 'Çok fazla deneme. Lütfen biraz bekleyin.' } });
r.use(requireAuth);
r.get('/me', c.myProgress);
r.get('/leaderboard', c.leaderboard);
r.post('/heartbeat', c.heartbeat);
r.get('/children', requireRole('parent', 'admin'), c.listChildren);
r.get('/link-code', requireRole('student'), c.myLinkCode);
r.post('/link-code', requireRole('student'), c.myLinkCode);
r.post('/children', requireRole('parent'), linkLimiter, c.linkChild);
r.get('/children/:childId', requireRole('parent', 'admin'), c.childProgress);

export default r;
