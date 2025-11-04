/**
 * Combat Resolution System
 * Handles D&D 5e combat mechanics
 */

import { rollDice, rollWithAdvantage, rollWithDisadvantage } from './dice.js';

/**
 * Resolve an attack roll and damage
 * @param {object} params - Attack parameters
 * @returns {object} - Attack result with hit/miss, damage, etc.
 */
export function resolveAttack(params) {
  const {
    attackBonus = 0,
    targetAC,
    damageDice,
    damageBonus = 0,
    advantage = false,
    disadvantage = false,
    critRange = 20, // Natural 20 by default
    context = 'Attack'
  } = params;
  
  // Roll attack (1d20 + bonus)
  let attackRoll;
  if (advantage) {
    attackRoll = rollWithAdvantage('1d20', `${context} (with advantage)`);
  } else if (disadvantage) {
    attackRoll = rollWithDisadvantage('1d20', `${context} (with disadvantage)`);
  } else {
    attackRoll = rollDice('1d20', context);
  }
  
  const naturalRoll = attackRoll.raw_rolls[0];
  const totalAttack = attackRoll.result + attackBonus;
  
  // Check for critical hit
  const critical = naturalRoll >= critRange;
  const criticalMiss = naturalRoll === 1;
  
  // Determine hit/miss (natural 1 always misses, natural 20 always hits)
  let hit = false;
  if (criticalMiss) {
    hit = false;
  } else if (critical) {
    hit = true;
  } else {
    hit = totalAttack >= targetAC;
  }
  
  // Roll damage if hit
  let damage = 0;
  let damageBreakdown = '';
  let damageRolls = null;
  
  if (hit && damageDice) {
    if (critical) {
      // Critical hit: double the dice (not the modifier)
      const [count, sides] = damageDice.match(/(\d+)d(\d+)/).slice(1);
      const critDice = `${count * 2}d${sides}`;
      damageRolls = rollDice(critDice, 'Critical Damage');
      damage = damageRolls.result + damageBonus;
      damageBreakdown = `${critDice}${damageBonus !== 0 ? (damageBonus >= 0 ? '+' : '') + damageBonus : ''} = ${damage}`;
    } else {
      // Normal damage
      damageRolls = rollDice(damageDice, 'Damage');
      damage = damageRolls.result + damageBonus;
      damageBreakdown = `${damageDice}${damageBonus !== 0 ? (damageBonus >= 0 ? '+' : '') + damageBonus : ''} = ${damage}`;
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
    damageRolls: damageRolls ? damageRolls.raw_rolls : null,
    context
  };
}

/**
 * Apply damage to a creature
 * @param {number} currentHP - Current hit points
 * @param {number} maxHP - Maximum hit points
 * @param {number} damage - Damage to apply
 * @returns {object} - New HP and status
 */
export function applyDamage(currentHP, maxHP, damage) {
  const newHP = Math.max(0, currentHP - damage);
  
  return {
    previousHP: currentHP,
    damage,
    newHP,
    maxHP,
    isDead: newHP === 0,
    isBloodied: newHP <= maxHP / 2 && newHP > 0,
    hpLost: currentHP - newHP,
    message: newHP === 0 
      ? `Reduced to 0 HP!` 
      : `HP: ${currentHP} → ${newHP} (${damage} damage taken)`
  };
}

/**
 * Apply healing to a creature
 * @param {number} currentHP - Current hit points
 * @param {number} maxHP - Maximum hit points
 * @param {number} healing - Hit points to restore
 * @returns {object} - New HP and status
 */
export function applyHealing(currentHP, maxHP, healing) {
  const newHP = Math.min(maxHP, currentHP + healing);
  const actualHealing = newHP - currentHP;
  
  return {
    previousHP: currentHP,
    healing: actualHealing,
    newHP,
    maxHP,
    atFullHealth: newHP === maxHP,
    overheal: healing - actualHealing,
    message: `HP: ${currentHP} → ${newHP} (+${actualHealing} HP restored)`
  };
}

/**
 * Roll initiative (determines turn order in combat)
 * @param {number} dexModifier - Dexterity modifier
 * @param {boolean} advantage - Roll with advantage
 * @returns {object} - Initiative result
 */
export function rollInitiative(dexModifier = 0, advantage = false) {
  let roll;
  
  if (advantage) {
    roll = rollWithAdvantage('1d20', 'Initiative');
  } else {
    roll = rollDice('1d20', 'Initiative');
  }
  
  const total = roll.result + dexModifier;
  
  return {
    roll: roll.raw_rolls[0],
    dexModifier,
    total,
    breakdown: `1d20 (${roll.raw_rolls[0]}) + ${dexModifier} = ${total}`,
    advantage
  };
}

/**
 * Resolve a saving throw
 * @param {object} params - Save parameters
 * @returns {object} - Save result
 */
export function resolveSavingThrow(params) {
  const {
    modifier = 0,
    dc,
    advantage = false,
    disadvantage = false,
    saveName = 'Saving Throw'
  } = params;
  
  let roll;
  if (advantage) {
    roll = rollWithAdvantage('1d20', saveName);
  } else if (disadvantage) {
    roll = rollWithDisadvantage('1d20', saveName);
  } else {
    roll = rollDice('1d20', saveName);
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
