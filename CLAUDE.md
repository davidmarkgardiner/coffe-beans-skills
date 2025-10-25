# Claude Code Rules for Skills Management

## 1. Check Skills Before Starting Tasks

Before beginning any task, **proactively check the available skills** to see if any contain relevant instructions, patterns, or context.

### When to Check Skills

- **Before implementing features**: Check if a skill exists for the technology stack, framework, or domain (e.g., firebase-coffee-integration for Firebase work, stripe-integration for payments)
- **When working with existing patterns**: Look for skills that document established patterns in the project (e.g., premium-coffee-website for React/Vite/Tailwind patterns)
- **For specialized tasks**: Check for domain-specific skills (e.g., logo-manager for logo work, secrets-manager for environment variables)
- **When uncertain about approach**: Skills often contain decision rationale and best practices that can guide implementation

### How to Check Skills

1. Review the available skills list shown in the Skill tool
2. Read skill descriptions carefully - they indicate when to use each skill
3. For a comprehensive overview of all available skills, see [`.claude/skills/README.md`](.claude/skills/README.md)
4. If a skill seems relevant, invoke it using the Skill tool to access detailed instructions
5. Follow the patterns and guidelines provided in the skill

### Examples

```
Task: Add Firebase authentication to the app
→ Check: firebase-coffee-integration skill exists and covers Firebase Auth
→ Action: Invoke the skill before starting implementation

Task: Update the company logo with dark mode support
→ Check: logo-manager skill exists and covers logo variants and dark mode
→ Action: Invoke the skill to follow established patterns

Task: Set up payment processing
→ Check: stripe-integration skill exists
→ Action: Invoke the skill for payment workflow patterns
```

## 2. Update Skills With Lessons Learned

After completing tasks, **actively update relevant skills** with lessons learned, new patterns, gotchas, and improvements.

### What to Document

- **New patterns discovered**: Document successful approaches that worked well
- **Gotchas and pitfalls**: Record issues encountered and how to avoid them
- **Configuration details**: Add specific settings or configurations that were needed
- **Best practices**: Capture what worked better than alternatives
- **Common errors**: Document error messages and their solutions
- **Integration quirks**: Note unexpected behavior when integrating services/tools
- **Performance optimizations**: Record any performance improvements discovered

### When to Update Skills

- **After completing a feature**: If you used a skill, update it with what you learned
- **After debugging an issue**: Add the issue and solution to prevent future occurrences
- **After discovering a better approach**: Update the skill with the improved method
- **After integration work**: Document integration patterns and requirements
- **After encountering errors**: Add error handling patterns and solutions

### How to Update Skills

1. **Identify the relevant skill**: Determine which skill(s) the lessons apply to
2. **Read the current skill**: Use the Read tool to review the existing content
3. **Update strategically**:
   - Add new sections for major new topics
   - Add bullet points to existing sections for minor additions
   - Update examples to reflect current best practices
   - Add troubleshooting sections for common issues
4. **Be specific**: Include file paths, code snippets, and concrete examples
5. **Keep it actionable**: Focus on practical, reusable guidance

### Update Examples

```
Example 1: After adding Firebase deployment
→ Update: firebase-coffee-integration skill
→ Add: Deployment steps, Firebase CLI commands, configuration requirements

Example 2: After fixing CORS issues
→ Update: Relevant backend/API skill
→ Add: CORS configuration section with allowed origins and common pitfalls

Example 3: After implementing dark mode logo switching
→ Update: logo-manager skill
→ Add: Implementation details, CSS classes needed, toggle patterns

Example 4: After debugging Stripe webhook issues
→ Update: stripe-integration skill
→ Add: Webhook troubleshooting section with common errors and solutions
```

## 3. Skill Maintenance Best Practices

### Keep Skills Relevant

- Remove outdated information when approaches change
- Update file paths if project structure changes
- Maintain consistent formatting and organization
- Keep examples current with the latest codebase

### Make Skills Discoverable

- Use clear, descriptive skill names
- Write comprehensive skill descriptions that indicate when to use them
- Cross-reference related skills when appropriate
- Include keyword-rich content so skills are easy to find

### Balance Detail and Brevity

- Be comprehensive but concise
- Focus on the most important information
- Use bullet points and headings for scannability
- Include code snippets for clarity, not full files

### Version Control

- Commit skill updates with clear messages
- Explain what was learned in commit descriptions
- Group related skill updates in single commits

## 4. Creating New Skills

When you discover a pattern or domain that doesn't have a skill yet:

1. **Identify the need**: Recognize when a new skill would be valuable
2. **Check for overlap**: Ensure it doesn't duplicate existing skills
3. **Use skill-creator**: Invoke the skill-creator skill for guidance
4. **Start comprehensive**: Include all relevant context from the start
5. **Make it reusable**: Focus on patterns that will be used repeatedly

### When to Create New Skills

- New technology stack is introduced (e.g., new database, framework)
- New feature domain emerges (e.g., analytics, notifications)
- Repeated patterns are used across multiple features
- Complex integration requires documentation
- Project-specific conventions need to be captured

## 5. Continuous Improvement Mindset

Treat skills as **living documentation** that evolves with the project:

- Every completed task is an opportunity to improve skills
- Every bug fixed is knowledge to be captured
- Every pattern discovered is a reusable asset
- Every integration completed is documentation for the next time

By following these rules, skills become increasingly valuable and make future work faster and more reliable.

## Available Skills Reference

For a complete list of available skills with descriptions and use cases, see:
**[`.claude/skills/README.md`](.claude/skills/README.md)**

This reference includes:
- Overview of all project-specific skills
- When to use each skill
- Key features and capabilities
- Skill structure and organization
- Tips for effective skill usage
