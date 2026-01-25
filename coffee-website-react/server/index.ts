// Unified Backend Server - Stripe Payments + Coffee Copilot AI
import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import { OpenAI } from 'openai';
import Stripe from 'stripe';
import path from 'path';
import fs from 'fs';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe with secret key
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

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Initialize with default credentials (works on Cloud Run and locally with GOOGLE_APPLICATION_CREDENTIALS)
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
  console.log('✅ Firebase Admin initialized');
}

const db = admin.firestore();

// ============================================================================
// EMAIL CONFIGURATION (Nodemailer)
// ============================================================================

// Create email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify email configuration on startup
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  emailTransporter.verify((error, success) => {
    if (error) {
      console.warn('⚠️  Email configuration error:', error.message);
    } else {
      console.log('✅ Email transporter configured');
    }
  });
} else {
  console.warn('⚠️  SMTP credentials not set - order confirmation emails will not be sent');
}

interface OrderEmailData {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  shippingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  } | null;
}

async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  // Skip if email not configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('📧 Skipping order confirmation email - SMTP not configured');
    return false;
  }

  const {
    orderId,
    customerEmail,
    customerName,
    items,
    subtotal,
    shipping,
    total,
    currency,
    shippingAddress,
  } = data;

  const currencySymbol = currency === 'gbp' ? '£' : currency === 'usd' ? '$' : currency.toUpperCase() + ' ';

  // Build items HTML
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${currencySymbol}${item.price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${currencySymbol}${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  // Build shipping address HTML
  const addressHtml = shippingAddress ? `
    <p style="margin: 0; color: #666;">
      ${shippingAddress.line1 || ''}<br>
      ${shippingAddress.line2 ? shippingAddress.line2 + '<br>' : ''}
      ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.postal_code || ''}<br>
      ${shippingAddress.country || ''}
    </p>
  ` : '<p style="margin: 0; color: #666;">No shipping address provided</p>';

  // Estimated delivery (5-7 business days from now)
  const deliveryStart = new Date();
  deliveryStart.setDate(deliveryStart.getDate() + 5);
  const deliveryEnd = new Date();
  deliveryEnd.setDate(deliveryEnd.getDate() + 7);
  const estimatedDelivery = `${deliveryStart.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })} - ${deliveryEnd.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #8B4513;">
        <h1 style="color: #8B4513; margin: 0; font-size: 28px;">☕ Stockbridge Coffee</h1>
        <p style="color: #666; margin: 5px 0 0 0;">Artisan Coffee Roastery</p>
      </div>

      <div style="padding: 30px 0;">
        <h2 style="color: #333; margin: 0 0 10px 0;">Thank you for your order!</h2>
        <p style="margin: 0; color: #666;">Hi ${customerName || 'there'},</p>
        <p style="color: #666;">We've received your order and it's being prepared with care. Here's a summary of your purchase:</p>

        <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Order Number:</strong> #${orderId}</p>
          <p style="margin: 0;"><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #8B4513; color: white;">
              <th style="padding: 12px; text-align: left;">Item</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 12px; text-align: right;"><strong>Subtotal:</strong></td>
              <td style="padding: 12px; text-align: right;">${currencySymbol}${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 12px; text-align: right;"><strong>Shipping:</strong></td>
              <td style="padding: 12px; text-align: right;">${shipping > 0 ? currencySymbol + shipping.toFixed(2) : 'FREE'}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td colspan="3" style="padding: 12px; text-align: right;"><strong style="font-size: 18px;">Total:</strong></td>
              <td style="padding: 12px; text-align: right;"><strong style="font-size: 18px; color: #8B4513;">${currencySymbol}${total.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div style="margin: 30px 0;">
          <h3 style="color: #333; margin: 0 0 10px 0;">Shipping Address</h3>
          ${addressHtml}
        </div>

        <div style="background: #FFF8E7; border-left: 4px solid #8B4513; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #666;"><strong>What's next?</strong></p>
          <p style="margin: 10px 0 0 0; color: #666;">We'll send you another email with tracking information once your order ships.</p>
        </div>
      </div>

      <div style="border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #666; font-size: 14px;">
        <p style="margin: 0 0 10px 0;"><strong>Questions about your order?</strong></p>
        <p style="margin: 0;">Email us at <a href="mailto:support@stockbridgecoffee.co.uk" style="color: #8B4513;">support@stockbridgecoffee.co.uk</a></p>
        <p style="margin: 20px 0 0 0; font-size: 12px; color: #999;">
          Stockbridge Coffee Roastery<br>
          Edinburgh, Scotland
        </p>
      </div>
    </body>
    </html>
  `;

  const emailText = `
Thank you for your order!

Hi ${customerName || 'there'},

We've received your order and it's being prepared with care.

Order Number: #${orderId}
Estimated Delivery: ${estimatedDelivery}

Items:
${items.map(item => `- ${item.name} x${item.quantity} - ${currencySymbol}${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Subtotal: ${currencySymbol}${subtotal.toFixed(2)}
Shipping: ${shipping > 0 ? currencySymbol + shipping.toFixed(2) : 'FREE'}
Total: ${currencySymbol}${total.toFixed(2)}

We'll send you another email with tracking information once your order ships.

Questions? Email us at support@stockbridgecoffee.co.uk

Stockbridge Coffee Roastery
Edinburgh, Scotland
  `;

  try {
    await emailTransporter.sendMail({
      from: `"Stockbridge Coffee" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Order Confirmation - #${orderId}`,
      text: emailText,
      html: emailHtml,
    });

    console.log(`📧 Order confirmation email sent to ${customerEmail} for order #${orderId}`);
    return true;
  } catch (error) {
    console.error('📧 Failed to send order confirmation email:', error);
    return false;
  }
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

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

// ============================================================================
// RATE LIMITING CONFIGURATION
// ============================================================================

// Stripe endpoints - most restrictive (10 requests per minute)
const stripeRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    error: 'Too many payment requests. Please wait a moment and try again.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI/Chat endpoints - moderate (20 requests per minute)
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    error: 'Too many requests. Please slow down.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API endpoints - permissive (100 requests per minute)
const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    error: 'Too many requests. Please try again later.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters to specific route groups
app.use('/api/create-payment-intent', stripeRateLimiter);
app.use('/api/stripe-webhook', stripeRateLimiter);
app.use('/api/chat', aiRateLimiter);
app.use('/api/feedback', aiRateLimiter);
app.use('/api/admin', generalRateLimiter);
app.use('/api/health', generalRateLimiter);

console.log('✅ Rate limiting configured');

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
// COFFEE COPILOT TOOL IMPLEMENTATIONS
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
// COFFEE COPILOT TOOL DEFINITIONS
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
// API ROUTES
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
    stripe: stripe ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================================
// COFFEE COPILOT ENDPOINTS
// ============================================================================

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
// ORDER FULFILLMENT LOGIC
// ============================================================================

async function fulfillOrder(paymentIntent: Stripe.PaymentIntent) {
  console.log('📦 Fulfilling order for payment:', paymentIntent.id);

  const { metadata } = paymentIntent;
  const userId = metadata.userId || 'guest';
  const customerEmail = metadata.customerEmail || 'no-email@provided.com';

  // Parse cart items from metadata
  let cartItems: any[] = [];
  try {
    cartItems = JSON.parse(metadata.cartItems || '[]');
  } catch (error) {
    console.error('Failed to parse cart items:', error);
    throw new Error('Invalid cart items in payment metadata');
  }

  if (!cartItems || cartItems.length === 0) {
    console.warn('No cart items found in payment intent metadata');
    return;
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = parseFloat(metadata.shipping || '0');
  const tax = parseFloat(metadata.tax || '0');
  const total = paymentIntent.amount / 100; // Convert from cents

  // Create order document
  const orderData = {
    userId,
    customerEmail,
    status: 'processing',
    paymentStatus: 'paid',
    paymentIntentId: paymentIntent.id,
    items: cartItems,
    subtotal,
    shipping,
    tax,
    total,
    currency: paymentIntent.currency,
    shippingAddress: metadata.shippingAddress ? JSON.parse(metadata.shippingAddress) : null,
    billingAddress: metadata.billingAddress ? JSON.parse(metadata.billingAddress) : null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    // Create order in Firestore
    const orderRef = await db.collection('orders').add(orderData);
    console.log('✅ Order created:', orderRef.id);

    // Deduct inventory for each item
    for (const item of cartItems) {
      try {
        await deductInventory(item.id, item.quantity, orderRef.id);
      } catch (inventoryError) {
        console.error(`Failed to deduct inventory for product ${item.id}:`, inventoryError);
        // Log inventory issue but don't fail the entire order
        await db.collection('inventory_issues').add({
          orderId: orderRef.id,
          productId: item.id,
          productName: item.name,
          requestedQuantity: item.quantity,
          error: inventoryError instanceof Error ? inventoryError.message : 'Unknown error',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    // Clear user's cart if not guest
    if (userId !== 'guest') {
      try {
        await db.collection('cart').doc(userId).delete();
        console.log('🗑️  Cart cleared for user:', userId);
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }

    // Create notification for admin
    await db.collection('admin_notifications').add({
      type: 'new_order',
      orderId: orderRef.id,
      customerEmail,
      total,
      currency: paymentIntent.currency,
      itemCount: cartItems.length,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail({
        orderId: orderRef.id,
        customerEmail,
        customerName: metadata.customerName,
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        shipping,
        total,
        currency: paymentIntent.currency,
        shippingAddress: orderData.shippingAddress,
      });
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order if email fails - log it for manual follow-up
      await db.collection('email_failures').add({
        orderId: orderRef.id,
        customerEmail,
        type: 'order_confirmation',
        error: emailError instanceof Error ? emailError.message : 'Unknown error',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    console.log('✅ Order fulfillment complete:', orderRef.id);
    return orderRef.id;
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
}

async function deductInventory(productId: string, quantity: number, orderId: string) {
  const productRef = db.collection('products').doc(productId);

  try {
    // Use a transaction to ensure atomic stock updates
    await db.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists) {
        throw new Error(`Product ${productId} not found`);
      }

      const productData = productDoc.data()!;
      const currentStock = productData.stock || 0;
      const newStock = currentStock - quantity;

      if (newStock < 0) {
        throw new Error(`Insufficient stock for product ${productData.name}. Available: ${currentStock}, Requested: ${quantity}`);
      }

      // Update product stock
      transaction.update(productRef, {
        stock: newStock,
        sold: (productData.sold || 0) + quantity,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log inventory change
      const inventoryLogRef = db.collection('inventory_logs').doc();
      transaction.set(inventoryLogRef, {
        productId,
        productName: productData.name,
        previousStock: currentStock,
        newStock,
        change: -quantity,
        reason: 'sale',
        orderId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    console.log(`📉 Inventory updated for product ${productId}: -${quantity}`);
  } catch (error) {
    console.error(`Inventory deduction failed for product ${productId}:`, error);
    throw error;
  }
}

// ============================================================================
// STRIPE PAYMENT ENDPOINTS
// ============================================================================

// Create payment intent endpoint
app.post('/api/create-payment-intent', async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Webhook endpoint for Stripe events
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
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
        console.log('✅ PaymentIntent succeeded:', paymentIntent.id);

        try {
          await fulfillOrder(paymentIntent);
        } catch (error) {
          console.error('Error fulfilling order:', error);
          // Don't fail the webhook - order creation errors should be logged and handled separately
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('❌ PaymentIntent failed:', failedPayment.id);

        // Log failed payment attempt
        try {
          await db.collection('payment_failures').add({
            paymentIntentId: failedPayment.id,
            amount: failedPayment.amount,
            currency: failedPayment.currency,
            metadata: failedPayment.metadata,
            error: failedPayment.last_payment_error?.message || 'Unknown error',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (error) {
          console.error('Error logging failed payment:', error);
        }
        break;

      case 'charge.succeeded':
        const charge = event.data.object as Stripe.Charge;
        console.log('💳 Charge succeeded:', charge.id);
        break;

      default:
        console.log(`⚠️  Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// ============================================================================
// ADMIN API ENDPOINTS
// ============================================================================

// Get all orders with optional filtering
app.get('/api/admin/orders', async (req: Request, res: Response) => {
  try {
    const { status, limit = 50 } = req.query;

    let query = db.collection('orders').orderBy('createdAt', 'desc').limit(Number(limit));

    if (status) {
      query = db.collection('orders')
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .limit(Number(limit));
    }

    const snapshot = await query.get();
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
app.patch('/api/admin/orders/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (status) updateData.status = status;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    await db.collection('orders').doc(orderId).update(updateData);

    res.json({ success: true, orderId });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Get admin statistics
app.get('/api/admin/stats', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get orders
    const ordersSnapshot = await db.collection('orders').get();
    const orders = ordersSnapshot.docs.map(doc => doc.data());

    // Calculate stats
    const todayOrders = orders.filter(o => o.createdAt?.toDate?.() >= today);
    const weekOrders = orders.filter(o => o.createdAt?.toDate?.() >= thisWeek);
    const monthOrders = orders.filter(o => o.createdAt?.toDate?.() >= thisMonth);

    const stats = {
      totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      todayRevenue: todayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      weekRevenue: weekOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      monthRevenue: monthOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      weekOrders: weekOrders.length,
      monthOrders: monthOrders.length,
      pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length : 0,
    };

    // Get low stock products
    const productsSnapshot = await db.collection('products')
      .where('stock', '<=', 10)
      .where('active', '==', true)
      .get();

    const lowStockProducts = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get unread notifications count
    const notificationsSnapshot = await db.collection('admin_notifications')
      .where('read', '==', false)
      .get();

    res.json({
      stats,
      lowStockProducts,
      unreadNotifications: notificationsSnapshot.size,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get inventory logs
app.get('/api/admin/inventory-logs', async (req: Request, res: Response) => {
  try {
    const { productId, limit = 50 } = req.query;

    let query = db.collection('inventory_logs')
      .orderBy('timestamp', 'desc')
      .limit(Number(limit));

    if (productId) {
      query = db.collection('inventory_logs')
        .where('productId', '==', productId)
        .orderBy('timestamp', 'desc')
        .limit(Number(limit));
    }

    const snapshot = await query.get();
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || null,
    }));

    res.json({ logs });
  } catch (error) {
    console.error('Error fetching inventory logs:', error);
    res.status(500).json({ error: 'Failed to fetch inventory logs' });
  }
});

// Update product stock manually
app.post('/api/admin/inventory/adjust', async (req: Request, res: Response) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'Product ID and quantity required' });
    }

    const productRef = db.collection('products').doc(productId);

    await db.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists) {
        throw new Error('Product not found');
      }

      const productData = productDoc.data()!;
      const currentStock = productData.stock || 0;
      const newStock = currentStock + Number(quantity);

      if (newStock < 0) {
        throw new Error('Cannot reduce stock below zero');
      }

      transaction.update(productRef, {
        stock: newStock,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const inventoryLogRef = db.collection('inventory_logs').doc();
      transaction.set(inventoryLogRef, {
        productId,
        productName: productData.name,
        previousStock: currentStock,
        newStock,
        change: Number(quantity),
        reason: reason || 'manual_adjustment',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    res.json({ success: true, productId });
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to adjust inventory'
    });
  }
});

// Mark notifications as read
app.post('/api/admin/notifications/read', async (req: Request, res: Response) => {
  try {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds)) {
      return res.status(400).json({ error: 'notificationIds must be an array' });
    }

    const batch = db.batch();
    notificationIds.forEach(id => {
      const ref = db.collection('admin_notifications').doc(id);
      batch.update(ref, { read: true, readAt: admin.firestore.FieldValue.serverTimestamp() });
    });

    await batch.commit();
    res.json({ success: true, count: notificationIds.length });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`\n🚀 Unified Backend Server - Coffee Copilot + Stripe`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`\n☕️ Coffee Copilot:`);
  console.log(`   OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   - POST /api/chat (AI chat endpoint)`);
  console.log(`   - POST /api/feedback (Bug reports with screenshots)`);
  console.log(`\n💳 Stripe Payments:`);
  console.log(`   Stripe: ${stripe ? '✅ Configured' : '⚠️  Not configured'}`);
  console.log(`   - POST /api/create-payment-intent`);
  console.log(`   - POST /api/stripe-webhook`);
  if (stripe && stripeSecretKey) {
    console.log(`   Mode: ${stripeSecretKey.includes('test') ? 'TEST' : 'LIVE'}`);
  }
  console.log('');
});
