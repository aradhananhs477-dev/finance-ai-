import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Zap,
  Target
} from 'lucide-react';
import { SpendingAnalysis } from '../types';
import { aiApi } from '../services/api';

export const SpendingAnalysisPage: React.FC = () => {
  const [analysis, setAnalysis] = useState<SpendingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});

  const fetchAnalysis = async () => {
    try {
      setIsLoading(true);
      const data = await aiApi.analyzeSpending();
      setAnalysis(data);
    } catch (err) {
      console.error('Failed to run spending analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const toggleTask = (index: number) => {
    setCompletedTasks(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (isLoading || !analysis) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Gemini AI is analyzing your spending patterns & database records...</p>
        </div>
      </div>
    );
  }

  const { healthScore, summary, spendingPatterns, anomalies, highSpendingCategories, savingsOpportunities, actionPlan } = analysis;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner: Health Score & Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Health Score Meter */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-[#111827] border border-purple-500/30 shadow-2xl flex flex-col justify-between items-center text-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Financial Health Index
            </span>
            <button
              onClick={fetchAnalysis}
              disabled={isLoading}
              title="Re-run AI Analysis"
              className="p-1 text-purple-400 hover:text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            {/* Circular Ring Glow */}
            <div className="w-36 h-36 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-full border-8 border-purple-500 border-t-emerald-400 border-r-indigo-400 animate-spin-slow"
                style={{ transform: `rotate(${healthScore * 3.6}deg)` }}
              ></div>
              <div className="text-center z-10">
                <span className="text-4xl font-black text-white">{healthScore}</span>
                <span className="text-xs text-slate-400 block font-semibold">/ 100</span>
              </div>
            </div>
          </div>

          <div className="w-full pt-2">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {healthScore >= 80 ? '🟢 Strong Financial Discipline' : healthScore >= 60 ? '🟡 Moderate Stability' : '🔴 Needs Budget Review'}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Calculated using actual cash-retention, category caps, and goal contributions.
            </p>
          </div>
        </div>

        {/* AI Executive Commentary */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">AI Financial Diagnosis</h3>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {summary}
            </p>
          </div>

          {/* Key Detected Patterns */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Key Spending Patterns Identified
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {spendingPatterns.map((pat, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                  <span className="leading-snug">{pat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Anomalies & Leakage Alerts */}
      {anomalies && anomalies.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Anomalies & Spending Leakage Alerts</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {anomalies.map((anom, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#111827] border border-amber-900/40 text-xs text-amber-200/90 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0"></span>
                <span>{anom}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High-Spending Categories Analysis */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
        <div>
          <h4 className="text-sm font-bold text-white">Top Expense Outflows & Category Diagnosis</h4>
          <p className="text-xs text-slate-400">Grounded in actual current month expense debits</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {highSpendingCategories.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{item.category}</span>
                <span className="text-xs font-bold text-purple-300">{item.percentage}% of expenses</span>
              </div>
              <p className="text-lg font-black text-white">
                ₹{item.amount.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.insight}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tailored Savings Opportunities & Concrete Action Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tailored Savings Opportunities */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Personalized Savings Opportunities</h4>
              <p className="text-xs text-slate-400">Quantified optimization tactics based on your transaction habits</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <Zap className="w-3.5 h-3.5" />
              <span>
                Total Potential: ₹{savingsOpportunities.reduce((acc, s) => acc + s.potentialMonthlySavings, 0).toLocaleString('en-IN')}/mo
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {savingsOpportunities.map((opp, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>{opp.title}</span>
                  </h5>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      opp.impact === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {opp.impact} Impact
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      +₹{opp.potentialMonthlySavings.toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {opp.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Plan Checklist */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white">Recommended Action Plan</h4>
            <p className="text-xs text-slate-400">Check off steps as you implement them</p>
          </div>

          <div className="space-y-3">
            {actionPlan.map((step, idx) => {
              const isChecked = Boolean(completedTasks[idx]);
              return (
                <div
                  key={idx}
                  onClick={() => toggleTask(idx)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition flex items-start gap-3 select-none ${
                    isChecked
                      ? 'bg-purple-950/20 border-purple-800/40 text-slate-400 line-through'
                      : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-purple-500/40'
                  }`}
                >
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border transition ${
                    isChecked ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-600 bg-slate-800'
                  }`}>
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className="leading-snug">{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
