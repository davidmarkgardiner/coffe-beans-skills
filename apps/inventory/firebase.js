// Firebase Admin SDK setup — shared across all inventory scripts
// Uses GOOGLE_APPLICATION_CREDENTIALS env var for auth
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export const db = admin.firestore();
export { admin };
