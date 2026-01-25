---
name: coffee-copilot
description: Implement an AI-powered copilot chat widget for web applications with RAG (Retrieval-Augmented Generation), order management, and GitHub issue integration. Use when implementing conversational AI features, chatbots with tool-calling capabilities, or customer support automation for coffee-related businesses or similar e-commerce applications.
---

# Coffee Copilot Implementation Skill

## Overview

Implement a production-ready AI copilot for coffee websites (or similar e-commerce applications) that provides:
- **Conversational AI**: Chat about products, brewing methods, and answer customer questions
- **RAG (Retrieval-Augmented Generation)**: Search documentation to provide accurate, cited answers
- **Order Management**: Enable users to place orders through natural conversation
- **GitHub Integration**: Allow users to file bug reports and feature requests directly from chat
- **Mode-Based Control**: Explicit user consent required for bug reporting (prevents accidental issue creation)
- **GitHub Actions Integration**: Automatically triggers Claude Code to fix reported issues

This skill provides complete implementation templates, scripts, and comprehensive documentation for deploying an AI copilot powered by OpenAI's tool-calling API with seamless CI/CD integration.

## When to Use This Skill

Use this skill when:
- Implementing a conversational AI assistant for a web application
- Building customer support automation with product knowledge retrieval
- Creating a chatbot with multiple capabilities (search, orders, issue filing)
- Setting up RAG for documentation search
- Integrating OpenAI tool-calling API with backend services
- Deploying AI-powered features that require backend infrastructure

## Quick Start (MVP Approach)

> **💡 Lesson Learned**: Start with an in-memory knowledge base before adding vector databases. This gets you a working copilot in <2 hours and lets you test tool calling immediately.

This guide follows the proven MVP-first approach: simple knowledge base → test thoroughly → upgrade to vector DB.

## Quick Start

### 1. Initial Setup

To set up the Coffee Copilot environment:

```bash
# Copy environment template
cp assets/.env.example .env

# Or use the setup script
./scripts/setup-env.sh

# Verify dependencies
./scripts/verify-dependencies.sh
```

Edit `.env` and configure:
- `OPENAI_API_KEY` - Required for AI functionality
- Vector database credentials (choose pgvector, Pinecone, or Qdrant)
- `GITHUB_TOKEN` and `GITHUB_REPO` (optional, for issue filing)

### 2. Install Dependencies

Initialize a new Node.js project or add to existing:

```bash
# Use provided package.json as reference
npm init -y

# Install core dependencies
npm install express cors body-parser dotenv helmet express-rate-limit openai

# Install vector database client (choose one)
npm install pg                              # For pgvector
npm install @pinecone-database/pinecone     # For Pinecone
npm install @qdrant/js-client-rest          # For Qdrant
```

### 3. Implement Backend

Use `assets/server.ts` as the starting template:

```bash
# Copy server template to your project
cp assets/server.ts src/server.ts

# Customize tool implementations:
# - searchDocs() - Connect to your vector database
# - createOrder() - Integrate with your commerce system
# - createGithubIssue() - Configure GitHub integration
```

**Key areas to customize in server.ts:**
1. **searchDocs function** (line ~40): Replace placeholder with actual vector DB search
2. **createOrder function** (line ~60): Integrate with your order management system
3. **System prompt** (line ~180): Customize for your business and tone
4. **Tool definitions** (line ~100): Adjust parameters based on your needs

### 4. Set Up RAG (Document Search)

Index your documentation for the copilot to search:

```bash
# 1. Organize docs in a directory structure
mkdir -p docs/coffee/{beans,brewing,equipment,faq}

# 2. Customize indexing script
cp assets/index-docs.ts src/index-docs.ts

# 3. Update CONFIG in index-docs.ts:
#    - docsDirectory: path to your docs
#    - maxChunkTokens: chunk size (default 500)
#    - embeddingModel: OpenAI embedding model

# 4. Run indexing
npm run index-docs
```

**Important**: Implement the `storeEmbeddings()` function in `index-docs.ts` based on your chosen vector database. See `references/rag-setup.md` for detailed examples for pgvector, Pinecone, and Qdrant.

### 5. Implement Frontend Widget

Add the chat widget to your React application:

```bash
# Copy widget component
cp assets/CoffeeCopilot.tsx src/components/CoffeeCopilot.tsx
```

Integrate in your app:

```tsx
// In your root component (App.tsx, layout.tsx, etc.)
import CoffeeCopilot from './components/CoffeeCopilot';

function App() {
  return (
    <>
      {/* Your existing app content */}
      <CoffeeCopilot />
    </>
  );
}
```

**Customization points:**
- Update API endpoint if backend is on different domain
- Replace placeholder user ID with actual authentication
- Customize styling (Tailwind classes or custom CSS)
- Adjust widget positioning and size

### 6. Set Up GitHub Actions Integration (Optional but Recommended)

If you want issues to automatically trigger Claude Code to fix bugs:

```bash
# In Claude Code, run:
/install-github-app

# This sets up the GitHub Action workflow that:
# - Listens for @claude mentions in issues
# - Automatically starts working on reported bugs
# - Creates fixes and pull requests
```

The Coffee Copilot automatically adds `@claude Please investigate and fix this issue.` to every issue created, triggering the workflow.

### 7. Start Development Server

```bash
# Start backend
npm run dev

# In another terminal, start your frontend dev server
npm run dev  # or your frontend command
```

Test the complete flow:
1. Open your app in browser
2. Click the coffee bean button to open chat
3. **Test Chat Mode**: Ask a question about coffee (triggers document search)
4. **Test Bug Report Mode**:
   - Click "🐛 Report Issue" button
   - Describe a bug
   - AI creates GitHub issue with @claude mention
   - Check that GitHub Action triggered (if configured)
5. Test order creation (if implemented)

## Implementation Guide

### Architecture

**Frontend (React Widget)**
- Displays conversation UI
- Sends messages to backend via `/api/chat`
- Handles loading states and errors
- Template: `assets/CoffeeCopilot.tsx`

**Backend (Express Server)**
- Receives chat requests
- Calls OpenAI with tool definitions
- Executes tools when requested by AI
- Returns responses to frontend
- Template: `assets/server.ts`

**Vector Database (RAG)**
- Stores document embeddings
- Enables semantic search
- Returns relevant passages
- Options: pgvector, Pinecone, Qdrant

**External Integrations**
- OpenAI API for chat and embeddings
- GitHub API for issue creation
- Your commerce system for orders

### Tool Calling Flow

Understanding how tool calling works:

1. **User sends message** → Frontend sends to `/api/chat`
2. **Backend calls OpenAI** with conversation + tool definitions
3. **AI decides** whether to use a tool or respond directly
4. **If tool needed**:
   - AI returns tool name + arguments
   - Backend executes the tool function
   - Backend sends tool result back to AI
   - AI formulates final response using tool results
5. **Response sent** → Backend returns to frontend

Example conversation with tools:

```
User: "What beans do you recommend for espresso?"

Backend → OpenAI:
  - Messages: [system prompt, user message]
  - Tools: [searchDocs, createOrder, createGithubIssue]

OpenAI → Backend:
  - Tool call: searchDocs(query: "beans for espresso")

Backend executes searchDocs:
  - Searches vector DB for "beans for espresso"
  - Returns: [{text: "...", source: "...", score: 0.9}]

Backend → OpenAI:
  - Previous messages
  - Tool result: [search results]

OpenAI → Backend:
  - Final response: "For espresso, I recommend... [cites sources]"

Backend → Frontend:
  - Display response to user
```

### Mode-Based Control (Critical Feature)

**Problem**: AI autonomously deciding when to create GitHub issues leads to unwanted issue spam and lack of user control.

**Solution**: Implement explicit mode toggle with two distinct modes:

#### 💬 Chat Mode (Default)
- Users ask questions about products, brewing, etc.
- AI can ONLY use `searchDocs` tool
- GitHub issue creation is **completely disabled**
- If user mentions bugs, AI suggests switching to Report Issue mode

#### 🐛 Report Issue Mode (Explicit User Action)
- User must click "Report Issue" button to enable
- AI enters focused bug-triage mode
- Different system prompt optimized for gathering bug details
- GitHub issue creation is enabled
- Visual indicator shows mode is active

**Implementation:**

```typescript
// Frontend: Send mode flag
body: JSON.stringify({
  messages: [...],
  allowGithubIssues: bugReportMode  // true only when Report Issue mode active
})

// Backend: Conditional tool availability
const availableTools = allowGithubIssues
  ? tools  // All tools including GitHub
  : tools.filter(t => t.function.name !== 'createGithubIssue');  // GitHub disabled

// Backend: Mode-specific system prompts
const systemPrompt = allowGithubIssues
  ? "BUG REPORT MODE: Help users file detailed bug reports..."
  : "CHAT MODE: Answer coffee questions. Cannot file bugs.";
```

**Why this matters:**
- ✅ User has full control over when issues are created
- ✅ No surprise GitHub issues
- ✅ Better bug reports (focused mode asks right questions)
- ✅ Prevents accidental issue spam

### Customizing System Prompts

The system prompt defines your copilot's behavior. With mode-based control, you need **two different prompts**:

```typescript
// Chat Mode Prompt
const chatPrompt = `You are [Business Name] Coffee Copilot.

Your capabilities:
- Use searchDocs to answer questions about coffee

Guidelines:
- Always search knowledge base first
- Be warm and conversational
- If user mentions bugs, suggest switching to Report Issue mode

Note: You CANNOT file bug reports in this mode.`;

// Bug Report Mode Prompt
const bugReportPrompt = `You are [Business Name] Coffee Copilot in BUG REPORT MODE.

Your task: Help users file detailed bug reports.

Process:
1. Ask clarifying questions (what happened, expected, device, steps)
2. Once you have enough detail, use createGithubIssue
3. Confirm the issue was created

Be thorough and professional.`;
```

**Best practices:**
- Make mode limitations crystal clear in prompts
- Chat mode should mention switching to bug mode
- Bug report mode should focus on gathering complete information
- Set tone appropriate for each mode

### Implementing Tool Functions

Each tool requires a function implementation. See `references/backend-implementation.md` for detailed examples.

**searchDocs:**
- Convert query to embedding using OpenAI
- Search vector database for similar documents
- Return top-k results with sources
- Always include source attribution

**createOrder:**
- Validate product exists and is in stock
- Check user permissions
- Create order with PENDING_PAYMENT status
- Never trust client-provided prices
- Log all order attempts

**createGithubIssue:**
- Format issue with context (browser, steps to reproduce)
- Apply appropriate labels (bug, feature, mobile, urgent, etc.)
- **Automatically append `@claude Please investigate and fix this issue.` to body** (triggers GitHub Actions)
- Use GitHub App token (more secure than PAT)
- Include user email if consented

**Important**: The `@claude` mention in the issue body is what triggers the GitHub Actions workflow, not a label. This enables automatic bug fixing via Claude Code.

### Vector Database Setup

Choose a vector database based on your needs:

**pgvector (PostgreSQL extension):**
- ✅ Works with existing Postgres database
- ✅ Lower cost, good for small-medium datasets
- ❌ Requires Postgres knowledge
- See `references/rag-setup.md` for setup

**Pinecone (Managed service):**
- ✅ Fully managed, excellent performance
- ✅ Built-in hybrid search
- ❌ Additional service cost
- See `references/rag-setup.md` for setup

**Qdrant (Open source):**
- ✅ Can self-host or use cloud
- ✅ Rich filtering capabilities
- ❌ Another service to manage
- See `references/rag-setup.md` for setup

Detailed setup instructions, code examples, and optimization strategies for each option are in `references/rag-setup.md`.

### Document Preparation for RAG

Prepare documentation for optimal retrieval:

1. **Collect content**: Product info, FAQs, guides, blog posts
2. **Chunk documents**: Split into 300-800 token passages
3. **Extract metadata**: Category, title, source, tags
4. **Create embeddings**: Use OpenAI text-embedding-3-large
5. **Store in vector DB**: With searchable metadata

Use `assets/index-docs.ts` as a starting point. The script includes:
- Semantic chunking (splits on paragraphs)
- Markdown-aware chunking (preserves headings)
- Metadata extraction
- Batch embedding (efficient API usage)
- Storage templates for all vector DBs

**Chunking strategies:**
- **Semantic**: Splits on paragraph boundaries (recommended for most docs)
- **Markdown-aware**: Preserves heading context (best for structured docs)
- **Sliding window**: Overlapping chunks (best for dense technical content)

## Deployment Checklist

Before deploying to production, use `references/deployment-checklist.md` to verify:

### Pre-Deployment
- [ ] Environment variables configured securely
- [ ] Rate limiting enabled
- [ ] Authentication implemented
- [ ] CORS configured correctly
- [ ] All tools tested
- [ ] Error handling in place
- [ ] Documentation indexed
- [ ] Security headers configured

### Deployment
- [ ] Backend deployed and health check passing
- [ ] Frontend widget deployed
- [ ] HTTPS/TLS enabled
- [ ] Monitoring set up
- [ ] Cost alerts configured
- [ ] Rollback plan tested

### Post-Deployment
- [ ] Monitor error rates
- [ ] Review conversation logs
- [ ] Analyze tool usage
- [ ] Optimize system prompts
- [ ] Update docs as needed

See `references/deployment-checklist.md` for the complete checklist with detailed items.

## Security Best Practices

Implement these security measures:

1. **Never expose API keys to frontend**
   - Keep OPENAI_API_KEY server-side only
   - Use environment variables

2. **Implement authentication**
   - Verify user identity before tool execution
   - Include user ID in order creation

3. **Add rate limiting**
   - Prevent abuse with request limits
   - Example: 100 requests per 15 minutes per IP

4. **Validate all inputs**
   - Sanitize user messages
   - Validate tool arguments server-side
   - Never trust client data for pricing

5. **Use HTTPS everywhere**
   - Encrypt all traffic
   - Configure CORS properly

6. **Log security events**
   - Track all tool executions
   - Monitor for unusual patterns
   - Alert on failures

7. **GitHub token security**
   - Use GitHub App instead of PAT
   - Limit scopes to minimum required
   - Rotate tokens regularly

## Troubleshooting

### Common Issues

**"OpenAI: ❌ Missing" after adding API key:**
- **Cause**: Environment variables load at server startup, not dynamically
- **Solution**: Stop server (Ctrl+C), then restart with `npm run dev`
- **Verify**: `curl http://localhost:3001/health` should show `"openai":"configured"`
- **Double-check**: Ensure no duplicate keys in `.env` file

**GitHub API returns 404:**
- **Cause**: Repository doesn't exist or token lacks access
- **Solution**: Create GitHub repo first, or verify repo name is correct
- **Test**: `curl -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/repos/owner/repo`
- **Fix**: Ensure token has `repo` or `public_repo` scope

**Tool not being called:**
- Check tool description is clear and specific
- Verify tool parameters match what AI expects
- Review system prompt for tool usage guidance
- Test with explicit user requests (e.g., "search docs for...")

**Vector search returning poor results:**
- Verify embeddings were created successfully
- Check chunk size (try 300-800 tokens)
- Review chunking strategy (semantic vs. markdown-aware)
- Test queries manually with vector DB client
- Consider hybrid search (vector + keyword)

**Orders failing:**
- Verify product IDs exist in your system
- Check inventory before creating order
- Validate user permissions
- Review error logs for specific failures

**API rate limits:**
- Implement caching for common queries
- Batch embed operations when indexing
- Monitor token usage in OpenAI dashboard
- Consider using smaller embedding model

**CORS errors:**
- Add frontend origin to ALLOWED_ORIGINS
- Verify CORS middleware is configured
- Check browser console for specific error
- Test with Postman to isolate frontend vs backend

### Performance Optimization

- **Cache embeddings**: Don't re-embed same queries
- **Batch operations**: Process multiple docs at once when indexing
- **Connection pooling**: Reuse database connections
- **Lazy load widget**: Only load when user interacts
- **Compress responses**: Enable gzip compression

## Production Deployment

### Quick Start

**`QUICK-DEPLOY.md`** - Fast deployment checklist (~20 minutes total):
- ✅ Condensed step-by-step commands
- ✅ Copy-paste ready for quick deployment
- ✅ Common issues with quick fixes
- ✅ Verification steps
- ✅ Cost estimates

Use this when you know what you're doing and just need the commands.

### Complete Guide

**`references/production-deployment.md`** - Comprehensive deployment guide with detailed explanations:
- ✅ Google Cloud Run deployment (backend)
- ✅ Firebase Hosting configuration (frontend)
- ✅ Secret management with Google Secret Manager
- ✅ CORS configuration and troubleshooting
- ✅ GitHub Actions CI/CD setup
- ✅ All common issues and solutions documented
- ✅ Step-by-step deployment checklist
- ✅ Cost optimization strategies
- ✅ Architecture explanations

This guide documents real production deployment experience, including every error encountered and how it was fixed. Essential for understanding the complete deployment process and troubleshooting issues.

## Resources

### Scripts (`scripts/`)

**setup-env.sh**
- Creates `.env` file with all required configuration
- Provides guidance on obtaining API keys
- Ensures proper security (adds to .gitignore)

**verify-dependencies.sh**
- Checks Node.js and package manager installation
- Verifies `.env` file exists and has required variables
- Confirms dependencies are installed
- Validates project structure

### References (`references/`)

**backend-implementation.md**
- Detailed backend architecture explanation
- Tool implementation examples with full code
- System prompt engineering guidance
- Error handling patterns
- Security best practices
- Testing strategies

**frontend-widget.md**
- Complete React component implementation
- Styling options (Tailwind and custom CSS)
- Advanced features (streaming, markdown support)
- Accessibility guidelines
- Integration patterns for Next.js, React Router
- Performance optimization techniques

**rag-setup.md**
- Comprehensive RAG implementation guide
- Vector database comparison and setup for pgvector, Pinecone, Qdrant
- Document preparation and chunking strategies
- Indexing scripts and workflows
- Search optimization (hybrid search, re-ranking)
- Cost optimization techniques

**deployment-checklist.md**
- Complete pre-deployment checklist
- Security configuration requirements
- Deployment steps and verification
- Monitoring and observability setup
- Post-deployment tasks
- Rollback procedures

**production-deployment.md**
- Complete Google Cloud Run deployment guide with real production experience
- Docker multi-stage build setup and common pitfalls
- Google Secret Manager configuration and service account permissions
- CORS configuration for Firebase Hosting integration
- GitHub Actions CI/CD workflow setup
- All errors encountered and their solutions
- Step-by-step deployment process
- Cost optimization strategies
- Comprehensive troubleshooting guide

### Assets (`assets/`)

**server.ts**
- Complete Express backend server template
- Tool calling implementation with OpenAI
- Tool function placeholders (searchDocs, createOrder, createGithubIssue)
- Rate limiting and security middleware
- Health check endpoint
- Comprehensive comments and TODOs for customization

**CoffeeCopilot.tsx**
- Production-ready React chat widget
- Toggle open/close functionality
- Loading states and error handling
- Accessibility features (ARIA labels, keyboard navigation)
- Timestamp display
- Both Tailwind and vanilla CSS examples

**index-docs.ts**
- Complete document indexing script
- Multiple chunking strategies (semantic, markdown-aware)
- Metadata extraction
- Batch embedding with rate limiting
- Storage templates for all major vector DBs
- Configuration options

**.env.example**
- Template for all environment variables
- Comments explaining where to get each value
- Optional and required variables clearly marked
- Examples for all vector database options

**package.json**
- All required dependencies with versions
- Optional dependencies for vector DBs
- Scripts for development and production
- TypeScript configuration

## Example Workflows

### Adding New Tool

To add a new capability:

1. **Define tool schema** in `server.ts`:
```typescript
{
  type: "function",
  function: {
    name: "checkInventory",
    description: "Check stock levels for products",
    parameters: {
      type: "object",
      properties: {
        productId: { type: "string" }
      },
      required: ["productId"]
    }
  }
}
```

2. **Implement tool function**:
```typescript
async function checkInventory(params: { productId: string }) {
  // Query your database
  const product = await db.products.findById(params.productId);
  return { inStock: product.quantity > 0, quantity: product.quantity };
}
```

3. **Add to tool execution** in chat endpoint:
```typescript
if (toolName === 'checkInventory') {
  result = await checkInventory(args);
}
```

4. **Update system prompt** to guide when to use new tool

### Updating Documentation

When documentation changes:

1. **Update source files** in your docs directory
2. **Run incremental indexing** (see `references/rag-setup.md` for updateDocument function)
3. **Or re-run full indexing**: `npm run index-docs`
4. **Test search** with queries related to updated content

### Customizing for Different Industries

This skill is designed for coffee businesses but works for any e-commerce:

**For other industries:**
1. Update system prompt with your domain expertise
2. Adjust tool descriptions to match your use cases
3. Replace "coffee" terminology in widget UI
4. Customize metadata categories in document indexing
5. Modify order creation to match your product schema

**Example adaptations:**
- Bookstore: Search books, recommend reading, place orders
- Hardware store: Find tools, provide DIY advice, check inventory
- Restaurant: Menu questions, dietary info, reservations
- SaaS product: Feature questions, troubleshooting, bug reports

## Next Steps

After implementing the Coffee Copilot:

1. **Test thoroughly** with real user queries
2. **Monitor conversations** to identify common patterns
3. **Refine system prompt** based on AI behavior
4. **Add more tools** for additional capabilities
5. **Optimize RAG** by improving document chunks
6. **Gather user feedback** and iterate
7. **Set up analytics** to track engagement and success metrics

For production deployment, carefully review `references/deployment-checklist.md` to ensure security, monitoring, and reliability best practices are followed.

---

## Quick Reference: Key Implementation Points

### Mode-Based Control (Critical!)
```typescript
// Frontend: Add mode toggle
const [bugReportMode, setBugReportMode] = useState(false);

// Backend: Conditional tools
const availableTools = allowGithubIssues ? tools : tools.filter(t => t.function.name !== 'createGithubIssue');
```

### GitHub Actions Integration
```typescript
// Automatically append @claude mention to trigger workflow
const bodyWithMention = `${params.body}\n\n---\n\n@claude Please investigate and fix this issue.`;
```

### Setup Checklist
- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] OpenAI API key in `server/.env`
- [ ] GitHub token and repo in `server/.env`
- [ ] Run `/install-github-app` in Claude Code
- [ ] Test Chat mode (💬)
- [ ] Test Bug Report mode (🐛)
- [ ] Verify @claude mention in created issues

### Common Issues
- **Server not seeing API key**: Restart server after `.env` changes
- **GitHub Action not triggering**: Ensure `@claude` is in issue **body**, not label
- **Tools not being called**: Check system prompt clarity and tool descriptions

### File Locations
- Backend: `server/src/server.ts`
- Frontend widget: `src/components/CoffeeCopilot.tsx`
- Environment: `server/.env`
- Knowledge base: In-memory array in `server.ts` (lines 22-43)
- Next steps: `NEXT_STEPS.md` in project root

---

**Implementation Time**: ~2 hours for MVP
**Status**: Production-ready with chat + bug reporting + GitHub Actions
**Next**: Expand knowledge base, add authentication, implement orders
