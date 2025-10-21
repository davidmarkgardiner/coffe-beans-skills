// server.ts - Coffee Copilot Backend Server
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { OpenAI } from 'openai';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
}));
app.use(bodyParser.json());

// Rate limiting
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later.'
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ============================================================================
// TOOL IMPLEMENTATIONS
// ============================================================================

/**
 * Search documentation using RAG (Retrieval-Augmented Generation)
 * TODO: Implement with your chosen vector database (pgvector, Pinecone, Qdrant)
 */
async function searchDocs(query: string) {
  // TODO: Replace with actual vector DB search
  // 1. Convert query to embedding
  // 2. Search vector database
  // 3. Return top-k results

  console.log('searchDocs called with query:', query);

  // Placeholder implementation
  return [
    {
      text: "Example: Arabica beans from Ethiopia tend to have floral and fruity notes.",
      source: "docs/beans/ethiopia.md",
      score: 0.88
    }
  ];
}

/**
 * Create an order for coffee products
 * TODO: Integrate with your commerce system
 */
async function createOrder(params: {
  itemId: string;
  quantity: number;
  notes?: string;
  userId?: string;
}) {
  // TODO: Replace with actual order creation logic
  // 1. Validate product exists and is in stock
  // 2. Create order with PENDING_PAYMENT status
  // 3. Return order details

  console.log('createOrder called with params:', params);

  // Placeholder implementation
  return {
    orderId: `ord_${Date.now()}`,
    status: 'PENDING_PAYMENT',
    itemId: params.itemId,
    quantity: params.quantity,
    notes: params.notes,
    total: 29.99 * params.quantity // TODO: Get actual price from database
  };
}

/**
 * Create a GitHub issue for bug reports or feature requests
 * TODO: Configure GitHub token and repository
 */
async function createGithubIssue(params: {
  title: string;
  body: string;
  labels?: string[];
}) {
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  if (!repo || !token) {
    throw new Error('GitHub integration not configured');
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'coffee-copilot'
      },
      body: JSON.stringify({
        title: params.title,
        body: params.body,
        labels: params.labels || []
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }

    const issue = await response.json();
    return {
      issueNumber: issue.number,
      url: issue.html_url
    };
  } catch (error) {
    console.error('GitHub issue creation failed:', error);
    throw error;
  }
}

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

const tools = [
  {
    type: "function" as const,
    function: {
      name: "searchDocs",
      description: "Search internal coffee documentation and FAQs to answer user questions about beans, brewing methods, and equipment.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query to find relevant documentation"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "createOrder",
      description: "Create an order for coffee beans or equipment. Always confirm details with user before creating the order.",
      parameters: {
        type: "object",
        properties: {
          itemId: {
            type: "string",
            description: "Product ID or SKU"
          },
          quantity: {
            type: "integer",
            minimum: 1,
            description: "Quantity to order"
          },
          notes: {
            type: "string",
            description: "Optional notes for the order"
          }
        },
        required: ["itemId", "quantity"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "createGithubIssue",
      description: "File a bug report or feature request in GitHub.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Issue title"
          },
          body: {
            type: "string",
            description: "Detailed description of the issue or feature request"
          },
          labels: {
            type: "array",
            items: { type: "string" },
            description: "Labels to apply (e.g., 'bug', 'feature', 'mobile')"
          }
        },
        required: ["title", "body"]
      }
    }
  }
];

// ============================================================================
// ROUTES
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

/**
 * Main chat endpoint
 */
app.post('/api/chat', chatLimiter, async (req, res) => {
  try {
    const { messages, user } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array required' });
    }

    // System prompt - customize for your coffee business
    const systemPrompt = {
      role: "system" as const,
      content: [
        "You are Coffee Copilot, a friendly expert barista assistant.",
        "Your capabilities:",
        "- Answer questions about coffee beans, brewing methods, and equipment using searchDocs",
        "- Help users place orders for coffee products",
        "- File bug reports and feature requests to GitHub",
        "",
        "Guidelines:",
        "- Always use searchDocs before answering technical questions about coffee",
        "- For orders: confirm item, quantity, and price before creating the order",
        "- For bug reports: gather reproduction steps and context before filing",
        "- Be friendly, concise, and helpful",
        "- Never ask for payment information in chat - orders should redirect to checkout",
        "- If asked about topics outside coffee, politely decline",
        "",
        "Tone: Friendly, knowledgeable, concise - like a helpful barista."
      ].join("\n")
    };

    // First API call with tools
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemPrompt, ...messages],
      tools,
      tool_choice: "auto"
    });

    const message = response.choices[0].message;

    // Handle tool calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolResults = [];

      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments || '{}');

        console.log(`Executing tool: ${toolName}`, args);

        try {
          let result: any;

          switch (toolName) {
            case 'searchDocs':
              result = await searchDocs(args.query);
              break;
            case 'createOrder':
              result = await createOrder({ ...args, userId: user?.id });
              break;
            case 'createGithubIssue':
              result = await createGithubIssue(args);
              break;
            default:
              throw new Error(`Unknown tool: ${toolName}`);
          }

          toolResults.push({
            role: "tool" as const,
            tool_call_id: toolCall.id,
            name: toolName,
            content: JSON.stringify(result)
          });
        } catch (error: any) {
          console.error(`Tool ${toolName} failed:`, error);

          toolResults.push({
            role: "tool" as const,
            tool_call_id: toolCall.id,
            name: toolName,
            content: JSON.stringify({
              error: true,
              message: error.message || 'Tool execution failed'
            })
          });
        }
      }

      // Second API call with tool results
      const finalResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          systemPrompt,
          ...messages,
          message,
          ...toolResults
        ]
      });

      return res.json({
        reply: finalResponse.choices[0].message
      });
    }

    // No tools needed
    return res.json({
      reply: message
    });

  } catch (error: any) {
    console.error('Chat error:', error);

    return res.status(500).json({
      error: 'An error occurred processing your request',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(port, () => {
  console.log(`🚀 Coffee Copilot API listening on port ${port}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${port}/health`);
});
