import { Shield } from 'lucide-react';
import { getModifiers } from '../data/initialState';

/**
 * CharacterTab Component
 * Displays character stats, HP, conditions, etc.
 */
export default function CharacterTab({ player }) {
  if (!player) {
    return (
      <div className="p-6 text-center text-purple-400">
        Loading character...
      </div>
    );
  }
  
  const hpPercentage = (player.hp.current / player.hp.max) * 100;
  const modifiers = getModifiers(player.stats);
  
  function getHPColor(percentage) {
    if (percentage > 50) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (percentage > 25) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-rose-500';
  }
  
  function formatModifier(value) {
    return value >= 0 ? `+${value}` : `${value}`;
  }
  
  return (
    <div className="p-4 space-y-4 text-white h-full">
      {/* Header */}
      <div className="text-center p-4 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl border border-purple-500/30 shadow-xl">
        <h2 className="text-2xl font-bold text-gradient mb-1">{player.name}</h2>
        <p className="text-purple-300 font-medium">{player.race} {player.class}</p>
        <p className="text-slate-400 text-sm">Level {player.level}</p>
      </div>
      
      {/* HP Bar */}
      <div className="p-4 bg-gradient-to-br from-red-900/30 to-rose-900/20 rounded-xl border border-red-500/30 shadow-lg">
        <div className="flex justify-between mb-2">
          <span className="font-bold text-red-200 flex items-center gap-1">
            <span className="text-xl">❤️</span>
            Hit Points
          </span>
          <span className="font-bold text-lg">
            <span className={hpPercentage <= 25 ? 'text-red-300 animate-pulse' : 'text-white'}>
              {player.hp.current}
            </span>
            <span className="text-slate-400"> / {player.hp.max}</span>
          </span>
        </div>
        <div className="h-5 bg-slate-900/60 rounded-full overflow-hidden shadow-inner border border-slate-700/50">
          <div 
            className={`h-full transition-all duration-500 ${getHPColor(hpPercentage)} shadow-lg`}
            style={{ width: `${Math.max(hpPercentage, 3)}%` }}
          />
        </div>
        {player.hp.current === 0 && (
          <div className="mt-2 p-2 bg-red-900/70 border border-red-500 rounded-lg animate-pulse">
            <p className="text-red-200 text-sm font-bold text-center">
              💀 UNCONSCIOUS - Make death saving throws!
            </p>
          </div>
        )}
      </div>
      
      {/* AC */}
      <div className="flex items-center gap-3 bg-gradient-to-br from-blue-900/40 to-cyan-900/30 p-4 rounded-xl border border-blue-500/40 shadow-lg">
        <div className="p-3 bg-blue-600/40 rounded-lg shadow-inner">
          <Shield size={28} className="text-blue-200" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-blue-200">Armor Class</p>
          <p className="text-3xl font-bold text-white">{player.ac}</p>
        </div>
      </div>
      
      {/* Ability Scores */}
      <div>
        <h3 className="font-bold mb-3 text-lg text-slate-200 flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Ability Scores</span>
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(player.stats).map(([stat, value], idx) => {
            const colors = [
              'from-red-600/30 to-red-500/20 border-red-500/30',
              'from-orange-600/30 to-orange-500/20 border-orange-500/30',
              'from-yellow-600/30 to-yellow-500/20 border-yellow-500/30',
              'from-green-600/30 to-green-500/20 border-green-500/30',
              'from-blue-600/30 to-blue-500/20 border-blue-500/30',
              'from-purple-600/30 to-purple-500/20 border-purple-500/30'
            ];
            return (
              <div key={stat} className={`text-center p-3 bg-gradient-to-br ${colors[idx]} rounded-lg border transition-all hover:scale-105 shadow-md hover:shadow-lg`}>
                <p className="text-xs text-slate-300 uppercase font-semibold mb-1">
                  {stat.slice(0, 3)}
                </p>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className={`text-sm font-bold ${
                  modifiers[stat] >= 0 ? 'text-green-300' : 'text-red-300'
                }`}>
                  {formatModifier(modifiers[stat])}
                </p>
              </div>
            );
          })}
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
