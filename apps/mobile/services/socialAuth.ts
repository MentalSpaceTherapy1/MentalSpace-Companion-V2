/**
 * Social Authentication Service
 * Handles Sign in with Apple and Google authentication
 */

import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { auth, db, firebase } from './firebase';
import { Platform } from 'react-native';
import type { User as AppUser } from '@mentalspace/shared';

// Ensure web browser sessions complete properly
WebBrowser.maybeCompleteAuthSession();

// ========================================
// APPLE SIGN IN
// ========================================

/**
 * Check if Apple Sign In is available on this device
 */
export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return await AppleAuthentication.isAvailableAsync();
}

/**
 * Generate a secure nonce for Apple Sign In
 */
function generateNonce(length: number = 32): string {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
}

/**
 * Sign in with Apple
 * Returns the Firebase user and whether this is a new account
 */
export async function signInWithApple(): Promise<{ isNewUser: boolean }> {
  // Generate a secure nonce
  const nonce = generateNonce();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    nonce
  );

  // Request Apple credentials
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!credential.identityToken) {
    throw new Error('No identity token received from Apple');
  }

  // Create Firebase credential (using compat API)
  const provider = new firebase.auth.OAuthProvider('apple.com');
  const oAuthCredential = provider.credential({
    idToken: credential.identityToken,
    rawNonce: nonce,
  });

  // Sign in to Firebase
  const userCredential = await auth.signInWithCredential(oAuthCredential);
  const user = userCredential.user;
  if (!user) throw new Error('No user returned from sign in');

  // Check if user profile exists
  const profileDoc = await db.collection('users').doc(user.uid).get();
  const isNewUser = !profileDoc.exists;

  if (isNewUser) {
    // Create new user profile
    const displayName =
      credential.fullName?.givenName && credential.fullName?.familyName
        ? `${credential.fullName.givenName} ${credential.fullName.familyName}`
        : credential.fullName?.givenName || 'User';

    const newProfile: Omit<AppUser, 'id'> = {
      email: credential.email || user.email || '',
      displayName,
      createdAt: new Date(),
      updatedAt: new Date(),
      onboardingCompleted: false,
      carePreferencesCompleted: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      authProvider: 'apple',
      preferences: {
        reasons: [],
        focusAreas: [],
        notifications: {
          dailyReminder: true,
          reminderTime: '09:00',
          weeklyDigest: true,
        },
        theme: 'system',
      },
      carePreferences: {
        currentMentalState: 'managing',
        therapyStatus: 'not_in_therapy',
        primaryGoals: [],
        preferredSupportStyle: 'gentle_encouragement',
        triggerTopics: [],
        socialSupport: 'moderate',
        sleepSchedule: {
          typicalBedtime: '22:00',
          typicalWakeTime: '07:00',
          sleepQualityRating: 5,
        },
        exerciseFrequency: 'once_week',
        copingStrategiesUsed: [],
        crisisContacts: [],
      },
    };

    await db.collection('users').doc(user.uid).set({
      ...newProfile,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  return { isNewUser };
}

// ========================================
// GOOGLE SIGN IN
// ========================================

/**
 * Sign in with Google using Firebase Auth
 * Uses popup flow for web, native modules for mobile
 */
export async function signInWithGoogle(): Promise<{ isNewUser: boolean }> {
  // Check if we're on web platform
  if (Platform.OS === 'web') {
    return signInWithGoogleWeb();
  }

  // For native platforms, Google Sign-In requires additional setup
  // TODO: Implement native Google Sign-In with expo-google-sign-in or @react-native-google-signin/google-signin
  throw new Error(
    'Google Sign In on native requires additional configuration. ' +
    'Please use email or Apple Sign In for now.'
  );
}

/**
 * Web-specific Google Sign-In using Firebase popup
 */
async function signInWithGoogleWeb(): Promise<{ isNewUser: boolean }> {
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }

  // Create Google Auth provider
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');

  // Sign in with popup
  const userCredential = await auth.signInWithPopup(provider);
  const user = userCredential.user;

  if (!user) {
    throw new Error('No user returned from Google sign in');
  }

  // Check if user profile exists in Firestore
  const profileDoc = await db.collection('users').doc(user.uid).get();
  const isNewUser = !profileDoc.exists;

  if (isNewUser) {
    // Create new user profile
    const newProfile: Omit<AppUser, 'id'> = {
      email: user.email || '',
      displayName: user.displayName || 'User',
      photoURL: user.photoURL || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      onboardingCompleted: false,
      carePreferencesCompleted: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      authProvider: 'google',
      preferences: {
        reasons: [],
        focusAreas: [],
        notifications: {
          dailyReminder: true,
          reminderTime: '09:00',
          weeklyDigest: true,
        },
        theme: 'system',
      },
      carePreferences: {
        currentMentalState: 'managing',
        therapyStatus: 'not_in_therapy',
        primaryGoals: [],
        preferredSupportStyle: 'gentle_encouragement',
        triggerTopics: [],
        socialSupport: 'moderate',
        sleepSchedule: {
          typicalBedtime: '22:00',
          typicalWakeTime: '07:00',
          sleepQualityRating: 5,
        },
        exerciseFrequency: 'once_week',
        copingStrategiesUsed: [],
        crisisContacts: [],
      },
    };

    await db.collection('users').doc(user.uid).set({
      ...newProfile,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  return { isNewUser };
}

/**
 * Complete Google Sign In with the ID token
 * Call this after getting the token from expo-auth-session
 */
export async function completeGoogleSignIn(idToken: string): Promise<{ isNewUser: boolean }> {
  // Create Firebase credential (using compat API)
  const credential = firebase.auth.GoogleAuthProvider.credential(idToken);

  // Sign in to Firebase
  const userCredential = await auth.signInWithCredential(credential);
  const user = userCredential.user;
  if (!user) throw new Error('No user returned from sign in');

  // Check if user profile exists
  const profileDoc = await db.collection('users').doc(user.uid).get();
  const isNewUser = !profileDoc.exists;

  if (isNewUser) {
    // Create new user profile
    const newProfile: Omit<AppUser, 'id'> = {
      email: user.email || '',
      displayName: user.displayName || 'User',
      photoURL: user.photoURL || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      onboardingCompleted: false,
      carePreferencesCompleted: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      authProvider: 'google',
      preferences: {
        reasons: [],
        focusAreas: [],
        notifications: {
          dailyReminder: true,
          reminderTime: '09:00',
          weeklyDigest: true,
        },
        theme: 'system',
      },
      carePreferences: {
        currentMentalState: 'managing',
        therapyStatus: 'not_in_therapy',
        primaryGoals: [],
        preferredSupportStyle: 'gentle_encouragement',
        triggerTopics: [],
        socialSupport: 'moderate',
        sleepSchedule: {
          typicalBedtime: '22:00',
          typicalWakeTime: '07:00',
          sleepQualityRating: 5,
        },
        exerciseFrequency: 'once_week',
        copingStrategiesUsed: [],
        crisisContacts: [],
      },
    };

    await db.collection('users').doc(user.uid).set({
      ...newProfile,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  return { isNewUser };
}
