import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { queryOne, execute } from '../database.js';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Demo 1-Click Login
router.post('/demo-login', (req, res) => {
  const demoUserId = 'usr_demo_finwise_01';
  let user = queryOne('SELECT id, email, name, currency, monthly_income_target, gemini_api_key FROM users WHERE id = ?', demoUserId) as any;

  if (!user) {
    const passwordHash = bcrypt.hashSync('demo123', 10);
    execute(`
      INSERT INTO users (id, email, password_hash, name, currency, monthly_income_target, gemini_api_key)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, demoUserId, 'demo@finwise.ai', passwordHash, 'Aarav Sharma (Demo)', 'INR', 55000, '');

    user = {
      id: demoUserId,
      email: 'demo@finwise.ai',
      name: 'Aarav Sharma (Demo)',
      currency: 'INR',
      monthly_income_target: 55000,
      gemini_api_key: ''
    };
  }

  const token = generateToken({ id: user.id, email: user.email, name: user.name });
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency || 'INR',
      monthlyIncomeTarget: user.monthly_income_target,
      hasCustomApiKey: Boolean(user.gemini_api_key),
      isDemo: true
    }
  });
});

// Register
router.post('/register', (req, res) => {
  const { email, password, name, currency = 'INR', monthlyIncomeTarget = 50000 } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = queryOne('SELECT id FROM users WHERE email = ?', email);
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const id = 'usr_' + crypto.randomUUID();
  const passwordHash = bcrypt.hashSync(password, 10);

  execute(`
    INSERT INTO users (id, email, password_hash, name, currency, monthly_income_target)
    VALUES (?, ?, ?, ?, ?, ?)
  `, id, email.toLowerCase(), passwordHash, name, currency, monthlyIncomeTarget);

  const token = generateToken({ id, email: email.toLowerCase(), name });
  return res.status(201).json({
    token,
    user: {
      id,
      email: email.toLowerCase(),
      name,
      currency,
      monthlyIncomeTarget,
      hasCustomApiKey: false,
      isDemo: false
    }
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = queryOne('SELECT * FROM users WHERE email = ?', email.toLowerCase()) as any;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken({ id: user.id, email: user.email, name: user.name });
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency || 'INR',
      monthlyIncomeTarget: user.monthly_income_target,
      hasCustomApiKey: Boolean(user.gemini_api_key),
      isDemo: user.id === 'usr_demo_finwise_01'
    }
  });
});

// Me (Current User Profile)
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = queryOne('SELECT id, email, name, currency, monthly_income_target, gemini_api_key FROM users WHERE id = ?', req.user!.id) as any;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    currency: user.currency || 'INR',
    monthlyIncomeTarget: user.monthly_income_target,
    hasCustomApiKey: Boolean(user.gemini_api_key),
    isDemo: user.id === 'usr_demo_finwise_01'
  });
});

// Update Gemini API Key
router.post('/update-key', authMiddleware, (req: AuthRequest, res: Response) => {
  const { geminiApiKey } = req.body;
  execute('UPDATE users SET gemini_api_key = ? WHERE id = ?', geminiApiKey ? geminiApiKey.trim() : null, req.user!.id);
  return res.json({ success: true, hasCustomApiKey: Boolean(geminiApiKey && geminiApiKey.trim()) });
});

export default router;
