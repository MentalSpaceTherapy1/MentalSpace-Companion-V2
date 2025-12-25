/**
 * Firebase Configuration
 * Initialize Firebase for React Native / Web
 *
 * Uses compat library throughout to avoid "Component auth has not been registered" error
 * SSR-safe: Only initializes on client side
 */

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Firebase configuration - hardcoded for reliable builds
const firebaseConfig = {
  apiKey: 'AIzaSyAVVtJ9rtP_T0qjJZhxGFGOZ0DgVXfMt8o',
  authDomain: 'mentalspace-companion.firebaseapp.com',
  projectId: 'mentalspace-companion',
  storageBucket: 'mentalspace-companion.firebasestorage.app',
  messagingSenderId: '467539507170',
  appId: '1:467539507170:web:32b01c8fb3cd1c70852bbb',
};

// Check if we're in a browser environment (SSR-safe)
const isBrowser = typeof window !== 'undefined';

// Initialize Firebase App (only once, only on client)
let app: firebase.app.App | null = null;
let auth: firebase.auth.Auth | null = null;
let db: firebase.firestore.Firestore | null = null;
let storage: firebase.storage.Storage | null = null;

if (isBrowser) {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }

  // Get Firebase services (all compat)
  app = firebase.app();
  auth = firebase.auth();
  db = firebase.firestore();
  storage = firebase.storage();

  // Set persistence for React Native
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
}

// Export async getter for compatibility
export async function getFirebaseAuth() {
  if (!auth && isBrowser) {
    // Lazy init if needed
    if (firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
  }
  return auth;
}

export { app, auth, db, storage, firebase };
