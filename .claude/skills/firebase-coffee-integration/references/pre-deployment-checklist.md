# Pre-Deployment Checklist

Use this checklist before deploying your Firebase-integrated coffee website to production.

## Configuration Files

- [ ] `.firebaserc` exists with correct project ID
- [ ] `firebase.json` configured for hosting, firestore, storage
- [ ] `firestore.rules` exists and compiles successfully
- [ ] `storage.rules` exists (if using Storage)
- [ ] `.env.local` has all required Firebase credentials
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
  - [ ] `VITE_FIREBASE_PROJECT_ID`
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET`
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `VITE_FIREBASE_APP_ID`
  - [ ] `VITE_FIREBASE_MEASUREMENT_ID`

## Build Verification

- [ ] `npm run build` completes without errors
- [ ] `dist/` folder contains index.html and assets
- [ ] Firebase project ID is embedded in build files
  ```bash
  grep -q "$(firebase use | tail -1)" dist/assets/*.js && echo "✓" || echo "✗"
  ```
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings in production build
- [ ] Bundle size is acceptable (check build output)

## Service Enablement

Verify all required services are enabled:

- [ ] **Firebase Authentication** enabled
  ```bash
  firebase auth:export /tmp/test.json && echo "✓ Enabled" || echo "✗ Disabled"
  ```
  - [ ] Email/Password provider enabled
  - [ ] Google OAuth enabled (optional)

- [ ] **Firestore Database** created and accessible
  ```bash
  firebase firestore:databases:list
  ```
  - [ ] Database location selected
  - [ ] Collections can be accessed

- [ ] **Cloud Storage** bucket initialized (if using file uploads)
  - [ ] Storage location matches Firestore location
  - [ ] Bucket is accessible in Console

- [ ] **Firebase Hosting** configured
  ```bash
  firebase hosting:sites:list
  ```

## Security Rules

- [ ] Firestore rules deploy successfully
  ```bash
  firebase deploy --only firestore:rules --dry-run
  ```
- [ ] Storage rules created (deployment may need Console)
- [ ] Rules tested in Firebase Console Rules Playground
- [ ] Production rules (not test mode) are active
- [ ] Role-based access control implemented
- [ ] All collections have appropriate security rules

## Code Quality

- [ ] All components have proper error handling
- [ ] Loading states implemented for async operations
- [ ] No `console.log` statements in production code
- [ ] Environment variables validated at runtime
- [ ] TypeScript `type` imports used (not regular imports for types)
- [ ] No unused imports in codebase
- [ ] All Firebase hooks have error boundaries

## Local Testing

- [ ] App runs locally: `npm run dev`
- [ ] Firebase initializes without errors in browser console
  - [ ] Check for message: "Firebase initialized with project: [PROJECT_ID]"
- [ ] Can authenticate users (signup/login)
- [ ] Can read products from Firestore
- [ ] Can write to Firestore (orders, cart)
- [ ] No permission denied errors
- [ ] Inventory updates work correctly
- [ ] Run inventory test: `npm run test:inventory`

## Performance & Optimization

- [ ] Images are optimized and properly sized
- [ ] Code splitting implemented where appropriate
- [ ] Lazy loading for non-critical components
- [ ] Firebase Analytics configured (optional)
- [ ] Bundle size warnings addressed
  - [ ] Consider code splitting if over 500 KB

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] No API keys hardcoded in source code
- [ ] Firebase App Check enabled (recommended)
- [ ] CORS configured for Storage (if needed)
- [ ] Email verification enabled for new users (optional)
- [ ] Rate limiting considered for Auth operations

## Database Readiness

- [ ] Sample products seeded (optional)
  ```bash
  npx tsx scripts/seed-products.ts
  ```
- [ ] Database indexes created for common queries
- [ ] Firestore collections structure matches schema
- [ ] Test data cleared from production database
- [ ] Backup strategy planned

## Deployment Commands Ready

Prepare these commands for deployment:

```bash
# 1. Build
npm run build

# 2. Verify build
ls -lh dist/

# 3. Deploy Firestore rules
firebase deploy --only firestore:rules

# 4. Deploy hosting
firebase deploy --only hosting

# 5. Verify deployment
bash scripts/verify-firebase-deployment.sh
```

## Post-Deployment Plan

- [ ] Monitoring dashboard prepared
- [ ] Error tracking configured (Firebase Crashlytics or similar)
- [ ] Billing alerts set up in Firebase Console
- [ ] Uptime monitoring configured
- [ ] Backup/restore process documented
- [ ] Rollback plan prepared

## Final Checks

- [ ] All team members have reviewed the code
- [ ] Documentation is up to date
- [ ] Deployment announcement prepared (if needed)
- [ ] Support team notified (if applicable)
- [ ] Rollback procedures tested and documented

## Quick Pre-Deployment Command

Run this one-liner to check most items:

```bash
npm run build && \
firebase deploy --only firestore:rules --dry-run && \
firebase auth:export /tmp/check.json 2>&1 | grep -q "Exporting" && \
firebase firestore:databases:list && \
echo "✅ Pre-deployment checks passed"
```

---

## Deployment Day Checklist

On the day of deployment:

1. [ ] Run full test suite
2. [ ] Clear browser cache and test locally
3. [ ] Deploy during low-traffic period
4. [ ] Monitor Firebase Console during deployment
5. [ ] Test critical user flows immediately after deployment
6. [ ] Monitor error rates for first hour
7. [ ] Have rollback ready if needed

---

**Remember**: It's better to delay deployment and fix issues than to deploy with known problems.

**Pro Tip**: Use `scripts/firebase-status.sh` to get a quick overview of all services before deploying.
