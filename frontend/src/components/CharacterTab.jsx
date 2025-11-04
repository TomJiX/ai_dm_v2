import { Shield } from 'lucide-react';
import { getModifiers } from '../data/initialState';

/**
 * CharacterTab Component
 * Displays character stats, HP, conditions, etc.
 */
export default function CharacterTab({ player }) {
  if (!player) {
    return (
      <div className="p-6 text-center text-gray-400">
        Loading character...
      </div>
    );
  }
  
  const hpPercentage = (player.hp.current / player.hp.max) * 100;
  const modifiers = getModifiers(player.stats);
  
  function getHPColor(percentage) {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  }
  
  function formatModifier(value) {
    return value >= 0 ? `+${value}` : `${value}`;
  }
  
  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white overflow-y-auto h-full">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">{player.name}</h2>
        <p className="text-gray-400">{player.class} - Level {player.level}</p>
      </div>
      
      {/* HP Bar */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Hit Points</span>
          <span className="font-bold">
            {player.hp.current} / {player.hp.max}
          </span>
        </div>
        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getHPColor(hpPercentage)}`}
            style={{ width: `${hpPercentage}%` }}
          />
        </div>
        {player.hp.current === 0 && (
          <p className="text-red-500 text-sm mt-1 font-bold">
            ⚠️ UNCONSCIOUS - Make death saving throws!
          </p>
        )}
      </div>
      
      {/* AC */}
      <div className="flex items-center gap-2 bg-gray-800 p-3 rounded-lg">
        <Shield size={24} className="text-blue-400" />
        <div>
          <p className="text-sm text-gray-400">Armor Class</p>
          <p className="text-2xl font-bold">{player.ac}</p>
        </div>
      </div>
      
      {/* Ability Scores */}
      <div>
        <h3 className="font-bold mb-3">Ability Scores</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(player.stats).map(([stat, value]) => (
            <div key={stat} className="text-center p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400 uppercase">
                {stat.slice(0, 3)}
              </p>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-gray-400">
                {formatModifier(modifiers[stat])}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Resources */}
      {player.resources && (
        <div>
          <h3 className="font-bold mb-2">Resources</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
              <span>Gold</span>
              <span className="font-bold text-yellow-500">
                {player.resources.gold} gp
              </span>
            </div>
            {player.resources.special_abilities && Object.entries(player.resources.special_abilities).map(([ability, uses]) => (
              <div key={ability} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                <span className="capitalize">{ability.replace('_', ' ')}</span>
                <span className="font-mono">
                  {'●'.repeat(uses)}{'○'.repeat(Math.max(0, 2 - uses))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Conditions */}
      {player.conditions && player.conditions.length > 0 && (
        <div>
          <h3 className="font-bold mb-2">Conditions</h3>
          <div className="flex flex-wrap gap-2">
            {player.conditions.map((condition, idx) => (
              <span 
                key={idx}
                className="bg-yellow-800 px-3 py-1 rounded-full text-sm"
              >
                {condition}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Quest Log */}
      {player.quest_log && player.quest_log.length > 0 && (
        <div>
          <h3 className="font-bold mb-2">Quests</h3>
          <div className="space-y-2">
            {player.quest_log.map((quest, idx) => (
              <div key={idx} className="bg-gray-800 p-2 rounded text-sm">
                {quest}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
