import { useEffect, useRef, useState } from 'react';
import { Send, Loader } from 'lucide-react';
import Message from './Message';

/**
 * DialogueWindow Component
 * Main chat interface with message history and input
 */
export default function DialogueWindow({ 
  messages, 
  onSendMessage, 
  isThinking,
  quickActions = []
}) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = () => {
    if (input.trim() && !isThinking) {
      const text = input.trim();
      onSendMessage(text);
      setHistory((h) => [...h, text]);
      setHistoryIndex(-1);
      setInput('');
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }
    if (e.key === 'ArrowUp' && !e.shiftKey) {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex] || '');
      return;
    }
    if (e.key === 'ArrowDown' && !e.shiftKey) {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex < 0 ? -1 : Math.min(history.length - 1, historyIndex + 1);
      setHistoryIndex(nextIndex);
      setInput(nextIndex === -1 ? '' : (history[nextIndex] || ''));
      return;
    }
  };
  
  const handleQuickAction = (action) => {
    onSendMessage(action);
  };
  
  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent via-slate-900/30 to-transparent">
        {messages.length === 0 && (
          <div className="text-center mt-12 animate-fade-in">
            <div className="text-8xl mb-6 animate-pulse">⚔️</div>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-3">Welcome, Adventurer!</p>
            <p className="text-lg text-purple-300">Your epic journey is about to begin...</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={msg.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
            <Message message={msg} />
          </div>
        ))}
        
        {isThinking && (
          <div className="flex items-center gap-3 text-purple-400 justify-center py-4 animate-pulse">
            <Loader className="animate-spin" size={24} />
            <span className="font-semibold">The DM is weaving your tale...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t border-purple-500/20 p-4 bg-gradient-to-r from-slate-800/90 via-slate-900/90 to-slate-800/90 backdrop-blur-sm shadow-lg">
        {/* Quick actions */}
        {quickActions.length > 0 && !isThinking && (
          {/* Dialogue suggestions removed by request */}
        )}
        
        {/* Text input */}
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you do? (Press Enter to send)"
            disabled={isThinking}
            className="flex-1 bg-slate-800 text-white px-5 py-3 rounded-xl resize-none focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 placeholder-slate-400 border-2 border-purple-600/30 focus:border-purple-500 transition-all shadow-lg"
            rows="2"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed px-6 py-3 rounded-xl text-white transition-all flex items-center gap-2 shadow-xl border-2 border-purple-400/50 hover:shadow-purple-500/70 transform hover:scale-105 active:scale-95 disabled:transform-none font-bold"
          >
            <Send size={20} />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
