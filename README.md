# AI Dungeon Master v2

A complete AI-powered D&D game master application using React, Model Context Protocol (MCP), and GitHub Copilot.

## 🎮 Features

- **AI Dungeon Master**: GitHub Copilot powered narrative generation
- **MCP Server**: Handles dice rolls, combat, and state management
- **Interactive UI**: Chat-based gameplay with character sheet and inventory
- **Complete D&D Mechanics**: Dice rolling, combat resolution, skill checks, saving throws
- **Scenario System**: JSON-based adventure structure (includes Goblin Cave Rescue)
- **Save/Load**: Save your progress and continue later
- **Mobile Responsive**: Works on desktop and mobile devices

## 📁 Project Structure

```
ai_gm_v2/
├── mcp-server/           # MCP server for game mechanics
│   ├── tools/            # Dice, combat, state management
│   ├── scenarios/        # Adventure scenarios (JSON)
│   └── index.js          # MCP server entry point
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── services/     # AI and MCP client services
│   │   └── data/         # Game data and scenarios
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- GitHub account with Copilot access

### Installation

1. **Install MCP Server dependencies:**
```bash
cd mcp-server
npm install
```

2. **Install Frontend dependencies:**
```bash
cd frontend
npm install
```

3. **Configure GitHub Token:**
```bash
cd frontend
cp .env.example .env.local
```

Get your GitHub token from https://github.com/settings/tokens (enable 'copilot' scope)

Edit `.env.local` and add your GitHub token:
```
VITE_GITHUB_TOKEN=your_github_token_here
```

### Running the Application

**Option 1: Run both services separately**

Terminal 1 (MCP Server):
```bash
cd mcp-server
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

**Option 2: Frontend only (with embedded MCP client)**

The frontend includes an embedded MCP client that works without running the server separately.

```bash
cd frontend
npm run dev
```

Open your browser to: http://localhost:5173

## 🎲 How to Play

1. **Start the game**: The AI DM will introduce the scenario
2. **Type actions**: Describe what you want to do in the chat
3. **Use quick actions**: Click suggested actions for common tasks
4. **Check your character**: View HP, stats, and conditions in the Character tab
5. **Manage inventory**: Use items from your Inventory tab
6. **Save your progress**: Click the Save button to download your game state

### Example Actions

- "I talk to Marcus and ask about the goblins"
- "I want to search the area for clues"
- "I attack the goblin with my longsword"
- "I try to sneak past the guards"
- "I use a healing potion"

## 🛠️ MCP Server Tools

The MCP server provides these tools:

### Dice Rolling
- `roll_dice` - Roll dice (e.g., "2d6+3")
- `roll_with_advantage` - Roll twice, take higher
- `roll_with_disadvantage` - Roll twice, take lower

### State Management
- `initialize_player` - Create player character
- `save_state` - Save game data
- `load_state` - Load game data
- `update_state` - Update player state
- `get_all_state` - Get complete state
- `reset_state` - Clear all state

### Combat & Mechanics
- `resolve_attack` - Complete attack resolution
- `apply_damage` - Calculate damage effects
- `apply_healing` - Calculate healing effects
- `roll_initiative` - Roll for combat turn order
- `resolve_saving_throw` - Roll saving throws vs DC

## 📖 Creating Custom Scenarios

Edit or create new scenario files in `mcp-server/scenarios/`:

```json
{
  "title": "Your Adventure Title",
  "description": "Adventure description",
  "scenes": {
    "start": {
      "title": "Opening Scene",
      "description": "Scene description...",
      "npcs": [...],
      "exits": ["next_scene"],
      "skill_checks": [...],
      "encounters": [...]
    }
  },
  "rules": {...},
  "win_conditions": [...],
  "lose_conditions": [...]
}
```

Copy the scenario to `frontend/src/data/` and import it in `App.jsx`.

## 🎨 Customization

### Change Character Starting Stats

Edit `frontend/src/data/initialState.js`:

```javascript
export const initialPlayerState = {
  name: 'Your Name',
  class: 'Rogue',
  level: 1,
  hp: { current: 25, max: 25 },
  ac: 14,
  stats: {
    strength: 10,
    dexterity: 16,
    // ...
  }
};
```

### Adjust AI Behavior

Modify system prompts in `frontend/src/services/promptBuilder.js`.

### Style Changes

Edit Tailwind classes in component files or add custom CSS to `frontend/src/index.css`.

## 🔧 Troubleshooting

**"Invalid token" error:**
- Check that your GitHub token is correctly set in `.env.local`
- Ensure the token has 'copilot' scope enabled
- Restart the dev server after changing `.env.local`

**Tools not working:**
- Check browser console for errors
- Verify tool call format in AI responses (should be `TOOL_CALL:` and `ARGUMENTS:`)

**AI not responding:**
- Verify your GitHub Copilot subscription is active
- Check internet connection
- Look for rate limiting messages

**State not saving:**
- Check browser console for errors
- Verify the MCP client is properly initialized
- Try refreshing the page

## 📝 Development

### Build for Production

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`.

### Preview Production Build

```bash
cd frontend
npm run preview
```

## 🤝 Contributing

This is a personal project, but feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Create custom scenarios

## 📄 License

MIT License - Feel free to use and modify!

## 🙏 Acknowledgments

- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- Powered by [GitHub Copilot](https://github.com/features/copilot)
- Uses [Model Context Protocol](https://github.com/modelcontextprotocol)
- Icons from [Lucide React](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 🎯 Roadmap

- [ ] Add more scenarios
- [ ] Implement real MCP server connection (HTTP/WebSocket)
- [ ] Add character creation flow
- [ ] Support multiplayer (shared state)
- [ ] Add sound effects and music
- [ ] Create scenario editor UI
- [ ] Add AI-generated images for scenes

---

**Ready to adventure? Fire up the servers and start playing! ⚔️🎲**
