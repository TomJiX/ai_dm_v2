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
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = () => {
    if (input.trim() && !isThinking) {
      onSendMessage(input.trim());
      setInput('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleQuickAction = (action) => {
    onSendMessage(action);
  };
  
  return (
    <div className="h-full flex flex-col bg-slate-900/50">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-12 animate-fade-in">
            <div className="text-6xl mb-4">⚔️</div>
            <p className="text-2xl font-bold text-gradient mb-2">Welcome, Adventurer!</p>
            <p className="text-sm">Your epic journey is about to begin...</p>
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
      <div className="border-t border-slate-700/50 p-4 bg-slate-800/50 backdrop-blur-sm">
        {/* Quick actions */}
        {quickActions.length > 0 && !isThinking && (
          <div className="flex flex-wrap gap-2 mb-3 animate-fade-in">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action)}
                className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-purple-600 hover:to-blue-600 px-4 py-2 rounded-full text-sm text-white transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/50 font-medium"
              >
                ✨ {action}
              </button>
            ))}
          </div>
        )}
        
        {/* Text input */}
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What do you do? (Press Enter to send)"
            disabled={isThinking}
            className="flex-1 bg-slate-700 text-white px-5 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 placeholder-slate-400 border border-slate-600 focus:border-purple-500 transition-all shadow-lg"
            rows="2"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed px-6 py-3 rounded-xl text-white transition-all flex items-center gap-2 shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 active:scale-95 disabled:transform-none font-semibold"
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
