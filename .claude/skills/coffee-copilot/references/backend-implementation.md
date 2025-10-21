# Backend Implementation Guide

This document provides detailed guidance for implementing the Coffee Copilot backend server with AI tool-calling capabilities.

## Architecture Overview

The backend uses:
- **Express.js** for the HTTP server
- **OpenAI API** for chat completions with tool calling
- **Vector Database** for RAG (retrieval-augmented generation)
- **GitHub API** for issue creation
- **Your commerce API** for order management

## Core Components

### 1. Tool Definitions

Define tools that the AI can invoke. Each tool needs:
- `name`: Function identifier
- `description`: When and why to use this tool
- `parameters`: JSON Schema for the tool's arguments

Example tool schema:
```typescript
{
  type: "function",
  function: {
    name: "searchDocs",
    description: "Search internal coffee docs/FAQs to answer user questions.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" }
      },
      required: ["query"]
    }
  }
}
```

### 2. Tool Implementation Functions

#### searchDocs(query: string)
Implements RAG (Retrieval-Augmented Generation):
1. Convert user query to embeddings using OpenAI's embedding model
2. Perform similarity search in your vector database
3. Return top-k most relevant passages with metadata

**Important**: Always include source attribution (file name, section, URL) so the AI can cite sources.

Example return format:
```typescript
[
  {
    text: "Arabica beans from Ethiopia have floral notes...",
    source: "docs/beans/ethiopia.md",
    score: 0.88
  }
]
```

#### createOrder(params)
Creates an order in your system:
1. Validate SKU and quantity server-side
2. Check inventory availability
3. Create order with `PENDING_PAYMENT` status
4. Return order details for confirmation

**Security considerations**:
- Never trust client-provided prices
- Validate user permissions
- Log all order attempts with user ID
- Implement rate limiting

Example implementation:
```typescript
async function createOrder(params: {
  itemId: string;
  quantity: number;
  notes?: string;
  userId?: string;
}) {
  // Validate product exists
  const product = await db.products.findById(params.itemId);
  if (!product) throw new Error("Product not found");

  // Check stock
  if (product.stock < params.quantity) {
    throw new Error("Insufficient stock");
  }

  // Create order
  const order = await db.orders.create({
    userId: params.userId,
    items: [{ productId: params.itemId, quantity: params.quantity }],
    status: "PENDING_PAYMENT",
    notes: params.notes,
    total: product.price * params.quantity
  });

  return {
    orderId: order.id,
    status: order.status,
    total: order.total,
    items: order.items
  };
}
```

#### createGithubIssue(params)
Files a GitHub issue:
1. Authenticate with GitHub (use GitHub App token, not PAT)
2. Format issue body with context (user email, browser, reproduction steps)
3. Apply appropriate labels
4. Return issue URL

**Best practices**:
- Use GitHub App for better security and scoping
- Include relevant context in issue body
- Add labels for categorization (bug, feature, mobile, etc.)
- Never expose GitHub token to frontend

Example implementation:
```typescript
async function createGithubIssue(params: {
  title: string;
  body: string;
  labels?: string[];
}) {
  const repo = process.env.GITHUB_REPO; // "owner/repo"
  const token = process.env.GITHUB_TOKEN;

  const response = await fetch(
    `https://api.github.com/repos/${repo}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "coffee-copilot"
      },
      body: JSON.stringify({
        title: params.title,
        body: params.body,
        labels: params.labels ?? []
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }

  const issue = await response.json();
  return {
    issueNumber: issue.number,
    url: issue.html_url
  };
}
```

### 3. Chat Endpoint Implementation

The `/api/chat` endpoint handles the conversation loop:

1. **Receive message** from frontend
2. **Build context** with system prompt + conversation history
3. **Call OpenAI** with tool definitions
4. **Handle tool calls** if requested:
   - Execute the tool function
   - Send tool result back to OpenAI
   - Get final response
5. **Return response** to frontend

**Key implementation details**:

```typescript
app.post("/api/chat", async (req, res) => {
  const { messages, user } = req.body;

  // System prompt defines AI behavior
  const systemPrompt = {
    role: "system",
    content: [
      "You are Coffee Copilot, a friendly expert barista.",
      "Always use searchDocs before answering questions about coffee.",
      "For orders: confirm item, quantity, and price before creating.",
      "For GitHub issues: include reproduction steps and context."
    ].join(" ")
  };

  try {
    // First API call with tools
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemPrompt, ...messages],
      tools: toolDefinitions,
      tool_choice: "auto"
    });

    const message = response.choices[0].message;

    // Handle tool calls
    if (message.tool_calls?.length > 0) {
      const results = [];

      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        let result;
        if (toolName === "searchDocs") {
          result = await searchDocs(args.query);
        } else if (toolName === "createOrder") {
          result = await createOrder({ ...args, userId: user?.id });
        } else if (toolName === "createGithubIssue") {
          result = await createGithubIssue(args);
        }

        results.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolName,
          content: JSON.stringify(result)
        });
      }

      // Second API call with tool results
      const finalResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          systemPrompt,
          ...messages,
          message,
          ...results
        ]
      });

      return res.json({
        reply: finalResponse.choices[0].message
      });
    }

    // No tools needed
    return res.json({ reply: message });

  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({
      error: "An error occurred processing your request"
    });
  }
});
```

## System Prompt Engineering

The system prompt is critical for guiding AI behavior. Include:

1. **Identity**: Who is the AI?
2. **Capabilities**: What can it do?
3. **Tool usage**: When to use each tool
4. **Guardrails**: What to avoid
5. **Tone**: How to communicate

Example comprehensive system prompt:
```typescript
const systemPrompt = `You are Coffee Copilot, an expert barista assistant for [Your Coffee Shop].

Your capabilities:
- Answer questions about coffee beans, brewing methods, and equipment
- Search our documentation for detailed information
- Help users place orders for coffee beans and equipment
- File bug reports and feature requests to our GitHub

Guidelines:
- Always use searchDocs before answering technical or product questions
- For orders: confirm item details and price, then ask for final confirmation
- For bugs: gather reproduction steps and context before filing
- Be friendly, concise, and helpful
- Never ask for payment information in chat - redirect to checkout
- If asked about topics outside coffee, politely decline

Tone: Friendly, knowledgeable, concise. Like a helpful barista.`;
```

## Error Handling

Implement robust error handling:

```typescript
// Tool execution wrapper
async function executeTool(name: string, args: any, user: any) {
  try {
    switch (name) {
      case "searchDocs":
        return await searchDocs(args.query);
      case "createOrder":
        return await createOrder({ ...args, userId: user?.id });
      case "createGithubIssue":
        return await createGithubIssue(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`Tool ${name} failed:`, error);
    // Return error to AI so it can inform user gracefully
    return {
      error: true,
      message: error.message || "Tool execution failed"
    };
  }
}
```

## Security Best Practices

1. **Authentication**: Verify user identity before tool execution
2. **Authorization**: Check user permissions for sensitive actions
3. **Rate limiting**: Prevent abuse with request limits
4. **Input validation**: Sanitize and validate all inputs
5. **Secrets**: Never expose API keys to frontend
6. **Logging**: Log all tool calls with user context
7. **CORS**: Configure allowed origins properly

Example middleware:
```typescript
// Rate limiting
import rateLimit from "express-rate-limit";

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests, please try again later"
});

app.post("/api/chat", chatLimiter, async (req, res) => {
  // ... chat implementation
});

// Authentication
function requireAuth(req, res, next) {
  const userId = req.session?.userId || req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.user = { id: userId };
  next();
}

app.post("/api/chat", requireAuth, async (req, res) => {
  // ... chat implementation
});
```

## Testing

Test each component:

1. **Tool functions**: Unit test each tool independently
2. **Chat endpoint**: Test conversation flows
3. **Error handling**: Test failure scenarios
4. **Security**: Test authentication and authorization

Example tool test:
```typescript
describe("searchDocs", () => {
  it("should return relevant documents", async () => {
    const results = await searchDocs("Ethiopian coffee");
    expect(results).toHaveLength(3);
    expect(results[0]).toHaveProperty("text");
    expect(results[0]).toHaveProperty("source");
    expect(results[0]).toHaveProperty("score");
  });
});
```

## Deployment Considerations

1. **Environment variables**: Use different configs for dev/staging/prod
2. **Monitoring**: Track API usage, error rates, response times
3. **Scaling**: Consider caching, connection pooling
4. **Cost management**: Monitor OpenAI API usage

See `deployment-checklist.md` for complete deployment guide.
