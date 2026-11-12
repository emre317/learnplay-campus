import { Router } from 'express';
import * as c from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const r = Router();
r.use(requireAuth, requireRole('admin'));
r.get('/stats', c.stats);
r.get('/users', c.listUsers);
r.patch('/users/:id/plan', c.setPlan);
r.get('/:resource', c.list);
r.post('/:resource', c.create);
r.patch('/:resource/:id', c.update);
r.delete('/:resource/:id', c.remove);

export default r;
