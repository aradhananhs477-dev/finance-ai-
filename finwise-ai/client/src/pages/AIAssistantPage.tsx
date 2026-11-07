import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  RefreshCw,
  Lightbulb,
  ShieldCheck,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { ChatMessage } from '../types';
import { aiApi } from '../services/api';

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Where am I spending most?',
    'How much did I spend on food?',
    'How can I save ₹2,000 next month?',
    'Which expenses can I reduce?',
    'Compare this month with last month',
    'How are my savings goals progressing?'
  ];

  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await aiApi.getChatHistory();
      if (res.messages && res.messages.length > 0) {
        setMessages(res.messages);
      } else {
        // Default greeting if empty
        setMessages([
          {
            id: 'msg_greet',
            role: 'assistant',
            content: `👋 Hello! I am **FinWise AI**, your intelligent personal finance assistant.\n\nI have full, real-time context of your actual income, expenses, category budgets, and savings goals in **INR (₹)**.\n\nTry asking me any question below, or type your own!`
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    const tempUserMsg: ChatMessage = {
      id: 'tmp_user_' + Date.now(),
      role: 'user',
      content: text.trim()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await aiApi.chat(text.trim());
      setMessages(prev => [...prev, res.assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'tmp_err_' + Date.now(),
          role: 'assistant',
          content: '⚠️ I encountered an error connecting to the AI engine. Please verify your connection or try again shortly.'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Clear your conversation history with FinWise AI?')) {
      try {
        await aiApi.clearChatHistory();
        setMessages([
          {
            id: 'msg_greet_fresh',
            role: 'assistant',
            content: 'Conversation history cleared. How can I assist with your finances today?'
          }
        ]);
      } catch (err) {
        console.error('Failed to clear history:', err);
      }
    }
  };

  // Helper to render markdown-like formatting simply
  const renderMessageContent = (content: string) => {
    // Process headers and bolding
    const paragraphs = content.split('\n\n');
    return (
      <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
        {paragraphs.map((p, idx) => {
          if (p.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-white text-sm mt-2 mb-1 text-purple-300">
                {p.replace('### ', '')}
              </h4>
            );
          }
          if (p.startsWith('**') && p.endsWith('**')) {
            return (
              <p key={idx} className="font-bold text-white">
                {p.replace(/\*\*/g, '')}
              </p>
            );
          }

          // Bullet lists
          if (p.includes('\n- ') || p.startsWith('- ')) {
            const lines = p.split('\n').filter(Boolean);
            return (
              <ul key={idx} className="space-y-1.5 list-disc pl-4 text-slate-200">
                {lines.map((line, lIdx) => {
                  const cleaned = line.replace(/^- /, '');
                  return (
                    <li key={lIdx}>
                      <span dangerouslySetInnerHTML={{ __html: formatBoldAndCurrency(cleaned) }} />
                    </li>
                  );
                })}
              </ul>
            );
          }

          return (
            <p
              key={idx}
              className="text-slate-200"
              dangerouslySetInnerHTML={{ __html: formatBoldAndCurrency(p) }}
            />
          );
        })}
      </div>
    );
  };

  const formatBoldAndCurrency = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-purple-300">$1</em>');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-5rem)] flex flex-col">
      {/* Top Banner */}
      <div className="mb-4 p-4 rounded-2xl bg-[#111827] border border-slate-800 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">FinWise Intelligent Co-Pilot</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                Grounded in Live Data
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Answers calculations, analyses, and savings strategies using your real database records
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          title="Clear chat history"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400 mr-2" />
            Loading conversation...
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 shadow-lg ${
                    isUser
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-[#111827] border border-slate-800 rounded-tl-none'
                  }`}
                >
                  {isUser ? (
                    <p className="text-xs sm:text-sm font-medium">{msg.content}</p>
                  ) : (
                    renderMessageContent(msg.content)
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                    You
                  </div>
                )}
              </div>
            );
          })
        )}

        {isSending && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-purple-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-slate-400 text-[11px] ml-1">Analyzing financial context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            Try:
          </span>
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSendMessage(p)}
              disabled={isSending}
              className="px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-slate-800 text-slate-300 hover:text-purple-300 border border-slate-800 hover:border-purple-500/40 text-[11px] whitespace-nowrap transition disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-[#111827] border border-slate-700/80 rounded-2xl p-2 shadow-2xl focus-within:border-purple-500 transition"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask FinWise AI (e.g. How can I save ₹2,000 next month? Or where did I spend most?)"
          className="flex-1 bg-transparent px-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending || !inputText.trim()}
          className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition shadow-md shadow-purple-600/30 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
