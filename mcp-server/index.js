#!/usr/bin/env node

/**
 * AI Dungeon Master MCP Server
 * Provides tools for dice rolling, state management, and combat resolution
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import tool functions
import { rollDice, rollWithAdvantage, rollWithDisadvantage } from './tools/dice.js';
import { 
  saveState, 
  loadState, 
  updateState, 
  getAllState, 
  resetState, 
  initializePlayer 
} from './tools/state.js';
import { 
  resolveAttack, 
  applyDamage, 
  applyHealing, 
  rollInitiative,
  resolveSavingThrow
} from './tools/combat.js';

// Create MCP server
const server = new Server(
  {
    name: 'ai-dm-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const TOOLS = [
  {
    name: 'roll_dice',
    description: 'Roll dice using standard D&D notation (e.g., "2d6+3", "1d20"). Returns result and breakdown.',
    inputSchema: {
      type: 'object',
      properties: {
        notation: {
          type: 'string',
          description: 'Dice notation (e.g., "2d6+3", "1d20", "4d8-2")',
        },
        context: {
          type: 'string',
          description: 'What the roll is for (e.g., "attack roll", "damage")',
        },
      },
      required: ['notation'],
    },
  },
  {
    name: 'roll_with_advantage',
    description: 'Roll dice with advantage (roll twice, take higher result). Used in D&D when you have an advantage.',
    inputSchema: {
      type: 'object',
      properties: {
        notation: {
          type: 'string',
          description: 'Dice notation (usually "1d20" for D&D)',
        },
        context: {
          type: 'string',
          description: 'What the roll is for',
        },
      },
      required: ['notation'],
    },
  },
  {
    name: 'roll_with_disadvantage',
    description: 'Roll dice with disadvantage (roll twice, take lower result). Used in D&D when you have a disadvantage.',
    inputSchema: {
      type: 'object',
      properties: {
        notation: {
          type: 'string',
          description: 'Dice notation (usually "1d20" for D&D)',
        },
        context: {
          type: 'string',
          description: 'What the roll is for',
        },
      },
      required: ['notation'],
    },
  },
  {
    name: 'save_state',
    description: 'Save game state data (player stats, flags, etc.) to memory.',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'State key to save to (e.g., "player", "npcs", "flags")',
        },
        value: {
          description: 'Value to save (any JSON-serializable data)',
        },
      },
      required: ['key', 'value'],
    },
  },
  {
    name: 'load_state',
    description: 'Load game state data from memory.',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'State key to load from (e.g., "player", "npcs")',
        },
      },
      required: ['key'],
    },
  },
  {
    name: 'update_state',
    description: 'Update existing state with partial changes (deep merge). Use this to update player HP, inventory, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'State key to update (e.g., "player")',
        },
        updates: {
          type: 'object',
          description: 'Object with updates to merge into existing state',
        },
      },
      required: ['key', 'updates'],
    },
  },
  {
    name: 'get_all_state',
    description: 'Get all current game state data. Useful for debugging or saving the game.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'reset_state',
    description: 'Reset all game state (start a new game). Clears player, NPCs, flags, etc.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'initialize_player',
    description: 'Initialize player state with default stats. Use this at the start of a new game.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Player character name',
        },
        class: {
          type: 'string',
          description: 'Character class (Fighter, Wizard, Rogue, etc.)',
        },
        level: {
          type: 'number',
          description: 'Character level (usually 1 for new games)',
        },
        maxHp: {
          type: 'number',
          description: 'Maximum hit points',
        },
        ac: {
          type: 'number',
          description: 'Armor class',
        },
        stats: {
          type: 'object',
          description: 'Ability scores (strength, dexterity, constitution, intelligence, wisdom, charisma)',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'resolve_attack',
    description: 'Resolve a complete attack: roll to hit, check against AC, roll damage if hit. Handles crits and misses.',
    inputSchema: {
      type: 'object',
      properties: {
        attackBonus: {
          type: 'number',
          description: 'Attack bonus to add to 1d20 roll',
        },
        targetAC: {
          type: 'number',
          description: 'Target\'s Armor Class',
        },
        damageDice: {
          type: 'string',
          description: 'Damage dice notation (e.g., "1d8", "2d6")',
        },
        damageBonus: {
          type: 'number',
          description: 'Damage bonus to add',
        },
        advantage: {
          type: 'boolean',
          description: 'Roll attack with advantage',
        },
        disadvantage: {
          type: 'boolean',
          description: 'Roll attack with disadvantage',
        },
        critRange: {
          type: 'number',
          description: 'Natural roll needed for critical hit (default 20)',
        },
        context: {
          type: 'string',
          description: 'Description of the attack',
        },
      },
      required: ['targetAC', 'damageDice'],
    },
  },
  {
    name: 'apply_damage',
    description: 'Apply damage to a creature, calculating new HP and status (dead, bloodied).',
    inputSchema: {
      type: 'object',
      properties: {
        currentHP: {
          type: 'number',
          description: 'Current hit points',
        },
        maxHP: {
          type: 'number',
          description: 'Maximum hit points',
        },
        damage: {
          type: 'number',
          description: 'Damage to apply',
        },
      },
      required: ['currentHP', 'maxHP', 'damage'],
    },
  },
  {
    name: 'apply_healing',
    description: 'Apply healing to a creature, calculating new HP (cannot exceed max).',
    inputSchema: {
      type: 'object',
      properties: {
        currentHP: {
          type: 'number',
          description: 'Current hit points',
        },
        maxHP: {
          type: 'number',
          description: 'Maximum hit points',
        },
        healing: {
          type: 'number',
          description: 'Hit points to restore',
        },
      },
      required: ['currentHP', 'maxHP', 'healing'],
    },
  },
  {
    name: 'roll_initiative',
    description: 'Roll initiative for combat (1d20 + DEX modifier). Determines turn order.',
    inputSchema: {
      type: 'object',
      properties: {
        dexModifier: {
          type: 'number',
          description: 'Dexterity modifier to add to roll',
        },
        advantage: {
          type: 'boolean',
          description: 'Roll with advantage',
        },
      },
    },
  },
  {
    name: 'resolve_saving_throw',
    description: 'Resolve a saving throw (1d20 + modifier vs DC). Used for resisting spells, traps, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        modifier: {
          type: 'number',
          description: 'Ability modifier to add to roll',
        },
        dc: {
          type: 'number',
          description: 'Difficulty Class to beat',
        },
        advantage: {
          type: 'boolean',
          description: 'Roll with advantage',
        },
        disadvantage: {
          type: 'boolean',
          description: 'Roll with disadvantage',
        },
        saveName: {
          type: 'string',
          description: 'Name of the save (e.g., "Dexterity Save", "Constitution Save")',
        },
      },
      required: ['dc'],
    },
  },
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'roll_dice':
        result = rollDice(args.notation, args.context || '');
        break;

      case 'roll_with_advantage':
        result = rollWithAdvantage(args.notation, args.context || '');
        break;

      case 'roll_with_disadvantage':
        result = rollWithDisadvantage(args.notation, args.context || '');
        break;

      case 'save_state':
        result = saveState(args.key, args.value);
        break;

      case 'load_state':
        result = loadState(args.key);
        break;

      case 'update_state':
        result = updateState(args.key, args.updates);
        break;

      case 'get_all_state':
        result = getAllState();
        break;

      case 'reset_state':
        result = resetState();
        break;

      case 'initialize_player':
        result = initializePlayer(args);
        break;

      case 'resolve_attack':
        result = resolveAttack(args);
        break;

      case 'apply_damage':
        result = applyDamage(args.currentHP, args.maxHP, args.damage);
        break;

      case 'apply_healing':
        result = applyHealing(args.currentHP, args.maxHP, args.healing);
        break;

      case 'roll_initiative':
        result = rollInitiative(args.dexModifier || 0, args.advantage || false);
        break;

      case 'resolve_saving_throw':
        result = resolveSavingThrow(args);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error.message,
            tool: name,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AI DM MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
