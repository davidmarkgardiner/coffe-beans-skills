# Skills Directory

This directory contains **Claude Code skills** - reusable knowledge modules that provide specialized guidance, templates, and best practices for common development tasks in this project.

## What are Skills?

Skills are structured markdown files that Claude Code can invoke to access detailed implementation guides, patterns, and lessons learned. They serve as living documentation that:

- **Capture proven patterns** and best practices from completed work
- **Provide ready-to-use templates** for common tasks
- **Document lessons learned** and gotchas to avoid
- **Enable consistent implementation** across the project
- **Speed up development** by providing instant access to detailed guides

## How to Use Skills

Skills are automatically available when using Claude Code. When you start a task, Claude will:

1. **Check for relevant skills** based on your request
2. **Invoke appropriate skills** to access detailed guidance
3. **Follow the patterns** and templates provided
4. **Update skills** with lessons learned after completing tasks

You can also manually invoke a skill by asking Claude to use it:
```
"Use the firebase-coffee-integration skill to help me add authentication"
"Check the logo-manager skill for logo implementation patterns"
```

## Available Skills

### Project-Specific Skills

#### ai-content-manager
**Description:** Expert AI-powered content management and generation for coffee e-commerce websites. Automates weekly creation of seasonal videos and images using Google Gemini/Veo, manages content rotation via Firebase, and integrates dynamic backgrounds into React components.

**Use when:**
- Setting up AI-powered content generation for website backgrounds
- Implementing seasonal/holiday content automation
- Building dynamic content rotation systems (videos, images)
- Integrating Google Gemini/Veo APIs for media generation
- Creating automated workflows for weekly content creation
- Managing content libraries in Firebase Storage and Firestore
- Updating Hero components with AI-generated backgrounds

**Key features:**
- Comprehensive seasonal prompt library (Winter, Spring, Summer, Autumn)
- Holiday-specific content generation (Christmas, Easter, Halloween, etc.)
- Firebase Storage and Firestore integration
- React hooks for content rotation (`useContentRotation`)
- ContentRotationProvider for global state management
- GitHub Actions workflow for weekly automated generation
- Auto-publish workflow (no manual approval required)
- Complete TypeScript types and interfaces
- Cost optimization strategies

**Tech stack:**
- Google Gemini API (Imagen for photos, Veo for videos)
- Firebase (Storage, Firestore)
- React + TypeScript hooks
- GitHub Actions automation
- Node.js generation scripts

---

#### github-actions-orchestrator
**Description:** Expert GitHub Actions orchestrator that manages the complete automated workflow lifecycle from PR creation through approval. Monitors workflow runs, fixes issues, and ensures PRs pass through all automated checks.

**Use when:**
- Running end-to-end workflow validation
- Creating PRs and monitoring automated workflows
- Debugging workflow failures (fast-pre-checks, firebase-preview, code-review)
- Responding to @claude tags in PR comments
- Fixing workflow configuration issues
- Validating the complete automation pipeline works

**Key features:**
- Complete PR creation and monitoring scripts
- Workflow diagnostic commands (`gh run view`, `gh run watch`)
- Artifact downloading and analysis (Playwright reports)
- Issue diagnosis and resolution patterns
- End-to-end validation process
- Iteration monitoring and management
- Success criteria checklist

**Workflows managed:**
- `fast-pre-checks.yml` - Type check, lint, build, unit tests
- `firebase-preview.yml` - Deploy + E2E tests against preview URL
- `claude-code-review-custom.yml` - Code review with E2E results
- `claude.yml` - Responds to @claude mentions

**Expected timeline:** 9-20 min for first-pass approval

---

#### coffee-copilot
**Description:** Implement an AI-powered copilot chat widget for web applications with RAG (Retrieval-Augmented Generation), order management, and GitHub issue integration.

**Use when:**
- Implementing conversational AI features
- Building customer support automation with product knowledge retrieval
- Creating chatbots with tool-calling capabilities
- Setting up RAG for documentation search
- Integrating OpenAI tool-calling API with backend services

**Key features:**
- Complete backend and frontend templates
- Mode-based control (chat vs bug report)
- Vector database integration (pgvector, Pinecone, Qdrant)
- GitHub Actions integration for automatic bug fixing
- Production deployment guides

---

#### firebase-coffee-integration
**Description:** Integrate Firebase into React/Vite coffee e-commerce applications for inventory management, user authentication, order tracking, and real-time database operations.

**Use when:**
- Implementing Firebase Firestore or Firebase Auth
- Setting up product/order management
- Building shopping cart functionality
- Creating admin dashboards
- Deploying to Firebase Hosting

**Key features:**
- Firebase setup and configuration
- Authentication patterns
- Firestore data modeling
- Real-time database operations
- Deployment scripts and CLI reference

---

#### logo-manager
**Description:** Tools and workflows for implementing, managing, and displaying company logos on websites with support for multiple color variants, dark mode switching, seasonal variations, and responsive sizing.

**Use when:**
- Adding logos to navigation bars, hero sections, or footers
- Implementing dark mode logo switching
- Creating seasonal logo variations
- Extracting logo variants from composite images
- Optimizing logo performance and accessibility
- Fixing logo spelling errors or color issues

**Key features:**
- React Logo component with multiple variants (teal, golden, grey)
- Extraction scripts for composite images
- Export tools for various formats (PNG, WebP, favicons)
- Bright variant creation for dark backgrounds
- Hero section redesign patterns
- Comprehensive sizing and accessibility guidelines

---

#### premium-coffee-website
**Description:** Build premium coffee websites using React, TypeScript, shadcn/ui, and Tailwind CSS with sophisticated aesthetics, smooth animations, and modern design patterns.

**Use when:**
- Building new React/Vite websites
- Implementing Tailwind CSS styling
- Adding shadcn/ui components
- Creating sophisticated UI animations
- Following established design patterns

**Stack:** Always builds with Vite + React + TypeScript + Tailwind CSS

---

#### stripe-integration
**Description:** Integrate Stripe payment processing into coffee beans e-commerce applications.

**Use when:**
- Implementing payment workflows
- Setting up Stripe API endpoints
- Handling webhooks
- Configuring payment forms for one-time purchases
- Testing with Stripe test cards

**Key features:**
- Payment workflow templates
- Webhook handling patterns
- Test card automation
- Production transition guide

---

#### cloudflare-firebase-domain
**Description:** Expert guidance for connecting Cloudflare-managed domains to Firebase Hosting, including manual setup steps, DNS configuration, SSL/TLS provisioning, and automated Cloudflare API scripts.

**Use when:**
- Configuring custom domains for Firebase-hosted applications
- Setting up Cloudflare DNS with Firebase
- Troubleshooting SSL/TLS provisioning
- Automating DNS record management

---

#### secrets-manager
**Description:** Secure secrets management using Teller and Google Cloud Secret Manager for any repository or device.

**Use when:**
- Setting up secret management
- Initializing .env files from cloud secrets
- Migrating secrets to Google Secret Manager
- Ensuring secrets are properly git-ignored
- Syncing secrets across development environments

**Key features:**
- Teller configuration
- Google Cloud Secret Manager integration
- Secret syncing and uploading workflows
- Authentication setup

---

#### webapp-testing
**Description:** Toolkit for interacting with and testing local web applications using Playwright.

**Use when:**
- Verifying frontend functionality
- Debugging UI behavior
- Capturing browser screenshots
- Viewing browser logs
- Testing local web applications

---

#### skill-creator
**Description:** Guide for creating effective skills that extend Claude's capabilities with specialized knowledge, workflows, or tool integrations.

**Use when:**
- Creating a new skill
- Updating an existing skill
- Learning skill best practices
- Structuring skill documentation

---

## Skill Management Rules

For detailed guidelines on how to check and update skills, see **[`/claude.md`](/claude.md)** in the project root.

### Quick Reference:

**Before starting tasks:**
- ✅ Check if a relevant skill exists
- ✅ Invoke the skill to access detailed guidance
- ✅ Follow the patterns and templates provided

**After completing tasks:**
- ✅ Update relevant skills with lessons learned
- ✅ Document new patterns, gotchas, and solutions
- ✅ Add error messages and their fixes
- ✅ Include specific file paths and code examples

**Creating new skills:**
- ✅ Use the skill-creator skill for guidance
- ✅ Make skills comprehensive but concise
- ✅ Include ready-to-use templates and examples
- ✅ Focus on reusable patterns

## Skill Structure

Each skill typically contains:

```
skill-name/
├── skill.md              # Main skill content with frontmatter
├── assets/               # Templates, scripts, code examples
├── references/           # Additional documentation and guides
└── scripts/              # Automation scripts and tools
```

**Frontmatter format:**
```yaml
---
name: skill-name
description: When to use this skill and what it provides
---
```

## Contributing to Skills

Skills are **living documentation** that should evolve with the project:

1. **After every completed task**, consider what was learned
2. **Update relevant skills** with new patterns and gotchas
3. **Be specific** - include file paths, line numbers, and concrete examples
4. **Keep it actionable** - focus on practical, reusable guidance
5. **Commit changes** with clear messages explaining what was learned

## Tips for Effective Skill Usage

### For Users:
- **Be specific** when asking Claude for help - mention relevant technologies
- **Ask Claude to check skills** if you're unsure whether guidance exists
- **Request skill updates** after debugging complex issues

### For Claude:
- **Proactively invoke skills** when tasks match skill descriptions
- **Follow patterns exactly** - skills contain proven approaches
- **Update skills immediately** after completing tasks while details are fresh
- **Cross-reference skills** when multiple skills apply to a task

## Directory Organization

```
.claude/skills/
├── README.md                        # This file
├── ai-content-manager/              # AI content generation & rotation
├── cloudflare-firebase-domain/      # Cloudflare + Firebase domain setup
├── coffee-copilot/                  # AI copilot implementation
├── firebase-coffee-integration/     # Firebase integration patterns
├── github-actions-orchestrator/     # GitHub Actions workflow management
├── logo-manager/                    # Logo management and optimization
├── premium-coffee-website/          # Premium website patterns
├── secrets-manager/                 # Secret management workflows
├── skill-creator/                   # Skill creation guide
├── stripe-integration/              # Stripe payment processing
└── webapp-testing/                  # Playwright testing toolkit
```

## Related Documentation

- **`/claude.md`** - Complete rules for checking and updating skills
- **`.claude/commands/`** - Slash commands for common tasks
- **Project root README** - Main project documentation

---

**Note:** Skills complement but don't replace good documentation. Always keep project-specific docs up to date, and use skills to capture reusable patterns that apply across multiple features or projects.
