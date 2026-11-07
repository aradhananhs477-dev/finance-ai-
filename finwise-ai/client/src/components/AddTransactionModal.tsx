import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Check, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Transaction, TransactionCategory, PaymentMethod, TransactionType } from '../types';
import { aiApi, transactionsApi } from '../services/api';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTransaction?: Transaction | null;
}

const CATEGORIES: TransactionCategory[] = [
  'Food',
  'Shopping',
  'Education',
  'Transport',
  'Entertainment',
  'Healthcare',
  'Bills',
  'Rent',
  'Travel',
  'Salary',
  'Freelancing',
  'Investments',
  'Others'
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Net Banking',
  'Credit Card',
  'Debit Card',
  'Cash'
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editTransaction
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [notes, setNotes] = useState<string>('');

  // AI categorization states
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: TransactionCategory;
    confidence: number;
    reasoning: string;
    suggestedTags: string[];
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(editTransaction.amount.toString());
      setDescription(editTransaction.description);
      setCategory(editTransaction.category);
      setPaymentMethod(editTransaction.payment_method);
      setDate(editTransaction.date);
      setNotes(editTransaction.notes || '');
      setAiSuggestion(null);
    } else {
      setType('expense');
      setAmount('');
      setDescription('');
      setCategory('Food');
      setPaymentMethod('UPI');
      setDate(new Date().toISOString().substring(0, 10));
      setNotes('');
      setAiSuggestion(null);
    }
    setError(null);
  }, [editTransaction, isOpen]);

  if (!isOpen) return null;

  // Trigger Gemini AI auto-categorization
  const handleAutoCategorize = async () => {
    if (!description.trim()) {
      setError('Please enter a description first to auto-categorize (e.g. Swiggy, Uber, Amazon)');
      return;
    }

    try {
      setIsCategorizing(true);
      setError(null);
      const result = await aiApi.categorize(description, Number(amount) || 0, type);
      setAiSuggestion(result);
      setCategory(result.category);
    } catch (err: any) {
      console.error('Categorization error:', err);
      setError('AI categorization temporarily unavailable. Please select category manually.');
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || Number(amount) <= 0) {
      setError('Please provide a valid description and positive amount in ₹');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        type,
        amount: Number(amount),
        category,
        description: description.trim(),
        date,
        payment_method: paymentMethod,
        notes: notes.trim(),
        ai_suggested: aiSuggestion ? 1 : 0,
        ai_confidence: aiSuggestion ? aiSuggestion.confidence : 0
      };

      if (editTransaction) {
        await transactionsApi.update(editTransaction.id, payload);
      } else {
        await transactionsApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">
          {editTransaction ? 'Edit Transaction' : 'Add New Transaction'}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Record your income or expense with automated Gemini AI categorization
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle: Expense vs Income */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => { setType('expense'); if (category === 'Salary' || category === 'Freelancing') setCategory('Food'); }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory('Salary'); }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span>Income</span>
            </button>
          </div>

          {/* Description with Auto-Categorize Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Description / Merchant
              </label>
              <button
                type="button"
                onClick={handleAutoCategorize}
                disabled={isCategorizing || !description.trim()}
                className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition disabled:opacity-40"
              >
                {isCategorizing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Predicting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>AI Categorize</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Swiggy ₹350, Uber ride to campus, Amazon tech gear"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>

          {/* AI Categorization Suggestion Feedback */}
          {aiSuggestion && (
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-700/50 space-y-1 text-xs animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Gemini Identified: <strong>{aiSuggestion.category}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-600/30 text-purple-300 font-bold text-[10px] border border-purple-500/30">
                  {Math.round(aiSuggestion.confidence * 100)}% match
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">{aiSuggestion.reasoning}</p>
            </div>
          )}

          {/* Amount (₹) & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Amount (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          {/* Category Dropdown & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Split with college roommate, reimbursed by office"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{editTransaction ? 'Update' : 'Save Transaction'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
