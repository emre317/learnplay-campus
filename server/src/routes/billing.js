import { Router } from 'express';
import * as c from '../controllers/billingController.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();
r.get('/plans', c.getPlans);
r.post('/checkout', requireAuth, c.checkout);

export default r;
