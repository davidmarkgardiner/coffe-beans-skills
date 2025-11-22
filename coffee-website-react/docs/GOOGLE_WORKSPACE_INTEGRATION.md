# Google Workspace Integration Guide for Stockbridge Coffee

**Version:** 1.0
**Last Updated:** 2025-11-14
**Contact:** hello@stockbridgecoffee.co.uk

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Google Workspace Setup](#google-workspace-setup)
4. [Order Notification System](#order-notification-system)
5. [AI Email Automation](#ai-email-automation)
6. [Implementation Guide](#implementation-guide)
7. [Testing & Deployment](#testing--deployment)
8. [Troubleshooting](#troubleshooting)
9. [Cost Analysis](#cost-analysis)

---

## Overview

This guide documents the complete integration of Google Workspace with the Stockbridge Coffee e-commerce platform. The integration provides three core capabilities:

1. **Order Notifications** - Automated admin alerts when orders are placed
2. **Newsletter Distribution** - Weekly blog content delivery to subscribers
3. **AI Email Automation** - Intelligent customer support email handling

### Key Features

- Professional email: `hello@stockbridgecoffee.co.uk`
- AI-powered customer support with auto-responses
- Smart email categorization and prioritization
- Admin notification system with inventory alerts
- Customer insights using AI analysis
- Comprehensive audit trail in Firestore

### Current Status

- ✅ Newsletter system operational (using Gmail API)
- ❌ Order notifications not implemented
- ❌ AI email automation not implemented
- ❌ Google Workspace migration pending

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    STOCKBRIDGE COFFEE                        │
│                   E-Commerce Platform                        │
└──────────────┬──────────────────────────────┬────────────────┘
               │                              │
               ▼                              ▼
    ┌──────────────────┐           ┌──────────────────┐
    │  Stripe Webhook  │           │ Customer Emails  │
    │  (Order Created) │           │  (Gmail Inbox)   │
    └────────┬─────────┘           └────────┬─────────┘
             │                              │
             │                              │
             ▼                              ▼
    ┌──────────────────┐           ┌──────────────────┐
    │ Order Processor  │           │  Email Monitor   │
    │  - Save to DB    │           │  - Poll Inbox    │
    │  - Deduct Stock  │           │  - Parse Email   │
    └────────┬─────────┘           └────────┬─────────┘
             │                              │
             │                              │
             ▼                              ▼
    ┌──────────────────┐           ┌──────────────────┐
    │   AI Analysis    │           │ AI Categorizer   │
    │  - Customer LTV  │           │  - Product Q     │
    │  - Order Pattern │           │  - Order Issue   │
    │  - Preferences   │           │  - Complaint     │
    └────────┬─────────┘           └────────┬─────────┘
             │                              │
             │                              │
             ▼                              ▼
    ┌──────────────────┐           ┌──────────────────┐
    │  Admin Email     │           │ Response Engine  │
    │  - Order Summary │           │  - Auto-respond  │
    │  - Stock Alerts  │           │  - Draft Reply   │
    │  - AI Insights   │           │  - Summarize     │
    └────────┬─────────┘           └────────┬─────────┘
             │                              │
             │                              │
             ▼                              ▼
    ┌──────────────────────────────────────────┐
    │      Google Workspace Gmail API           │
    │        hello@stockbridgecoffee.co.uk     │
    └──────────────────────────────────────────┘
```

### Email Flows

#### 1. Order Notification Flow
```
Customer Checkout → Stripe Payment → Webhook → Server
    ↓
Save Order to Firestore
    ↓
Deduct Inventory (with transaction)
    ↓
Analyze Customer (AI)
    ↓
Check Stock Levels
    ↓
Generate Admin Email (Summary + Alerts + Insights)
    ↓
Send via Google Workspace
    ↓
Log to /order_notifications_sent
```

#### 2. Newsletter Flow (Current)
```
GitHub Actions (Weekly Cron)
    ↓
Curate Blog Content (Gemini AI)
    ↓
Generate Images (Imagen 4.0)
    ↓
Upload to Firestore
    ↓
Fetch Subscribers
    ↓
Generate HTML Email
    ↓
Send via Gmail API
    ↓
Log to /newsletter-history
```

#### 3. AI Email Automation Flow
```
Customer Sends Email → Gmail Inbox
    ↓
Email Monitor Script (Polling/Push)
    ↓
Parse Email & Extract Context
    ↓
Save to /incoming_emails (Firestore)
    ↓
AI Categorization (Product Q / Order Issue / etc.)
    ↓
Calculate Confidence Score
    ↓
┌─────────────────┬──────────────────┬───────────────┐
│ High Confidence │ Medium Confidence│ Low Confidence│
│   (Score >0.85) │   (0.6-0.85)     │   (<0.6)      │
└────────┬────────┴────────┬─────────┴───────┬───────┘
         │                 │                 │
         ▼                 ▼                 ▼
   Auto-Respond      Draft Response    Escalate to Admin
         │                 │                 │
         │                 ▼                 │
         │     Save to /email_responses     │
         │     (Pending Approval)            │
         │                 │                 │
         └─────────────────┴─────────────────┘
                           │
                           ▼
                    Send Response
                           │
                           ▼
                Log to /email_threads
```

### Firestore Collections

#### Existing Collections
```
/orders                  - Customer orders
/users                   - User accounts
/products                - Coffee products
/newsletter              - Email subscribers
/newsletter-history      - Newsletter send logs
/blog-posts              - Published blog content
/inventory_logs          - Stock change history
/admin_notifications     - Admin dashboard alerts
```

#### New Collections (To Be Created)
```
/incoming_emails         - Received customer emails
/email_responses         - AI-generated response drafts
/email_threads           - Conversation history
/order_notifications_sent- Order notification logs
/email_analytics         - Email performance metrics
```

### Collection Schemas

#### `/incoming_emails`
```typescript
{
  emailId: string;          // Gmail message ID
  threadId: string;         // Gmail thread ID
  from: string;             // Customer email
  subject: string;
  body: string;             // Plain text body
  bodyHtml: string;         // HTML body
  receivedAt: Timestamp;
  category: 'product_question' | 'order_issue' | 'complaint' |
            'shipping_inquiry' | 'refund_request' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sentiment: 'positive' | 'neutral' | 'negative';
  confidenceScore: number;  // 0-1
  aiSummary: string;        // Brief summary
  extractedOrderId?: string;// If order-related
  status: 'pending' | 'responded' | 'escalated';
  processedAt: Timestamp;
  tags: string[];           // AI-generated tags
}
```

#### `/email_responses`
```typescript
{
  incomingEmailId: string;  // Reference to incoming email
  responseType: 'auto' | 'draft' | 'approved';
  generatedResponse: string;// AI-generated text
  editedResponse?: string;  // Admin-edited version
  confidenceScore: number;
  createdAt: Timestamp;
  approvedAt?: Timestamp;
  approvedBy?: string;      // Admin user ID
  sentAt?: Timestamp;
  status: 'pending' | 'approved' | 'rejected' | 'sent';
  reasoning: string;        // Why this response was generated
}
```

#### `/email_threads`
```typescript
{
  threadId: string;         // Gmail thread ID
  customerEmail: string;
  subject: string;
  messages: Array<{
    messageId: string;
    direction: 'inbound' | 'outbound';
    body: string;
    sentAt: Timestamp;
    sender: string;
  }>;
  status: 'active' | 'resolved' | 'archived';
  category: string;
  createdAt: Timestamp;
  lastMessageAt: Timestamp;
  totalMessages: number;
}
```

#### `/order_notifications_sent`
```typescript
{
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  total: number;
  itemCount: number;
  sentTo: string;           // Admin email
  sentAt: Timestamp;
  inventoryAlerts: Array<{
    productId: string;
    productName: string;
    stockLevel: number;
    reorderThreshold: number;
  }>;
  customerInsights: {
    isNewCustomer: boolean;
    previousOrders: number;
    lifetimeValue: number;
    averageOrderValue: number;
    lastOrderDate?: Timestamp;
    preferredProducts: string[];
    aiSummary: string;
  };
}
```

---

## Google Workspace Setup

### Prerequisites

- Domain: `stockbridgecoffee.co.uk` (managed via Cloudflare)
- Admin access to Cloudflare DNS
- Google Cloud Console project
- Credit card for Google Workspace subscription

### Step 1: Google Workspace Account Creation

1. **Sign up for Google Workspace**
   - Visit: https://workspace.google.com/
   - Choose **Business Starter** plan (£4.60/user/month)
   - Domain: `stockbridgecoffee.co.uk`
   - Create admin account: `admin@stockbridgecoffee.co.uk`

2. **Domain Verification**

   Google will provide a TXT record to add to Cloudflare:

   ```
   Type: TXT
   Name: @
   Content: google-site-verification=xxxxxxxxxxxxxxxxxxxxx
   TTL: Auto
   ```

   **In Cloudflare:**
   - Log in to Cloudflare
   - Select `stockbridgecoffee.co.uk` domain
   - Go to **DNS** > **Records**
   - Click **Add record**
   - Add the TXT record provided by Google
   - Wait 5-10 minutes for propagation
   - Return to Google Workspace and click **Verify**

3. **MX Records Configuration**

   Add these MX records to Cloudflare (replace existing MX records):

   ```
   Priority: 1
   Name: @
   Content: ASPMX.L.GOOGLE.COM

   Priority: 5
   Name: @
   Content: ALT1.ASPMX.L.GOOGLE.COM

   Priority: 5
   Name: @
   Content: ALT2.ASPMX.L.GOOGLE.COM

   Priority: 10
   Name: @
   Content: ALT3.ASPMX.L.GOOGLE.COM

   Priority: 10
   Name: @
   Content: ALT4.ASPMX.L.GOOGLE.COM
   ```

   **Note:** Orange cloud (proxy) should be OFF for MX records

4. **SPF Record (Email Authentication)**

   Add TXT record:
   ```
   Type: TXT
   Name: @
   Content: v=spf1 include:_spf.google.com ~all
   TTL: Auto
   ```

5.  

   In Google Workspace Admin Console:
   - Go to **Apps** > **Google Workspace** > **Gmail**
   - Click **Authenticate email**
   - Click **Generate new record**
   - Copy the TXT record details

   Add to Cloudflare:
   ```
   Type: TXT
   Name: google._domainkey
   Content: v=DKIM1; k=rsa; p=MIGfMA0GCSq... (very long string)
   TTL: Auto
   ```

6. **DMARC Policy (Optional but Recommended)**

   Add TXT record:
   ```
   Type: TXT
   Name: _dmarc
   Content: v=DMARC1; p=quarantine; rua=mailto:admin@stockbridgecoffee.co.uk
   TTL: Auto
   ```

7. **Create hello@ Email**

   In Google Workspace Admin Console:
   - Go to **Directory** > **Users**
   - Click **Add new user**
   - Email: `hello@stockbridgecoffee.co.uk`
   - First name: "Customer Support"
   - Last name: "Stockbridge Coffee"
   - Password: (generate strong password)
   - Click **Add new user**

### Step 2: Google Cloud Console Setup

1. **Create or Select Project**
   - Go to: https://console.cloud.google.com/
   - Create new project: `stockbridge-coffee-workspace`
   - Note the Project ID

logical-waters-478314-c3

2. **Enable Required APIs**

   Enable these APIs:
   - Gmail API
   - Google Workspace Admin SDK
   - Cloud Pub/Sub API (for push notifications)

   ```bash
   gcloud services enable gmail.googleapis.com
   gcloud services enable admin.googleapis.com
   gcloud services enable pubsub.googleapis.com
   ```

3. **Configure OAuth Consent Screen**

   - Go to **APIs & Services** > **OAuth consent screen**
   - User Type: **Internal** (for Workspace accounts only)
   - App name: "Stockbridge Coffee Email Automation"
   - User support email: `admin@stockbridgecoffee.co.uk`
   - Developer contact: `admin@stockbridgecoffee.co.uk`
   - Scopes to add:
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`
     - `https://www.googleapis.com/auth/gmail.compose`
   - Click **Save and Continue**

4. **Create OAuth 2.0 Credentials**

   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Application type: **Desktop app**
   - Name: "Stockbridge Coffee Email Client"
   - Click **Create**
   - Download JSON file as `gmail-credentials.json`
   - Save to: `/coffee-website-react/scripts/credentials/gmail-credentials.json`

5. **Generate Refresh Token**

   Create authentication script:

   ```bash
   # Navigate to scripts directory
   cd /coffee-website-react/scripts

   # Run OAuth flow
   npm run workspace:auth
   ```

   This will:
   - Open browser for authentication
   - Ask you to log in as `hello@stockbridgecoffee.co.uk`
   - Grant permissions to the app
   - Display refresh token in terminal

   **Save the refresh token** - you'll add it to `.env.local`

6. **Update Environment Variables**

   Add to `/coffee-website-react/.env.local`:

   ```env
   # Google Workspace (Gmail API)
   GOOGLE_WORKSPACE_USER=hello@stockbridgecoffee.co.uk
   GOOGLE_WORKSPACE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   GOOGLE_WORKSPACE_CLIENT_SECRET=xxxxx
   GOOGLE_WORKSPACE_REFRESH_TOKEN=xxxxx

   # Admin Notifications
   ADMIN_EMAIL=your-admin@email.com

   # AI Email Processing
   OPENAI_API_KEY=sk-xxxxx  # Or use GEMINI_API_KEY

   # Email Monitoring
   EMAIL_CHECK_INTERVAL=300000  # 5 minutes in ms
   ```

   **Security Note:** Add `gmail-credentials.json` to `.gitignore`

### Step 3: Migration from Gmail to Google Workspace

If you're currently using personal Gmail for newsletters:

1. **Test Workspace Email**

   ```bash
   npm run test:workspace-email
   ```

   This sends a test email to verify the setup works.

2. **Update Newsletter Script**

   In `scripts/send-newsletter.ts`, change:
   ```typescript
   // OLD
   user: process.env.GMAIL_USER,
   clientId: process.env.GMAIL_CLIENT_ID,

   // NEW
   user: process.env.GOOGLE_WORKSPACE_USER,
   clientId: process.env.GOOGLE_WORKSPACE_CLIENT_ID,
   ```

3. **Run Newsletter Test**

   ```bash
   npm run send:newsletter -- --dry-run
   ```

   Verify emails are sent from `hello@stockbridgecoffee.co.uk`

4. **Update GitHub Actions Secrets**

   In GitHub repository settings:
   - Add: `GOOGLE_WORKSPACE_USER`
   - Add: `GOOGLE_WORKSPACE_CLIENT_ID`
   - Add: `GOOGLE_WORKSPACE_CLIENT_SECRET`
   - Add: `GOOGLE_WORKSPACE_REFRESH_TOKEN`

   Update `.github/workflows/weekly-blog-newsletter.yml` to use new secrets.

### Step 4: Email Forwarding & Aliases (Optional)

1. **Set up Email Forwarding**

   Forward `hello@` emails to admin's personal email:
   - Go to Google Workspace Admin Console
   - **Apps** > **Google Workspace** > **Gmail** > **Routing**
   - Click **Add another rule**
   - Recipients: `hello@stockbridgecoffee.co.uk`
   - Also deliver to: `your-admin@email.com`
   - Click **Save**

2. **Create Email Aliases**

   - `support@stockbridgecoffee.co.uk` → `hello@`
   - `info@stockbridgecoffee.co.uk` → `hello@`
   - `orders@stockbridgecoffee.co.uk` → `hello@`

### Step 5: Security Best Practices

1. **Enable 2-Factor Authentication**
   - Required for `admin@` and `hello@` accounts

2. **Create App-Specific Passwords** (if needed)
   - For legacy apps that don't support OAuth

3. **Set Up Security Alerts**
   - Enable suspicious activity alerts
   - Monitor login attempts

4. **Rotate Credentials Regularly**
   - Refresh tokens should be rotated every 6 months
   - Document rotation procedure

---

## Order Notification System

### Overview

Automatically notify the admin when orders are placed, including:
- Quick order summary
- Inventory stock alerts
- AI-generated customer insights

### Implementation Components

#### 1. Email Template

Create `scripts/templates/order-notification.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #F5F1E8;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #2C5F5D 0%, #1a3e3d 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px;
    }
    .order-summary {
      background: #F5F1E8;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      padding: 8px 0;
      border-bottom: 1px solid #ddd;
    }
    .summary-label {
      font-weight: 600;
      color: #4A5C5A;
    }
    .summary-value {
      color: #2C5F5D;
      font-weight: 700;
    }
    .alert-box {
      background: #fff3cd;
      border-left: 4px solid #D4A574;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .alert-title {
      color: #856404;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .insights-box {
      background: #e8f4f8;
      border-left: 4px solid #2C5F5D;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .insights-title {
      color: #2C5F5D;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .cta-button {
      display: inline-block;
      background: #2C5F5D;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .footer {
      background: #4A5C5A;
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 New Order Received</h1>
      <p>Order #{{orderNumber}}</p>
    </div>

    <div class="content">
      <p>A new order has been placed on Stockbridge Coffee.</p>

      <div class="order-summary">
        <div class="summary-row">
          <span class="summary-label">Order Number:</span>
          <span class="summary-value">{{orderNumber}}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Total:</span>
          <span class="summary-value">£{{total}}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Items:</span>
          <span class="summary-value">{{itemCount}}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Customer:</span>
          <span class="summary-value">{{customerEmail}}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Placed:</span>
          <span class="summary-value">{{timestamp}}</span>
        </div>
      </div>

      {{#if hasInventoryAlerts}}
      <div class="alert-box">
        <div class="alert-title">⚠️ Inventory Alerts</div>
        <p>The following items are running low on stock:</p>
        <ul>
          {{#each inventoryAlerts}}
          <li><strong>{{productName}}</strong>: {{stockLevel}} remaining (threshold: {{reorderThreshold}})</li>
          {{/each}}
        </ul>
      </div>
      {{/if}}

      <div class="insights-box">
        <div class="insights-title">🤖 Customer Insights (AI)</div>
        <p><strong>Customer Type:</strong> {{customerType}}</p>
        <p><strong>Previous Orders:</strong> {{previousOrders}}</p>
        <p><strong>Lifetime Value:</strong> £{{lifetimeValue}}</p>
        <p><strong>Average Order:</strong> £{{averageOrderValue}}</p>
        {{#if preferredProducts}}
        <p><strong>Preferred Products:</strong> {{preferredProducts}}</p>
        {{/if}}
        <p style="margin-top: 15px; font-style: italic;">{{aiSummary}}</p>
      </div>

      <center>
        <a href="https://stockbridgecoffee.co.uk/admin/orders/{{orderId}}" class="cta-button">
          View Order Details
        </a>
      </center>
    </div>

    <div class="footer">
      <p>Stockbridge Coffee - Admin Notifications</p>
      <p>hello@stockbridgecoffee.co.uk</p>
    </div>
  </div>
</body>
</html>
```

#### 2. Order Notification Script

Create `scripts/send-order-notification.ts`:

```typescript
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import { firestore } from '../server/src/firebase-admin';

interface OrderData {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  total: number;
  itemCount: number;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
  }>;
}

interface CustomerInsights {
  isNewCustomer: boolean;
  previousOrders: number;
  lifetimeValue: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  preferredProducts: string[];
  aiSummary: string;
}

interface InventoryAlert {
  productId: string;
  productName: string;
  stockLevel: number;
  reorderThreshold: number;
}

async function generateCustomerInsights(
  customerEmail: string,
  currentOrder: OrderData
): Promise<CustomerInsights> {
  // Fetch customer order history
  const ordersSnapshot = await firestore
    .collection('orders')
    .where('customerEmail', '==', customerEmail)
    .where('status', '!=', 'cancelled')
    .orderBy('createdAt', 'desc')
    .get();

  const orders = ordersSnapshot.docs.map(doc => doc.data());
  const previousOrders = orders.length - 1; // Exclude current order

  const lifetimeValue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const averageOrderValue = orders.length > 0 ? lifetimeValue / orders.length : 0;

  // Count product preferences
  const productCounts: Record<string, { name: string; count: number }> = {};
  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      if (!productCounts[item.id]) {
        productCounts[item.id] = { name: item.name, count: 0 };
      }
      productCounts[item.id].count += item.quantity;
    });
  });

  const preferredProducts = Object.values(productCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(p => p.name);

  const lastOrderDate = orders.length > 1 ? orders[1].createdAt?.toDate() : undefined;

  // Generate AI summary using OpenAI or Gemini
  const aiSummary = await generateAISummary({
    isNewCustomer: previousOrders === 0,
    previousOrders,
    lifetimeValue,
    averageOrderValue,
    preferredProducts,
    currentOrderValue: currentOrder.total,
  });

  return {
    isNewCustomer: previousOrders === 0,
    previousOrders,
    lifetimeValue: Math.round(lifetimeValue * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    lastOrderDate,
    preferredProducts,
    aiSummary,
  };
}

async function generateAISummary(data: any): Promise<string> {
  // Use OpenAI or Gemini to generate a natural language summary
  // This is a placeholder - implement actual AI integration

  if (data.isNewCustomer) {
    return `This is a new customer making their first purchase of £${data.currentOrderValue}. Consider sending a welcome email and first-time discount code for their next order.`;
  }

  if (data.lifetimeValue > 200) {
    return `High-value customer with £${data.lifetimeValue} in lifetime purchases. They typically order ${data.preferredProducts.join(', ')}. Consider VIP treatment and loyalty rewards.`;
  }

  return `Returning customer with ${data.previousOrders} previous orders averaging £${data.averageOrderValue}. Standard service workflow applies.`;
}

async function checkInventoryAlerts(
  orderItems: Array<{ productId: string; name: string; quantity: number }>
): Promise<InventoryAlert[]> {
  const alerts: InventoryAlert[] = [];

  for (const item of orderItems) {
    const productDoc = await firestore
      .collection('products')
      .doc(item.productId)
      .get();

    const product = productDoc.data();
    if (!product) continue;

    const stockLevel = product.inventory || 0;
    const reorderThreshold = product.reorderThreshold || 10;

    if (stockLevel <= reorderThreshold) {
      alerts.push({
        productId: item.productId,
        productName: item.name,
        stockLevel,
        reorderThreshold,
      });
    }
  }

  return alerts;
}

export async function sendOrderNotification(orderData: OrderData): Promise<void> {
  try {
    // Generate customer insights
    const customerInsights = await generateCustomerInsights(
      orderData.customerEmail,
      orderData
    );

    // Check inventory alerts
    const inventoryAlerts = await checkInventoryAlerts(orderData.items);

    // Load and compile email template
    const templatePath = join(__dirname, 'templates', 'order-notification.html');
    const templateSource = readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);

    // Prepare template data
    const templateData = {
      orderNumber: orderData.orderNumber,
      orderId: orderData.orderId,
      total: orderData.total.toFixed(2),
      itemCount: orderData.itemCount,
      customerEmail: orderData.customerEmail,
      timestamp: new Date().toLocaleString('en-GB', {
        dateStyle: 'full',
        timeStyle: 'short',
      }),
      hasInventoryAlerts: inventoryAlerts.length > 0,
      inventoryAlerts,
      customerType: customerInsights.isNewCustomer ? 'New Customer 🎉' : 'Returning Customer',
      previousOrders: customerInsights.previousOrders,
      lifetimeValue: customerInsights.lifetimeValue.toFixed(2),
      averageOrderValue: customerInsights.averageOrderValue.toFixed(2),
      preferredProducts: customerInsights.preferredProducts.join(', '),
      aiSummary: customerInsights.aiSummary,
    };

    const htmlContent = template(templateData);

    // Set up Gmail OAuth2 transporter
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_WORKSPACE_CLIENT_ID,
      process.env.GOOGLE_WORKSPACE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_WORKSPACE_REFRESH_TOKEN,
    });

    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GOOGLE_WORKSPACE_USER,
        clientId: process.env.GOOGLE_WORKSPACE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_WORKSPACE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_WORKSPACE_REFRESH_TOKEN,
        accessToken: accessToken.token as string,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Stockbridge Coffee Orders" <${process.env.GOOGLE_WORKSPACE_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🛒 New Order #${orderData.orderNumber} - £${orderData.total}`,
      html: htmlContent,
    });

    // Log notification to Firestore
    await firestore.collection('order_notifications_sent').add({
      orderId: orderData.orderId,
      orderNumber: orderData.orderNumber,
      customerEmail: orderData.customerEmail,
      total: orderData.total,
      itemCount: orderData.itemCount,
      sentTo: process.env.ADMIN_EMAIL,
      sentAt: new Date(),
      inventoryAlerts,
      customerInsights,
    });

    console.log(`✅ Order notification sent for #${orderData.orderNumber}`);
  } catch (error) {
    console.error('❌ Failed to send order notification:', error);
    throw error;
  }
}
```

#### 3. Integration with Stripe Webhook

Update `server/src/server.ts` in the `fulfillOrder` function (around line 590):

```typescript
// After order is successfully created and saved to Firestore
console.log(`Order ${orderDoc.id} created successfully`);

// NEW: Send order notification to admin
try {
  await sendOrderNotification({
    orderId: orderDoc.id,
    orderNumber: orderData.orderNumber || orderDoc.id.substring(0, 8).toUpperCase(),
    customerEmail: orderData.customerEmail,
    total: orderData.total,
    itemCount: orderData.items.reduce((sum, item) => sum + item.quantity, 0),
    items: orderData.items,
  });
} catch (error) {
  console.error('Failed to send order notification:', error);
  // Don't throw - order was created successfully
}
```

Import the function at the top of `server.ts`:

```typescript
import { sendOrderNotification } from '../../scripts/send-order-notification';
```

#### 4. Testing

Create `scripts/test-order-notification.ts`:

```typescript
import { sendOrderNotification } from './send-order-notification';

async function testOrderNotification() {
  const testOrderData = {
    orderId: 'test_order_123',
    orderNumber: 'TEST0001',
    customerEmail: 'customer@example.com',
    total: 45.50,
    itemCount: 3,
    items: [
      { productId: 'prod_123', name: 'Ethiopian Yirgacheffe', quantity: 2 },
      { productId: 'prod_456', name: 'Colombian Supremo', quantity: 1 },
    ],
  };

  await sendOrderNotification(testOrderData);
  console.log('✅ Test notification sent!');
}

testOrderNotification().catch(console.error);
```

Run test:
```bash
npm run test:order-notification
```

---

## AI Email Automation

### Overview

Intelligent customer support system that:
1. Monitors `hello@stockbridgecoffee.co.uk` inbox
2. Categorizes incoming emails using AI
3. Generates appropriate responses (auto-send or draft for approval)
4. Summarizes email activity for admin review

### Architecture Decision: Polling vs Push

**Recommended: Gmail Push Notifications (Cloud Pub/Sub)**

**Pros:**
- Real-time notification of new emails
- Lower API quota usage
- More scalable
- No constant polling overhead

**Cons:**
- Requires public webhook endpoint
- More complex setup
- Needs SSL certificate

**Alternative: Polling (Simpler)**

**Pros:**
- Easier to implement
- No webhook infrastructure needed
- Good for low-volume email

**Cons:**
- Higher API quota usage
- Slight delay (5-minute intervals)
- Less scalable

**Implementation choice:** Start with **polling** for MVP, migrate to push later.

### Implementation Components

#### 1. Email Monitor Script

Create `scripts/monitor-inbox.ts`:

```typescript
import { google } from 'googleapis';
import { firestore } from '../server/src/firebase-admin';
import { processIncomingEmail } from './process-incoming-email';

const CHECK_INTERVAL = parseInt(process.env.EMAIL_CHECK_INTERVAL || '300000'); // 5 minutes

async function getGmailClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_WORKSPACE_CLIENT_ID,
    process.env.GOOGLE_WORKSPACE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_WORKSPACE_REFRESH_TOKEN,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

async function fetchUnreadEmails() {
  const gmail = await getGmailClient();

  // Get unread messages from inbox (excluding sent items)
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread in:inbox -from:me',
    maxResults: 10,
  });

  const messages = response.data.messages || [];

  for (const message of messages) {
    try {
      // Get full message details
      const messageData = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
        format: 'full',
      });

      // Check if already processed
      const existingDoc = await firestore
        .collection('incoming_emails')
        .doc(message.id!)
        .get();

      if (existingDoc.exists) {
        console.log(`Email ${message.id} already processed, skipping...`);
        continue;
      }

      // Process the email
      await processIncomingEmail(messageData.data);

      // Mark as read
      await gmail.users.messages.modify({
        userId: 'me',
        id: message.id!,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      });

      console.log(`✅ Processed email ${message.id}`);
    } catch (error) {
      console.error(`❌ Failed to process email ${message.id}:`, error);
    }
  }

  return messages.length;
}

async function monitorInbox() {
  console.log('📧 Starting email monitor...');
  console.log(`Checking inbox every ${CHECK_INTERVAL / 1000} seconds`);

  while (true) {
    try {
      const count = await fetchUnreadEmails();
      console.log(`Checked inbox - ${count} unread emails found`);
    } catch (error) {
      console.error('Error checking inbox:', error);
    }

    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
}

// Run monitor
monitorInbox().catch(console.error);
```

#### 2. Email Processing & AI Categorization

Create `scripts/process-incoming-email.ts`:

```typescript
import { gmail_v1 } from 'googleapis';
import { firestore } from '../server/src/firebase-admin';
import { OpenAI } from 'openai';
import { sendCustomerResponse } from './send-customer-response';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ParsedEmail {
  from: string;
  subject: string;
  body: string;
  bodyHtml: string;
  receivedAt: Date;
}

interface EmailCategory {
  category: 'product_question' | 'order_issue' | 'complaint' | 'shipping_inquiry' | 'refund_request' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sentiment: 'positive' | 'neutral' | 'negative';
  confidenceScore: number;
  aiSummary: string;
  suggestedResponse: string;
  reasoning: string;
  extractedOrderId?: string;
  tags: string[];
}

function parseEmailMessage(message: gmail_v1.Schema$Message): ParsedEmail {
  const headers = message.payload?.headers || [];
  const fromHeader = headers.find(h => h.name === 'From')?.value || '';
  const subjectHeader = headers.find(h => h.name === 'Subject')?.value || '';
  const dateHeader = headers.find(h => h.name === 'Date')?.value || '';

  // Extract email address from "Name <email@example.com>" format
  const emailMatch = fromHeader.match(/<(.+?)>/);
  const from = emailMatch ? emailMatch[1] : fromHeader;

  // Extract body (handle both plain text and HTML)
  let body = '';
  let bodyHtml = '';

  const parts = message.payload?.parts || [];

  for (const part of parts) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      body = Buffer.from(part.body.data, 'base64').toString('utf-8');
    }
    if (part.mimeType === 'text/html' && part.body?.data) {
      bodyHtml = Buffer.from(part.body.data, 'base64').toString('utf-8');
    }
  }

  // Fallback to main body if no parts
  if (!body && message.payload?.body?.data) {
    body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
  }

  return {
    from,
    subject: subjectHeader,
    body: body || 'No plain text body',
    bodyHtml: bodyHtml || '',
    receivedAt: new Date(dateHeader),
  };
}

async function categorizeEmail(parsedEmail: ParsedEmail): Promise<EmailCategory> {
  const prompt = `You are an AI assistant for Stockbridge Coffee, a specialty coffee bean e-commerce business.

Analyze this customer email and provide a structured response:

From: ${parsedEmail.from}
Subject: ${parsedEmail.subject}
Body: ${parsedEmail.body}

Provide a JSON response with the following fields:
{
  "category": "<product_question|order_issue|complaint|shipping_inquiry|refund_request|general>",
  "priority": "<low|medium|high|urgent>",
  "sentiment": "<positive|neutral|negative>",
  "confidenceScore": <0.0 to 1.0>,
  "aiSummary": "<brief 1-2 sentence summary of the email>",
  "suggestedResponse": "<a professional, friendly response to this email>",
  "reasoning": "<why you chose this category and response>",
  "extractedOrderId": "<order ID if mentioned, or null>",
  "tags": ["<relevant>", "<tags>"]
}

Guidelines:
- Be professional and friendly
- For simple questions (hours, shipping, returns), provide direct answers
- For complex issues, acknowledge and say someone will follow up
- Never promise refunds or shipping dates without admin approval
- Use Stockbridge Coffee brand voice: warm, knowledgeable, artisanal`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a customer service AI for Stockbridge Coffee.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as EmailCategory;
  } catch (error) {
    console.error('AI categorization failed:', error);

    // Fallback categorization
    return {
      category: 'general',
      priority: 'medium',
      sentiment: 'neutral',
      confidenceScore: 0.3,
      aiSummary: 'Unable to analyze email automatically. Manual review required.',
      suggestedResponse: 'Thank you for your email. We will review your message and respond shortly.',
      reasoning: 'AI categorization failed',
      tags: ['needs-manual-review'],
    };
  }
}

export async function processIncomingEmail(message: gmail_v1.Schema$Message): Promise<void> {
  const emailId = message.id!;
  const threadId = message.threadId!;

  try {
    // Parse email
    const parsedEmail = parseEmailMessage(message);

    // Run AI categorization
    const categorization = await categorizeEmail(parsedEmail);

    // Save to Firestore
    const emailDoc = {
      emailId,
      threadId,
      from: parsedEmail.from,
      subject: parsedEmail.subject,
      body: parsedEmail.body,
      bodyHtml: parsedEmail.bodyHtml,
      receivedAt: parsedEmail.receivedAt,
      category: categorization.category,
      priority: categorization.priority,
      sentiment: categorization.sentiment,
      confidenceScore: categorization.confidenceScore,
      aiSummary: categorization.aiSummary,
      extractedOrderId: categorization.extractedOrderId,
      tags: categorization.tags,
      status: 'pending',
      processedAt: new Date(),
    };

    await firestore.collection('incoming_emails').doc(emailId).set(emailDoc);

    // Determine action based on confidence and category
    const shouldAutoRespond =
      categorization.confidenceScore >= 0.85 &&
      ['product_question', 'general', 'shipping_inquiry'].includes(categorization.category) &&
      categorization.sentiment !== 'negative';

    const needsApproval =
      categorization.confidenceScore < 0.85 ||
      ['complaint', 'refund_request', 'order_issue'].includes(categorization.category) ||
      categorization.sentiment === 'negative';

    if (shouldAutoRespond) {
      // Auto-respond for high-confidence, low-risk emails
      await sendCustomerResponse({
        incomingEmailId: emailId,
        to: parsedEmail.from,
        subject: `Re: ${parsedEmail.subject}`,
        body: categorization.suggestedResponse,
        responseType: 'auto',
        confidenceScore: categorization.confidenceScore,
      });

      await firestore.collection('incoming_emails').doc(emailId).update({
        status: 'responded',
      });

      console.log(`✅ Auto-responded to ${parsedEmail.from}`);
    } else if (needsApproval) {
      // Save draft for admin approval
      await firestore.collection('email_responses').add({
        incomingEmailId: emailId,
        responseType: 'draft',
        generatedResponse: categorization.suggestedResponse,
        confidenceScore: categorization.confidenceScore,
        createdAt: new Date(),
        status: 'pending',
        reasoning: categorization.reasoning,
      });

      console.log(`📝 Draft created for ${parsedEmail.from} - awaiting approval`);
    }

    console.log(`✅ Processed email from ${parsedEmail.from}: ${categorization.category} (${categorization.priority})`);
  } catch (error) {
    console.error(`❌ Failed to process email ${emailId}:`, error);
    throw error;
  }
}
```

#### 3. Customer Response Sender

Create `scripts/send-customer-response.ts`:

```typescript
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { firestore } from '../server/src/firebase-admin';

interface ResponseData {
  incomingEmailId: string;
  to: string;
  subject: string;
  body: string;
  responseType: 'auto' | 'approved';
  confidenceScore: number;
}

export async function sendCustomerResponse(data: ResponseData): Promise<void> {
  try {
    // Set up Gmail OAuth2 transporter
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_WORKSPACE_CLIENT_ID,
      process.env.GOOGLE_WORKSPACE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_WORKSPACE_REFRESH_TOKEN,
    });

    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GOOGLE_WORKSPACE_USER,
        clientId: process.env.GOOGLE_WORKSPACE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_WORKSPACE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_WORKSPACE_REFRESH_TOKEN,
        accessToken: accessToken.token as string,
      },
    });

    // Create email with brand styling
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #4A5C5A;
      line-height: 1.6;
    }
    .content {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #2C5F5D;
      font-size: 12px;
      color: #666;
    }
    .signature {
      margin-top: 20px;
      color: #2C5F5D;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="content">
    ${data.body.split('\n').map(p => `<p>${p}</p>`).join('')}

    <div class="signature">
      <p>Best regards,<br>
      The Stockbridge Coffee Team</p>
    </div>

    <div class="footer">
      <p><strong>Stockbridge Coffee</strong><br>
      Specialty Coffee Beans | Freshly Roasted<br>
      🌐 <a href="https://stockbridgecoffee.co.uk">stockbridgecoffee.co.uk</a><br>
      📧 hello@stockbridgecoffee.co.uk</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    await transporter.sendMail({
      from: `"Stockbridge Coffee" <${process.env.GOOGLE_WORKSPACE_USER}>`,
      to: data.to,
      subject: data.subject,
      text: data.body,
      html: htmlBody,
    });

    // Log to email_responses collection
    await firestore.collection('email_responses').add({
      incomingEmailId: data.incomingEmailId,
      responseType: data.responseType,
      generatedResponse: data.body,
      confidenceScore: data.confidenceScore,
      sentAt: new Date(),
      status: 'sent',
    });

    // Update thread
    const incomingEmail = await firestore
      .collection('incoming_emails')
      .doc(data.incomingEmailId)
      .get();

    const threadId = incomingEmail.data()?.threadId;

    if (threadId) {
      const threadRef = firestore.collection('email_threads').doc(threadId);
      const threadDoc = await threadRef.get();

      if (threadDoc.exists) {
        await threadRef.update({
          messages: firestore.FieldValue.arrayUnion({
            messageId: data.incomingEmailId + '_response',
            direction: 'outbound',
            body: data.body,
            sentAt: new Date(),
            sender: process.env.GOOGLE_WORKSPACE_USER,
          }),
          lastMessageAt: new Date(),
          totalMessages: firestore.FieldValue.increment(1),
        });
      } else {
        await threadRef.set({
          threadId,
          customerEmail: data.to,
          subject: data.subject,
          messages: [{
            messageId: data.incomingEmailId + '_response',
            direction: 'outbound',
            body: data.body,
            sentAt: new Date(),
            sender: process.env.GOOGLE_WORKSPACE_USER,
          }],
          status: 'active',
          category: 'general',
          createdAt: new Date(),
          lastMessageAt: new Date(),
          totalMessages: 1,
        });
      }
    }

    console.log(`✅ Response sent to ${data.to}`);
  } catch (error) {
    console.error('❌ Failed to send customer response:', error);
    throw error;
  }
}
```

#### 4. Admin Email Digest

Create `scripts/generate-email-digest.ts`:

```typescript
import { firestore } from '../server/src/firebase-admin';
import { sendAdminDigest } from './send-admin-digest';

interface DigestData {
  pendingDrafts: number;
  autoResponded: number;
  highPriority: number;
  complaints: number;
  topCategories: Record<string, number>;
  recentEmails: Array<{
    from: string;
    subject: string;
    category: string;
    priority: string;
    receivedAt: Date;
  }>;
}

async function generateEmailDigest(): Promise<void> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch emails from last 24 hours
  const emailsSnapshot = await firestore
    .collection('incoming_emails')
    .where('receivedAt', '>=', yesterday)
    .where('receivedAt', '<', today)
    .orderBy('receivedAt', 'desc')
    .get();

  const emails = emailsSnapshot.docs.map(doc => doc.data());

  // Calculate stats
  const pendingDrafts = emails.filter(e => e.status === 'pending').length;
  const autoResponded = emails.filter(e => e.status === 'responded').length;
  const highPriority = emails.filter(e => ['high', 'urgent'].includes(e.priority)).length;
  const complaints = emails.filter(e => e.category === 'complaint').length;

  // Category breakdown
  const topCategories: Record<string, number> = {};
  emails.forEach(e => {
    topCategories[e.category] = (topCategories[e.category] || 0) + 1;
  });

  // Recent emails (top 10)
  const recentEmails = emails.slice(0, 10).map(e => ({
    from: e.from,
    subject: e.subject,
    category: e.category,
    priority: e.priority,
    receivedAt: e.receivedAt.toDate(),
  }));

  const digestData: DigestData = {
    pendingDrafts,
    autoResponded,
    highPriority,
    complaints,
    topCategories,
    recentEmails,
  };

  await sendAdminDigest(digestData);
  console.log('✅ Daily email digest sent to admin');
}

// Run digest generation
generateEmailDigest().catch(console.error);
```

#### 5. Process Manager (PM2 or systemd)

Create `ecosystem.config.js` for PM2:

```javascript
module.exports = {
  apps: [
    {
      name: 'email-monitor',
      script: 'scripts/monitor-inbox.ts',
      interpreter: 'tsx',
      cwd: '/coffee-website-react',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

Start the monitor:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Implementation Guide

### Phase 1: Order Notifications (Week 1)

**Tasks:**
1. ✅ Set up Google Workspace account
2. ✅ Configure domain DNS records
3. ✅ Create OAuth credentials
4. ✅ Generate refresh token
5. ✅ Update environment variables
6. ✅ Create order notification email template
7. ✅ Implement `send-order-notification.ts` script
8. ✅ Integrate with Stripe webhook in `server.ts`
9. ✅ Test with real order
10. ✅ Deploy to production

**Acceptance Criteria:**
- Admin receives email within 30 seconds of order placement
- Email contains order summary, inventory alerts, and customer insights
- Logs saved to Firestore for audit trail

### Phase 2: AI Email Automation (Week 2-3)

**Tasks:**
1. ✅ Implement email monitor script
2. ✅ Create AI categorization system
3. ✅ Build response generation logic
4. ✅ Implement safety guardrails
5. ✅ Create admin approval interface (Firestore)
6. ✅ Set up email sending system
7. ✅ Test with sample emails
8. ✅ Deploy monitor as background process
9. ✅ Monitor AI accuracy and adjust thresholds

**Acceptance Criteria:**
- Emails categorized with >80% accuracy
- High-confidence responses auto-sent within 5 minutes
- Complex issues flagged for admin review
- All responses logged for audit

### Phase 3: Admin Dashboard Integration (Week 4)

**Tasks:**
1. ✅ Create admin page for email queue
2. ✅ Build approval interface for draft responses
3. ✅ Add email analytics dashboard
4. ✅ Implement manual response composer
5. ✅ Add email thread view
6. ✅ Create daily digest email

**Acceptance Criteria:**
- Admin can view all pending emails
- One-click approval for AI drafts
- Edit drafts before sending
- View conversation history
- Analytics on response times and customer satisfaction

### Phase 4: Optimization & Scaling (Ongoing)

**Tasks:**
1. ✅ Migrate from polling to Gmail push notifications
2. ✅ Fine-tune AI categorization prompts
3. ✅ A/B test different response templates
4. ✅ Monitor deliverability and spam scores
5. ✅ Implement email routing rules
6. ✅ Add customer satisfaction surveys

---

## Testing & Deployment

### Testing Order Notifications

1. **Local Testing**
   ```bash
   npm run test:order-notification
   ```

2. **End-to-End Test**
   - Place test order on staging site
   - Verify Stripe webhook triggers
   - Check admin email received
   - Verify Firestore logs

3. **Load Testing**
   - Simulate 10 orders in quick succession
   - Verify all notifications sent
   - Check for race conditions

### Testing AI Email System

1. **Sample Email Tests**

   Create test emails:

   **Simple Product Question:**
   ```
   From: customer@example.com
   Subject: What brewing method is best for Ethiopian coffee?
   Body: Hi, I'm new to specialty coffee. What brewing method do you recommend for Ethiopian beans?
   ```

   Expected: Auto-respond with brewing recommendations

   **Order Issue:**
   ```
   From: customer@example.com
   Subject: My order hasn't arrived
   Body: I ordered coffee 2 weeks ago (order #12345) and it still hasn't arrived. Can you help?
   ```

   Expected: Draft response for admin approval, high priority

   **Complaint:**
   ```
   From: customer@example.com
   Subject: Very disappointed
   Body: The coffee I received was stale and tasted terrible. I want a refund.
   ```

   Expected: Escalate to admin immediately, negative sentiment, urgent priority

2. **Dry-Run Mode**

   Add flag to skip actual email sending:
   ```bash
   DRY_RUN=true npm run monitor:inbox
   ```

3. **AI Accuracy Monitoring**

   Create dashboard to track:
   - Categorization accuracy (manually verify first 50 emails)
   - Confidence scores distribution
   - Auto-response vs manual approval ratio
   - Customer satisfaction (from follow-up surveys)

### Deployment Checklist

**Pre-Deployment:**
- [ ] Environment variables set in production
- [ ] Firebase rules allow server writes
- [ ] OAuth refresh token tested
- [ ] Email templates reviewed
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] Logging configured

**Deployment:**
- [ ] Deploy server with order notification integration
- [ ] Start email monitor process (PM2)
- [ ] Set up daily digest cron job
- [ ] Configure alerts for failures
- [ ] Monitor first 24 hours closely

**Post-Deployment:**
- [ ] Verify first order notification
- [ ] Check first auto-response
- [ ] Review AI categorization accuracy
- [ ] Monitor Gmail API quota usage
- [ ] Check error logs

### Monitoring & Alerts

**Key Metrics:**
- Order notifications sent (vs orders created)
- Email processing time
- AI confidence scores
- Auto-response rate
- Admin approval time
- Customer satisfaction scores
- Gmail API quota usage

**Alert Thresholds:**
- Order notification failure (immediate alert)
- Email processing backlog >10 (alert admin)
- AI confidence drop below 70% (review prompts)
- Gmail API quota >80% (upgrade plan)

---

## Troubleshooting

### Common Issues

#### 1. OAuth Token Expired

**Symptoms:**
- 401 Unauthorized errors
- "Invalid credentials" messages

**Solution:**
```bash
# Regenerate refresh token
cd scripts
npm run workspace:auth

# Update .env.local with new token
# Restart server and email monitor
```

#### 2. Emails Not Sending

**Symptoms:**
- No errors, but emails not received
- Stuck in Firestore queue

**Diagnostic Steps:**
```bash
# Check Gmail API quota
gcloud monitoring dashboards list --project=stockbridge-coffee-workspace

# Test Gmail connection
npm run test:workspace-email

# Check for blocks/spam
# Log into hello@stockbridgecoffee.co.uk and check Sent folder
```

**Common Causes:**
- Daily sending limit reached (2000/day for Workspace)
- Domain not verified
- SPF/DKIM not configured
- Recipient marked as spam

#### 3. AI Categorization Inaccurate

**Symptoms:**
- Wrong categories assigned
- Low confidence scores
- Auto-responses inappropriate

**Solution:**
- Review AI prompts in `process-incoming-email.ts`
- Adjust confidence thresholds (currently 0.85 for auto-send)
- Fine-tune OpenAI system prompt
- Consider switching to Gemini for cost savings

#### 4. Email Monitor Crashed

**Symptoms:**
- PM2 shows "errored" status
- No new emails being processed

**Diagnostic Steps:**
```bash
# Check PM2 logs
pm2 logs email-monitor

# Check for memory issues
pm2 status

# Restart monitor
pm2 restart email-monitor
```

#### 5. High Gmail API Quota Usage

**Symptoms:**
- API quota warnings
- Rate limit errors

**Solution:**
- Increase polling interval (`EMAIL_CHECK_INTERVAL`)
- Migrate to push notifications (Cloud Pub/Sub)
- Implement caching for frequently accessed data
- Use batch requests where possible

### Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 401 | Invalid credentials | Refresh OAuth token |
| 403 | Permission denied | Check API scopes |
| 429 | Rate limit exceeded | Reduce request frequency |
| 500 | Gmail server error | Retry with exponential backoff |
| 503 | Service unavailable | Check Google Workspace status |

### Getting Help

**Resources:**
- Google Workspace Admin Help: https://support.google.com/a
- Gmail API Documentation: https://developers.google.com/gmail/api
- Cloudflare DNS Docs: https://developers.cloudflare.com/dns

**Support Contacts:**
- Google Workspace Support: support.google.com/a (admin@stockbridgecoffee.co.uk)
- Cloudflare Support: support.cloudflare.com
- Internal: admin@stockbridgecoffee.co.uk

---

## Cost Analysis

### Google Workspace

**Business Starter Plan:**
- **Price:** £4.60/user/month (£55.20/year)
- **Users:** 1 (hello@stockbridgecoffee.co.uk)
- **Includes:**
  - Custom domain email
  - 30GB storage per user
  - 2,000 emails/day sending limit
  - Standard security
  - 24/7 support

**Total:** £55.20/year

### Gmail API Usage

**Free Tier:**
- 1 billion quota units/day
- Most API calls = 5-25 units
- Newsletter sending: ~10 units/email
- Email monitoring: ~5 units/check

**Estimated Usage:**
- Newsletter: 100 subscribers × 10 units = 1,000 units/week
- Order notifications: 20 orders/day × 10 units = 200 units/day
- Email monitoring: 288 checks/day × 5 units = 1,440 units/day
- **Total: ~3,000 units/day** (well within free tier)

**Cost:** £0/month

### OpenAI API (AI Email Processing)

**Model:** GPT-4o
- **Input:** $5 / 1M tokens
- **Output:** $15 / 1M tokens

**Estimated Usage:**
- Average email: ~500 tokens input, ~200 tokens output
- 10 emails/day average
- Monthly: 300 emails
  - Input: 150,000 tokens = $0.75
  - Output: 60,000 tokens = $0.90
  - **Total: $1.65/month**

**Alternative: Gemini 2.0 Flash** (cheaper)
- Free tier: 1500 requests/day
- Above free tier: much cheaper than OpenAI
- **Estimated: $0-0.50/month**

### Cloud Pub/Sub (Push Notifications)

**If migrating from polling:**
- First 10GB/month: Free
- Beyond: $0.40/million operations
- Estimated: <$1/month for low volume

**Cost:** ~£1/month

### Total Monthly Cost

| Service | Cost |
|---------|------|
| Google Workspace | £4.60 |
| Gmail API | £0 |
| OpenAI API | £1.50 |
| Cloud Pub/Sub | £1 |
| **TOTAL** | **£7.10/month** |

**Annual:** £85/year

### Cost Optimization Tips

1. **Use Gemini instead of OpenAI** - Save ~£1/month
2. **Batch email processing** - Reduce API calls
3. **Implement caching** - Avoid redundant AI calls
4. **Monitor quotas** - Stay within free tiers
5. **Only send necessary emails** - Reduce noise

### ROI Analysis

**Benefits:**
- **Time Saved:** ~2 hours/day on email management (£40/day = £1,200/month)
- **Customer Satisfaction:** Faster responses, better experience
- **Professional Brand:** Custom domain email
- **Scalability:** Handles growth without manual work

**ROI:** ~170x (£1,200 saved / £7 cost)

---

## Appendices

### A. Package.json Scripts

Add to `/coffee-website-react/package.json`:

```json
{
  "scripts": {
    "workspace:auth": "tsx scripts/gmail-auth.ts",
    "test:workspace-email": "tsx scripts/test-workspace-email.ts",
    "test:order-notification": "tsx scripts/test-order-notification.ts",
    "monitor:inbox": "tsx scripts/monitor-inbox.ts",
    "send:customer-response": "tsx scripts/send-customer-response.ts",
    "generate:email-digest": "tsx scripts/generate-email-digest.ts"
  }
}
```

### B. Firestore Security Rules

Update `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Incoming emails - server only
    match /incoming_emails/{emailId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Email responses - server only
    match /email_responses/{responseId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Email threads - server only
    match /email_threads/{threadId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Order notifications - server only
    match /order_notifications_sent/{notificationId} {
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if false; // Server writes only via Admin SDK
    }
  }
}
```

### C. Environment Variables Reference

Complete `.env.local` file:

```env
# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=coffee-65c46
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...

# Firebase Admin SDK (server-side)
FIREBASE_ADMIN_PROJECT_ID=coffee-65c46
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...

# Google Workspace Gmail
GOOGLE_WORKSPACE_USER=hello@stockbridgecoffee.co.uk
GOOGLE_WORKSPACE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_WORKSPACE_CLIENT_SECRET=...
GOOGLE_WORKSPACE_REFRESH_TOKEN=...

# Admin Notifications
ADMIN_EMAIL=your-admin@email.com

# AI Email Processing
OPENAI_API_KEY=sk-...
# OR
GEMINI_API_KEY=...

# Email Monitoring
EMAIL_CHECK_INTERVAL=300000  # 5 minutes

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Server
PORT=3001
NODE_ENV=production
```

### D. Gmail API Scopes Explained

| Scope | Permission | Used For |
|-------|-----------|----------|
| `gmail.send` | Send emails | Newsletters, order notifications, customer responses |
| `gmail.readonly` | Read emails | Monitor inbox for customer emails |
| `gmail.modify` | Modify labels | Mark emails as read after processing |
| `gmail.compose` | Draft emails | Create draft responses for admin approval |

### E. Contact Information

**Technical Owner:** Admin Team
**Email:** admin@stockbridgecoffee.co.uk
**Customer Support:** hello@stockbridgecoffee.co.uk
**Website:** https://stockbridgecoffee.co.uk

**Document Version:** 1.0
**Last Updated:** 2025-11-14
**Next Review:** 2025-12-14

---

## Quick Start Checklist

For rapid implementation, follow this checklist:

### Week 1: Order Notifications
- [ ] Sign up for Google Workspace
- [ ] Verify domain in Cloudflare
- [ ] Configure MX, SPF, DKIM records
- [ ] Create OAuth credentials
- [ ] Generate refresh token
- [ ] Update `.env.local`
- [ ] Create order notification template
- [ ] Implement `send-order-notification.ts`
- [ ] Test with sample order
- [ ] Deploy to production

### Week 2: Email Monitoring
- [ ] Implement `monitor-inbox.ts`
- [ ] Create AI categorization system
- [ ] Test with sample emails
- [ ] Deploy as PM2 process
- [ ] Monitor first 24 hours

### Week 3: AI Responses
- [ ] Implement response generator
- [ ] Create safety guardrails
- [ ] Build admin approval workflow
- [ ] Test auto-responses
- [ ] Fine-tune confidence thresholds

### Week 4: Admin Dashboard
- [ ] Create email queue interface
- [ ] Build approval system
- [ ] Add analytics dashboard
- [ ] Set up daily digest
- [ ] Train admin team

---

**End of Document**
