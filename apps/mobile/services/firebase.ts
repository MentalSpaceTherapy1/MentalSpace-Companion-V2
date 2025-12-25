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

// Firebase configuration - hardcoded for reliable builds
const firebaseConfig = {
  apiKey: 'AIzaSyAVVtJ9rtP_T0qjJZhxGFGOZ0DgVXfMt8o',
  authDomain: 'mentalspace-companion.firebaseapp.com',
  projectId: 'mentalspace-companion',
  storageBucket: 'mentalspace-companion.firebasestorage.app',
  messagingSenderId: '467539507170',
  appId: '1:467539507170:web:32b01c8fb3cd1c70852bbb',
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
