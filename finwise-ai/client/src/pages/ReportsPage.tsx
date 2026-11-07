import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Sparkles,
  TrendingUp,
  TrendingDown,
  PieChart,
  RefreshCw,
  Award,
  CreditCard
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { MonthlyReport } from '../types';
import { analyticsApi, aiApi } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const fetchReportData = async (month: string) => {
    try {
      setIsLoading(true);
      const res = await analyticsApi.getReport(month);
      setReport(res);

      // Fetch AI summary
      setIsLoadingAI(true);
      const aiRes = await aiApi.getMonthlySummary(month);
      setAiSummary(aiRes.summary);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchReportData(selectedMonth);
  }, [selectedMonth]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!report || report.transactions.length === 0) return;

    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount (INR)', 'Payment Method', 'Notes'];
    const rows = report.transactions.map(t => [
      t.date,
      t.type,
      t.category,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      t.payment_method,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinWise_Report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto print:p-2 print:space-y-4">
      {/* Month Selector & Print / Export Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-purple-400" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Select Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#111827] border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="2026-11">November 2026 (Current)</option>
              <option value="2026-10">October 2026 (Previous)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {isLoading || !report ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-purple-400 mb-2" />
          Generating monthly financial statement...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Statement Header Card */}
          <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Monthly Financial Statement
                </span>
                <h2 className="text-xl font-black text-white mt-0.5">
                  Statement Period: {selectedMonth}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Currency</span>
                <span className="text-xs font-bold text-white">INR (₹)</span>
              </div>
            </div>

            {/* 4 Performance Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block mb-1">Total Income</span>
                <span className="text-lg font-black text-emerald-400">
                  ₹{report.totalIncome.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block mb-1">Total Expenses</span>
                <span className="text-lg font-black text-rose-400">
                  ₹{report.totalExpense.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block mb-1">Net Savings</span>
                <span className="text-lg font-black text-purple-300">
                  ₹{report.netSavings.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block mb-1">Savings Rate</span>
                <span className="text-lg font-black text-white">
                  {report.savingsRate}%
                </span>
              </div>
            </div>
          </div>

          {/* AI-Generated Executive Summary Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-[#111827] border border-purple-600/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Gemini AI Executive Review</h3>
                  <p className="text-[11px] text-slate-400">Automated performance audit and next month strategy</p>
                </div>
              </div>

              {isLoadingAI && (
                <div className="flex items-center gap-1.5 text-xs text-purple-300">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/50 border border-purple-900/40 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {aiSummary}
            </div>
          </div>

          {/* Daily Outflow Chart */}
          {report.dailyTrend.length > 0 && (
            <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-white">Daily Spending Curve</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.dailyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spent']}
                    />
                    <Bar dataKey="amount" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Category Breakdown Table */}
          <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white">Category Statement Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4 text-right">% of Total Outflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {report.categoryBreakdown.map((cat) => (
                    <tr key={cat.category} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-white">{cat.category}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">₹{cat.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right">{cat.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
