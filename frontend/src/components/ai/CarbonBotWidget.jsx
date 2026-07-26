import { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, Send, Loader2, User, RefreshCw } from 'lucide-react';
import aiAssistantService from '@/services/api/aiAssistantService';

export default function CarbonBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hi! I'm **CarbonBot**, your AI Sustainability Assistant.\n\nAsk me anything about reducing your carbon footprint, green travel, eco diets, or energy savings!",
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
        .catch(() => {});
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
        text: res.reply || "I'm here to help you live more sustainably!",
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
          text: "I'm having trouble connecting to Gemini AI right now. Tip: Switching to public transit twice a week saves ~15 kg CO₂e weekly!",
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
      // Remove horizontal dividers like ---
      if (line.trim() === '---') {
        return <hr key={idx} className="my-2 border-slate-200 dark:border-slate-700/60" />;
      }

      // Strip markdown header symbols like ###, ##, #
      const isHeader = /^#{1,6}\s+/.test(line);
      const cleanLine = line.replace(/^#{1,6}\s+/, '').trim();
      if (!cleanLine) return <div key={idx} className="h-1" />;

      const formattedHtml = cleanLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      return (
        <p
          key={idx}
          className={`mb-1 last:mb-0 ${isHeader ? 'font-bold text-emerald-700 dark:text-emerald-300 text-[13px] mt-2 mb-1' : ''}`}
          dangerouslySetInnerHTML={{ __html: formattedHtml }}
        />
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* ── Chat Drawer Window ── */}
      {isOpen && (
        <div className="mb-4 w-[360px] sm:w-[420px] h-[520px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-200/80 dark:border-emerald-800/50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative p-2 bg-white/20 backdrop-blur-md rounded-2xl">
                <Bot className="h-6 w-6 text-white" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-300 rounded-full ring-2 ring-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  CarbonBot AI
                  <Sparkles className="h-3.5 w-3.5 text-emerald-200 fill-emerald-200 animate-pulse" />
                </h3>
                <p className="text-[11px] text-emerald-100/90 font-medium">Sustainability Coach • Gemini 3.5 Flash</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60 dark:bg-slate-950/40 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="h-7 w-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  {renderFormattedText(msg.text)}
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="h-7 w-7 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="h-7 w-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="h-4 w-4 animate-spin" />
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" />
                  <span className="text-slate-500 dark:text-slate-400 text-xs italic">CarbonBot is thinking...</span>
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
                placeholder="Ask CarbonBot anything..."
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
        <Bot className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300 border-2 border-white dark:border-slate-900" />
        </span>
      </button>
    </div>
  );
}
