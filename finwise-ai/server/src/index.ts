import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database.js';
import authRouter from './routes/auth.js';
import transactionsRouter from './routes/transactions.js';
import budgetsRouter from './routes/budgets.js';
import goalsRouter from './routes/goals.js';
import analyticsRouter from './routes/analytics.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database & seed demo data if fresh
initDatabase();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'FinWise AI API',
    timestamp: new Date().toISOString(),
    currency: 'INR (₹)'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[FinWise Server Error]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err?.message || 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 FinWise AI Backend running at http://localhost:${PORT}`);
  console.log(`💡 Mode: Development | Currency: INR (₹)`);
  console.log(`===============================================`);
});
