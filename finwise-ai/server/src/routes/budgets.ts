import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { queryOne, queryAll, execute } from '../database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /api/budgets
router.get('/', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const currentMonthYear = new Date().toISOString().substring(0, 7);

  const budgets = queryAll(`
    SELECT * FROM budgets WHERE user_id = ? ORDER BY category ASC
  `, userId) as any[];

  // Calculate actual spending in current month for each budget category
  const spendRows = queryAll(`
    SELECT category, SUM(amount) as spent
    FROM transactions
    WHERE user_id = ? AND type = 'expense' AND strftime('%Y-%m', date) = ?
    GROUP BY category
  `, userId, currentMonthYear) as any[];

  const spendMap: Record<string, number> = {};
  for (const row of spendRows) {
    spendMap[row.category] = row.spent;
  }

  const enrichedBudgets = budgets.map((b) => {
    const spent = spendMap[b.category] || 0;
    const percentage = b.monthly_limit > 0 ? Number(((spent / b.monthly_limit) * 100).toFixed(1)) : 0;
    const remaining = Math.max(0, b.monthly_limit - spent);
    let alertStatus: 'NORMAL' | 'WARNING_80' | 'OVER_BUDGET' = 'NORMAL';
    if (percentage >= 100) alertStatus = 'OVER_BUDGET';
    else if (percentage >= 80) alertStatus = 'WARNING_80';

    return {
      id: b.id,
      category: b.category,
      monthly_limit: b.monthly_limit,
      month_year: b.month_year,
      spent,
      remaining,
      percentage,
      alertStatus,
      isOverBudget: percentage >= 100,
      isWarning: percentage >= 80 && percentage < 100
    };
  });

  const totalBudget = enrichedBudgets.reduce((acc, b) => acc + b.monthly_limit, 0);
  const totalSpent = enrichedBudgets.reduce((acc, b) => acc + b.spent, 0);

  return res.json({
    budgets: enrichedBudgets,
    totalBudget,
    totalSpent,
    overallPercentage: totalBudget > 0 ? Number(((totalSpent / totalBudget) * 100).toFixed(1)) : 0
  });
});

// POST /api/budgets
router.post('/', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { category, monthly_limit, month_year = new Date().toISOString().substring(0, 7) } = req.body;

  if (!category || monthly_limit === undefined) {
    return res.status(400).json({ error: 'Category and monthly_limit are required' });
  }

  const existing = queryOne(`
    SELECT id FROM budgets WHERE user_id = ? AND category = ?
  `, userId, category) as any;

  if (existing) {
    execute(`
      UPDATE budgets SET monthly_limit = ?, month_year = ? WHERE id = ?
    `, Number(monthly_limit), month_year, existing.id);

    const updated = queryOne('SELECT * FROM budgets WHERE id = ?', existing.id);
    return res.json(updated);
  }

  const id = 'bg_' + crypto.randomUUID();
  execute(`
    INSERT INTO budgets (id, user_id, category, monthly_limit, month_year)
    VALUES (?, ?, ?, ?, ?)
  `, id, userId, category, Number(monthly_limit), month_year);

  const created = queryOne('SELECT * FROM budgets WHERE id = ?', id);
  return res.status(201).json(created);
});

// PUT /api/budgets/:id
router.put('/:id', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const budgetId = String(req.params.id);
  const { monthly_limit, category } = req.body;

  const existing = queryOne('SELECT id FROM budgets WHERE id = ? AND user_id = ?', budgetId, userId);
  if (!existing) {
    return res.status(404).json({ error: 'Budget not found' });
  }

  execute(`
    UPDATE budgets
    SET monthly_limit = COALESCE(?, monthly_limit),
        category = COALESCE(?, category)
    WHERE id = ? AND user_id = ?
  `, monthly_limit !== undefined ? Number(monthly_limit) : null, category || null, budgetId, userId);

  const updated = queryOne('SELECT * FROM budgets WHERE id = ?', budgetId);
  return res.json(updated);
});

// DELETE /api/budgets/:id
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const budgetId = String(req.params.id);

  const existing = queryOne('SELECT id FROM budgets WHERE id = ? AND user_id = ?', budgetId, userId);
  if (!existing) {
    return res.status(404).json({ error: 'Budget not found' });
  }

  execute('DELETE FROM budgets WHERE id = ? AND user_id = ?', budgetId, userId);
  return res.json({ success: true, message: 'Budget deleted successfully' });
});

export default router;
