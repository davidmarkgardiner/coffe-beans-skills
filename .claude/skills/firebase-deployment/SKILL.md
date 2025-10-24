# Firebase Deployment Expert

Expert guidance for Firebase Hosting deployment workflows, specializing in preview channels, CI/CD automation, and production deployment strategies.

## When to Use This Skill

Use this skill when you need to:
- Deploy web applications to Firebase Hosting with preview channels
- Set up staging/preview environments before production deployment
- Configure CI/CD pipelines for automated Firebase deployments
- Manage multiple hosting environments and channels
- Implement PR-based preview deployments with GitHub Actions
- Troubleshoot Firebase CLI deployment issues
- Clone deployments between channels
- Configure custom domains and environment-specific settings

## Core Capabilities

### 1. Preview Channel Deployments
- Create temporary preview URLs for testing
- Deploy feature branches to isolated environments
- Share work-in-progress with stakeholders
- Test changes before production deployment

### 2. Production Deployment Workflows
- Safe deployment patterns (preview → test → production)
- Rollback strategies
- Version management
- Traffic splitting and gradual rollouts

### 3. CI/CD Automation
- GitHub Actions workflows for automated deployments
- PR-based preview channels
- Automated testing before deployment
- Environment-specific build configurations

### 4. Channel Management
- Create, list, and delete preview channels
- Set custom expiration times
- Clone deployments between channels
- Promote previews to production

## Prerequisites Knowledge

Before using this skill, ensure:
- Firebase CLI is installed (`npm install -g firebase-tools`)
- User is authenticated (`firebase login`)
- Project is initialized with Firebase Hosting (`firebase init`)
- `firebase.json` configuration exists
- Build process is working (`npm run build`)

## Key Commands Reference

### Deploy to Preview Channel
```bash
firebase hosting:channel:deploy CHANNEL_ID
```

### Deploy with Custom Expiration
```bash
firebase hosting:channel:deploy CHANNEL_ID --expires 30d
```

### List All Channels
```bash
firebase hosting:channel:list
```

### Delete Preview Channel
```bash
firebase hosting:channel:delete CHANNEL_ID
```

### Clone to Production
```bash
firebase hosting:clone SOURCE_SITE_ID:CHANNEL_ID TARGET_SITE_ID:live
```

### Deploy to Production (Live)
```bash
firebase deploy --only hosting
```

## Workflow Patterns

### Pattern 1: Feature Development Workflow
1. Create feature branch
2. Make changes and test locally
3. Build the application
4. Deploy to preview channel matching branch name
5. Share preview URL for review
6. After approval, merge to main
7. Deploy to production

### Pattern 2: PR-Based Preview (Automated)
1. Developer opens PR
2. GitHub Action triggers automatically
3. Builds the application
4. Deploys to preview channel (e.g., `pr-123`)
5. Bot comments preview URL on PR
6. Reviewers test using preview URL
7. On merge, deploy to production
8. Preview channel auto-expires or is deleted

### Pattern 3: Staged Deployment
1. Deploy to `staging` channel first
2. Run integration tests
3. Manual or automated approval
4. Clone staging deployment to `production`
5. Monitor production metrics

## Environment-Specific Configurations

### Using Multiple Firebase Projects
```bash
# Deploy to staging project
firebase use staging
firebase deploy --only hosting

# Deploy to production project
firebase use production
firebase deploy --only hosting
```

### Environment Variables in Build
```bash
# Build with staging environment
VITE_ENV=staging npm run build
firebase hosting:channel:deploy staging

# Build with production environment
VITE_ENV=production npm run build
firebase deploy --only hosting
```

## Common Issues and Solutions

### Issue: "Error: HTTP Error: 403, Missing necessary permission"
**Solution:** Ensure you're logged in with correct account:
```bash
firebase logout
firebase login
firebase use --add
```

### Issue: "Error: Cannot understand what targets to deploy"
**Solution:** Check `firebase.json` has hosting configuration:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

### Issue: Preview URL shows 404
**Solution:** Verify build output directory matches `firebase.json`:
- Check `public` field in `firebase.json`
- Ensure build command output matches (e.g., `dist`, `build`, `out`)
- Run build command before deploying

### Issue: "Channel name contains invalid characters"
**Solution:** Channel IDs must be lowercase alphanumeric with hyphens:
- Valid: `feature-login`, `pr-123`, `staging`
- Invalid: `Feature_Login`, `PR#123`, `staging.env`

## Best Practices

1. **Naming Conventions**
   - Use branch names for feature previews: `feature-auth`
   - Use PR numbers for automated previews: `pr-123`
   - Use descriptive names for long-lived channels: `staging`, `qa`

2. **Expiration Times**
   - Short-lived features: 7 days (default)
   - PR previews: Until PR closed
   - Staging environments: 30+ days
   - Demo channels: Custom based on need

3. **Security**
   - Don't commit Firebase tokens to git
   - Use GitHub Secrets for CI/CD tokens
   - Review Firebase security rules before production
   - Keep Firebase CLI updated

4. **Performance**
   - Build optimized production bundles
   - Enable caching in `firebase.json`
   - Use CDN for static assets
   - Monitor bundle sizes

5. **Workflow Organization**
   - Always preview before production
   - Automate repetitive deployments
   - Document deployment process
   - Use semantic versioning for releases

## Integration with CI/CD

### GitHub Actions Example
See `templates/github-actions-preview.yml` for a complete workflow that:
- Deploys preview channel on PR creation
- Updates preview on new commits
- Comments preview URL on PR
- Cleans up channel when PR closes

### GitLab CI Example
See `templates/gitlab-ci-preview.yml` for GitLab CI/CD configuration

## Advanced Features

### Traffic Splitting
```bash
# Route 90% to live, 10% to canary channel
firebase hosting:channel:deploy canary
# Configure in Firebase Console
```

### Custom Domains for Channels
Configure in Firebase Console:
- Hosting → Add custom domain
- Point DNS records
- SSL certificates auto-provisioned

### Multiple Sites
```json
{
  "hosting": [
    {
      "target": "main-site",
      "public": "dist"
    },
    {
      "target": "admin-site",
      "public": "admin/dist"
    }
  ]
}
```

Deploy specific site:
```bash
firebase deploy --only hosting:main-site
```

## Troubleshooting Checklist

Before seeking help, verify:
- [ ] Firebase CLI is up to date: `firebase --version`
- [ ] Logged in with correct account: `firebase login:list`
- [ ] Using correct project: `firebase use`
- [ ] Build directory exists and has content
- [ ] `firebase.json` public path matches build output
- [ ] No build errors before deployment
- [ ] Sufficient permissions on Firebase project

## Related Resources

- Firebase Hosting Documentation: https://firebase.google.com/docs/hosting
- Firebase CLI Reference: https://firebase.google.com/docs/cli
- Preview Channels Guide: See `references/preview-channels-guide.md`
- GitHub Actions Template: See `templates/github-actions-preview.yml`
- Deployment Scripts: See `scripts/` directory

## Project-Specific Context

This skill is designed to work with coffee e-commerce applications built with:
- React + Vite
- TypeScript
- Tailwind CSS
- Firebase Hosting

Typical build command: `npm run build`
Typical output directory: `dist`

## Usage Examples

### Example 1: Deploy Feature for Review
```bash
# After making changes
npm run build
firebase hosting:channel:deploy feature-new-checkout --expires 7d

# Share the preview URL with team
```

### Example 2: Staged Production Deployment
```bash
# Deploy to staging first
npm run build
firebase hosting:channel:deploy staging --expires 30d

# Test thoroughly
# If tests pass, clone to production
firebase hosting:clone PROJECT_ID:staging PROJECT_ID:live
```

### Example 3: PR-Based Workflow (Automated)
GitHub Action automatically:
1. Builds on PR creation
2. Deploys to `pr-{number}` channel
3. Comments URL on PR
4. Updates on new commits
5. Deletes channel when PR closes

See `templates/github-actions-preview.yml` for implementation.

## Next Steps

After deploying:
1. Test all functionality on preview URL
2. Check responsive design on multiple devices
3. Verify environment variables are correct
4. Test authentication flows
5. Validate API integrations
6. Check console for errors
7. Run lighthouse audit
8. Share with stakeholders for approval
9. If approved, deploy to production
10. Monitor production metrics

## Support

For Firebase-specific issues:
- Check Firebase Status: https://status.firebase.google.com/
- Firebase Support: https://firebase.google.com/support
- Community: https://stackoverflow.com/questions/tagged/firebase

For skill improvements:
- Update this SKILL.md with lessons learned
- Add new scripts to automate common tasks
- Document project-specific configurations
