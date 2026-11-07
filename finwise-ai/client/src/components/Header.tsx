import React from 'react';
import { Plus, Bot, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentTab: string;
  onOpenAddModal: () => void;
  onNavigateToChat: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenAddModal,
  onNavigateToChat,
  onRefresh,
  isRefreshing = false
}) => {
  const { user } = useAuth();

  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Financial Overview',
      subtitle: 'Real-time metrics, cashflow trends, and AI-driven personal insights'
    },
    transactions: {
      title: 'Transaction Management',
      subtitle: 'Track, categorize, and audit all your income & expenses in INR (₹)'
    },
    'ai-chat': {
      title: 'AI Financial Assistant',
      subtitle: 'Ask questions grounded in your actual spending records with Gemini AI'
    },
    'spending-analysis': {
      title: 'AI Spending Analysis',
      subtitle: 'Deep-dive anomalies, spending leakage, and personalized monthly savings plans'
    },
    budgets: {
      title: 'Budget Management',
      subtitle: 'Set category thresholds with automated 80% caution and 100% danger alerts'
    },
    goals: {
      title: 'Savings Goals',
      subtitle: 'Set targets, track progress, and calculate AI suggested monthly contributions'
    },
    reports: {
      title: 'Financial Statements & Reports',
      subtitle: 'Review monthly balance sheets, category breakdowns, and AI executive summaries'
    }
  };

  const current = titles[currentTab] || { title: 'FinWise AI', subtitle: 'Intelligent Finance' };

  return (
    <header className="h-20 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          {current.title}
          {user?.isDemo && (
            <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Demo Data Active
            </span>
          )}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh All Data"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        )}

        {currentTab !== 'ai-chat' && (
          <button
            onClick={onNavigateToChat}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-800/60 text-xs font-semibold transition"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>Ask AI Assistant</span>
          </button>
        )}

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>
    </header>
  );
};
