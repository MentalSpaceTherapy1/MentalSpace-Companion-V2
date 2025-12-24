/**
 * Predictive Store
 * Manages predictions, trigger dates, and bad day mode state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../services/firebase';
import { useAuthStore } from './authStore';
import { useCheckinStore } from './checkinStore';
import { useSafetyPlanStore } from './safetyPlanStore';
import { usePlanStore } from './planStore';
import {
  analyzeDayOfWeekPatterns,
  predictTomorrowMood,
  detectTriggerPatterns,
  generateProactiveAlert,
  checkTriggerDateMatch,
  type DayOfWeekPattern,
  type MoodPrediction,
  type TriggerPattern,
  type ProactiveAlert,
} from '../services/patternPrediction';
import {
  shouldActivateBadDayMode,
  shouldDeactivateBadDayMode,
  getBadDayModeConfig,
  adjustActionsForBadDayMode,
  calculateMissedActions,
  type BadDayTrigger,
  type BadDayModeConfig,
} from '../utils/badDayMode';
import { isDeviceOnline } from '../services/offlineStorage';

export interface TriggerDate {
  id: string;
  date: string; // ISO date string
  label: string; // e.g., "Anniversary of loss"
  repeatAnnually: boolean;
  createdAt: string;
}

export interface PredictionState {
  // Day of week patterns
  dayPatterns: DayOfWeekPattern[];

  // Tomorrow's mood prediction
  tomorrowPrediction: MoodPrediction | null;

  // Detected patterns
  detectedPatterns: TriggerPattern[];

  // Proactive alert
  currentAlert: ProactiveAlert | null;
  alertDismissed: boolean;

  // Trigger dates
  triggerDates: TriggerDate[];

  // Bad day mode
  badDayModeActive: boolean;
  badDayModeConfig: BadDayModeConfig;
  badDayActivatedDate: string | null;
  badDayTriggers: BadDayTrigger[];

  // Last prediction run
  lastPredictionRun: string | null;

  // Loading states
  isLoading: boolean;
  error: string | null;
}

interface PredictiveActions {
  // Predictions
  runPredictions: () => Promise<void>;
  dismissAlert: () => void;

  // Trigger dates
  loadTriggerDates: () => Promise<void>;
  addTriggerDate: (date: string, label: string, repeatAnnually?: boolean) => Promise<void>;
  updateTriggerDate: (id: string, updates: Partial<TriggerDate>) => Promise<void>;
  deleteTriggerDate: (id: string) => Promise<void>;

  // Bad day mode
  activateBadDayMode: (triggers: BadDayTrigger[]) => void;
  deactivateBadDayMode: () => void;
  checkBadDayModeConditions: () => void;

  // Utility
  reset: () => void;
}

type PredictiveState = PredictionState & PredictiveActions;

const initialState: PredictionState = {
  dayPatterns: [],
  tomorrowPrediction: null,
  detectedPatterns: [],
  currentAlert: null,
  alertDismissed: false,
  triggerDates: [],
  badDayModeActive: false,
  badDayModeConfig: getBadDayModeConfig(),
  badDayActivatedDate: null,
  badDayTriggers: [],
  lastPredictionRun: null,
  isLoading: false,
  error: null,
};

export const usePredictiveStore = create<PredictiveState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Run all predictions based on recent check-ins
       */
      runPredictions: async () => {
        set({ isLoading: true, error: null });

        try {
          const { recentCheckins } = useCheckinStore.getState();

          if (recentCheckins.length < 3) {
            // Not enough data for predictions
            set({
              isLoading: false,
              lastPredictionRun: new Date().toISOString(),
            });
            return;
          }

          // Analyze patterns
          const dayPatterns = analyzeDayOfWeekPatterns(recentCheckins);
          const tomorrowPrediction = predictTomorrowMood(recentCheckins);
          const detectedPatterns = detectTriggerPatterns(recentCheckins);

          // Generate proactive alert
          const { triggerDates } = get();
          const currentAlert = generateProactiveAlert(
            tomorrowPrediction,
            detectedPatterns,
            triggerDates,
            recentCheckins
          );

          set({
            dayPatterns,
            tomorrowPrediction,
            detectedPatterns,
            currentAlert,
            alertDismissed: false, // Reset dismissal for new alerts
            lastPredictionRun: new Date().toISOString(),
            isLoading: false,
          });

          // Check bad day mode conditions
          get().checkBadDayModeConditions();
        } catch (error: any) {
          console.error('Error running predictions:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      /**
       * Dismiss the current alert
       */
      dismissAlert: () => {
        set({ alertDismissed: true });
      },

      /**
       * Load trigger dates from Firebase (offline-first)
       */
      loadTriggerDates: async () => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ isLoading: true, error: null });

        try {
          // Try to load from cache first
          const cached = await AsyncStorage.getItem(`trigger_dates_${userId}`);
          if (cached) {
            const triggerDates = JSON.parse(cached) as TriggerDate[];
            set({ triggerDates, isLoading: false });
          }

          // If online, sync with Firebase
          if (isDeviceOnline()) {
            const snapshot = await db
              .collection('users')
              .doc(userId)
              .collection('trigger_dates')
              .orderBy('date', 'asc')
              .get();

            const triggerDates = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as TriggerDate[];

            set({ triggerDates, isLoading: false });

            // Update cache
            await AsyncStorage.setItem(
              `trigger_dates_${userId}`,
              JSON.stringify(triggerDates)
            );
          } else if (!cached) {
            set({ triggerDates: [], isLoading: false });
          }
        } catch (error: any) {
          console.error('Error loading trigger dates:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      /**
       * Add a new trigger date
       */
      addTriggerDate: async (date: string, label: string, repeatAnnually = false) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) throw new Error('Not authenticated');

        set({ isLoading: true, error: null });

        try {
          const newTriggerDate: Omit<TriggerDate, 'id'> = {
            date,
            label,
            repeatAnnually,
            createdAt: new Date().toISOString(),
          };

          // Save to Firebase
          const docRef = await db
            .collection('users')
            .doc(userId)
            .collection('trigger_dates')
            .add(newTriggerDate);

          const triggerDate: TriggerDate = {
            id: docRef.id,
            ...newTriggerDate,
          };

          // Update local state
          const { triggerDates } = get();
          const updatedDates = [...triggerDates, triggerDate].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          set({ triggerDates: updatedDates, isLoading: false });

          // Update cache
          await AsyncStorage.setItem(
            `trigger_dates_${userId}`,
            JSON.stringify(updatedDates)
          );

          // Re-run predictions
          await get().runPredictions();
        } catch (error: any) {
          console.error('Error adding trigger date:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Update an existing trigger date
       */
      updateTriggerDate: async (id: string, updates: Partial<TriggerDate>) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) throw new Error('Not authenticated');

        set({ isLoading: true, error: null });

        try {
          // Update in Firebase
          await db
            .collection('users')
            .doc(userId)
            .collection('trigger_dates')
            .doc(id)
            .update(updates);

          // Update local state
          const { triggerDates } = get();
          const updatedDates = triggerDates
            .map((td) => (td.id === id ? { ...td, ...updates } : td))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          set({ triggerDates: updatedDates, isLoading: false });

          // Update cache
          await AsyncStorage.setItem(
            `trigger_dates_${userId}`,
            JSON.stringify(updatedDates)
          );

          // Re-run predictions
          await get().runPredictions();
        } catch (error: any) {
          console.error('Error updating trigger date:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Delete a trigger date
       */
      deleteTriggerDate: async (id: string) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) throw new Error('Not authenticated');

        set({ isLoading: true, error: null });

        try {
          // Delete from Firebase
          await db
            .collection('users')
            .doc(userId)
            .collection('trigger_dates')
            .doc(id)
            .delete();

          // Update local state
          const { triggerDates } = get();
          const updatedDates = triggerDates.filter((td) => td.id !== id);

          set({ triggerDates: updatedDates, isLoading: false });

          // Update cache
          await AsyncStorage.setItem(
            `trigger_dates_${userId}`,
            JSON.stringify(updatedDates)
          );

          // Re-run predictions
          await get().runPredictions();
        } catch (error: any) {
          console.error('Error deleting trigger date:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Activate bad day mode
       */
      activateBadDayMode: (triggers: BadDayTrigger[]) => {
        const config = getBadDayModeConfig();

        set({
          badDayModeActive: true,
          badDayModeConfig: config,
          badDayActivatedDate: new Date().toISOString(),
          badDayTriggers: triggers,
        });

        // Adjust current plan if exists
        const { currentPlan } = usePlanStore.getState();
        if (currentPlan && currentPlan.actions.length > 1) {
          const adjustedActions = adjustActionsForBadDayMode(currentPlan.actions, config);

          usePlanStore.setState({
            currentPlan: {
              ...currentPlan,
              actions: adjustedActions,
              totalCount: adjustedActions.length,
            },
          });
        }
      },

      /**
       * Deactivate bad day mode
       */
      deactivateBadDayMode: () => {
        set({
          badDayModeActive: false,
          badDayActivatedDate: null,
          badDayTriggers: [],
        });
      },

      /**
       * Check if bad day mode should be activated or deactivated
       */
      checkBadDayModeConditions: () => {
        const { todayCheckin } = useCheckinStore.getState();
        const { currentPlan } = usePlanStore.getState();
        const { triggerDates, badDayModeActive, badDayActivatedDate } = get();

        // Check if today is a trigger date
        const today = new Date();
        const isTriggerDate = checkTriggerDateMatch(today, triggerDates);

        // Check SOS usage (would need to be tracked separately)
        const sosUsedToday = false; // TODO: Integrate with SOS tracking

        // Calculate missed actions
        const missedActionsCount = currentPlan
          ? calculateMissedActions(currentPlan.actions)
          : 0;

        if (badDayModeActive) {
          // Check if should deactivate
          if (shouldDeactivateBadDayMode(todayCheckin, badDayActivatedDate)) {
            get().deactivateBadDayMode();
          }
        } else {
          // Check if should activate
          const { shouldActivate, triggers } = shouldActivateBadDayMode(
            todayCheckin,
            sosUsedToday,
            missedActionsCount,
            isTriggerDate
          );

          if (shouldActivate) {
            get().activateBadDayMode(triggers);
          }
        }
      },

      /**
       * Reset all state
       */
      reset: () => {
        set({ ...initialState });
      },
    }),
    {
      name: 'predictive-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        triggerDates: state.triggerDates,
        badDayModeActive: state.badDayModeActive,
        badDayActivatedDate: state.badDayActivatedDate,
        lastPredictionRun: state.lastPredictionRun,
      }),
    }
  )
);
