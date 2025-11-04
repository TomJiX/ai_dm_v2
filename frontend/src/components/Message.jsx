import DiceResult from './DiceResult';

/**
 * Message Component
 * Displays individual messages with appropriate styling
 */
export default function Message({ message }) {
  // Dice roll display
  if (message.type === 'dice') {
    return (
      <div className="flex justify-center my-2">
        <DiceResult result={message.data} />
      </div>
    );
  }
  
  // Combat message
  if (message.type === 'combat') {
    return (
      <div className="border-l-4 border-red-500 pl-4 py-3 bg-gradient-to-r from-red-900/30 to-red-800/20 rounded-lg shadow-lg">
        <p className="font-bold text-red-400 mb-1 flex items-center gap-2">
          ⚔️ Combat
        </p>
        <p className="text-white whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    );
  }
  
  // System message
  if (message.type === 'system') {
    return (
      <div className="text-center text-slate-400 text-sm italic my-2 py-2 px-4 bg-slate-800/30 rounded-full mx-auto max-w-fit">
        ✨ {message.content}
      </div>
    );
  }
  
  // Error message
  if (message.type === 'error') {
    return (
      <div className="border-l-4 border-red-600 pl-4 py-3 bg-gradient-to-r from-red-900/30 to-red-800/20 rounded-lg shadow-lg">
        <p className="font-bold text-red-400 mb-1 flex items-center gap-2">
          ⚠️ Error
        </p>
        <p className="text-white leading-relaxed">{message.content}</p>
      </div>
    );
  }
  
  // User message
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-2xl max-w-[80%] ml-8 shadow-lg shadow-blue-900/50">
          <p className="whitespace-pre-wrap leading-relaxed font-medium">{message.content}</p>
        </div>
      </div>
    );
  }
  
  // DM narrative message
  return (
    <div className="flex justify-start">
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white p-4 rounded-2xl max-w-[80%] mr-8 shadow-lg border border-slate-700/50">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-purple-400 font-bold text-xs">🎲 DM</span>
        </div>
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
