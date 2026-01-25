# Firebase Deployment Skill

Expert guidance for Firebase Hosting deployment workflows, specializing in preview channels, CI/CD automation, and production deployment strategies.

## Quick Start

### Manual Deployment

```bash
# Deploy to preview channel
npm run build
firebase hosting:channel:deploy feature-name --expires 7d

# Deploy to production
npm run build
firebase deploy --only hosting
```

### Using Scripts

```bash
# Make scripts executable (one time)
chmod +x .claude/skills/firebase-deployment/scripts/*.sh

# Deploy to preview
./claude/skills/firebase-deployment/scripts/deploy-preview.sh staging 30d

# Deploy to production with safety checks
./claude/skills/firebase-deployment/scripts/deploy-production.sh

# Clean up old channels
./claude/skills/firebase-deployment/scripts/cleanup-channels.sh --dry-run
```

### Automated Deployment (GitHub Actions)

See `references/github-actions-setup.md` for complete setup guide.

## Directory Structure

```
firebase-deployment/
├── SKILL.md                              # Main skill documentation
├── README.md                             # This file
├── references/
│   ├── preview-channels-guide.md        # Complete preview channels guide
│   └── github-actions-setup.md          # GitHub Actions setup tutorial
├── scripts/
│   ├── deploy-preview.sh                # Preview channel deployment
│   ├── deploy-production.sh             # Production deployment with checks
│   └── cleanup-channels.sh              # Channel cleanup utility
└── templates/
    ├── github-actions-preview.yml       # PR-based preview workflow
    ├── github-actions-production.yml    # Production deployment workflow
    └── github-actions-staging.yml       # Staging deployment workflow
```

## Key Features

### 1. Preview Channels
- Deploy to temporary URLs for testing
- Share work-in-progress with stakeholders
- PR-based preview deployments
- Automatic cleanup

### 2. Automated Deployments
- GitHub Actions workflows
- PR previews with auto-comments
- Staging and production pipelines
- Environment-specific builds

### 3. Safety Checks
- Staging verification before production
- Git status verification
- Build validation
- Post-deployment checklists

### 4. Channel Management
- List, create, update, delete channels
- Bulk cleanup utilities
- Clone deployments between channels
- Custom expiration times

## Common Workflows

### Feature Development
```bash
# 1. Create feature branch
git checkout -b feature-user-auth

# 2. Make changes and test locally
npm run dev

# 3. Deploy to preview
npm run build
firebase hosting:channel:deploy feature-user-auth --expires 7d

# 4. Share preview URL for review

# 5. After approval, merge and deploy to production
git checkout main
git merge feature-user-auth
npm run build
firebase deploy --only hosting
```

### PR-Based Preview (Automated)
1. Developer creates PR
2. GitHub Action automatically builds and deploys to `pr-{number}` channel
3. Bot comments preview URL on PR
4. Reviewers test using preview URL
5. On PR merge, auto-deploy to production
6. Preview channel cleaned up when PR closes

### Staged Deployment
```bash
# 1. Deploy to staging
./scripts/deploy-preview.sh staging 30d

# 2. Test thoroughly on staging
# (manual or automated tests)

# 3. If tests pass, deploy to production
./scripts/deploy-production.sh
```

## Prerequisites

- **Firebase CLI:** `npm install -g firebase-tools`
- **Authentication:** `firebase login`
- **Project Setup:** `firebase init`
- **Build Process:** Working `npm run build` command
- **Configuration:** Valid `firebase.json`

## Quick Reference

```bash
# List all channels
firebase hosting:channel:list

# Deploy to preview channel
firebase hosting:channel:deploy CHANNEL_ID --expires 7d

# Delete preview channel
firebase hosting:channel:delete CHANNEL_ID

# Clone staging to production
firebase hosting:clone PROJECT:staging PROJECT:live

# Deploy to production
firebase deploy --only hosting

# Open channel in browser
firebase hosting:channel:open CHANNEL_ID
```

## Documentation

- **SKILL.md** - Comprehensive skill guide with workflows and best practices
- **preview-channels-guide.md** - Complete guide to preview channels
- **github-actions-setup.md** - Step-by-step CI/CD setup

## Scripts

All scripts include:
- ✅ Input validation
- ✅ Prerequisite checks
- ✅ Colored output
- ✅ Error handling
- ✅ Confirmation prompts
- ✅ Help messages

Run any script with `--help` for usage information.

## Templates

GitHub Actions workflow templates for:
- **PR Preview** - Auto-deploy on PR, auto-cleanup on close
- **Production** - Deploy on merge to main
- **Staging** - Deploy on push to develop/staging branch

Copy templates to `.github/workflows/` and configure secrets.

## Tips

1. **Use descriptive channel names:** `feature-auth`, `pr-123`, `staging`
2. **Set appropriate expiration times:**
   - Features: 7 days
   - Staging: 30 days
   - Demos: Custom
3. **Always preview before production**
4. **Automate repetitive deployments with GitHub Actions**
5. **Clean up unused channels regularly**
6. **Use environment-specific builds** (staging vs production)

## Troubleshooting

Common issues and solutions:

- **403 Error:** Check authentication and permissions
- **404 on Preview:** Verify build output directory
- **Old Content:** Clear browser cache
- **Invalid Channel Name:** Use lowercase, alphanumeric, hyphens only

See SKILL.md for detailed troubleshooting guide.

## Next Steps

1. Read `SKILL.md` for complete documentation
2. Set up GitHub Actions using `references/github-actions-setup.md`
3. Test preview deployment with `scripts/deploy-preview.sh`
4. Configure your team's deployment workflow
5. Document project-specific deployment procedures

## Support

- Firebase Docs: https://firebase.google.com/docs/hosting
- Firebase CLI: https://firebase.google.com/docs/cli
- GitHub Actions: https://docs.github.com/en/actions

## Contributing

To improve this skill:
1. Update documentation with lessons learned
2. Add new scripts for common tasks
3. Create examples for different use cases
4. Document project-specific configurations
