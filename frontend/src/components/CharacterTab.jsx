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
    <div className="p-6 space-y-6 bg-slate-900/50 text-white overflow-y-auto h-full custom-scrollbar">
      {/* Header */}
      <div className="text-center p-4 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl border border-purple-500/30 shadow-xl">
        <h2 className="text-3xl font-bold text-gradient mb-1">{player.name}</h2>
        <p className="text-slate-300 font-medium">{player.race} {player.class}</p>
        <p className="text-slate-400 text-sm">Level {player.level}</p>
      </div>
      
      {/* HP Bar */}
      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-lg">
        <div className="flex justify-between mb-2">
          <span className="font-bold text-slate-200">❤️ Hit Points</span>
          <span className="font-bold text-lg">
            <span className={hpPercentage <= 25 ? 'text-red-400 animate-pulse' : 'text-white'}>
              {player.hp.current}
            </span>
            <span className="text-slate-500"> / {player.hp.max}</span>
          </span>
        </div>
        <div className="h-5 bg-slate-700 rounded-full overflow-hidden shadow-inner">
          <div 
            className={`h-full transition-all duration-500 ${getHPColor(hpPercentage)} shadow-lg`}
            style={{ width: `${Math.max(hpPercentage, 3)}%` }}
          />
        </div>
        {player.hp.current === 0 && (
          <div className="mt-2 p-2 bg-red-900/50 border border-red-500 rounded-lg animate-pulse">
            <p className="text-red-300 text-sm font-bold text-center">
              💀 UNCONSCIOUS - Make death saving throws!
            </p>
          </div>
        )}
      </div>
      
      {/* AC */}
      <div className="flex items-center gap-3 bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-4 rounded-xl border border-blue-500/30 shadow-lg">
        <div className="p-3 bg-blue-600/30 rounded-lg">
          <Shield size={28} className="text-blue-300" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-400">Armor Class</p>
          <p className="text-3xl font-bold text-white">{player.ac}</p>
        </div>
      </div>
      
      {/* Ability Scores */}
      <div>
        <h3 className="font-bold mb-3 text-lg text-slate-200 flex items-center gap-2">
          ⚡ Ability Scores
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(player.stats).map(([stat, value]) => (
            <div key={stat} className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-all hover:scale-105 shadow-md">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">
                {stat.slice(0, 3)}
              </p>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className={`text-sm font-bold ${
                modifiers[stat] >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatModifier(modifiers[stat])}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Resources */}
      {player.resources && (
        <div>
          <h3 className="font-bold mb-3 text-lg text-slate-200 flex items-center gap-2">
            💰 Resources
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 p-3 rounded-lg border border-yellow-600/30 shadow-md">
              <span className="font-semibold text-slate-200">Gold Coins</span>
              <span className="font-bold text-xl text-yellow-400">
                {player.gold || player.resources.gold || 0} 🪙
              </span>
            </div>
            {player.resources.special_abilities && Object.entries(player.resources.special_abilities).map(([ability, uses]) => (
              <div key={ability} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <span className="capitalize text-slate-200">{ability.replace('_', ' ')}</span>
                <span className="font-mono text-lg">
                  <span className="text-purple-400">{'●'.repeat(uses)}</span>
                  <span className="text-slate-600">{'○'.repeat(Math.max(0, 2 - uses))}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Conditions */}
      {player.conditions && player.conditions.length > 0 && (
        <div>
          <h3 className="font-bold mb-3 text-lg text-slate-200 flex items-center gap-2">
            🌟 Conditions
          </h3>
          <div className="flex flex-wrap gap-2">
            {player.conditions.map((condition, idx) => (
              <span 
                key={idx}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse"
              >
                ⚡ {condition}
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
