import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  X,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { SavingsGoal } from '../types';
import { goalsApi } from '../services/api';

export const SavingsGoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [totalTarget, setTotalTarget] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Add/Edit modal state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Emergency');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Contribute / Deposit modal state
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [contributeAction, setContributeAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [isDepositing, setIsDepositing] = useState(false);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const res = await goalsApi.getAll();
      setGoals(res.goals);
      setTotalTarget(res.totalTarget);
      setTotalSaved(res.totalSaved);
      setOverallProgress(res.overallProgress);
    } catch (err) {
      console.error('Failed to fetch savings goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenGoalModal = (goal?: SavingsGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setTitle(goal.title);
      setTargetAmount(goal.target_amount.toString());
      setCurrentAmount(goal.current_amount.toString());
      setTargetDate(goal.target_date);
      setCategory(goal.category || 'General');
      setNotes(goal.notes || '');
    } else {
      setEditingGoal(null);
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('');
      setTargetDate('');
      setCategory('Emergency');
      setNotes('');
    }
    setModalError(null);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount || !targetDate) {
      setModalError('Please fill in title, target amount, and target deadline date');
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);
      const payload = {
        title: title.trim(),
        target_amount: Number(targetAmount),
        current_amount: Number(currentAmount) || 0,
        target_date: targetDate,
        category,
        notes: notes.trim()
      };

      if (editingGoal) {
        await goalsApi.update(editingGoal.id, payload);
      } else {
        await goalsApi.create(payload);
      }

      setIsGoalModalOpen(false);
      fetchGoals();
    } catch (err: any) {
      setModalError(err?.response?.data?.error || 'Failed to save savings goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenContributeModal = (goal: SavingsGoal) => {
    setContributingGoal(goal);
    setDepositAmount('');
    setContributeAction('deposit');
    setIsContributeModalOpen(true);
  };

  const handleSaveContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributingGoal || !depositAmount || Number(depositAmount) <= 0) return;

    try {
      setIsDepositing(true);
      await goalsApi.contribute(contributingGoal.id, Number(depositAmount), contributeAction);
      setIsContributeModalOpen(false);
      fetchGoals();
    } catch (err) {
      console.error('Failed to contribute:', err);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (confirm('Delete this savings goal?')) {
      try {
        await goalsApi.delete(id);
        fetchGoals();
      } catch (err) {
        console.error('Failed to delete goal:', err);
      }
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Overview Banner */}
      <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Target Wealth Accumulation
          </span>
          <h2 className="text-2xl font-black text-white">
            ₹{totalSaved.toLocaleString('en-IN')} <span className="text-sm font-normal text-slate-400">saved of ₹{totalTarget.toLocaleString('en-IN')} total goals</span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
            <span className="text-emerald-400 font-bold">{overallProgress}% funded</span>
            <span>•</span>
            <span>{goals.length} active targets</span>
          </div>
        </div>

        <button
          onClick={() => handleOpenGoalModal()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-purple-400 mb-2" />
            Loading savings goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-[#111827] rounded-2xl border border-slate-800 p-8">
            <Target className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-white">No Savings Goals Set</p>
            <p className="text-slate-400 mt-1">Start tracking for your Emergency Fund, Tech upgrades, or Trips!</p>
          </div>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className="p-6 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 shadow-xl transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      {goal.category}
                    </span>
                    <h3 className="font-bold text-base text-white mt-1.5">{goal.title}</h3>
                    {goal.notes && (
                      <p className="text-xs text-slate-400 mt-0.5">{goal.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenGoalModal(goal)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                      title="Edit goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar and metrics */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-black text-white">
                        ₹{goal.current_amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400 ml-1.5">
                        / ₹{goal.target_amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-purple-400">
                      {goal.progress}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.progress >= 100
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, goal.progress)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>₹{goal.remaining.toLocaleString('en-IN')} remaining</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      Target: {goal.target_date} ({goal.monthsRemaining} mo)
                    </span>
                  </div>
                </div>

                {/* AI Suggested Monthly Contribution Chip */}
                {goal.remaining > 0 && (
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-purple-200">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Suggested Monthly Contribution:</span>
                    </div>
                    <span className="font-bold text-white bg-purple-600/30 px-2 py-0.5 rounded text-xs">
                      ₹{goal.suggestedMonthly.toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                )}
              </div>

              {/* Action: Deposit / Withdraw button */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {goal.progress >= 100 ? '🎉 Target Achieved!' : 'Active goal track'}
                </span>
                <button
                  onClick={() => handleOpenContributeModal(goal)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Deposit / Withdraw</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsGoalModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              {editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Set target amount, current balance, and deadline to calculate automated monthly pace
            </p>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. MacBook Pro M-Series or Emergency Fund"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="80000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Current Saved (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="Gadgets">Gadgets</option>
                    <option value="Travel">Travel</option>
                    <option value="Education">Education</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Parked in high-yield liquid FD"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit / Withdraw Modal */}
      {isContributeModalOpen && contributingGoal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <button
              onClick={() => setIsContributeModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Adjust Goal Savings</h3>
            <p className="text-xs text-slate-400 mb-4">
              {contributingGoal.title} (Current: ₹{contributingGoal.current_amount.toLocaleString('en-IN')})
            </p>

            <form onSubmit={handleSaveContribute} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setContributeAction('deposit')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                    contributeAction === 'deposit'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  + Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setContributeAction('withdraw')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                    contributeAction === 'withdraw'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  - Withdraw
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Amount (₹ INR)
                </label>
                <input
                  type="number"
                  min="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContributeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDepositing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-50"
                >
                  {isDepositing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
