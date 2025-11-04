export const initialPlayerState = {
  name: 'Adventurer',
  class: 'Fighter',
  level: 1,
  
  hp: {
    current: 30,
    max: 30
  },
  
  ac: 15,
  
  stats: {
    strength: 14,
    dexterity: 12,
    constitution: 14,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  },
  
  inventory: [
    'Longsword',
    'Shield',
    'Chain Mail',
    'Healing Potion (2d4+2)',
    'Rope (50 ft)',
    'Torch (3)'
  ],
  
  conditions: [],
  
  resources: {
    gold: 10,
    special_abilities: {
      second_wind: 1,
      action_surge: 1
    }
  },
  
  location: 'start',
  flags: {},
  quest_log: []
};

// Helper function to calculate ability modifiers
export function getAbilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

// Get all ability modifiers
export function getModifiers(stats) {
  return {
    strength: getAbilityModifier(stats.strength),
    dexterity: getAbilityModifier(stats.dexterity),
    constitution: getAbilityModifier(stats.constitution),
    intelligence: getAbilityModifier(stats.intelligence),
    wisdom: getAbilityModifier(stats.wisdom),
    charisma: getAbilityModifier(stats.charisma)
  };
}
