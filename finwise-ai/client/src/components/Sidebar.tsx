import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Bot,
  PieChart,
  Target,
  Sparkles,
  FileSpreadsheet,
  LogOut,
  Key,
  RefreshCw,
  Wallet,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { transactionsApi } from '../services/api';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openApiKeyModal: () => void;
  onRefreshData?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  openApiKeyModal,
  onRefreshData
}) => {
  const { user, logout } = useAuth();
  const [isResetting, setIsResetting] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'ai-chat', label: 'AI Financial Assistant', icon: Bot, badge: 'Gemini' },
    { id: 'spending-analysis', label: 'AI Spending Analysis', icon: Sparkles },
    { id: 'budgets', label: 'Budgets & Alerts', icon: PieChart },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'reports', label: 'Monthly Reports', icon: FileSpreadsheet },
  ];

  const handleResetDemo = async () => {
    if (confirm('Reload realistic Indian student/individual demo data? This will restore realistic INR transactions, budgets, and goals.')) {
      try {
        setIsResetting(true);
        await transactionsApi.seedDemo();
        if (onRefreshData) onRefreshData();
      } catch (err) {
        console.error('Failed to reset demo data:', err);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">FinWise</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded">AI</span>
              </div>
              <p className="text-[11px] text-slate-400">Intelligent Personal Finance</p>
            </div>
          </div>
        </div>

        {/* Demo Mode Pill */}
        {user?.isDemo && (
          <div className="mx-4 mt-3 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium">Demo Mode (INR ₹)</span>
            </div>
            <button
              onClick={handleResetDemo}
              disabled={isResetting}
              title="Reset Demo Data"
              className="text-indigo-400 hover:text-white transition p-1 hover:bg-indigo-800/40 rounded flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="text-[10px]">Reset</span>
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & User */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        {/* AI Key Status Button */}
        <button
          onClick={openApiKeyModal}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700/60 transition"
        >
          <div className="flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Configuration</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${user?.hasCustomApiKey ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
            {user?.hasCustomApiKey ? 'Custom Key' : 'Smart Fallback'}
          </span>
        </button>

        {/* User Card */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {user?.name ? user.name.substring(0, 2) : 'FW'}
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
