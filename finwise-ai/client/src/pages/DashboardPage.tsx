import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Target,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import { DashboardAnalytics, Transaction } from '../types';
import { analyticsApi, aiApi } from '../services/api';

interface DashboardPageProps {
  onNavigateToTab: (tab: string) => void;
  onOpenAddModal: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#F59E0B',
  Shopping: '#EC4899',
  Education: '#8B5CF6',
  Transport: '#06B6D4',
  Entertainment: '#A855F7',
  Healthcare: '#10B981',
  Bills: '#F97316',
  Rent: '#3B82F6',
  Travel: '#14B8A6',
  Salary: '#10B981',
  Freelancing: '#6366F1',
  Investments: '#EAB308',
  Others: '#64748B'
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToTab,
  onOpenAddModal
}) => {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async (currentTimeframe: string) => {
    try {
      setIsLoading(true);
      const [dash, ins] = await Promise.all([
        analyticsApi.getDashboard(currentTimeframe),
        aiApi.getInsights()
      ]);
      setData(dash);
      setInsights(ins.insights || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(timeframe);
  }, [timeframe]);

  if (isLoading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Loading your financial analytics...</p>
        </div>
      </div>
    );
  }

  const { kpis, categoryBreakdown, monthlyTrends, recentTransactions, budgetsSummary, goalsSummary } = data;

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'daily':
        return { inflow: "Today's Inflow", outflow: "Today's Outflow", savings: "Today's Net Savings", comp: 'vs yesterday' };
      case 'weekly':
        return { inflow: "This Week's Inflow", outflow: "This Week's Outflow", savings: 'Weekly Savings Rate', comp: 'vs last week' };
      case 'yearly':
        return { inflow: 'Annual Inflow', outflow: 'Annual Outflow', savings: 'Annual Savings Rate', comp: 'vs last year' };
      default:
        return { inflow: 'Monthly Inflow', outflow: 'Monthly Outflow', savings: 'Monthly Savings Rate', comp: 'vs last month' };
    }
  };

  const labels = getTimeframeLabel();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Timeframe Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Overview & Performance</h2>
          <p className="text-xs text-slate-400">Financial health, trends, and real-time AI diagnoses</p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#111827] rounded-xl border border-slate-800 self-start sm:self-auto shadow-sm">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                timeframe === tf
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Balance */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Net Balance</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white tracking-tight">
              ₹{kpis.totalBalance.toLocaleString('en-IN')}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-semibold flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-0.5" /> Liquid Surplus
              </span>
              <span>across all records</span>
            </div>
          </div>
        </div>

        {/* Dynamic Period Income */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">{labels.inflow}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-emerald-400 tracking-tight">
              ₹{kpis.monthlyIncome.toLocaleString('en-IN')}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className={`font-semibold flex items-center ${kpis.incomeGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {kpis.incomeGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpis.incomeGrowth >= 0 ? `+${kpis.incomeGrowth}%` : `${kpis.incomeGrowth}%`}
              </span>
              <span className="text-slate-400">{labels.comp}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Period Expenses */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">{labels.outflow}</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-rose-400 tracking-tight">
              ₹{kpis.monthlyExpense.toLocaleString('en-IN')}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className={`font-semibold flex items-center ${kpis.expenseGrowth <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {kpis.expenseGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpis.expenseGrowth >= 0 ? `+${kpis.expenseGrowth}%` : `${kpis.expenseGrowth}%`}
              </span>
              <span className="text-slate-400">{labels.comp}</span>
            </div>
          </div>
        </div>

        {/* Net Savings & Rate */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">{labels.savings}</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-black text-purple-300 tracking-tight">
                {kpis.savingsRate}%
              </h3>
              <span className="text-xs font-semibold text-slate-300">
                +₹{kpis.netSavings.toLocaleString('en-IN')}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, kpis.savingsRate))}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Financial Insights Dynamic Deck */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#111827] border border-purple-800/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-sm font-bold text-white">Gemini AI Financial Pulse</h4>
          </div>
          <button
            onClick={() => onNavigateToTab('spending-analysis')}
            className="text-xs text-purple-300 hover:text-white flex items-center gap-1 font-semibold transition"
          >
            <span>View Full AI Deep Dive</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {insights.map((ins, i) => (
            <div
              key={ins.id || i}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1 hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-2 font-semibold text-white">
                <span className={`w-2 h-2 rounded-full ${
                  ins.type === 'positive' ? 'bg-emerald-400' : ins.type === 'warning' ? 'bg-amber-400' : 'bg-purple-400'
                }`}></span>
                <span>{ins.title}</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{ins.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section: Cash Flow Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cash Flow Area Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white capitalize">
                {timeframe} Cash Flow Trend
              </h4>
              <p className="text-xs text-slate-400">Income vs expenses trajectory across selected timeframe</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                <span className="text-slate-300">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
                <span className="text-slate-300">Expense</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey={(entry) => entry.label || entry.monthLabel || entry.month} stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInc)" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#F43F5E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExp)" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Expense Donut Chart */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Expense by Category</h4>
            <p className="text-xs text-slate-400">Spending distribution for this period</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center relative">
            {categoryBreakdown.length === 0 ? (
              <div className="text-xs text-slate-500 text-center">No expenses in this timeframe.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#8B5CF6'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top 4 Categories List */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-2">Add an expense to view breakdown</p>
            ) : (
              categoryBreakdown.slice(0, 4).map((cat) => (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#8B5CF6' }}
                    ></span>
                    <span className="text-slate-300 font-medium">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">{cat.percentage}%</span>
                    <span className="text-white font-semibold">₹{cat.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions & Budget Health / Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions List */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Recent Transactions</h4>
              <p className="text-xs text-slate-400">Latest recorded income & expense activities</p>
            </div>
            <button
              onClick={() => onNavigateToTab('transactions')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No transactions recorded yet.</div>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'income' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4 text-rose-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-white group-hover:text-purple-300 transition truncate max-w-[200px] sm:max-w-xs">
                          {tx.description}
                        </p>
                        {tx.is_demo === 1 && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                            Demo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                          {tx.category}
                        </span>
                        <span>•</span>
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>{tx.payment_method}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-xs font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Budget Health & Savings Goals Highlights */}
        <div className="lg:col-span-5 space-y-6">
          {/* Budget Health with 80% & 100% Alert Badges */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Monthly Budgets & Alerts</h4>
                <p className="text-xs text-slate-400">Active category thresholds</p>
              </div>
              <button
                onClick={() => onNavigateToTab('budgets')}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3.5">
              {budgetsSummary.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">No active budgets set.</div>
              ) : (
                budgetsSummary.slice(0, 4).map((b) => (
                  <div key={b.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <span>{b.category}</span>
                        {b.alert === 'danger' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Over Budget!
                          </span>
                        )}
                        {b.alert === 'warning' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> 80% Used
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        ₹{b.spent.toLocaleString('en-IN')} / ₹{b.limit.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          b.alert === 'danger'
                            ? 'bg-rose-500'
                            : b.alert === 'warning'
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Savings Goals */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Savings Targets</h4>
                <p className="text-xs text-slate-400">Target milestones</p>
              </div>
              <button
                onClick={() => onNavigateToTab('goals')}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
              >
                View Goals
              </button>
            </div>

            <div className="space-y-3">
              {goalsSummary.slice(0, 2).map((g) => (
                <div key={g.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{g.title}</span>
                    <span className="text-purple-300 font-bold">{g.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, g.percentage)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>₹{g.current.toLocaleString('en-IN')} saved</span>
                    <span>Target: ₹{g.target.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
