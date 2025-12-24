/**
 * Firebase Configuration
 * Initialize Firebase for React Native / Web
 *
 * Uses compat library throughout to avoid "Component auth has not been registered" error
 */

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App (only once)
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

// Get Firebase services (all compat)
const app = firebase.app();
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Set persistence for React Native
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Export async getter for compatibility
export async function getFirebaseAuth() {
  return auth;
}

export { app, auth, db, storage, firebase };
