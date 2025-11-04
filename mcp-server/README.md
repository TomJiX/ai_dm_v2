# AI DM MCP Server

Model Context Protocol server providing D&D game mechanics tools.

## Installation

```bash
npm install
```

## Running

```bash
npm start
```

## Available Tools

### Dice Rolling
- `roll_dice` - Roll dice (e.g., "2d6+3")
- `roll_with_advantage` - Roll twice, take higher
- `roll_with_disadvantage` - Roll twice, take lower

### State Management
- `initialize_player` - Create player character
- `save_state` - Save data to game state
- `load_state` - Load data from game state
- `update_state` - Update existing state
- `get_all_state` - Get all game state
- `reset_state` - Clear all state

### Combat
- `resolve_attack` - Complete attack resolution
- `apply_damage` - Calculate damage effects
- `apply_healing` - Calculate healing effects
- `roll_initiative` - Roll for turn order
- `resolve_saving_throw` - Roll saving throw vs DC

## Usage Example

```javascript
// Roll dice
roll_dice({ notation: "1d20+5", context: "attack roll" })

// Initialize player
initialize_player({ 
  name: "Thorin", 
  class: "Fighter", 
  maxHp: 30, 
  ac: 15 
})

// Resolve attack
resolve_attack({
  attackBonus: 5,
  targetAC: 14,
  damageDice: "1d8+3",
  context: "Longsword attack"
})
```
