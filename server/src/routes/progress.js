import { Router } from 'express';
import * as c from '../controllers/progressController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const r = Router();
r.use(requireAuth);
r.get('/me', c.myProgress);
r.get('/leaderboard', c.leaderboard);
r.post('/children', requireRole('parent'), c.linkChild);
r.get('/children/:childId', requireRole('parent', 'admin'), c.childProgress);

export default r;
