/**
 * State Management System
 * In-memory storage for game state (player, NPCs, flags, etc.)
 */

// Global state storage
const gameState = {
  player: null,
  npcs: {},
  flags: {},
  quest_log: [],
  combat_state: null
};

/**
 * Save data to state
 * @param {string} key - State key to save to
 * @param {any} value - Value to save
 * @returns {object} - Confirmation with saved data
 */
export function saveState(key, value) {
  gameState[key] = value;
  return {
    success: true,
    key,
    message: `State saved to '${key}'`
  };
}

/**
 * Load data from state
 * @param {string} key - State key to load from
 * @returns {any} - Stored value or null if not found
 */
export function loadState(key) {
  if (!(key in gameState)) {
    return {
      success: false,
      message: `Key '${key}' not found in state`,
      value: null
    };
  }
  
  return {
    success: true,
    key,
    value: gameState[key]
  };
}

/**
 * Update existing state with partial updates (deep merge)
 * @param {string} key - State key to update
 * @param {object} updates - Object with updates to merge
 * @returns {object} - Updated state
 */
export function updateState(key, updates) {
  if (!(key in gameState)) {
    return {
      success: false,
      message: `Key '${key}' not found in state. Use saveState to create it first.`
    };
  }
  
  // Deep merge for nested objects
  gameState[key] = deepMerge(gameState[key], updates);
  
  return {
    success: true,
    key,
    value: gameState[key],
    message: `State '${key}' updated`
  };
}

/**
 * Get all state data
 * @returns {object} - Complete game state
 */
export function getAllState() {
  return {
    success: true,
    state: { ...gameState }
  };
}

/**
 * Reset all state (new game)
 * @returns {object} - Confirmation
 */
export function resetState() {
  gameState.player = null;
  gameState.npcs = {};
  gameState.flags = {};
  gameState.quest_log = [];
  gameState.combat_state = null;
  
  return {
    success: true,
    message: 'All state reset'
  };
}

/**
 * Initialize player state with default values
 * @param {object} playerData - Initial player data
 * @returns {object} - Created player state
 */
export function initializePlayer(playerData) {
  const defaultPlayer = {
    name: playerData.name || 'Adventurer',
    class: playerData.class || 'Fighter',
    level: playerData.level || 1,
    
    // Combat stats
    hp: {
      current: playerData.maxHp || 30,
      max: playerData.maxHp || 30
    },
    ac: playerData.ac || 15,
    
    // Ability scores (default to 10 = +0 modifier)
    stats: {
      strength: playerData.stats?.strength || 14,
      dexterity: playerData.stats?.dexterity || 12,
      constitution: playerData.stats?.constitution || 14,
      intelligence: playerData.stats?.intelligence || 10,
      wisdom: playerData.stats?.wisdom || 10,
      charisma: playerData.stats?.charisma || 10
    },
    
    // Inventory
    inventory: playerData.inventory || [
      'Longsword',
      'Shield',
      'Chain Mail',
      'Healing Potion (2d4+2)',
      'Rope (50 ft)',
      'Torch (3)'
    ],
    
    // Conditions (poisoned, stunned, etc.)
    conditions: [],
    
    // Resources
    resources: {
      gold: playerData.gold || 10,
      special_abilities: {
        second_wind: 1, // Fighter ability
        action_surge: 1
      }
    },
    
    // Location tracking
    location: playerData.location || 'start',
    
    // Quest flags
    flags: {},
    
    // Quest log
    quest_log: []
  };
  
  gameState.player = defaultPlayer;
  
  return {
    success: true,
    player: defaultPlayer,
    message: `Player '${defaultPlayer.name}' initialized`
  };
}

/**
 * Deep merge helper function
 */
function deepMerge(target, source) {
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (target[key]) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    } else {
      output[key] = source[key];
    }
  }
  
  return output;
}
