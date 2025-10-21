# Firestore Security Rules

Complete Firestore security rules for the coffee e-commerce application.

## Rules File

Save this as `firestore.rules` in your project root:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isAdmin() {
      return isSignedIn() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function emailVerified() {
      return request.auth.token.email_verified;
    }

    // Products - Read by all, write by admins only
    match /products/{productId} {
      allow read: if resource.data.active == true || isAdmin();
      allow create, update, delete: if isAdmin();
    }

    // Users - Users can read/write their own data
    match /users/{userId} {
      allow read: if isSignedIn() && (isOwner(userId) || isAdmin());
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isOwner(userId);
      allow delete: if isAdmin();
    }

    // Orders - Users can read their own orders, admins can read/write all
    match /orders/{orderId} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Cart - Users can only access their own cart
    match /cart/{userId} {
      allow read, write: if isSignedIn() && isOwner(userId);
    }

    // Newsletter - Anyone can subscribe, only admins can manage
    match /newsletter/{email} {
      allow read: if isAdmin();
      allow create: if true; // Anyone can subscribe
      allow update, delete: if isAdmin();
    }

    // Inventory logs - Read only for admins
    match /inventory_logs/{logId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

## Storage Rules

Save this as `storage.rules` in your project root:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Product images - Read by all, write by admins only
    match /products/{productId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // User profile photos - Users can manage their own photos
    match /users/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Order receipts - Only user and admin can access
    match /orders/{orderId}/{fileName} {
      allow read: if request.auth != null && (
        get(/databases/$(database)/documents/orders/$(orderId)).data.userId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Deploying Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy both
firebase deploy --only firestore:rules,storage
```

## Testing Rules

```bash
# Run emulator with rules
firebase emulators:start --only firestore

# Test rules locally
npm run test:rules
```

## Best Practices

1. **Always validate data types and required fields**
2. **Use helper functions to keep rules DRY**
3. **Test rules thoroughly before deploying to production**
4. **Never allow unrestricted write access**
5. **Validate data shapes in update rules**
6. **Use resource.data for existing data, request.resource.data for incoming data**
7. **Implement rate limiting for sensitive operations**
8. **Log and monitor rule violations in production**
