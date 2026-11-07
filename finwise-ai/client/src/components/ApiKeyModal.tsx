import React, { useState } from 'react';
import { X, Key, ExternalLink, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const { user, updateApiKey } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await updateApiKey(apiKey);
      setMessage({ type: 'success', text: apiKey ? 'Custom Gemini API Key updated successfully!' : 'Cleared custom key. Using backend default/heuristic engine.' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.error || 'Failed to update key' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Google Gemini AI Configuration</h3>
            <p className="text-xs text-slate-400">Power intelligent categorization and real-time chat</p>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200/90 space-y-1">
          <p className="font-semibold text-purple-300">💡 How FinWise AI Works:</p>
          <p>
            When a Gemini API Key is provided, all categorization, chatbot answers, and spending recommendations run directly via <strong>Gemini 1.5/2.5 Flash</strong>.
          </p>
          <p>
            If no key is configured, FinWise AI seamlessly runs an intelligent local heuristic classifier and mathematical grounding engine.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={user?.hasCustomApiKey ? '•••••••••••••••••••••••• (Key Configured)' : 'AIzaSy...'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Leave blank and save to clear key.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
              >
                Get Free API Key <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-800/50'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <ShieldAlert className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
