import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import progressRoutes from './routes/progress.js';
import adminRoutes from './routes/admin.js';
import billingRoutes from './routes/billing.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'Learn Play Campus API' }));
app.use('/api/auth', authRoutes);
app.use('/api', contentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/billing', billingRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
