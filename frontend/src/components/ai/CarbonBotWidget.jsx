import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Leaf, Sparkles, X, Send, Loader2, User, RefreshCw } from 'lucide-react';
import aiAssistantService from '@/services/api/aiAssistantService';

export default function CarbonBotWidget() {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: t('ai.welcome', { defaultValue: "👋 Hi! I'm **CarbonBot**, your AI Sustainability Assistant.\n\nAsk me anything about reducing your carbon footprint, green travel, eco diets, or energy savings!" }),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "I travelled 30 km by car today. How to reduce?",
    "Give me 3 easy ways to lower my electricity bill.",
    "How many trees do I need to plant to offset 50 kg CO₂?",
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      aiAssistantService
        .getSuggestions()
        .then((data) => {
          if (data && data.length > 0) setSuggestions(data);
        })
        .catch(() => { });
    }
  }, [isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      const res = await aiAssistantService.sendMessage(query, history);

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.reply || t('ai.defaultReply', { defaultValue: "I'm here to help you live more sustainably!" }),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      if (res.suggestions && res.suggestions.length > 0) {
        setSuggestions(res.suggestions);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: t('ai.fallbackReply', { defaultValue: "I'm having trouble connecting to Gemini AI right now. Tip: Switching to public transit twice a week saves ~15 kg CO₂e weekly!" }),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format markdown headers, bold text, and clean lines
  const renderFormattedText = (txt) => {
    if (!txt) return null;
    return txt.split('\n').map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={idx} className="block min-h-[1.2rem]">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-emerald-950 dark:text-emerald-300">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          className="mb-4 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 backdrop-blur-xl"
          role="dialog"
          aria-label="CarbonBot Assistant"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xs">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  CarbonBot <span className="text-[10px] bg-emerald-400/30 px-1.5 py-0.5 rounded-full font-medium">AI 2.5</span>
                </h3>
                <p className="text-[11px] text-emerald-100/90 font-medium">
                  {t('ai.sustainabilityCoach', { defaultValue: 'Sustainability & Eco Coach' })}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-emerald-100 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="h-7 w-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Leaf className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none font-medium'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  <div className="space-y-1">{renderFormattedText(m.text)}</div>
                  <span
                    className={`block text-[9px] mt-1.5 text-right ${
                      m.sender === 'user' ? 'text-emerald-200' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
                {m.sender === 'user' && (
                  <div className="h-7 w-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="h-7 w-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Leaf className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" />
                  <span className="text-slate-500 dark:text-slate-400 text-xs italic">{t('ai.thinking', { defaultValue: 'CarbonBot is thinking...' })}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {suggestions.length > 0 && !loading && (
            <div className="px-3 py-2 bg-slate-100/80 dark:bg-slate-900/80 border-t border-slate-200/60 dark:border-slate-800/60 flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
              {suggestions.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors shadow-xs shrink-0"
                >
                  💡 {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={t('ai.askPlaceholder', { defaultValue: 'Ask CarbonBot anything...' })}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-md active:scale-95 shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Floating Action Button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ring-4 ring-emerald-500/20"
        aria-label="Open CarbonBot AI Assistant"
      >
        <Leaf className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300 border-2 border-white dark:border-slate-900" />
        </span>
      </button>
    </div>
  );
}
