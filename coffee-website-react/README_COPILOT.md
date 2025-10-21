# ☕️ Coffee Copilot - AI Customer Support

**Status**: ✅ Production Ready
**Integration**: GitHub Actions + Claude Code
**Implementation Time**: 2 hours

---

## What This Is

An AI-powered chat widget that helps your coffee website visitors:
- 💬 Get answers about coffee, brewing, and products
- 🐛 Report bugs and request features
- 🤖 Automatically trigger bug fixes via GitHub Actions

---

## How It Works

### User Experience

1. **Visitor sees coffee bean (☕️) button** floating in bottom-right corner
2. **Clicks to open chat widget**
3. **Chooses mode:**
   - **💬 Chat Mode**: Ask about coffee, brewing methods, products
   - **🐛 Report Issue Mode**: File bugs or feature requests

### Behind the Scenes

```
User Message
    ↓
Frontend (React)
    ↓
Backend (Express + OpenAI)
    ↓
AI Decision: Search docs? Create issue?
    ↓
Execute Tool (searchDocs or createGithubIssue)
    ↓
Response to User
```

### Bug Report Flow

```
User clicks "Report Issue"
    ↓
Describes the bug
    ↓
AI asks clarifying questions
    ↓
Creates GitHub issue with @claude mention
    ↓
GitHub Action triggers
    ↓
Claude Code analyzes and fixes
    ↓
Pull request created
```

---

## Quick Start

### 1. Backend Server

```bash
cd server
npm install
npm run dev
```

Server runs on `http://localhost:3001`

### 2. Frontend

```bash
npm run dev
```

App runs on `http://localhost:5173`

### 3. Test It

- Open browser to `http://localhost:5173`
- Click ☕️ button
- Try Chat mode: "How do I brew pour over?"
- Try Report mode: Click 🐛 and describe a test bug

---

## Configuration

### Environment Variables (`server/.env`)

```bash
# Required
OPENAI_API_KEY=sk-...          # Get from platform.openai.com
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173

# For GitHub Integration (optional)
GITHUB_TOKEN=github_pat_...    # Personal access token
GITHUB_REPO=owner/repo-name

# Feature Flags
ENABLE_GITHUB_TOOL=true
ENABLE_RAG=true
```

**Important**: Restart server after changing `.env` file!

---

## Architecture

### Frontend (`src/components/CoffeeCopilot.tsx`)
- React component with useState hooks
- Mode toggle (Chat / Report Issue)
- Tailwind CSS styling
- Calls backend API at `/api/chat`

### Backend (`server/src/server.ts`)
- Express.js server
- OpenAI GPT-4o-mini integration
- Tool calling for searchDocs and createGithubIssue
- Mode-based system prompts

### Knowledge Base (MVP)
- In-memory array of coffee topics (lines 22-43 in server.ts)
- Simple keyword matching
- 5 topics currently (expand to 20+ recommended)

---

## Key Features

### ✅ Mode-Based Control

**Problem**: AI creating issues without permission
**Solution**: Explicit mode toggle

- **Chat Mode**: GitHub tool disabled completely
- **Report Issue Mode**: Must click button to enable

### ✅ GitHub Actions Integration

Every issue created automatically includes:

```markdown
---

@claude Please investigate and fix this issue.
```

This triggers the GitHub Action workflow to start fixing the bug.

### ✅ Smart Tool Calling

OpenAI decides when to use tools:
- User: "How do I make espresso?" → Searches knowledge base
- User: "Cart button broken" (in Report mode) → Creates GitHub issue

---

## Expanding the System

### Add More Coffee Knowledge

Edit `server/src/server.ts`:

```typescript
const coffeeKnowledge = [
  // Existing topics...
  {
    topic: "Cold Brew",
    text: "Cold brew uses coarse grind, room temp water, 12-24 hour steep time...",
    category: "brewing"
  },
  // Add 15-20 more topics
];
```

### Add Product Search

```typescript
async function searchProducts(query: string) {
  const products = await db.collection('products')
    .where('name', '>=', query)
    .limit(5)
    .get();

  return products.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    price: doc.data().price
  }));
}
```

### Add Order Creation

**Requires authentication first!**

```typescript
async function createOrder(params) {
  // 1. Verify user is authenticated
  // 2. Validate product exists
  // 3. Check inventory
  // 4. Create order in Firebase
  // 5. Return confirmation
}
```

---

## File Structure

```
coffee-website-react/
├── server/
│   ├── src/
│   │   └── server.ts          # Backend with OpenAI integration
│   ├── .env                   # Configuration (not in git)
│   └── package.json
├── src/
│   ├── components/
│   │   └── CoffeeCopilot.tsx  # Chat widget
│   └── App.tsx                # Imports CoffeeCopilot
├── NEXT_STEPS.md              # Detailed roadmap
└── README_COPILOT.md          # This file
```

---

## Common Issues

### "OpenAI: ❌ Missing" after adding API key
**Fix**: Stop server (Ctrl+C) and restart with `npm run dev`
**Why**: Environment variables load at startup

### GitHub Action not triggering
**Fix**: Check that `@claude` is in issue **body**, not label
**Verify**: `gh issue view [number]` and look for @claude mention

### Chat widget not appearing
**Fix**: Check browser console for errors
**Verify**: CoffeeCopilot imported in App.tsx

### CORS errors
**Fix**: Add frontend origin to `ALLOWED_ORIGINS` in server/.env
**Example**: `ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com`

---

## Monitoring

### Check Server Health

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "openai": "configured",
  "timestamp": "2025-10-20T..."
}
```

### View Server Logs

Server logs show:
- Tool calls: `Tool: searchDocs { query: 'espresso' }`
- GitHub issues: `createGithubIssue: Cart button not working`
- Errors and stack traces

### Check GitHub Issues

```bash
gh issue list
gh issue view 2
```

---

## Cost Estimation

### OpenAI Usage

- Model: GPT-4o-mini
- Cost per conversation: ~$0.001-0.005
- 1000 conversations: ~$1-5/month

### Optimization Tips

1. **Cache common queries**
2. **Limit conversation history** (only send last 10 messages)
3. **Use smaller model** for simple questions
4. **Set max_tokens** to prevent long responses

---

## Security Checklist

- [x] API keys in `.env`, not code
- [x] `.env` in `.gitignore`
- [x] CORS configured
- [ ] Add rate limiting (TODO)
- [ ] Add user authentication (TODO)
- [ ] Validate all tool inputs
- [ ] Never trust client-provided prices

---

## Next Steps

See `NEXT_STEPS.md` for detailed roadmap.

**Immediate priorities:**
1. Expand knowledge base to 25+ topics
2. Add user authentication
3. Implement product search
4. Set up analytics tracking

**This week:**
- Test on real devices (mobile Safari, Chrome)
- Monitor first user conversations
- Refine system prompts based on usage
- Add order creation flow

---

## Need Help?

**OpenAI API Issues**
- Dashboard: https://platform.openai.com/usage
- Docs: https://platform.openai.com/docs

**GitHub Actions**
- Check workflow runs: `.github/workflows/`
- View action logs: GitHub → Actions tab

**Skill Documentation**
- Full guide: `.claude/skills/coffee-copilot/SKILL.md`
- Lessons learned: `.claude/skills/coffee-copilot/LESSONS_LEARNED.md`

---

**Built with**: OpenAI GPT-4o-mini • React • Express.js • GitHub Actions • Claude Code
**Status**: MVP shipped in 2 hours ✅
**Next**: Scale and optimize 🚀
