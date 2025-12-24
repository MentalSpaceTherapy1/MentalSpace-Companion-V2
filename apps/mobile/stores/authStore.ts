/**
 * Auth Store
 * Zustand store for authentication state
 * Uses Firebase compat library for better React Native support
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db, firebase } from '../services/firebase';
import type { User as AppUser, UserPreferences, CarePreferences } from '@mentalspace/shared';

// Firebase User type from compat library
type FirebaseUser = firebase.User;

interface AuthState {
  // State
  user: FirebaseUser | null;
  profile: AppUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<AppUser>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  updateCarePreferences: (carePreferences: CarePreferences) => Promise<void>;
  completeOnboarding: (preferences: UserPreferences) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      isLoading: true,
      isInitialized: false,
      error: null,

      // Initialize auth listener
      initialize: () => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (user) {
            // Fetch user profile from Firestore
            try {
              const profileDoc = await db.collection('users').doc(user.uid).get();
              const profile = profileDoc.exists
                ? ({ id: user.uid, ...profileDoc.data() } as AppUser)
                : null;

              set({
                user,
                profile,
                isLoading: false,
                isInitialized: true,
              });
            } catch (error) {
              console.error('Error fetching profile:', error);
              set({
                user,
                profile: null,
                isLoading: false,
                isInitialized: true,
              });
            }
          } else {
            set({
              user: null,
              profile: null,
              isLoading: false,
              isInitialized: true,
            });
          }
        });

        return unsubscribe;
      },

      // Sign in with email/password
      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const { user } = await auth.signInWithEmailAndPassword(email, password);
          if (!user) throw new Error('No user returned from sign in');

          // Fetch profile
          const profileDoc = await db.collection('users').doc(user.uid).get();
          const profile = profileDoc.exists
            ? ({ id: user.uid, ...profileDoc.data() } as AppUser)
            : null;

          set({ user, profile, isLoading: false });
        } catch (error: any) {
          console.error('Sign in error:', error.code, error.message, error);
          const errorMessage = getAuthErrorMessage(error.code);
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      // Sign up with email/password
      signUp: async (email: string, password: string, displayName: string) => {
        set({ isLoading: true, error: null });

        try {
          const { user } = await auth.createUserWithEmailAndPassword(email, password);
          if (!user) throw new Error('No user returned from sign up');

          // Update Firebase Auth profile
          await user.updateProfile({ displayName });

          // Create Firestore user document
          const newProfile: Omit<AppUser, 'id'> = {
            email,
            displayName,
            createdAt: new Date(),
            updatedAt: new Date(),
            onboardingCompleted: false,
            carePreferencesCompleted: false,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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

          set({
            user,
            profile: { id: user.uid, ...newProfile },
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = getAuthErrorMessage(error.code);
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      // Sign out
      signOut: async () => {
        set({ isLoading: true });

        try {
          await auth.signOut();
          set({ user: null, profile: null, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Update user profile
      updateUserProfile: async (updates: Partial<AppUser>) => {
        const { user, profile } = get();
        if (!user || !profile) throw new Error('Not authenticated');

        try {
          await db.collection('users').doc(user.uid).update({
            ...updates,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });

          set({
            profile: { ...profile, ...updates, updatedAt: new Date() },
          });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      // Update preferences
      updatePreferences: async (preferences: Partial<UserPreferences>) => {
        const { user, profile } = get();
        if (!user || !profile) throw new Error('Not authenticated');

        const updatedPreferences = { ...profile.preferences, ...preferences };

        try {
          await db.collection('users').doc(user.uid).update({
            preferences: updatedPreferences,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });

          set({
            profile: {
              ...profile,
              preferences: updatedPreferences,
              updatedAt: new Date(),
            },
          });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      // Update care preferences
      updateCarePreferences: async (carePreferences: CarePreferences) => {
        const { user, profile } = get();
        if (!user || !profile) throw new Error('Not authenticated');

        try {
          await db.collection('users').doc(user.uid).update({
            carePreferences,
            carePreferencesCompleted: true,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });

          set({
            profile: {
              ...profile,
              carePreferences,
              carePreferencesCompleted: true,
              updatedAt: new Date(),
            },
          });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      // Complete onboarding
      completeOnboarding: async (preferences: UserPreferences) => {
        const { user, profile } = get();
        if (!user || !profile) throw new Error('Not authenticated');

        try {
          await db.collection('users').doc(user.uid).update({
            preferences,
            onboardingCompleted: true,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });

          set({
            profile: {
              ...profile,
              preferences,
              onboardingCompleted: true,
              updatedAt: new Date(),
            },
          });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'mentalspace-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist minimal data, auth state comes from Firebase
      }),
    }
  )
);

/**
 * Map Firebase auth error codes to user-friendly messages
 */
function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
}
