import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { queryOne, queryAll, execute, seedDemoRecords } from '../database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { categorizeTransaction } from '../services/geminiService.js';

const router = Router();
router.use(authMiddleware);

// GET /api/transactions
router.get('/', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { type, category, search, startDate, endDate, limit = '100', offset = '0' } = req.query;

  let query = 'SELECT * FROM transactions WHERE user_id = ?';
  const params: any[] = [userId];

  if (type && (type === 'income' || type === 'expense')) {
    query += ' AND type = ?';
    params.push(type);
  }

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (startDate) {
    query += ' AND date >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND date <= ?';
    params.push(endDate);
  }

  if (search) {
    query += ' AND (description LIKE ? OR notes LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const transactions = queryAll(query, ...params);

  // Also get total count
  let countQuery = 'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?';
  const countParams: any[] = [userId];
  if (type && (type === 'income' || type === 'expense')) {
    countQuery += ' AND type = ?';
    countParams.push(type);
  }
  if (category && category !== 'All') {
    countQuery += ' AND category = ?';
    countParams.push(category);
  }
  if (search) {
    countQuery += ' AND (description LIKE ? OR notes LIKE ?)';
    countParams.push(`%${search}%`, `%${search}%`);
  }

  const countResult = queryOne(countQuery, ...countParams) as any;

  return res.json({
    transactions,
    total: countResult?.total || transactions.length
  });
});

// POST /api/transactions/categorize - AI categorization endpoint
router.post('/categorize', async (req: AuthRequest, res: Response) => {
  const { description, amount = 0, type = 'expense' } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const user = queryOne('SELECT gemini_api_key FROM users WHERE id = ?', req.user!.id) as any;
  const result = await categorizeTransaction(description, Number(amount), type, user?.gemini_api_key);
  return res.json(result);
});

// POST /api/transactions
router.post('/', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const {
    type,
    amount,
    category,
    description,
    date = new Date().toISOString().substring(0, 10),
    payment_method = 'UPI',
    ai_suggested = 0,
    ai_confidence = 0,
    notes = ''
  } = req.body;

  if (!type || !amount || !category || !description) {
    return res.status(400).json({ error: 'Type, amount, category, and description are required' });
  }

  const id = 'tx_' + crypto.randomUUID();
  execute(`
    INSERT INTO transactions (id, user_id, type, amount, category, description, date, payment_method, ai_suggested, ai_confidence, notes, is_demo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `, id, userId, type, Number(amount), category, description.trim(), date, payment_method, ai_suggested ? 1 : 0, Number(ai_confidence) || 0, notes ? notes.trim() : '');

  const created = queryOne('SELECT * FROM transactions WHERE id = ?', id);
  return res.status(201).json(created);
});

// PUT /api/transactions/:id
router.put('/:id', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const txId = String(req.params.id);
  const { type, amount, category, description, date, payment_method, notes } = req.body;

  const existing = queryOne('SELECT * FROM transactions WHERE id = ? AND user_id = ?', txId, userId) as any;
  if (!existing) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  execute(`
    UPDATE transactions
    SET type = COALESCE(?, type),
        amount = COALESCE(?, amount),
        category = COALESCE(?, category),
        description = COALESCE(?, description),
        date = COALESCE(?, date),
        payment_method = COALESCE(?, payment_method),
        notes = COALESCE(?, notes)
    WHERE id = ? AND user_id = ?
  `, type || existing.type, amount !== undefined ? Number(amount) : existing.amount, category || existing.category, description ? description.trim() : existing.description, date || existing.date, payment_method || existing.payment_method, notes !== undefined ? notes : existing.notes, txId, userId);

  const updated = queryOne('SELECT * FROM transactions WHERE id = ?', txId);
  return res.json(updated);
});

// DELETE /api/transactions/:id
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const txId = String(req.params.id);

  const existing = queryOne('SELECT id FROM transactions WHERE id = ? AND user_id = ?', txId, userId);
  if (!existing) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  execute('DELETE FROM transactions WHERE id = ? AND user_id = ?', txId, userId);
  return res.json({ success: true, message: 'Transaction deleted successfully' });
});

// POST /api/transactions/seed-demo
router.post('/seed-demo', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  seedDemoRecords(userId);
  return res.json({ success: true, message: 'Realistic Indian student/professional financial demo data loaded successfully' });
});

// POST /api/transactions/clear-all
router.post('/clear-all', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  execute('DELETE FROM transactions WHERE user_id = ?', userId);
  return res.json({ success: true, message: 'All transactions cleared' });
});

export default router;
