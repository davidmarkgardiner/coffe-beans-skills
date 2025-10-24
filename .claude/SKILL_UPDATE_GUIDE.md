# Skill Update Guide

## When to Update Skills

After successfully completing a task using a skill, always update the skill documentation with:
- Lessons learned
- Common pitfalls encountered
- Solutions that worked
- Best practices discovered
- Framework-specific quirks
- Troubleshooting steps

## What to Document

### 1. **Environment-Specific Issues**
Document issues related to specific frameworks, tools, or environments:
- Vite vs Next.js vs Create React App differences
- Environment variable loading behavior
- Build tool quirks
- Configuration requirements

**Example:**
```markdown
### Vite Environment Variables
- Must be in project root (e.g., `app/.env`)
- Require `VITE_` prefix for frontend access
- Require server restart to pick up changes
- Not available in terminal/shell (build-time only)
```

### 2. **Import/Module Issues**
Document TypeScript/JavaScript import problems:
- Type imports vs runtime imports
- Module resolution issues
- Export/import naming conflicts

**Example:**
```markdown
### TypeScript Import Fix
Use `import type` for types to avoid runtime errors:

```typescript
// ✅ Correct
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

// ❌ Wrong (causes "export not found" errors)
import { loadStripe, Stripe } from '@stripe/stripe-js';
```
```

### 3. **Testing Strategies**
Document testing approaches that worked:
- End-to-end testing with Playwright
- Unit testing strategies
- Integration testing patterns
- Test scripts and commands

**Example:**
```markdown
### Automated Testing with Playwright
Use Playwright for complete flow testing:
1. Navigate and wait for networkidle
2. Interact with elements
3. Wait for async operations
4. Capture screenshots for verification
5. Assert expected outcomes
```

### 4. **Troubleshooting Steps**
Add troubleshooting entries for every error encountered:
- Error message
- Root cause
- Step-by-step solution
- Prevention tips

**Example:**
```markdown
### "Publishable key is not set" Error
**Cause:** Environment variable not loaded
**Solution:**
1. Ensure `.env` in correct location
2. Restart dev server
3. Verify variable name/prefix
4. Check for typos
```

### 5. **Configuration Examples**
Provide working configuration snippets:
- Server setup
- Proxy configuration
- Build tool settings
- Package.json scripts

**Example:**
```markdown
### Vite Proxy Configuration
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```
```

### 6. **Workflow Improvements**
Document workflow refinements:
- Better order of operations
- Time-saving shortcuts
- Automated scripts
- Validation steps

## Update Process

### Step 1: Identify What to Document
While working on the task, note:
- [ ] Errors encountered
- [ ] Solutions that worked
- [ ] Unexpected behaviors
- [ ] Framework-specific issues
- [ ] Configuration challenges
- [ ] Testing discoveries

### Step 2: Locate Relevant Sections
Find where in the skill document to add updates:
- Quick Start / Setup sections for environment issues
- Dependencies section for installation issues
- Troubleshooting section for errors
- Best Practices section for lessons learned
- Testing section for test strategies

### Step 3: Update Documentation
Add clear, actionable information:
- Use headers for easy scanning
- Provide code examples
- Show both wrong and right approaches
- Explain the "why" not just the "how"

### Step 4: Test Your Updates
Verify documentation changes:
- [ ] Examples are accurate
- [ ] Commands are correct
- [ ] Code snippets are tested
- [ ] Links work
- [ ] Formatting is consistent

## Documentation Standards

### Writing Style
- **Clear and concise:** Get to the point quickly
- **Actionable:** Provide specific steps, not vague advice
- **Example-driven:** Show code, don't just describe
- **Error-focused:** Lead with the symptom, then the solution

### Code Examples
```markdown
// ✅ Good example - shows both approaches
// ✅ Correct
const result = doItThisWay();

// ❌ Wrong
const result = notThisWay();
```

### Structure
1. **Problem/Symptom** (what the user sees)
2. **Cause** (why it happens)
3. **Solution** (how to fix it)
4. **Prevention** (how to avoid it)

### Formatting
- Use `**bold**` for emphasis
- Use `code blocks` for commands and code
- Use emoji sparingly (✅ ❌ ⚠️ 💡)
- Use lists for steps
- Use headers for organization

## Example Updates

### Before (Generic)
```markdown
## Setup
Install dependencies and configure environment variables.
```

### After (Specific)
```markdown
## Setup

### 1. Install Dependencies
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Configure Environment Variables
**CRITICAL:** For Vite/React, `.env` must be in project root with `VITE_` prefix:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
```

**⚠️ Common Mistake:** Vite requires server restart to pick up `.env` changes.
```

## Skill Types to Update

### Integration Skills
(Stripe, Firebase, Auth0, etc.)
- API key management
- SDK configuration
- Error handling
- Testing strategies

### Framework Skills
(React, Next.js, Vite, etc.)
- Build configuration
- Environment setup
- Deployment issues
- Performance tips

### Testing Skills
(Playwright, Jest, Cypress, etc.)
- Test patterns
- Debugging techniques
- CI/CD integration
- Screenshot strategies

### DevOps Skills
(Docker, Kubernetes, CI/CD, etc.)
- Configuration files
- Deployment steps
- Troubleshooting
- Security practices

## Checklist for Skill Updates

After completing a task with a skill:

- [ ] Document all errors encountered
- [ ] Add troubleshooting steps
- [ ] Update configuration examples
- [ ] Add framework-specific notes
- [ ] Include working code snippets
- [ ] Test documentation accuracy
- [ ] Update best practices
- [ ] Add testing strategies
- [ ] Include lessons learned
- [ ] Update quick start if needed

## Benefits

Updating skills after successful use:
1. **Helps future you** - Don't repeat the same debugging
2. **Helps the team** - Share solutions with others
3. **Improves the skill** - Make it more robust and comprehensive
4. **Saves time** - Faster setup and fewer errors next time
5. **Builds knowledge** - Create institutional memory

## Remember

> "The best time to document is right after you figure it out, when the solution is fresh in your mind and the pain is still memorable."

Update skills while the experience is fresh. Future you (and your teammates) will thank you!
