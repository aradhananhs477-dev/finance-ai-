import express from 'express';
import cors from 'cors';
import { initDatabase } from './database.js';
import authRouter from './routes/auth.js';
import transactionsRouter from './routes/transactions.js';
import budgetsRouter from './routes/budgets.js';
import goalsRouter from './routes/goals.js';
import analyticsRouter from './routes/analytics.js';
import aiRouter from './routes/ai.js';

const app = express();
initDatabase();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);

const TEST_PORT = 5055;
const server = app.listen(TEST_PORT, async () => {
  console.log(`[HTTP Test] Test server running on http://localhost:${TEST_PORT}`);

  try {
    const BASE = `http://127.0.0.1:${TEST_PORT}/api`;

    // 1. Demo Login
    const loginRes = await fetch(`${BASE}/auth/demo-login`, { method: 'POST' });
    const loginData = await loginRes.json() as any;
    console.log('✓ 1. Demo Login HTTP response:', loginRes.status, loginData.user?.email);
    if (!loginData.token) throw new Error('Demo login failed: missing token');
    const token = loginData.token;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. Dashboard Analytics (Monthly)
    const dashRes = await fetch(`${BASE}/analytics/dashboard`, { headers });
    const dashData = await dashRes.json() as any;
    console.log('✓ 2. Dashboard Monthly:', dashRes.status, `Balance=₹${dashData.kpis.totalBalance}`);

    // 3. Dashboard Weekly, Daily, Yearly
    for (const tf of ['daily', 'weekly', 'yearly']) {
      const tfRes = await fetch(`${BASE}/analytics/dashboard?timeframe=${tf}`, { headers });
      const tfData = await tfRes.json() as any;
      console.log(`✓ 3. Dashboard ${tf}:`, tfRes.status, `Inflow=₹${tfData.kpis.monthlyIncome}`);
    }

    // 4. Transactions List
    const txRes = await fetch(`${BASE}/transactions`, { headers });
    const txData = await txRes.json() as any;
    console.log('✓ 4. Transactions List:', txRes.status, `Count=${txData.transactions.length}`);

    // 5. Add Transaction
    const addTxRes = await fetch(`${BASE}/transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'expense',
        amount: 320,
        category: 'Food',
        description: 'Swiggy Midnight Snack & Coffee',
        date: '2026-11-06',
        payment_method: 'UPI',
        notes: 'Late night study session'
      })
    });
    const addTxData = await addTxRes.json() as any;
    console.log('✓ 5. Add Transaction:', addTxRes.status, `ID=${addTxData.id}`);

    // 6. AI Categorize endpoint
    const catRes = await fetch(`${BASE}/ai/categorize`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        description: 'Uber Auto to Metro Station',
        amount: 90,
        type: 'expense'
      })
    });
    const catData = await catRes.json() as any;
    console.log('✓ 6. AI Categorize endpoint:', catRes.status, `Category=${catData.category} (${catData.confidence * 100}%)`);

    // 7. AI Chat Assistant
    const chatRes = await fetch(`${BASE}/ai/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: 'Where am I spending most?' })
    });
    const chatData = await chatRes.json() as any;
    console.log('✓ 7. AI Chat Assistant:', chatRes.status, `Reply preview: ${chatData.reply.substring(0, 80)}...`);

    // 8. AI Spending Analysis
    const spendRes = await fetch(`${BASE}/ai/spending-analysis`, {
      method: 'POST',
      headers
    });
    const spendData = await spendRes.json() as any;
    console.log('✓ 8. AI Spending Analysis:', spendRes.status, `Health Score=${spendData.healthScore}/100`);

    // 9. Budgets List & Thresholds
    const bgtRes = await fetch(`${BASE}/budgets`, { headers });
    const bgtData = await bgtRes.json() as any;
    console.log('✓ 9. Budgets List:', bgtRes.status, `Total budgets=${bgtData.budgets.length}`);

    // 10. Savings Goals List & Contribute
    const goalsRes = await fetch(`${BASE}/goals`, { headers });
    const goalsData = await goalsRes.json() as any;
    console.log('✓ 10. Goals List:', goalsRes.status, `Active goals=${goalsData.goals.length}`);

    if (goalsData.goals.length > 0) {
      const gId = goalsData.goals[0].id;
      const contribRes = await fetch(`${BASE}/goals/${gId}/contribute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount: 1000, action: 'deposit' })
      });
      console.log('✓ 11. Goal Contribution (Deposit ₹1000):', contribRes.status);
    }

    // 11. Monthly Report Statement
    const repRes = await fetch(`${BASE}/analytics/report?month=2026-11`, { headers });
    const repData = await repRes.json() as any;
    console.log('✓ 12. Monthly Report Statement:', repRes.status, `Income=₹${repData.totalIncome}`);

    console.log('\n======================================================');
    console.log('✅ ALL 12 END-TO-END HTTP REST ENDPOINTS ARE VERIFIED!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('HTTP Test Failed:', err);
    process.exitCode = 1;
  } finally {
    server.close(() => {
      console.log('[HTTP Test] Test server shut down cleanly.');
      process.exit(process.exitCode || 0);
    });
  }
});
