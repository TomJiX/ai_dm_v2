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
      <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-900/10 rounded">
        <p className="font-bold text-red-400">⚔️ Combat</p>
        <p className="text-white whitespace-pre-wrap">{message.content}</p>
      </div>
    );
  }
  
  // System message
  if (message.type === 'system') {
    return (
      <div className="text-center text-gray-400 text-sm italic my-2">
        {message.content}
      </div>
    );
  }
  
  // Error message
  if (message.type === 'error') {
    return (
      <div className="border-l-4 border-red-600 pl-4 py-2 bg-red-900/20 rounded">
        <p className="font-bold text-red-400">⚠️ Error</p>
        <p className="text-white">{message.content}</p>
      </div>
    );
  }
  
  // User message
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white p-3 rounded-lg max-w-[80%] ml-8">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }
  
  // DM narrative message
  return (
    <div className="flex justify-start">
      <div className="bg-gray-800 text-white p-3 rounded-lg max-w-[80%] mr-8">
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
