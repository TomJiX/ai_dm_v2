# 🔑 GitHub Copilot API Setup Guide

This application now uses **GitHub Copilot API** instead of OpenAI for narrative generation.

## Prerequisites

1. **GitHub Copilot Subscription** - You need an active Copilot subscription
2. **GitHub Account** - Must be logged in to GitHub

## Getting Your GitHub Token

### Step 1: Create a Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name like "AI Dungeon Master"
4. Set expiration (recommended: 90 days)
5. **Important**: Enable the **`copilot`** scope checkbox
6. Click **"Generate token"** at the bottom
7. **Copy the token immediately** (you won't be able to see it again!)

### Step 2: Add Token to Your Project

1. Open `frontend/.env.local` file
2. Replace the placeholder with your token:
```
VITE_GITHUB_TOKEN=ghp_yourActualTokenHere
```

### Step 3: Restart Dev Server

If the server is already running:
```powershell
# Press Ctrl+C to stop
npm run dev  # Start again
```

## How It Works

The application uses GitHub Copilot's API endpoint:
- **Base URL**: `https://api.githubcopilot.com`
- **Model**: `gpt-4o` (Copilot's GPT-4 optimized model)
- **Authentication**: GitHub Personal Access Token

## Differences from OpenAI

### Advantages ✅
- No separate OpenAI account needed
- Included with Copilot subscription
- Same powerful GPT-4 model
- Better integration with GitHub ecosystem

### Limitations ⚠️
- Requires active GitHub Copilot subscription
- Token needs periodic renewal
- Rate limits may differ from OpenAI

## Troubleshooting

### "Invalid GitHub token" Error
- **Check**: Token has `copilot` scope enabled
- **Check**: Token hasn't expired
- **Try**: Generate a new token

### "Copilot subscription required" Error
- **Verify**: Your Copilot subscription is active at https://github.com/settings/copilot
- **Note**: Free trials may have limitations

### Rate Limiting
- GitHub Copilot API has usage limits
- If you hit limits, wait a few minutes before trying again
- Consider generating a new token if issues persist

## Security Best Practices

1. **Never commit** `.env.local` to git (already in .gitignore)
2. **Don't share** your GitHub token publicly
3. **Rotate tokens** periodically (every 90 days recommended)
4. **Use minimal scopes** (only enable `copilot`)
5. **Revoke old tokens** at https://github.com/settings/tokens

## Token Management

### Checking Token Status
Visit: https://github.com/settings/tokens
- See all your active tokens
- Check expiration dates
- Revoke compromised tokens

### Revoking a Token
1. Go to: https://github.com/settings/tokens
2. Find the token
3. Click **"Revoke"**
4. Generate a new one if needed

## Cost Considerations

GitHub Copilot subscription pricing (as of 2024):
- **Individual**: $10/month or $100/year
- **Business**: $19/user/month
- **Enterprise**: Custom pricing

The API usage is included in your Copilot subscription with fair use limits.

## Alternative: Switch Back to OpenAI

If you prefer to use OpenAI directly:

1. Edit `frontend/src/services/copilotService.js`:
```javascript
const copilot = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1',  // Change this
  dangerouslyAllowBrowser: true
});
```

2. Update `.env.local`:
```
VITE_OPENAI_API_KEY=sk-your-openai-key
```

## Support

- GitHub Copilot Docs: https://docs.github.com/en/copilot
- Token Docs: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- API Reference: https://github.com/features/copilot

---

**Ready to play?** Follow the [QUICKSTART.md](QUICKSTART.md) guide!
