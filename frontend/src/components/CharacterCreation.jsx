import { useState } from 'react';
import { Sparkles, Sword, Shield, BookOpen, Zap } from 'lucide-react';

const RACES = [
  { id: 'human', name: 'Human', description: '+1 to all stats', bonus: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 } },
  { id: 'elf', name: 'Elf', description: '+2 Dexterity, +1 Intelligence', bonus: { dex: 2, int: 1 } },
  { id: 'dwarf', name: 'Dwarf', description: '+2 Constitution, +1 Strength', bonus: { con: 2, str: 1 } },
  { id: 'halfling', name: 'Halfling', description: '+2 Dexterity, +1 Charisma', bonus: { dex: 2, cha: 1 } },
  { id: 'dragonborn', name: 'Dragonborn', description: '+2 Strength, +1 Charisma', bonus: { str: 2, cha: 1 } },
  { id: 'tiefling', name: 'Tiefling', description: '+2 Charisma, +1 Intelligence', bonus: { cha: 2, int: 1 } }
];

const CLASSES = [
  { 
    id: 'fighter', 
    name: 'Fighter', 
    description: 'Master of weapons and armor',
    icon: Sword,
    hp: 30,
    ac: 15,
    equipment: ['Longsword', 'Shield', 'Chain Mail', 'Healing Potion', 'Rope', 'Torch']
  },
  { 
    id: 'wizard', 
    name: 'Wizard', 
    description: 'Wielder of arcane magic',
    icon: BookOpen,
    hp: 18,
    ac: 12,
    equipment: ['Staff', 'Spellbook', 'Robes', 'Component Pouch', 'Healing Potion', 'Scroll']
  },
  { 
    id: 'rogue', 
    name: 'Rogue', 
    description: 'Stealthy and cunning',
    icon: Zap,
    hp: 24,
    ac: 14,
    equipment: ['Dagger', 'Shortsword', 'Leather Armor', 'Thieves Tools', 'Healing Potion', 'Rope']
  },
  { 
    id: 'cleric', 
    name: 'Cleric', 
    description: 'Divine healer and protector',
    icon: Shield,
    hp: 26,
    ac: 16,
    equipment: ['Mace', 'Shield', 'Chain Mail', 'Holy Symbol', 'Healing Potion x2', 'Prayer Book']
  }
];

const GENDERS = ['Male', 'Female', 'Non-binary'];

export default function CharacterCreation({ onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [race, setRace] = useState(null);
  const [charClass, setCharClass] = useState(null);

  const baseStats = {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10
  };

  const getFinalStats = () => {
    const finalStats = { ...baseStats };
    // Apply race bonuses if chosen
    if (race) {
      Object.keys(race.bonus).forEach(stat => {
        finalStats[stat] += race.bonus[stat];
      });
    }
    // Apply simple class-based modifiers (keep it lightweight)
    if (charClass) {
      const classMods = {
        fighter: { str: 2, con: 1 },
        wizard: { int: 2, wis: 1 },
        rogue: { dex: 2, int: 1 },
        cleric: { wis: 2, cha: 1 }
      };
      const mods = classMods[charClass.id] || {};
      Object.keys(mods).forEach(stat => {
        finalStats[stat] += mods[stat];
      });
    }
    return finalStats;
  };

  const handleComplete = () => {
    const finalStats = getFinalStats();
    const classSkillMap = {
      fighter: ['Athletics', 'Intimidation', 'Perception'],
      wizard: ['Arcana', 'History', 'Investigation'],
      rogue: ['Stealth', 'Sleight of Hand', 'Perception'],
      cleric: ['Religion', 'Medicine', 'Insight']
    };
    const profSkills = classSkillMap[charClass.id] || [];
    const character = {
      name,
      gender,
      race: race.name,
      class: charClass.name,
      level: 1,
      hp: { current: charClass.hp, max: charClass.hp },
      ac: charClass.ac,
      stats: finalStats,
      inventory: charClass.equipment.map(item => ({ name: item, quantity: 1 })),
      gold: 50,
      conditions: [],
      resources: {
        spell_slots: charClass.id === 'wizard' || charClass.id === 'cleric' ? { 1: 2 } : {},
        special_abilities: []
      },
      proficiencies: { skills: profSkills, bonus: 2 }
    };
    onComplete(character);
  };

  const canProceed = () => {
    if (step === 1) return name.length >= 2;
    if (step === 2) return gender !== '';
    if (step === 3) return race !== null;
    if (step === 4) return charClass !== null;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-yellow-300" />
            <h1 className="text-3xl font-bold text-white">Character Creation</h1>
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </div>
          <p className="text-purple-100">Step {step} of 4</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-700 h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 min-h-[400px]">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3">What is your name, adventurer?</h2>
                <p className="text-slate-400">Choose wisely - this name will echo through the realm</p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your character's name"
                  className="w-full px-6 py-5 bg-slate-700 border-2 border-purple-500/30 rounded-xl text-white text-xl placeholder-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all shadow-lg"
                  autoFocus
                />
                {name.length >= 2 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 text-2xl animate-bounce">
                    ✓
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full transition-colors ${
                  name.length >= 2 ? 'bg-green-500' : 'bg-slate-600'
                }`} />
                <p className={`transition-colors ${
                  name.length >= 2 ? 'text-green-400' : 'text-slate-500'
                }`}>Name must be at least 2 characters</p>
              </div>
            </div>
          )}

          {/* Step 2: Gender */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-4">Choose your gender</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`group p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      gender === g
                        ? 'bg-gradient-to-br from-purple-600 to-blue-600 border-purple-400 shadow-xl shadow-purple-500/50 scale-105'
                        : 'bg-slate-700 border-slate-600 hover:border-purple-500 hover:bg-slate-650 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {gender === g && <span className="text-2xl">✓</span>}
                      <p className={`text-xl font-bold transition-colors ${
                        gender === g ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`}>{g}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Race */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-4">Choose your race</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {RACES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRace(r)}
                    className={`group p-6 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-105 ${
                      race?.id === r.id
                        ? 'bg-gradient-to-br from-purple-600 to-blue-600 border-purple-400 shadow-xl shadow-purple-500/50 scale-105 ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-800'
                        : 'bg-slate-700 border-slate-600 hover:border-purple-500 hover:bg-slate-650 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`text-xl font-bold transition-colors ${
                        race?.id === r.id ? 'text-white' : 'text-slate-200 group-hover:text-white'
                      }`}>{r.name}</h3>
                      {race?.id === r.id && (
                        <span className="text-2xl animate-bounce">✓</span>
                      )}
                    </div>
                    <p className={`text-sm transition-colors ${
                      race?.id === r.id ? 'text-purple-100' : 'text-slate-400 group-hover:text-purple-200'
                    }`}>{r.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Class */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-4">Choose your class</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CLASSES.map((c) => {
                  const Icon = c.icon;
                  const isSelected = charClass?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCharClass(c)}
                      className={`group p-6 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-105 ${
                        isSelected
                          ? 'bg-gradient-to-br from-purple-600 to-blue-600 border-purple-400 shadow-xl shadow-purple-500/50 scale-105 ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-800'
                          : 'bg-slate-700 border-slate-600 hover:border-purple-500 hover:bg-slate-650 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg transition-colors ${
                            isSelected ? 'bg-white/20' : 'bg-slate-800/50 group-hover:bg-purple-600/30'
                          }`}>
                            <Icon className={`w-6 h-6 transition-colors ${
                              isSelected ? 'text-white' : 'text-purple-400 group-hover:text-purple-300'
                            }`} />
                          </div>
                          <div>
                            <h3 className={`text-xl font-bold transition-colors ${
                              isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                            }`}>{c.name}</h3>
                            <p className={`text-sm transition-colors ${
                              isSelected ? 'text-purple-100' : 'text-slate-400 group-hover:text-purple-200'
                            }`}>{c.description}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-2xl animate-bounce">✓</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className={`rounded-lg px-3 py-2 transition-colors ${
                          isSelected ? 'bg-white/10' : 'bg-slate-800/50 group-hover:bg-slate-800'
                        }`}>
                          <span className={isSelected ? 'text-purple-200' : 'text-slate-400'}>HP:</span>
                          <span className="text-white font-bold ml-2">{c.hp}</span>
                        </div>
                        <div className={`rounded-lg px-3 py-2 transition-colors ${
                          isSelected ? 'bg-white/10' : 'bg-slate-800/50 group-hover:bg-slate-800'
                        }`}>
                          <span className={isSelected ? 'text-purple-200' : 'text-slate-400'}>AC:</span>
                          <span className="text-white font-bold ml-2">{c.ac}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary (shown on last step) */}
          {step === 4 && charClass && (
            <div className="mt-8 p-6 bg-gradient-to-br from-slate-700/80 to-slate-800/80 rounded-xl border-2 border-purple-500/30 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Character Summary</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <span className="text-slate-400 text-sm block mb-1">Name</span>
                  <span className="text-white font-bold text-lg">{name}</span>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <span className="text-slate-400 text-sm block mb-1">Gender</span>
                  <span className="text-white font-bold text-lg">{gender}</span>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <span className="text-slate-400 text-sm block mb-1">Race</span>
                  <span className="text-purple-300 font-bold text-lg">{race.name}</span>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <span className="text-slate-400 text-sm block mb-1">Class</span>
                  <span className="text-blue-300 font-bold text-lg">{charClass.name}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                <p className="text-purple-200 text-sm text-center">
                  ⚔️ Your legend begins here, <span className="font-bold">{name}</span>!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900 p-6 flex justify-between items-center border-t border-slate-700">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold transform hover:scale-105 active:scale-95"
          >
            ← Back
          </button>
          
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-xl hover:shadow-purple-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canProceed()}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-xl hover:shadow-green-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold flex items-center gap-2 transform hover:scale-110 active:scale-95 disabled:transform-none animate-pulse hover:animate-none"
            >
              <Sparkles className="w-5 h-5" />
              Begin Adventure!
              <Sparkles className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
