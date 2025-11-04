/**
 * Dice Rolling System
 * Handles D&D-style dice notation (e.g., "2d6+3", "1d20")
 */

/**
 * Parse dice notation string
 * @param {string} notation - Format: "XdY+Z" (e.g., "2d6+3", "1d20", "3d8-2")
 * @returns {object} - { count, sides, modifier }
 */
function parseDiceNotation(notation) {
  const pattern = /^(\d+)d(\d+)([+-]\d+)?$/i;
  const match = notation.trim().match(pattern);
  
  if (!match) {
    throw new Error(`Invalid dice notation: ${notation}. Use format like "2d6+3"`);
  }
  
  return {
    count: parseInt(match[1]),
    sides: parseInt(match[2]),
    modifier: match[3] ? parseInt(match[3]) : 0
  };
}

/**
 * Roll a single die
 * @param {number} sides - Number of sides on the die
 * @returns {number} - Random number between 1 and sides
 */
function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice and return results
 * @param {number} count - Number of dice to roll
 * @param {number} sides - Number of sides per die
 * @returns {array} - Array of individual roll results
 */
function rollMultipleDice(count, sides) {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides));
  }
  return rolls;
}

/**
 * Roll dice based on notation
 * @param {string} notation - Dice notation (e.g., "2d6+3")
 * @param {string} context - Description of what the roll is for
 * @returns {object} - { result, breakdown, raw_rolls, modifier, context }
 */
export function rollDice(notation, context = '') {
  const { count, sides, modifier } = parseDiceNotation(notation);
  const rolls = rollMultipleDice(count, sides);
  const sum = rolls.reduce((a, b) => a + b, 0);
  const result = sum + modifier;
  
  // Create breakdown string
  let breakdown = `${count}d${sides}`;
  if (rolls.length <= 10) { // Only show individual rolls if reasonable
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
    notation,
    sum_before_modifier: sum
  };
}

/**
 * Roll with advantage (roll twice, take higher)
 * @param {string} notation - Dice notation
 * @param {string} context - Description of the roll
 * @returns {object} - Roll result with advantage details
 */
export function rollWithAdvantage(notation, context = '') {
  const roll1 = rollDice(notation, context);
  const roll2 = rollDice(notation, context);
  
  const chosen = roll1.result >= roll2.result ? roll1 : roll2;
  const discarded = roll1.result >= roll2.result ? roll2 : roll1;
  
  return {
    ...chosen,
    advantage: true,
    rolls: [roll1, roll2],
    chosen_result: chosen.result,
    discarded_result: discarded.result,
    breakdown: `${chosen.breakdown} [ADV: chose ${chosen.result} over ${discarded.result}]`
  };
}

/**
 * Roll with disadvantage (roll twice, take lower)
 * @param {string} notation - Dice notation
 * @param {string} context - Description of the roll
 * @returns {object} - Roll result with disadvantage details
 */
export function rollWithDisadvantage(notation, context = '') {
  const roll1 = rollDice(notation, context);
  const roll2 = rollDice(notation, context);
  
  const chosen = roll1.result <= roll2.result ? roll1 : roll2;
  const discarded = roll1.result <= roll2.result ? roll2 : roll1;
  
  return {
    ...chosen,
    disadvantage: true,
    rolls: [roll1, roll2],
    chosen_result: chosen.result,
    discarded_result: discarded.result,
    breakdown: `${chosen.breakdown} [DIS: chose ${chosen.result} over ${discarded.result}]`
  };
}
