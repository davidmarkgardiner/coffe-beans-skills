# Skill: Firebase Setup & Best Practices

## Purpose
To standardize the setup and configuration of Firebase services.

## Setup Steps

1.  **Project Initialization**:
    *   Run `firebase init` to select features (Firestore, Functions, Hosting, Storage).
    *   Use the project alias defined in `.firebaserc`.

2.  **Authentication**:
    *   Enable desired providers in the Firebase Console.
    *   Use Firebase Auth SDK for client-side authentication.

3.  **Firestore**:
    *   Use `gcloud` or the console to create the database in `production` mode.
    *   Define security rules in `firestore.rules`.
    *   **Rule**: Deny all by default. Allow only specific paths.

4.  **Functions**:
    *   Use TypeScript.
    *   Organize functions by trigger type (http, auth, firestore).
    *   Use `functions.config()` for environment variables.

## Security Best Practices
*   **Never** commit `service-account.json` to the repo.
*   Validate all data coming into Cloud Functions.
*   Use strict Firestore Security Rules.
