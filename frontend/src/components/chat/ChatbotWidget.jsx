/**
 * ChatbotWidget.jsx
 * ─────────────────────────────────────────────────────────────
 * Global floating AI Chatbot widget (CarbonBot).
 * Allows users to converse with an AI trained on emissions, Calculations,
 * and green strategies. Utilizes the Spring Boot backend /api/chat endpoint.
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Send, X, Leaf, Sparkles } from 'lucide-react';
import chatService from '@/services/api/chatService';
import './chatbot.css';

const renderMessageText = (text) => {
  if (!text) return null;

  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
    let cleanLine = line;
    if (isBullet) {
      cleanLine = line.trim().replace(/^[-*]\s+/, '');
    }

    const parts = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    let lastIndex = 0;

    while ((match = boldRegex.exec(cleanLine)) !== null) {
      if (match.index > lastIndex) {
        parts.push(cleanLine.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index}>{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }
    
    if (lastIndex < cleanLine.length) {
      parts.push(cleanLine.substring(lastIndex));
    }

    const content = parts.length > 0 ? parts : cleanLine;

    if (isBullet) {
      return (
        <li key={idx} className="chatbot-li">
          {content}
        </li>
      );
    }

    if (line.trim() === '') {
      return <div key={idx} className="chatbot-empty-line" />;
    }

    return (
      <div key={idx} className="chatbot-line">
        {content}
      </div>
    );
  });
};

export default function ChatbotWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'init',
      textKey: 'chatbot.welcome',
      text: "Hi! I'm CarbonBot, your carbon tracking assistant. Ask me anything about emissions, green habits, or how to use this app!",
      sender: 'bot',
      time: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to the bottom of the chat list on updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input field on expand
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const cleanInput = inputValue.trim();
    if (!cleanInput || isLoading) return;

    // Add user message to state
    const userMsg = {
      id: `user-${Date.now()}`,
      text: cleanInput,
      sender: 'user',
      time: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message to backend Gemini client
      const responseData = await chatService.sendMessage(cleanInput);
      
      const botMsg = {
        id: `bot-${Date.now()}`,
        text: responseData.response || t('chatbot.errorProcess', { defaultValue: "I couldn't process that request. Please try again." }),
        sender: 'bot',
        time: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chatbot API call failed:', error);
      const errorMsg = {
        id: `error-${Date.now()}`,
        text: t('chatbot.errorConnection', { defaultValue: "Sorry, I'm having trouble connecting to the carbon engine right now. Please check your network and try again." }),
        sender: 'bot',
        isError: true,
        time: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-widget-container">
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          type="button"
          className="chatbot-trigger-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open CarbonBot Chat"
        >
          <Leaf className="w-6 h-6 text-white" />
          <span className="chatbot-pulse-glow"></span>
        </button>
      )}

      {/* Expanded Chat Widget */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar-container">
                <Leaf className="w-5 h-5 text-white" />
                <Sparkles className="w-2.5 h-2.5 text-yellow-300 absolute -top-0.5 -right-0.5 animate-pulse" />
              </div>
              <div className="chatbot-header-info">
                <h3>CarbonBot</h3>
                <span className="chatbot-status">{t('chatbot.status', { defaultValue: 'Online • AI Assistant' })}</span>
              </div>
            </div>
            <button
              type="button"
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
            >
              <X className="w-4 h-4 text-slate-400 hover:text-slate-100" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-message-row ${
                  msg.sender === 'user' ? 'user-row' : 'bot-row'
                }`}
              >
                <div
                  className={`chatbot-message-bubble ${
                    msg.sender === 'user'
                      ? 'user-bubble'
                      : msg.isError
                      ? 'error-bubble'
                      : 'bot-bubble'
                  }`}
                >
                  <div className="chatbot-message-text">
                    {renderMessageText(msg.textKey ? t(msg.textKey) : msg.text)}
                  </div>
                  <span className="message-time">
                    {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading / Typing State */}
            {isLoading && (
              <div className="chatbot-message-row bot-row">
                <div className="chatbot-message-bubble bot-bubble typing-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            <textarea
              ref={inputRef}
              rows={1}
              className="chatbot-input-field chatbot-textarea"
              placeholder={t('chatbot.placeholder', { defaultValue: 'Ask about carbon calculations, tips...' })}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send Message"
            >
              <Send className="w-4.5 h-4.5 text-white" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
