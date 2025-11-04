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
    <div className="h-full flex flex-col bg-gray-900">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">Welcome, Adventurer!</p>
            <p className="text-sm mt-2">Your journey is about to begin...</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        
        {isThinking && (
          <div className="flex items-center gap-2 text-gray-400 justify-center">
            <Loader className="animate-spin" size={20} />
            <span>The DM is thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t border-gray-700 p-4 bg-gray-900">
        {/* Quick actions */}
        {quickActions.length > 0 && !isThinking && (
          <div className="flex flex-wrap gap-2 mb-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action)}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full text-sm text-white transition"
              >
                {action}
              </button>
            ))}
          </div>
        )}
        
        {/* Text input */}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What do you do?"
            disabled={isThinking}
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            rows="2"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-2 rounded-lg text-white transition flex items-center gap-2"
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
