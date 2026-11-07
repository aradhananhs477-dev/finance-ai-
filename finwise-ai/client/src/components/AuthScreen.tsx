import React, { useState } from 'react';
import {
  Wallet,
  Sparkles,
  Bot,
  PieChart,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Target,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthScreen: React.FC = () => {
  const { login, register, demoLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ email, password, name, currency: 'INR' });
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setError(null);
    setIsDemoLoading(true);
    try {
      await demoLogin();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to start demo session');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-xl shadow-purple-600/30">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white tracking-tight">FinWise</span>
                <span className="px-2 py-0.5 text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                  AI
                </span>
              </div>
              <p className="text-xs text-purple-300 font-medium">Intelligent Personal Finance Management</p>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Master Your Money with <span className="gradient-text">Gemini AI</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
              Designed for students, young professionals, and conscious savers. Track income, categorize transactions with Gemini AI, simulate savings goals, and chat directly with your personal financial co-pilot in INR (₹).
            </p>
          </div>

          {/* Value Props Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">AI Auto-Categorization</h4>
              <p className="text-[11px] text-slate-400">Classifies Swiggy, Uber, Amazon & tuition fees automatically.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Interactive RAG Chatbot</h4>
              <p className="text-[11px] text-slate-400">Answers *"Where am I spending most?"* grounded in your database.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">80% & 100% Budget Alerts</h4>
              <p className="text-[11px] text-slate-400">Real-time thresholds to prevent end-of-month cash pinches.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Savings Goals Tracker</h4>
              <p className="text-[11px] text-slate-400">Emergency fund, laptop upgrade & trips with monthly contribution math.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="lg:col-span-5">
          <div className="bg-[#111827] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/40 relative">
            {/* Quick Demo Access Hero Button */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-purple-900/50 via-indigo-900/40 to-slate-900 border border-purple-500/30 shadow-lg text-center space-y-2.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-purple-300">
                <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Instant Evaluation / Demo</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Try the full application immediately with 25+ realistic Indian student & professional transactions in INR (₹).
              </p>
              <button
                onClick={handleDemoAccess}
                disabled={isDemoLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 transition transform active:scale-95 disabled:opacity-50"
              >
                <span>{isDemoLoading ? 'Loading Demo Profile...' : '🚀 Launch Demo Account (1-Click)'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-[#111827] px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Or Sign In
              </span>
              <div className="border-t border-slate-800 w-full"></div>
            </div>

            {/* Login / Register Tab */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 rounded-xl mb-4 border border-slate-800">
              <button
                onClick={() => setIsLogin(true)}
                className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                  isLogin ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                  !isLogin ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav@college.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Processing...' : isLogin ? 'Sign In to FinWise' : 'Create FinWise Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
