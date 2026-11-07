import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  RefreshCw,
  Wallet,
  X,
  Loader2
} from 'lucide-react';
import { Budget, TransactionCategory } from '../types';
import { budgetsApi } from '../services/api';

const ALL_CATEGORIES: TransactionCategory[] = [
  'Food',
  'Shopping',
  'Education',
  'Transport',
  'Entertainment',
  'Healthcare',
  'Bills',
  'Rent',
  'Travel',
  'Others'
];

export const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [overallPercentage, setOverallPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>('Food');
  const [limitAmount, setLimitAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      const res = await budgetsApi.getAll();
      setBudgets(res.budgets);
      setTotalBudget(res.totalBudget);
      setTotalSpent(res.totalSpent);
      setOverallPercentage(res.overallPercentage);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleOpenAddModal = (editBudget?: Budget) => {
    if (editBudget) {
      setSelectedCategory(editBudget.category);
      setLimitAmount(editBudget.monthly_limit.toString());
    } else {
      setSelectedCategory('Food');
      setLimitAmount('');
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitAmount || Number(limitAmount) <= 0) {
      setError('Please enter a valid monthly limit amount in ₹');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await budgetsApi.createOrUpdate({
        category: selectedCategory,
        monthly_limit: Number(limitAmount)
      });
      setIsModalOpen(false);
      fetchBudgets();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm('Delete this budget?')) {
      try {
        await budgetsApi.delete(id);
        fetchBudgets();
      } catch (err) {
        console.error('Failed to delete budget:', err);
      }
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Overview Card */}
      <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Monthly Expense Ceiling
          </span>
          <h2 className="text-2xl font-black text-white">
            ₹{totalSpent.toLocaleString('en-IN')} <span className="text-sm font-normal text-slate-400">spent of ₹{totalBudget.toLocaleString('en-IN')} total limit</span>
          </h2>
          <p className="text-xs text-slate-400">
            {overallPercentage}% utilized across all budget categories in November 2026
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Set Category Budget</span>
          </button>
        </div>
      </div>

      {/* Alert Banner if any budget >= 80% or >= 100% */}
      {budgets.some(b => b.isOverBudget || b.isWarning) && (
        <div className="space-y-2">
          {budgets.filter(b => b.isOverBudget).map(b => (
            <div key={`over-${b.id}`} className="p-4 rounded-2xl bg-rose-950/30 border border-rose-600/40 text-xs text-rose-300 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <strong className="font-bold text-white">100% Threshold Exceeded in {b.category}:</strong> Spent ₹{b.spent.toLocaleString('en-IN')} of ₹{b.monthly_limit.toLocaleString('en-IN')} limit (Over by ₹{(b.spent - b.monthly_limit).toLocaleString('en-IN')})
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-600/30 text-rose-200 text-[10px] font-bold shrink-0">
                Action Required
              </span>
            </div>
          ))}

          {budgets.filter(b => b.isWarning && !b.isOverBudget).map(b => (
            <div key={`warn-${b.id}`} className="p-4 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-xs text-amber-300 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <strong className="font-bold text-white">80% Warning Alert in {b.category}:</strong> You have reached {b.percentage}% (₹{b.remaining.toLocaleString('en-IN')} remaining this month).
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-600/30 text-amber-200 text-[10px] font-bold shrink-0">
                Caution
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-purple-400 mb-2" />
            Loading your budgets...
          </div>
        ) : budgets.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-[#111827] rounded-2xl border border-slate-800 p-8">
            <PieChart className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-white">No Category Budgets Configured</p>
            <p className="text-slate-400 mt-1">Set monthly limits to get automatic 80% caution and 100% danger alerts!</p>
          </div>
        ) : (
          budgets.map((b) => (
            <div
              key={b.id}
              className={`p-5 rounded-2xl bg-[#111827] border transition shadow-lg space-y-4 ${
                b.isOverBudget
                  ? 'border-rose-600/50 hover:border-rose-500'
                  : b.isWarning
                  ? 'border-amber-500/50 hover:border-amber-400'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">{b.category}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Monthly Limit: ₹{b.monthly_limit.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenAddModal(b)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                    title="Edit budget"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(b.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition"
                    title="Delete budget"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress and status */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">
                    ₹{b.spent.toLocaleString('en-IN')} spent
                  </span>
                  <span className={`font-bold ${
                    b.isOverBudget ? 'text-rose-400' : b.isWarning ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {b.percentage}%
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      b.isOverBudget ? 'bg-rose-500' : b.isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, b.percentage)}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>
                    {b.isOverBudget ? (
                      <span className="text-rose-400 font-medium">Over by ₹{(b.spent - b.monthly_limit).toLocaleString('en-IN')}</span>
                    ) : (
                      <span>₹{b.remaining.toLocaleString('en-IN')} remaining</span>
                    )}
                  </span>
                  <span>
                    {b.isOverBudget ? '🚨 Over Budget' : b.isWarning ? '⚠️ 80% Reached' : '🟢 On Track'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Set / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Set Category Budget</h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure spending threshold to get active 80% caution & 100% breach notifications
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as TransactionCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  {ALL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Monthly Limit (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="100"
                    value={limitAmount}
                    onChange={(e) => setLimitAmount(e.target.value)}
                    placeholder="e.g. 8000"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
