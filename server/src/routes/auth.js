import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import * as c from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const r = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, message: { message: 'Çok fazla deneme. Lütfen biraz bekleyin.' } });

r.post(
  '/register',
  limiter,
  body('name').trim().isLength({ min: 2 }).withMessage('İsim en az 2 karakter olmalı.'),
  body('email').isEmail().withMessage('Geçerli bir e-posta girin.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı.'),
  body('grade').optional().isInt({ min: 4, max: 8 }).toInt(),
  validate,
  c.register
);
r.post('/login', limiter, body('email').isEmail().normalizeEmail(), body('password').notEmpty(), validate, c.login);
r.post('/logout', c.logout);
r.get('/me', requireAuth, c.me);
r.patch('/me', requireAuth, c.updateMe);

export default r;
