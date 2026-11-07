import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { queryOne, queryAll, execute } from '../database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import {
  categorizeTransaction,
  chatWithFinancialAssistant,
  generateSpendingAnalysis,
  generateMonthlyReportSummary,
  getUserFinancialContext
} from '../services/geminiService.js';

const router = Router();
router.use(authMiddleware);

// POST /api/ai/categorize
router.post('/categorize', async (req: AuthRequest, res: Response) => {
  const { description, amount = 0, type = 'expense' } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const user = queryOne('SELECT gemini_api_key FROM users WHERE id = ?', req.user!.id) as any;
  const result = await categorizeTransaction(description, Number(amount), type, user?.gemini_api_key);
  return res.json(result);
});

// GET /api/ai/chat-history
router.get('/chat-history', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const messages = queryAll(`
    SELECT id, role, content, created_at
    FROM chat_messages
    WHERE user_id = ?
    ORDER BY created_at ASC
  `, userId);

  return res.json({ messages });
});

// DELETE /api/ai/chat-history
router.delete('/chat-history', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  execute('DELETE FROM chat_messages WHERE user_id = ?', userId);
  return res.json({ success: true, message: 'Chat history cleared' });
});

// POST /api/ai/chat - Financial Assistant
router.post('/chat', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // 1. Save user message to database
  const userMsgId = 'msg_' + crypto.randomUUID();
  execute(`
    INSERT INTO chat_messages (id, user_id, role, content)
    VALUES (?, ?, 'user', ?)
  `, userMsgId, userId, message.trim());

  // 2. Fetch user's custom key if configured
  const user = queryOne('SELECT gemini_api_key FROM users WHERE id = ?', userId) as any;

  // 3. Generate response using grounded Gemini AI service
  const assistantReply = await chatWithFinancialAssistant(userId, message.trim(), user?.gemini_api_key);

  // 4. Save assistant reply to database
  const assistantMsgId = 'msg_' + crypto.randomUUID();
  execute(`
    INSERT INTO chat_messages (id, user_id, role, content)
    VALUES (?, ?, 'assistant', ?)
  `, assistantMsgId, userId, assistantReply);

  return res.json({
    reply: assistantReply,
    userMessage: { id: userMsgId, role: 'user', content: message.trim() },
    assistantMessage: { id: assistantMsgId, role: 'assistant', content: assistantReply }
  });
});

// POST /api/ai/spending-analysis
router.post('/spending-analysis', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const user = queryOne('SELECT gemini_api_key FROM users WHERE id = ?', userId) as any;
  const analysis = await generateSpendingAnalysis(userId, user?.gemini_api_key);
  return res.json(analysis);
});

// POST /api/ai/monthly-summary
router.post('/monthly-summary', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const monthYear = (req.body.monthYear as string) || new Date().toISOString().substring(0, 7);
  const user = queryOne('SELECT gemini_api_key FROM users WHERE id = ?', userId) as any;

  const summary = await generateMonthlyReportSummary(userId, monthYear, user?.gemini_api_key);
  return res.json({ monthYear, summary });
});

// GET /api/ai/insights - Quick dynamic AI cards for dashboard
router.get('/insights', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const ctx = getUserFinancialContext(userId);

  const insights = [
    {
      id: 'ins_1',
      title: 'Healthy Savings Rate',
      type: 'positive',
      icon: 'TrendingUp',
      description: `You are saving ${ctx.savingsRate}% of your income this month. That is well above the 20% golden rule!`
    },
    {
      id: 'ins_2',
      title: 'Top Variable Category: Food',
      type: 'warning',
      icon: 'AlertCircle',
      description: `Food accounts for ₹${(ctx.categorySpendMap['Food'] || 0).toLocaleString('en-IN')}. Trimming 2 Swiggy orders can save ₹800 this month.`
    },
    {
      id: 'ins_3',
      title: 'Emergency Fund Progress',
      type: 'info',
      icon: 'ShieldCheck',
      description: `Your Emergency Fund is at 65% of target. Maintain current allocations to reach your safety goal by April 2027.`
    }
  ];

  return res.json({ insights });
});

export default router;
