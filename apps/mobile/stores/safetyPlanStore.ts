/**
 * Safety Plan Store
 * Zustand store for safety plan management with offline-first support
 *
 * A safety plan helps users prepare for difficult moments by documenting:
 * - Warning signs that indicate they're struggling
 * - Personal coping strategies
 * - People and professionals to contact
 * - Safe places to go
 * - Reasons for living
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from './authStore';
import { isDeviceOnline } from '../services/offlineStorage';

// Types
export interface SafetyPlanContact {
  id: string;
  name: string;
  phone: string;
  relationship: 'family' | 'friend' | 'therapist' | 'doctor' | 'crisis_line' | 'other';
  isProfessional: boolean;
}

export interface SafetyPlan {
  // Warning signs that indicate user is struggling
  warningSigns: string[];

  // Personal coping strategies (things to do on their own)
  copingStrategies: string[];

  // People to contact for support
  supportContacts: SafetyPlanContact[];

  // Professional contacts
  professionalContacts: SafetyPlanContact[];

  // Safe places to go
  safePlaces: string[];

  // Reasons for living / things that matter
  reasonsToLive: string[];

  // Environment safety (optional - ways to make environment safer)
  environmentSafety: string[];

  // Last updated
  updatedAt: Date | null;
}

interface SafetyPlanState {
  // State
  safetyPlan: SafetyPlan;
  isLoading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;

  // Actions
  loadSafetyPlan: () => Promise<void>;
  saveSafetyPlan: () => Promise<void>;

  // Update individual sections
  updateWarningSigns: (signs: string[]) => void;
  updateCopingStrategies: (strategies: string[]) => void;
  updateSupportContacts: (contacts: SafetyPlanContact[]) => void;
  updateProfessionalContacts: (contacts: SafetyPlanContact[]) => void;
  updateSafePlaces: (places: string[]) => void;
  updateReasonsToLive: (reasons: string[]) => void;
  updateEnvironmentSafety: (items: string[]) => void;

  // Helper actions
  addWarningSign: (sign: string) => void;
  removeWarningSign: (index: number) => void;
  addCopingStrategy: (strategy: string) => void;
  removeCopingStrategy: (index: number) => void;
  addSupportContact: (contact: SafetyPlanContact) => void;
  removeSupportContact: (id: string) => void;
  addProfessionalContact: (contact: SafetyPlanContact) => void;
  removeProfessionalContact: (id: string) => void;
  addSafePlace: (place: string) => void;
  removeSafePlace: (index: number) => void;
  addReasonToLive: (reason: string) => void;
  removeReasonToLive: (index: number) => void;

  // Reset
  resetSafetyPlan: () => void;
}

const STORAGE_KEY = 'mentalspace_safety_plan';

const initialSafetyPlan: SafetyPlan = {
  warningSigns: [],
  copingStrategies: [],
  supportContacts: [],
  professionalContacts: [],
  safePlaces: [],
  reasonsToLive: [],
  environmentSafety: [],
  updatedAt: null,
};

// Default crisis contacts (always available)
export const DEFAULT_CRISIS_CONTACTS: SafetyPlanContact[] = [
  {
    id: 'crisis-988',
    name: '988 Suicide & Crisis Lifeline',
    phone: '988',
    relationship: 'crisis_line',
    isProfessional: true,
  },
  {
    id: 'crisis-text',
    name: 'Crisis Text Line',
    phone: '741741',
    relationship: 'crisis_line',
    isProfessional: true,
  },
];

export const useSafetyPlanStore = create<SafetyPlanState>((set, get) => ({
  // Initial state
  safetyPlan: { ...initialSafetyPlan },
  isLoading: false,
  error: null,
  hasUnsavedChanges: false,

  // Load safety plan (offline-first)
  loadSafetyPlan: async () => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      // First, try to load from local storage
      const cached = await AsyncStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (cached) {
        const parsedPlan = JSON.parse(cached) as SafetyPlan;
        set({ safetyPlan: parsedPlan, isLoading: false });
      }

      // If online, sync with Firebase
      if (isDeviceOnline()) {
        const docRef = doc(db, 'users', userId, 'safety_plan', 'current');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const serverPlan = docSnap.data() as SafetyPlan;

          // Convert Firestore timestamp if present
          if (serverPlan.updatedAt && typeof serverPlan.updatedAt === 'object') {
            serverPlan.updatedAt = (serverPlan.updatedAt as any).toDate();
          }

          set({ safetyPlan: serverPlan, isLoading: false });

          // Update local cache
          await AsyncStorage.setItem(
            `${STORAGE_KEY}_${userId}`,
            JSON.stringify(serverPlan)
          );
        } else if (!cached) {
          // No data anywhere, use initial
          set({ safetyPlan: { ...initialSafetyPlan }, isLoading: false });
        }
      } else if (!cached) {
        set({ safetyPlan: { ...initialSafetyPlan }, isLoading: false });
      }
    } catch (error: any) {
      console.error('Error loading safety plan:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Save safety plan (offline-first)
  saveSafetyPlan: async () => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      const currentPlan = get().safetyPlan;
      const planToSave = {
        ...currentPlan,
        updatedAt: new Date(),
      };

      // Always save to local storage first
      await AsyncStorage.setItem(
        `${STORAGE_KEY}_${userId}`,
        JSON.stringify(planToSave)
      );

      // If online, sync to Firebase
      if (isDeviceOnline()) {
        const docRef = doc(db, 'users', userId, 'safety_plan', 'current');
        await setDoc(docRef, {
          ...planToSave,
          updatedAt: serverTimestamp(),
        });
      }

      set({
        safetyPlan: planToSave,
        isLoading: false,
        hasUnsavedChanges: false
      });
    } catch (error: any) {
      console.error('Error saving safety plan:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Update sections
  updateWarningSigns: (signs) => {
    set((state) => ({
      safetyPlan: { ...state.safetyPlan, warningSigns: signs },
      hasUnsavedChanges: true,
    }));
  },

  updateCopingStrategies: (strategies) => {
    set((state) => ({
      safetyPlan: { ...state.safetyPlan, copingStrategies: strategies },
      hasUnsavedChanges: true,
    }));
  },

  updateSupportContacts: (contacts) => {
    set((state) => ({
      safetyPlan: { ...state.safetyPlan, supportContacts: contacts },
      hasUnsavedChanges: true,
    }));
  },

  updateProfessionalContacts: (contacts) => {
    set((state) => ({
      safetyPlan: { ...state.safetyPlan, professionalContacts: contacts },
      hasUnsavedChanges: true,
    }));
  },

  updateSafePlaces: (places) => {
    set((state) => ({
      safetyPlan: { ...state.safetyPlan, safePlaces: places },
      hasUnsavedChanges: true,
    }));
  },

  updateReasonsToLive: (reasons) => {
    set((state) => ({
      safetyPlan: { ...state.safetyPlan, reasonsToLive: reasons },
      hasUnsavedChanges: true,
    }));
  },

  updateEnvironmentSafety: (items) => {
    set((state) => ({
      safetyPlan: { ...state.safetyPlan, environmentSafety: items },
      hasUnsavedChanges: true,
    }));
  },

  // Helper actions for adding items
  addWarningSign: (sign) => {
    if (!sign.trim()) return;
    set((state) => ({
      safetyPlan: {
        ...state.safetyPlan,
        warningSigns: [...state.safetyPlan.warningSigns, sign.trim()],
      },
      hasUnsavedChanges: true,
    }));
  },

  removeWarningSign: (index) => {
    set((state) => ({
      safetyPlan: {
        ...state.safetyPlan,
        warningSigns: state.safetyPlan.warningSigns.filter((_, i) => i !== index),
      },
      hasUnsavedChanges: true,
    }));
  },

  addCopingStrategy: (strategy) => {
    if (!strategy.trim()) return;
    set((state) => ({
      safetyPlan: {
        ...state.safetyPlan,
        copingStrategies: [...state.safetyPlan.copingStrategies, strategy.trim()],
      },
      hasUnsavedChanges: true,
    }));
  },

  removeCopingStrategy: (index) => {
    set((state) => ({
      safetyPlan: {
        ...state.safetyPlan,
        copingStrategies: state.safetyPlan.copingStrategies.filter((_, i) => i !== index),
      },
      hasUnsavedChanges: true,
    }));
  },

  addSupportContact: (contact) => {
    set((state) => ({
      safetyPlan: {
        ...state.safetyPlan,
        supportContacts: [...state.safetyPlan.supportContacts, contact],
      },
      hasUnsavedChanges: true,
    }));
  },

  removeSupportContact: (id) => {
    set((state) => ({
      safetyPlan: {
        ...state.safetyPlan,
        supportContacts: state.safetyPlan.supportContacts.filter((c) => c.id !== id),
      },
      hasUnsavedChanges: true,
    }));
  },

  addProfessionalContact: (contact) => {
    set((state) => ({
      safetyPlan: {
        ...state.safetyPlan,
        professionalContacts: [...state.safetyPlan.professionalContacts, contact],
      },
      hasUnsavedChanges: true,
    }));
  },

  removeProfessionalContact: (id) => {
    set((state) => ({
      safetyPlan: {
        ...state.safetyPlan,
        professionalContacts: state.safetyPlan.professionalContacts.filter((c) => c.id !== id),
      },
      hasUnsavedChanges: true,
    }));
  },

  addSafePlace: (place) => {
    if (!place.trim()) return;
    set((state) => ({
      safetyPlan: {
        ...state.safetyPlan,
        safePlaces: [...state.safetyPlan.safePlaces, place.trim()],
      },
      hasUnsavedChanges: true,
    }));
  },

  removeSafePlace: (index) => {
    set((state) => ({
      safetyPlan: {
        ...state.safetyPlan,
        safePlaces: state.safetyPlan.safePlaces.filter((_, i) => i !== index),
      },
      hasUnsavedChanges: true,
    }));
  },

  addReasonToLive: (reason) => {
    if (!reason.trim()) return;
    set((state) => ({
      safetyPlan: {
        ...state.safetyPlan,
        reasonsToLive: [...state.safetyPlan.reasonsToLive, reason.trim()],
      },
      hasUnsavedChanges: true,
    }));
  },

  removeReasonToLive: (index) => {
    set((state) => ({
      safetyPlan: {
        ...state.safetyPlan,
        reasonsToLive: state.safetyPlan.reasonsToLive.filter((_, i) => i !== index),
      },
      hasUnsavedChanges: true,
    }));
  },

  // Reset to initial state
  resetSafetyPlan: () => {
    set({
      safetyPlan: { ...initialSafetyPlan },
      hasUnsavedChanges: false,
    });
  },
}));
