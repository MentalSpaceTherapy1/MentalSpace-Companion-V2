/**
 * Social Authentication Service
 * Handles Sign in with Apple and Google authentication
 */

import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  linkWithCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
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

  // Create Firebase credential
  const oAuthCredential = new OAuthProvider('apple.com').credential({
    idToken: credential.identityToken,
    rawNonce: nonce,
  });

  // Sign in to Firebase
  const { user } = await signInWithCredential(auth, oAuthCredential);

  // Check if user profile exists
  const profileDoc = await getDoc(doc(db, 'users', user.uid));
  const isNewUser = !profileDoc.exists();

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

    await setDoc(doc(db, 'users', user.uid), {
      ...newProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return { isNewUser };
}

// ========================================
// GOOGLE SIGN IN
// ========================================

// Google OAuth configuration
// Note: You'll need to set up Google OAuth in Firebase Console and add your web client ID
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';

/**
 * Sign in with Google using Firebase Auth
 * For Expo, we use the ID token flow
 */
export async function signInWithGoogle(): Promise<{ isNewUser: boolean }> {
  // For production, you'll use expo-auth-session with Google
  // This requires proper OAuth setup in Google Cloud Console

  // Import dynamically to avoid issues on platforms where it's not available
  const { makeRedirectUri, useAuthRequest, ResponseType } = await import('expo-auth-session');
  const { useEffect } = await import('react');

  throw new Error(
    'Google Sign In requires OAuth configuration. ' +
    'Please set up Google OAuth in Firebase Console and configure EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'
  );
}

/**
 * Complete Google Sign In with the ID token
 * Call this after getting the token from expo-auth-session
 */
export async function completeGoogleSignIn(idToken: string): Promise<{ isNewUser: boolean }> {
  // Create Firebase credential
  const credential = GoogleAuthProvider.credential(idToken);

  // Sign in to Firebase
  const { user } = await signInWithCredential(auth, credential);

  // Check if user profile exists
  const profileDoc = await getDoc(doc(db, 'users', user.uid));
  const isNewUser = !profileDoc.exists();

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

    await setDoc(doc(db, 'users', user.uid), {
      ...newProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return { isNewUser };
}
