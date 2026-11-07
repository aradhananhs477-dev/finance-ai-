import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  Edit2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { Transaction, TransactionCategory, TransactionType } from '../types';
import { transactionsApi } from '../services/api';

interface TransactionsPageProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

const CATEGORIES: string[] = [
  'All',
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

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenAddModal,
  onEditTransaction
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedType !== 'all') params.type = selectedType;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await transactionsApi.getAll(params);
      setTransactions(res.transactions);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedCategory, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        setIsDeleting(id);
        await transactionsApi.delete(id);
        setTransactions(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        console.error('Failed to delete transaction:', err);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount (INR)', 'Payment Method', 'Notes'];
    const rows = transactions.map(t => [
      t.id,
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
    link.setAttribute('download', `FinWise_Transactions_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by description, merchant, or notes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#111827] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </form>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Category Chips Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                  : 'bg-[#111827] text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              selectedType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType('income')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              selectedType === 'income' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setSelectedType('expense')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              selectedType === 'expense' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Expense
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-4">Transaction / Merchant</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">AI Status</th>
                <th className="py-3.5 px-5 text-right">Amount (₹)</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                      <span>Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {tx.date}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-xs">{tx.description}</span>
                        {tx.is_demo === 1 && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40 shrink-0">
                            Demo
                          </span>
                        )}
                      </div>
                      {tx.notes && (
                        <p className="text-[11px] text-slate-400 font-normal truncate max-w-xs mt-0.5">
                          {tx.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700/60 font-medium">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {tx.payment_method}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {tx.ai_suggested === 1 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                          <span>AI Auto</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Manual</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold whitespace-nowrap">
                      <span className={tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          title="Edit transaction"
                          className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          disabled={isDeleting === tx.id}
                          title="Delete transaction"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
