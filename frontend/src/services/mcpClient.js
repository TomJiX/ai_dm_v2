/**
 * MCP Client
 * Communicates with the MCP server for dice rolls, combat, and state management
 * 
 * Note: This is a simplified client that directly calls tool functions
 * In a real deployment, this would communicate with the MCP server via HTTP/WebSocket
 */

// For development, we'll directly import and call the tool functions
// In production, this would make HTTP requests to a running MCP server

/**
 * Simulated MCP client that calls tool functions directly
 */
class MCPClient {
  constructor() {
    this.state = {
      player: null,
      npcs: {},
      flags: {},
      quest_log: [],
      combat_state: null
    };
  }

  /**
   * Call an MCP tool
   * @param {string} toolName - Name of the tool
   * @param {object} args - Tool arguments
   * @returns {Promise<object>} - Tool result
   */
  async callTool(toolName, args) {
    try {
      // In development, we'll simulate tool calls with JS implementations
      switch (toolName) {
        case 'roll_dice':
          return this.rollDice(args.notation, args.context);
          
        case 'roll_with_advantage':
          return this.rollWithAdvantage(args.notation, args.context);
          
        case 'roll_with_disadvantage':
          return this.rollWithDisadvantage(args.notation, args.context);
          
        case 'initialize_player':
          return this.initializePlayer(args);
          
        case 'save_state':
          return this.saveState(args.key, args.value);
          
        case 'load_state':
          return this.loadState(args.key);
          
        case 'update_state':
          return this.updateState(args.key, args.updates);
          
        case 'get_all_state':
          return this.getAllState();
          
        case 'reset_state':
          return this.resetState();
          
        case 'resolve_attack':
          return this.resolveAttack(args);
          
        case 'apply_damage':
          return this.applyDamage(args.currentHP, args.maxHP, args.damage);
          
        case 'apply_healing':
          return this.applyHealing(args.currentHP, args.maxHP, args.healing);
          
        case 'roll_initiative':
          return this.rollInitiative(args.dexModifier, args.advantage);
          
        case 'resolve_saving_throw':
          return this.resolveSavingThrow(args);
          
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      console.error(`MCP tool error (${toolName}):`, error);
      throw error;
    }
  }

  // === Dice Rolling ===
  
  rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
  }

  parseDiceNotation(notation) {
    const match = notation.trim().match(/^(\d+)d(\d+)([+-]\d+)?$/i);
    if (!match) throw new Error(`Invalid dice notation: ${notation}`);
    return {
      count: parseInt(match[1]),
      sides: parseInt(match[2]),
      modifier: match[3] ? parseInt(match[3]) : 0
    };
  }

  rollDice(notation, context = '') {
    const { count, sides, modifier } = this.parseDiceNotation(notation);
    const rolls = Array.from({ length: count }, () => this.rollDie(sides));
    const sum = rolls.reduce((a, b) => a + b, 0);
    const result = sum + modifier;
    
    let breakdown = `${count}d${sides}`;
    if (rolls.length <= 10) {
      breakdown += ` (${rolls.join(', ')})`;
    }
    if (modifier !== 0) {
      breakdown += ` ${modifier >= 0 ? '+' : ''}${modifier}`;
    }
    
    return {
      result,
      breakdown,
      raw_rolls: rolls,
      modifier,
      context,
      notation
    };
  }

  rollWithAdvantage(notation, context = '') {
    const roll1 = this.rollDice(notation, context);
    const roll2 = this.rollDice(notation, context);
    const chosen = roll1.result >= roll2.result ? roll1 : roll2;
    const discarded = roll1.result >= roll2.result ? roll2 : roll1;
    
    return {
      ...chosen,
      advantage: true,
      rolls: [roll1, roll2],
      breakdown: `${chosen.breakdown} [ADV: chose ${chosen.result} over ${discarded.result}]`
    };
  }

  rollWithDisadvantage(notation, context = '') {
    const roll1 = this.rollDice(notation, context);
    const roll2 = this.rollDice(notation, context);
    const chosen = roll1.result <= roll2.result ? roll1 : roll2;
    const discarded = roll1.result <= roll2.result ? roll2 : roll1;
    
    return {
      ...chosen,
      disadvantage: true,
      rolls: [roll1, roll2],
      breakdown: `${chosen.breakdown} [DIS: chose ${chosen.result} over ${discarded.result}]`
    };
  }

  // === State Management ===
  
  initializePlayer(playerData) {
    const defaultPlayer = {
      name: playerData.name || 'Adventurer',
      class: playerData.class || 'Fighter',
      level: playerData.level || 1,
      hp: {
        current: playerData.maxHp || 30,
        max: playerData.maxHp || 30
      },
      ac: playerData.ac || 15,
      stats: playerData.stats || {
        strength: 14,
        dexterity: 12,
        constitution: 14,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      inventory: playerData.inventory || [
        'Longsword', 'Shield', 'Chain Mail',
        'Healing Potion (2d4+2)', 'Rope (50 ft)', 'Torch (3)'
      ],
      conditions: [],
      resources: {
        gold: playerData.gold || 10,
        special_abilities: {
          second_wind: 1,
          action_surge: 1
        }
      },
      location: playerData.location || 'start',
      flags: {},
      quest_log: []
    };
    
    this.state.player = defaultPlayer;
    return { success: true, player: defaultPlayer };
  }

  saveState(key, value) {
    this.state[key] = value;
    return { success: true, key, message: `State saved to '${key}'` };
  }

  loadState(key) {
    if (!(key in this.state)) {
      return { success: false, message: `Key '${key}' not found`, value: null };
    }
    return { success: true, key, value: this.state[key] };
  }

  updateState(key, updates) {
    if (!(key in this.state)) {
      return { success: false, message: `Key '${key}' not found` };
    }
    // Special handling for player inventory so we don't overwrite arrays accidentally
    if (key === 'player' && updates && typeof updates === 'object') {
      const current = this.state.player || {};
      const next = { ...current };

      // Handle inventory updates additively
      if (Object.prototype.hasOwnProperty.call(updates, 'inventory')) {
        next.inventory = this.mergeInventory(current.inventory || [], updates.inventory);
      }

      // Merge the rest using deepMerge
      const { inventory, ...rest } = updates;
      const merged = this.deepMerge(next, rest);
      this.state.player = merged;
      return { success: true, key, value: this.state.player };
    }

    this.state[key] = this.deepMerge(this.state[key], updates);
    return { success: true, key, value: this.state[key] };
  }

  getAllState() {
    return { success: true, state: { ...this.state } };
  }

  resetState() {
    this.state = {
      player: null,
      npcs: {},
      flags: {},
      quest_log: [],
      combat_state: null
    };
    return { success: true, message: 'All state reset' };
  }

  deepMerge(target, source) {
    const output = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = target[key] ? this.deepMerge(target[key], source[key]) : source[key];
      } else {
        output[key] = source[key];
      }
    }
    return output;
  }

  // === Inventory helpers ===
  normalizeItem(it) {
    if (!it) return null;
    if (typeof it === 'string') return { name: it, quantity: 1 };
    if (typeof it === 'object') {
      const name = it.name || '';
      const qty = typeof it.quantity === 'number' && it.quantity > 0 ? it.quantity : 1;
      return { name, quantity: qty };
    }
    return null;
  }

  mergeInventory(current, patch) {
    const inv = (current || []).map(it => this.normalizeItem(it)).filter(Boolean);
    const addItem = (item, qty = 1) => {
      const norm = this.normalizeItem(item);
      if (!norm || !norm.name) return;
      const idx = inv.findIndex(x => (x.name || '').toLowerCase() === norm.name.toLowerCase());
      if (idx >= 0) {
        inv[idx].quantity = (inv[idx].quantity || 1) + (qty || norm.quantity || 1);
      } else {
        inv.push({ name: norm.name, quantity: qty || norm.quantity || 1 });
      }
    };
    const removeItem = (name, qty = 1) => {
      if (!name) return;
      const idx = inv.findIndex(x => (x.name || '').toLowerCase() === String(name).toLowerCase());
      if (idx >= 0) {
        const newQty = (inv[idx].quantity || 1) - (qty || 1);
        if (newQty > 0) inv[idx].quantity = newQty; else inv.splice(idx, 1);
      }
    };

    if (Array.isArray(patch)) {
      patch.forEach(p => addItem(p));
      return inv;
    }
    if (typeof patch === 'string') {
      addItem(patch);
      return inv;
    }
    if (patch && typeof patch === 'object') {
      if (Object.prototype.hasOwnProperty.call(patch, 'add')) {
        const qty = patch.quantity || 1;
        addItem(patch.add, qty);
        return inv;
      }
      if (Object.prototype.hasOwnProperty.call(patch, 'remove')) {
        const qty = patch.quantity || 1;
        removeItem(patch.remove, qty);
        return inv;
      }
    }
    // Fallback: ignore unknown formats to avoid destructive overwrites
    return inv;
  }

  // === Combat ===
  
  resolveAttack(params) {
    const {
      attackBonus = 0,
      targetAC,
      damageDice,
      damageBonus = 0,
      advantage = false,
      disadvantage = false,
      critRange = 20,
      context = 'Attack'
    } = params;
    
    let attackRoll;
    if (advantage) {
      attackRoll = this.rollWithAdvantage('1d20', `${context} (with advantage)`);
    } else if (disadvantage) {
      attackRoll = this.rollWithDisadvantage('1d20', `${context} (with disadvantage)`);
    } else {
      attackRoll = this.rollDice('1d20', context);
    }
    
    const naturalRoll = attackRoll.raw_rolls[0];
    const totalAttack = attackRoll.result + attackBonus;
    const critical = naturalRoll >= critRange;
    const criticalMiss = naturalRoll === 1;
    
    let hit = criticalMiss ? false : (critical ? true : totalAttack >= targetAC);
    let damage = 0;
    let damageBreakdown = '';
    
    if (hit && damageDice) {
      if (critical) {
        const [count, sides] = damageDice.match(/(\d+)d(\d+)/).slice(1);
        const critDice = `${count * 2}d${sides}`;
        const damageRolls = this.rollDice(critDice, 'Critical Damage');
        damage = damageRolls.result + damageBonus;
        damageBreakdown = `${critDice}${damageBonus ? (damageBonus >= 0 ? '+' : '') + damageBonus : ''} = ${damage}`;
      } else {
        const damageRolls = this.rollDice(damageDice, 'Damage');
        damage = damageRolls.result + damageBonus;
        damageBreakdown = `${damageDice}${damageBonus ? (damageBonus >= 0 ? '+' : '') + damageBonus : ''} = ${damage}`;
      }
    }
    
    return {
      attackRoll: naturalRoll,
      attackBonus,
      totalAttack,
      targetAC,
      hit,
      critical,
      criticalMiss,
      damage,
      damageBreakdown,
      context
    };
  }

  applyDamage(currentHP, maxHP, damage) {
    const newHP = Math.max(0, currentHP - damage);
    return {
      previousHP: currentHP,
      damage,
      newHP,
      maxHP,
      isDead: newHP === 0,
      isBloodied: newHP <= maxHP / 2 && newHP > 0,
      message: newHP === 0 ? 'Reduced to 0 HP!' : `HP: ${currentHP} → ${newHP} (${damage} damage)`
    };
  }

  applyHealing(currentHP, maxHP, healing) {
    const newHP = Math.min(maxHP, currentHP + healing);
    const actualHealing = newHP - currentHP;
    return {
      previousHP: currentHP,
      healing: actualHealing,
      newHP,
      maxHP,
      atFullHealth: newHP === maxHP,
      message: `HP: ${currentHP} → ${newHP} (+${actualHealing} HP)`
    };
  }

  rollInitiative(dexModifier = 0, advantage = false) {
    const roll = advantage ? 
      this.rollWithAdvantage('1d20', 'Initiative') :
      this.rollDice('1d20', 'Initiative');
    const total = roll.result + dexModifier;
    return {
      roll: roll.raw_rolls[0],
      dexModifier,
      total,
      breakdown: `1d20 (${roll.raw_rolls[0]}) + ${dexModifier} = ${total}`,
      advantage
    };
  }

  resolveSavingThrow(params) {
    const {
      modifier = 0,
      dc,
      advantage = false,
      disadvantage = false,
      saveName = 'Saving Throw'
    } = params;
    
    let roll;
    if (advantage) {
      roll = this.rollWithAdvantage('1d20', saveName);
    } else if (disadvantage) {
      roll = this.rollWithDisadvantage('1d20', saveName);
    } else {
      roll = this.rollDice('1d20', saveName);
    }
    
    const total = roll.result + modifier;
    const success = total >= dc;
    
    return {
      roll: roll.raw_rolls[0],
      modifier,
      total,
      dc,
      success,
      margin: total - dc,
      breakdown: `1d20 (${roll.raw_rolls[0]}) + ${modifier} = ${total} vs DC ${dc}`,
      message: success ? `Success! (${total} vs DC ${dc})` : `Failure! (${total} vs DC ${dc})`
    };
  }
}

// Export singleton instance
export const mcpClient = new MCPClient();
