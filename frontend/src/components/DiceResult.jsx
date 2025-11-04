import { Dice6 } from 'lucide-react';

/**
 * DiceResult Component
 * Displays dice roll results with special formatting for crits
 */
export default function DiceResult({ result }) {
  const isCrit = result.raw_rolls?.includes(20);
  const isFail = result.raw_rolls?.includes(1);
  
  return (
    <div className={`p-3 rounded-lg border-2 ${
      isCrit ? 'border-yellow-500 bg-yellow-900/20' :
      isFail ? 'border-red-500 bg-red-900/20' :
      'border-purple-500 bg-purple-900/20'
    }`}>
      <div className="flex items-center gap-2">
        <Dice6 size={20} className="text-purple-400" />
        <span className="font-bold text-white">
          {result.context || 'Roll'}
        </span>
      </div>
      <p className="text-xl font-bold mt-1 text-white">
        {result.breakdown} = {result.result}
        {isCrit && ' 🌟 CRITICAL!'}
        {isFail && ' ❌ CRITICAL FAIL!'}
      </p>
    </div>
  );
}
