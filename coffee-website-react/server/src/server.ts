// Coffee Copilot Backend Server - MVP
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173']
}));
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

// Simple coffee knowledge base (MVP - will upgrade to vector DB later)
const coffeeKnowledge = [
  {
    topic: "Espresso Beans",
    text: "For espresso, use medium-dark roasted beans. Aim for 18-20g of coffee for a double shot. Popular origins include Ethiopia, Brazil, and Colombia.",
    category: "beans"
  },
  {
    topic: "Pour Over Brewing",
    text: "Pour over requires medium-fine grind, water at 195-205°F, and 1:16 coffee to water ratio. Brew time should be 2.5-3.5 minutes.",
    category: "brewing"
  },
  {
    topic: "Coffee Storage",
    text: "Store beans in an airtight container in a cool, dark place. Avoid the fridge. Use within 2-4 weeks of roasting for best flavor.",
    category: "storage"
  },
  {
    topic: "Grind Size",
    text: "Fine for espresso, medium-fine for pour over, medium for drip, coarse for French press and cold brew.",
    category: "brewing"
  }
];

// ============================================================================
// TOOL IMPLEMENTATIONS
// ============================================================================

async function searchDocs(query: string) {
  console.log('searchDocs:', query);

  const queryLower = query.toLowerCase();
  const results = coffeeKnowledge
    .filter(item =>
      item.topic.toLowerCase().includes(queryLower) ||
      item.text.toLowerCase().includes(queryLower) ||
      item.category.toLowerCase().includes(queryLower)
    )
    .map(item => ({
      text: item.text,
      topic: item.topic,
      source: `knowledge-base/${item.category}`
    }));

  return results.length > 0 ? results : [{
    text: "I can help with questions about coffee beans, brewing, and storage!",
    topic: "General",
    source: "knowledge-base/general"
  }];
}

async function createGithubIssue(params: {
  title: string;
  body: string;
  labels?: string[];
}) {
  console.log('createGithubIssue:', params.title);

  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  if (!repo || !token) {
    throw new Error('GitHub integration not configured. Please set GITHUB_TOKEN and GITHUB_REPO in .env');
  }

  try {
    // Add @claude mention to the body to trigger GitHub Actions
    const bodyWithMention = `${params.body}\n\n---\n\n@claude Please investigate and fix this issue.`;

    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'coffee-copilot',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        title: params.title,
        body: bodyWithMention,
        labels: params.labels || ['copilot-generated']
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }

    const issue = await response.json();
    return {
      issueNumber: issue.number,
      url: issue.html_url,
      message: `Issue #${issue.number} created successfully! View it at ${issue.html_url}`
    };
  } catch (error: any) {
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
      description: "Search the coffee knowledge base for information about beans, brewing methods, and coffee preparation.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query (e.g., 'espresso', 'pour over', 'storage')"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "createGithubIssue",
      description: "File a bug report or feature request to the development team. Use when users report problems with the website or suggest improvements.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Brief, clear title for the issue (e.g., 'Cart not updating on mobile', 'Add dark mode')"
          },
          body: {
            type: "string",
            description: "Detailed description including: what happened, expected behavior, steps to reproduce (for bugs), or use case/benefits (for features)"
          },
          labels: {
            type: "array",
            items: { type: "string" },
            description: "Issue labels like 'bug', 'feature', 'mobile', 'urgent', 'ui', 'performance'"
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

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, user, allowGithubIssues } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'OpenAI API key not configured',
        message: 'Add OPENAI_API_KEY to server/.env file'
      });
    }

    // System prompt - changes based on mode
    const systemPrompt = {
      role: "system" as const,
      content: allowGithubIssues
        ? `You are Coffee Copilot for Stockbridge Coffee Roastery in BUG REPORT MODE.

Your task: Help users file detailed bug reports or feature requests.

Process:
1. Ask clarifying questions:
   - What happened? What did you expect?
   - What device/browser are you using?
   - Can you reproduce it? Steps to reproduce?
2. Once you have enough detail, use createGithubIssue to file the report
3. Confirm with the user that the issue was created

Be thorough, professional, and helpful. This is for the development team!`
        : `You are Coffee Copilot for Stockbridge Coffee Roastery, a friendly barista assistant.

Your capabilities:
- Use searchDocs to answer questions about coffee beans, brewing methods, and storage

Guidelines:
- For coffee questions: Always search the knowledge base first using searchDocs
- Be warm, enthusiastic, and conversational
- Keep responses concise but helpful
- Like a friendly barista who's tech-savvy!

Note: You CANNOT file bug reports in this mode. If users mention bugs, suggest they switch to "Report Issue" mode.`
    };

    // Only include GitHub tool if in bug report mode
    const availableTools = allowGithubIssues ? tools : tools.filter(t => t.function.name !== 'createGithubIssue');

    // Call OpenAI with tools
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemPrompt, ...messages],
      tools: availableTools,
      tool_choice: "auto"
    });

    const message = response.choices[0].message;

    // Handle tool calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolResults = [];

      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments || '{}');

        console.log(`Tool: ${toolName}`, args);

        try {
          let result: any;
          if (toolName === 'searchDocs') {
            result = await searchDocs(args.query);
          } else if (toolName === 'createGithubIssue') {
            result = await createGithubIssue(args);
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

      // Get final response with tool results
      const finalResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          systemPrompt,
          ...messages,
          message,
          ...toolResults
        ],
        tools: availableTools
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
    console.error('Chat error:', error.message);
    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(port, () => {
  console.log(`\n🚀 Coffee Copilot Server`);
  console.log(`   Port: ${port}`);
  console.log(`   Health: http://localhost:${port}/health`);
  console.log(`   OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log('');
});
