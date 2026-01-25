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
"Use the firebase:firebase-coffee-integration skill to help me add authentication"
"Check the web-builder:logo-manager skill for logo implementation patterns"
```

---

## Skill Collections

Skills are organized into **10 collections** by domain:

### 📦 web-builder/
*Website development, UI/UX, and frontend design*

| Skill | Description |
|-------|-------------|
| **premium-coffee-website** | Build premium coffee websites using React, TypeScript, shadcn/ui, and Tailwind CSS |
| **frontend-enhancer** | Enhance frontend visual design and user experience |
| **ui-ux-pro-max** | Advanced UI/UX design patterns and implementation |
| **logo-manager** | Logo management, dark mode switching, and optimization |
| **seo-optimizer** | Search engine optimization best practices |

---

### 🔥 firebase/
*Firebase ecosystem and cloud infrastructure*

| Skill | Description |
|-------|-------------|
| **firebase-coffee-integration** | Integrate Firebase into React/Vite apps for inventory, auth, and orders |
| **firebase-deployment** | Firebase Hosting deployment workflows and configuration |
| **cloudflare-firebase-domain** | Connect Cloudflare-managed domains to Firebase Hosting |

---

### 💳 payments/
*Payment processing and e-commerce*

| Skill | Description |
|-------|-------------|
| **stripe-integration** | Stripe payment processing, webhooks, and checkout flows |

---

### 🚀 devops/
*CI/CD, containerization, testing, and infrastructure*

| Skill | Description |
|-------|-------------|
| **cicd-pipeline-generator** | Generate CI/CD pipelines for various platforms |
| **docker-containerization** | Docker configuration and containerization patterns |
| **github-actions-orchestrator** | Manage GitHub Actions workflows from PR to approval |
| **webapp-testing** | Playwright testing toolkit for web applications |
| **test-specialist** | Comprehensive testing strategies and implementation |
| **secrets-manager** | Secure secrets management with Teller and GCP Secret Manager |

---

### 📊 data/
*Data analysis, visualization, and reporting*

| Skill | Description |
|-------|-------------|
| **data-analyst** | Data analysis workflows and insights extraction |
| **csv-data-visualizer** | CSV data visualization and charting |
| **business-analytics-reporter** | Business analytics and reporting dashboards |

---

### 🤖 ai-content/
*AI-powered content generation and automation*

| Skill | Description |
|-------|-------------|
| **ai-content-manager** | AI-powered content generation with Google Gemini/Veo |
| **orchestration-system** | Multi-agent orchestration and workflow coordination |
| **coffee-copilot** | AI copilot chat widget with RAG and tool-calling |

---

### 📈 business/
*Business documents, strategy, and finance*

| Skill | Description |
|-------|-------------|
| **business-document-generator** | Generate professional business documents |
| **pitch-deck** | Create investor pitch decks and presentations |
| **brand-analyzer** | Brand analysis and competitive positioning |
| **research-paper-writer** | Academic and research paper writing |
| **startup-validator** | Startup idea validation frameworks |
| **finance-manager** | Financial planning and management |

---

### ✅ productivity/
*Personal productivity and lifestyle*

| Skill | Description |
|-------|-------------|
| **personal-assistant** | Personal task management and scheduling |
| **resume-manager** | Resume creation and optimization |
| **travel-planner** | Travel itinerary planning and booking |
| **nutritional-specialist** | Nutrition planning and dietary guidance |

---

### ✍️ content-creation/
*Content writing and media production*

| Skill | Description |
|-------|-------------|
| **script-writer** | Video and podcast script writing |
| **social-media-generator** | Social media content creation |
| **storyboard-manager** | Video storyboard creation and management |

---

### 🛠️ dev-tools/
*Development utilities and meta-skills*

| Skill | Description |
|-------|-------------|
| **codebase-documenter** | Automated codebase documentation generation |
| **tech-debt-analyzer** | Technical debt analysis and prioritization |
| **skill-creator** | Guide for creating new skills |
| **document-skills** | Document and organize skill collections |

---

## Directory Structure

```
.claude/skills/
├── README.md                    # This file
├── web-builder/
│   ├── premium-coffee-website/
│   ├── frontend-enhancer/
│   ├── ui-ux-pro-max/
│   ├── logo-manager/
│   └── seo-optimizer/
├── firebase/
│   ├── firebase-coffee-integration/
│   ├── firebase-deployment/
│   └── cloudflare-firebase-domain/
├── payments/
│   └── stripe-integration/
├── devops/
│   ├── cicd-pipeline-generator/
│   ├── docker-containerization/
│   ├── github-actions-orchestrator/
│   ├── webapp-testing/
│   ├── test-specialist/
│   └── secrets-manager/
├── data/
│   ├── data-analyst/
│   ├── csv-data-visualizer/
│   └── business-analytics-reporter/
├── ai-content/
│   ├── ai-content-manager/
│   ├── orchestration-system/
│   └── coffee-copilot/
├── business/
│   ├── business-document-generator/
│   ├── pitch-deck/
│   ├── brand-analyzer/
│   ├── research-paper-writer/
│   ├── startup-validator/
│   └── finance-manager/
├── productivity/
│   ├── personal-assistant/
│   ├── resume-manager/
│   ├── travel-planner/
│   └── nutritional-specialist/
├── content-creation/
│   ├── script-writer/
│   ├── social-media-generator/
│   └── storyboard-manager/
└── dev-tools/
    ├── codebase-documenter/
    ├── tech-debt-analyzer/
    ├── skill-creator/
    └── document-skills/
```

## Skill Management Rules

For detailed guidelines on how to check and update skills, see **[`/CLAUDE.md`](/CLAUDE.md)** in the project root.

### Quick Reference:

**Before starting tasks:**
- ✅ Check if a relevant skill exists in the appropriate collection
- ✅ Invoke the skill using `collection:skill-name` format
- ✅ Follow the patterns and templates provided

**After completing tasks:**
- ✅ Update relevant skills with lessons learned
- ✅ Document new patterns, gotchas, and solutions
- ✅ Add error messages and their fixes
- ✅ Include specific file paths and code examples

**Creating new skills:**
- ✅ Use the `dev-tools:skill-creator` skill for guidance
- ✅ Place the skill in the appropriate collection folder
- ✅ Update this README with the new skill

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
name: collection:skill-name
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

---

**Note:** Skills complement but don't replace good documentation. Always keep project-specific docs up to date, and use skills to capture reusable patterns that apply across multiple features or projects.
