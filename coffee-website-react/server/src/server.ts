// Coffee Copilot Backend Server - MVP
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { OpenAI } from 'openai';
import Stripe from 'stripe';
import path from 'path';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'https://coffee-65c46.web.app',
    'https://coffee-65c46.firebaseapp.com',
    'https://stockbridgecoffee.co.uk'
  ]
}));
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-09-30.clover',
  });
  console.log('✅ Stripe initialized');
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY not set - Stripe payments will not work');
}

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

    const issue = await response.json() as { number: number; html_url: string };
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

async function uploadScreenshotToGithub(file: Express.Multer.File, issueNumber: number): Promise<string> {
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  if (!repo || !token) {
    throw new Error('GitHub integration not configured');
  }

  try {
    // Create a unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || '.png';
    const filename = `issue-${issueNumber}-${timestamp}${ext}`;
    const filePath = `.github/feedback-screenshots/${filename}`;

    // Convert file buffer to base64
    const content = file.buffer.toString('base64');

    // Upload to GitHub repository
    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'coffee-copilot',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        message: `Add screenshot for issue #${issueNumber}`,
        content: content,
        branch: 'main' // or your default branch
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Screenshot upload failed:', error);
      throw new Error(`GitHub upload error: ${response.status}`);
    }

    const data = await response.json() as { content: { download_url: string } };
    return data.content.download_url;
  } catch (error: any) {
    console.error('Screenshot upload failed:', error);
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
    stripe: stripe ? 'configured' : 'missing',
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

// SIMPLIFIED FEEDBACK ENDPOINT - Direct GitHub issue creation
app.post('/api/feedback', upload.single('screenshot'), async (req, res) => {
  try {
    const { description } = req.body;
    const screenshot = req.file;

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Create a simple title from the description (first 50 chars)
    const title = description.length > 50
      ? description.substring(0, 50) + '...'
      : description;

    // Create the issue body
    const issueBody = `**User Feedback**\n\n${description}\n\n`;

    // Create the GitHub issue first
    const issueResult = await createGithubIssue({
      title: `User Feedback: ${title}`,
      body: issueBody,
      labels: ['user-feedback', 'copilot-generated']
    });

    // If screenshot is provided, upload it and add to issue
    if (screenshot) {
      try {
        const screenshotUrl = await uploadScreenshotToGithub(screenshot, issueResult.issueNumber);

        // Update the issue with the screenshot link
        const repo = process.env.GITHUB_REPO;
        const token = process.env.GITHUB_TOKEN;

        const updatedBody = `${issueBody}\n\n**Screenshot:**\n\n![User Screenshot](${screenshotUrl})`;

        await fetch(`https://api.github.com/repos/${repo}/issues/${issueResult.issueNumber}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'coffee-copilot',
            'X-GitHub-Api-Version': '2022-11-28'
          },
          body: JSON.stringify({
            body: updatedBody
          })
        });

        console.log(`Screenshot uploaded for issue #${issueResult.issueNumber}: ${screenshotUrl}`);
      } catch (uploadError: any) {
        console.error('Screenshot upload failed, but issue created:', uploadError);
        // Continue even if screenshot upload fails
      }
    }

    return res.json({
      success: true,
      issueNumber: issueResult.issueNumber,
      url: issueResult.url
    });

  } catch (error: any) {
    console.error('Feedback submission error:', error);
    return res.status(500).json({
      error: 'Failed to submit feedback',
      message: error.message
    });
  }
});

// ============================================================================
// STRIPE PAYMENT ENDPOINTS
// ============================================================================

// Create payment intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        error: 'Stripe not configured',
        message: 'STRIPE_SECRET_KEY environment variable is not set'
      });
    }

    const { amount, currency = 'gbp', metadata = {} } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Ensure amount is in cents (integer)
    const amountInCents = Math.round(amount);

    console.log(`Creating payment intent for $${amountInCents / 100} ${currency}`);

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: {
        ...metadata,
        created_at: new Date().toISOString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Webhook endpoint for Stripe events
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      error: 'Stripe not configured'
    });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET not set, skipping webhook verification');
    return res.status(400).send('Webhook secret not configured');
  }

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      webhookSecret
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        // TODO: Fulfill the order, send confirmation email, etc.
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent failed:', failedPayment.id);
        // TODO: Handle failed payment
        break;

      case 'charge.succeeded':
        const charge = event.data.object as Stripe.Charge;
        console.log('Charge succeeded:', charge.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  console.log(`   Stripe: ${stripe ? '✅ Configured' : '⚠️  Not configured'}`);
  console.log('');
});
