import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { queryOne, queryAll, execute } from '../database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /api/goals
router.get('/', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const goals = queryAll(`
    SELECT * FROM savings_goals WHERE user_id = ? ORDER BY target_date ASC
  `, userId) as any[];

  const now = new Date();

  const enrichedGoals = goals.map((g) => {
    const remaining = Math.max(0, g.target_amount - g.current_amount);
    const progress = g.target_amount > 0 ? Number(((g.current_amount / g.target_amount) * 100).toFixed(1)) : 0;
    
    // Calculate suggested monthly contribution
    const targetDate = new Date(g.target_date);
    const diffMonths = Math.max(1, (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth()));
    const suggestedMonthly = remaining > 0 ? Math.ceil(remaining / diffMonths) : 0;

    return {
      ...g,
      remaining,
      progress: Math.min(100, progress),
      suggestedMonthly,
      monthsRemaining: diffMonths,
      isCompleted: g.current_amount >= g.target_amount
    };
  });

  const totalTarget = goals.reduce((acc, g) => acc + g.target_amount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.current_amount, 0);

  return res.json({
    goals: enrichedGoals,
    totalTarget,
    totalSaved,
    overallProgress: totalTarget > 0 ? Number(((totalSaved / totalTarget) * 100).toFixed(1)) : 0
  });
});

// POST /api/goals
router.post('/', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { title, target_amount, current_amount = 0, target_date, category = 'General', notes = '' } = req.body;

  if (!title || !target_amount || !target_date) {
    return res.status(400).json({ error: 'Title, target_amount, and target_date are required' });
  }

  const id = 'sg_' + crypto.randomUUID();
  execute(`
    INSERT INTO savings_goals (id, user_id, title, target_amount, current_amount, target_date, category, notes, is_demo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
  `, id, userId, title.trim(), Number(target_amount), Number(current_amount) || 0, target_date, category, notes.trim());

  const created = queryOne('SELECT * FROM savings_goals WHERE id = ?', id);
  return res.status(201).json(created);
});

// PUT /api/goals/:id
router.put('/:id', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const goalId = String(req.params.id);
  const { title, target_amount, current_amount, target_date, category, notes } = req.body;

  const existing = queryOne('SELECT id FROM savings_goals WHERE id = ? AND user_id = ?', goalId, userId);
  if (!existing) {
    return res.status(404).json({ error: 'Goal not found' });
  }

  execute(`
    UPDATE savings_goals
    SET title = COALESCE(?, title),
        target_amount = COALESCE(?, target_amount),
        current_amount = COALESCE(?, current_amount),
        target_date = COALESCE(?, target_date),
        category = COALESCE(?, category),
        notes = COALESCE(?, notes)
    WHERE id = ? AND user_id = ?
  `, title ? title.trim() : null, target_amount !== undefined ? Number(target_amount) : null, current_amount !== undefined ? Number(current_amount) : null, target_date || null, category || null, notes !== undefined ? notes : null, goalId, userId);

  const updated = queryOne('SELECT * FROM savings_goals WHERE id = ?', goalId);
  return res.json(updated);
});

// POST /api/goals/:id/contribute
router.post('/:id/contribute', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const goalId = String(req.params.id);
  const { amount, action = 'deposit' } = req.body; // 'deposit' or 'withdraw'

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'A positive contribution amount is required' });
  }

  const existing = queryOne('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?', goalId, userId) as any;
  if (!existing) {
    return res.status(404).json({ error: 'Goal not found' });
  }

  const numAmount = Number(amount);
  let newCurrent = action === 'withdraw'
    ? Math.max(0, existing.current_amount - numAmount)
    : existing.current_amount + numAmount;

  execute('UPDATE savings_goals SET current_amount = ? WHERE id = ?', newCurrent, goalId);

  const updated = queryOne('SELECT * FROM savings_goals WHERE id = ?', goalId);
  return res.json(updated);
});

// DELETE /api/goals/:id
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const goalId = String(req.params.id);

  const existing = queryOne('SELECT id FROM savings_goals WHERE id = ? AND user_id = ?', goalId, userId);
  if (!existing) {
    return res.status(404).json({ error: 'Goal not found' });
  }

  execute('DELETE FROM savings_goals WHERE id = ? AND user_id = ?', goalId, userId);
  return res.json({ success: true, message: 'Savings goal deleted successfully' });
});

export default router;
