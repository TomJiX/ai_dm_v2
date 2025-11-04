# 🚀 Quick Start Guide

Get your AI Dungeon Master running in 5 minutes!

## Step 1: Install Dependencies

Open PowerShell and run:

```powershell
# Install MCP server dependencies
cd c:\Users\2838038J\Desktop\Perso\ai_gm_v2\mcp-server
npm install

# Install frontend dependencies
cd ..\frontend
npm install
```

## Step 2: Configure GitHub Token

1. Get your GitHub token from: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Enable the **copilot** scope
   - Copy the generated token

2. Create `.env.local` file:
```powershell
cd c:\Users\2838038J\Desktop\Perso\ai_gm_v2\frontend
Copy-Item .env.example .env.local
```

3. Edit `.env.local` and paste your GitHub token:
```
VITE_GITHUB_TOKEN=your_github_token_here
```

## Step 3: Run the Game

```powershell
cd c:\Users\2838038J\Desktop\Perso\ai_gm_v2\frontend
npm run dev
```

Open your browser to: **http://localhost:5173**

## 🎮 First Session

1. **Wait for the opening scene** - The AI will introduce your quest
2. **Type your first action** - Try: "I talk to Marcus about his daughter"
3. **Watch the AI respond** - It will narrate what happens
4. **Use tools automatically** - When dice need rolling, the AI will invoke tools
5. **Check your character** - Click the "Character" tab to see your stats

## 💡 Pro Tips

- **Use quick action buttons** below the chat for common actions
- **Save your game** before risky decisions (click Save button)
- **Be specific** in your actions for better responses
- **Check your inventory** before combat
- **Natural language works** - Just describe what you want to do!

## 🎲 Example Actions to Try

```
"I look around the tavern"
"I ask Greta if she has any healing potions"
"I want to inspect the merchant's wounds"
"I prepare to leave for the forest"
"I try to persuade Marcus to give me the map"
```

## ⚠️ Troubleshooting

**Can't connect to OpenAI?**
- Check your API key in `.env.local`
- Verify you have API credits: https://platform.openai.com/account/usage
- Restart the dev server: `Ctrl+C` then `npm run dev`

**Page is blank?**
- Check browser console (F12) for errors
- Make sure you're on http://localhost:5173 (not 5174)

**AI not responding?**
- Wait 5-10 seconds (GPT-4 can be slow)
- Check for rate limiting
- Verify your API key is active

## 🎯 Next Steps

Once you've played through the Goblin Cave scenario:

1. **Create your own scenario** - Copy `goblin-cave.json` and edit it
2. **Customize your character** - Edit `initialState.js`
3. **Adjust AI behavior** - Modify prompts in `promptBuilder.js`
4. **Add more tools** - Extend the MCP server

## 📚 Full Documentation

See `README.md` for complete documentation on:
- Architecture details
- Creating custom scenarios
- MCP server tools
- Customization options
- Development tips

---

**Happy adventuring! ⚔️**

Need help? Check the browser console (F12) for error messages.
