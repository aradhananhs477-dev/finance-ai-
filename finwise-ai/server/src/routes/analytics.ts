import { Router, Response } from 'express';
import { queryOne, queryAll } from '../database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { getUserFinancialContext } from '../services/geminiService.js';

const router = Router();
router.use(authMiddleware);

// GET /api/analytics/dashboard?timeframe=daily|weekly|monthly|yearly
router.get('/dashboard', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const timeframe = (req.query.timeframe as string) || 'monthly'; // 'daily' | 'weekly' | 'monthly' | 'yearly'

  // Overall lifetime balance
  const totals = queryOne(`
    SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpense
    FROM transactions
    WHERE user_id = ?
  `, userId) as any;

  const totalIncomeAllTime = totals?.totalIncome || 0;
  const totalExpenseAllTime = totals?.totalExpense || 0;
  const totalBalance = totalIncomeAllTime - totalExpenseAllTime;

  // Determine date ranges based on timeframe
  const now = new Date();
  const todayStr = now.toISOString().substring(0, 10);
  const currentMonthYear = now.toISOString().substring(0, 7);
  const currentYear = now.getFullYear().toString();

  let currentPeriodTxs: any[] = [];
  let prevPeriodTxs: any[] = [];
  let timeframeTrends: { label: string; income: number; expense: number; savings: number }[] = [];

  if (timeframe === 'daily') {
    // Today
    currentPeriodTxs = queryAll(`
      SELECT * FROM transactions WHERE user_id = ? AND date = ?
    `, userId, todayStr) as any[];

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yestStr = yesterday.toISOString().substring(0, 10);
    prevPeriodTxs = queryAll(`
      SELECT * FROM transactions WHERE user_id = ? AND date = ?
    `, userId, yestStr) as any[];

    // Trend: past 7 days day-by-day
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().substring(0, 10);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

      const dData = queryOne(`
        SELECT
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as inc,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as exp
        FROM transactions
        WHERE user_id = ? AND date = ?
      `, userId, dStr) as any;

      const inc = dData?.inc || 0;
      const exp = dData?.exp || 0;
      timeframeTrends.push({ label: dayLabel, income: inc, expense: exp, savings: inc - exp });
    }

  } else if (timeframe === 'weekly') {
    // Current Week (last 7 days)
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const startStr = sevenDaysAgo.toISOString().substring(0, 10);

    currentPeriodTxs = queryAll(`
      SELECT * FROM transactions WHERE user_id = ? AND date >= ? AND date <= ?
    `, userId, startStr, todayStr) as any[];

    // Previous Week (days 7 to 13 ago)
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    const prevStartStr = fourteenDaysAgo.toISOString().substring(0, 10);
    const prevEndStr = new Date(sevenDaysAgo.getTime() - 86400000).toISOString().substring(0, 10);

    prevPeriodTxs = queryAll(`
      SELECT * FROM transactions WHERE user_id = ? AND date >= ? AND date <= ?
    `, userId, prevStartStr, prevEndStr) as any[];

    // Trend: Day-by-day for the past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().substring(0, 10);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dData = queryOne(`
        SELECT
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as inc,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as exp
        FROM transactions
        WHERE user_id = ? AND date = ?
      `, userId, dStr) as any;

      const inc = dData?.inc || 0;
      const exp = dData?.exp || 0;
      timeframeTrends.push({ label: dayLabel, income: inc, expense: exp, savings: inc - exp });
    }

  } else if (timeframe === 'yearly') {
    // Current Year
    currentPeriodTxs = queryAll(`
      SELECT * FROM transactions WHERE user_id = ? AND strftime('%Y', date) = ?
    `, userId, currentYear) as any[];

    // Previous Year
    const prevYearStr = (now.getFullYear() - 1).toString();
    prevPeriodTxs = queryAll(`
      SELECT * FROM transactions WHERE user_id = ? AND strftime('%Y', date) = ?
    `, userId, prevYearStr) as any[];

    // Trend: 12 months of the current year
    for (let m = 1; m <= 12; m++) {
      const mStr = `${currentYear}-${m.toString().padStart(2, '0')}`;
      const d = new Date(Number(currentYear), m - 1, 1);
      const mLabel = d.toLocaleString('en-US', { month: 'short' });

      const dData = queryOne(`
        SELECT
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as inc,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as exp
        FROM transactions
        WHERE user_id = ? AND strftime('%Y-%m', date) = ?
      `, userId, mStr) as any;

      const inc = dData?.inc || 0;
      const exp = dData?.exp || 0;
      timeframeTrends.push({ label: mLabel, income: inc, expense: exp, savings: inc - exp });
    }

  } else {
    // Monthly (Default)
    currentPeriodTxs = queryAll(`
      SELECT * FROM transactions WHERE user_id = ? AND strftime('%Y-%m', date) = ?
    `, userId, currentMonthYear) as any[];

    const prevDate = new Date(now);
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevMonthYear = prevDate.toISOString().substring(0, 7);

    prevPeriodTxs = queryAll(`
      SELECT * FROM transactions WHERE user_id = ? AND strftime('%Y-%m', date) = ?
    `, userId, prevMonthYear) as any[];

    // Trend: Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const mStr = d.toISOString().substring(0, 7);
      const label = d.toLocaleString('en-US', { month: 'short' });

      const dData = queryOne(`
        SELECT
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as inc,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as exp
        FROM transactions
        WHERE user_id = ? AND strftime('%Y-%m', date) = ?
      `, userId, mStr) as any;

      const inc = dData?.inc || 0;
      const exp = dData?.exp || 0;
      timeframeTrends.push({ label, income: inc, expense: exp, savings: inc - exp });
    }
  }

  // Calculate stats for current period
  let periodIncome = 0;
  let periodExpense = 0;
  const categoryMap: Record<string, number> = {};

  for (const tx of currentPeriodTxs) {
    if (tx.type === 'income') {
      periodIncome += tx.amount;
    } else {
      periodExpense += tx.amount;
      categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
    }
  }

  let prevPeriodIncome = 0;
  let prevPeriodExpense = 0;
  for (const tx of prevPeriodTxs) {
    if (tx.type === 'income') prevPeriodIncome += tx.amount;
    else prevPeriodExpense += tx.amount;
  }

  const netSavings = periodIncome - periodExpense;
  const savingsRate = periodIncome > 0 ? Number(((netSavings / periodIncome) * 100).toFixed(1)) : 0;

  const incomeGrowth = prevPeriodIncome > 0
    ? Number((((periodIncome - prevPeriodIncome) / prevPeriodIncome) * 100).toFixed(1))
    : 0;

  const expenseGrowth = prevPeriodExpense > 0
    ? Number((((periodExpense - prevPeriodExpense) / prevPeriodExpense) * 100).toFixed(1))
    : 0;

  // Category breakdown
  const categoryBreakdown = Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount,
    percentage: periodExpense > 0 ? Number(((amount / periodExpense) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.amount - a.amount);

  // Recent 6 transactions
  const recentTransactions = queryAll(`
    SELECT * FROM transactions
    WHERE user_id = ?
    ORDER BY date DESC, created_at DESC
    LIMIT 6
  `, userId) as any[];

  // Active Budgets
  const budgets = queryAll(`
    SELECT * FROM budgets WHERE user_id = ?
  `, userId) as any[];

  const monthlyExpenseMap: Record<string, number> = {};
  const currentMonthExpenses = queryAll(`
    SELECT category, SUM(amount) as amt FROM transactions
    WHERE user_id = ? AND type = 'expense' AND strftime('%Y-%m', date) = ?
    GROUP BY category
  `, userId, currentMonthYear) as any[];

  for (const row of currentMonthExpenses) {
    monthlyExpenseMap[row.category] = row.amt;
  }

  const budgetsSummary = budgets.map((b) => {
    const spent = monthlyExpenseMap[b.category] || 0;
    const pct = b.monthly_limit > 0 ? Number(((spent / b.monthly_limit) * 100).toFixed(1)) : 0;
    return {
      category: b.category,
      limit: b.monthly_limit,
      spent,
      remaining: Math.max(0, b.monthly_limit - spent),
      percentage: pct,
      alert: pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'ok'
    };
  });

  // Goals summary
  const goals = queryAll(`
    SELECT * FROM savings_goals WHERE user_id = ? ORDER BY target_date ASC LIMIT 3
  `, userId) as any[];

  const goalsSummary = goals.map(g => ({
    id: g.id,
    title: g.title,
    target: g.target_amount,
    current: g.current_amount,
    percentage: g.target_amount > 0 ? Number(((g.current_amount / g.target_amount) * 100).toFixed(1)) : 0
  }));

  return res.json({
    timeframe,
    kpis: {
      totalBalance,
      monthlyIncome: periodIncome,
      monthlyExpense: periodExpense,
      netSavings,
      savingsRate,
      incomeGrowth,
      expenseGrowth
    },
    categoryBreakdown,
    monthlyTrends: timeframeTrends,
    recentTransactions,
    budgetsSummary,
    goalsSummary
  });
});

// GET /api/analytics/report
router.get('/report', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const monthYear = (req.query.month as string) || new Date().toISOString().substring(0, 7);

  const transactions = queryAll(`
    SELECT * FROM transactions
    WHERE user_id = ? AND strftime('%Y-%m', date) = ?
    ORDER BY date ASC
  `, userId, monthYear) as any[];

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryMap: Record<string, number> = {};
  const paymentMethodMap: Record<string, number> = {};
  const dailySpendMap: Record<string, number> = {};

  for (const tx of transactions) {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
      categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
      paymentMethodMap[tx.payment_method] = (paymentMethodMap[tx.payment_method] || 0) + tx.amount;
      dailySpendMap[tx.date] = (dailySpendMap[tx.date] || 0) + tx.amount;
    }
  }

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Number(((netSavings / totalIncome) * 100).toFixed(1)) : 0;

  const categoryList = Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpense > 0 ? Number(((amount / totalExpense) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.amount - a.amount);

  const dailyTrend = Object.entries(dailySpendMap).map(([date, amount]) => ({
    date,
    amount
  })).sort((a, b) => a.date.localeCompare(b.date));

  return res.json({
    monthYear,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    transactionCount: transactions.length,
    categoryBreakdown: categoryList,
    paymentMethodBreakdown: paymentMethodMap,
    dailyTrend,
    transactions
  });
});

export default router;
