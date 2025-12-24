/**
 * Check-in Store
 * Zustand store for check-in state management with offline-first support
 * Uses Firebase compat library
 */

import { create } from 'zustand';
import { db, firebase } from '../services/firebase';
import { useAuthStore } from './authStore';
import type { Checkin, CheckinMetrics } from '@mentalspace/shared';
import { getTodayString, getDateDaysAgo } from '@mentalspace/shared';
import {
  getCachedCheckins,
  cacheCheckins,
  createCheckinOffline,
  isDeviceOnline,
  isCacheStale,
} from '../services/offlineStorage';
import { useStreakStore } from './streakStore';
import { trackCheckInCompleted, trackEvent } from '../services/analytics';

interface CheckinState {
  // State
  todayCheckin: Checkin | null;
  recentCheckins: Checkin[];
  isLoading: boolean;
  error: string | null;

  // Draft state for in-progress check-in
  draft: Partial<CheckinMetrics> & { journalEntry?: string; photoUri?: string };

  // Actions
  fetchTodayCheckin: () => Promise<void>;
  fetchRecentCheckins: (days?: number) => Promise<void>;
  createCheckin: (data: CheckinMetrics & { journalEntry?: string; photoUri?: string; crisisDetected?: boolean; crisisHandled?: boolean }) => Promise<Checkin>;
  updateDraft: (updates: Partial<CheckinState['draft']>) => void;
  clearDraft: () => void;
  refresh: () => Promise<void>;
}

const initialDraft: CheckinState['draft'] = {
  mood: undefined,
  stress: undefined,
  sleep: undefined,
  energy: undefined,
  focus: undefined,
  anxiety: undefined,
  journalEntry: '',
  photoUri: undefined,
};

export const useCheckinStore = create<CheckinState>((set, get) => ({
  // Initial state
  todayCheckin: null,
  recentCheckins: [],
  isLoading: false,
  error: null,
  draft: { ...initialDraft },

  // Fetch today's check-in (offline-first)
  fetchTodayCheckin: async () => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      const today = getTodayString();

      // Check cache first
      const cached = await getCachedCheckins(userId);
      const cachedToday = cached.find((c) => c.date === today);

      if (cachedToday) {
        set({ todayCheckin: cachedToday, isLoading: false });
      }

      // If online and cache is stale, fetch from server
      if (isDeviceOnline() && (await isCacheStale(userId, 'checkins', 5))) {
        const snapshot = await db
          .collection('users')
          .doc(userId)
          .collection('checkins')
          .where('date', '==', today)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const checkin = { id: doc.id, ...doc.data() } as Checkin;
          set({ todayCheckin: checkin, isLoading: false });

          // Update cache
          const updatedCache = cached.filter((c) => c.date !== today);
          updatedCache.unshift(checkin);
          await cacheCheckins(userId, updatedCache);
        } else if (!cachedToday) {
          set({ todayCheckin: null, isLoading: false });
        }
      } else if (!cachedToday) {
        set({ todayCheckin: null, isLoading: false });
      }
    } catch (error: any) {
      // On error, return cached data if available
      console.error('Error fetching today checkin:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch recent check-ins (offline-first)
  fetchRecentCheckins: async (days = 7) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      const startDate = getDateDaysAgo(days);

      // Check cache first
      const cached = await getCachedCheckins(userId);
      const cachedRecent = cached.filter((c) => c.date >= startDate);

      if (cachedRecent.length > 0) {
        set({ recentCheckins: cachedRecent, isLoading: false });
      }

      // If online and cache is stale, fetch from server
      if (isDeviceOnline() && (await isCacheStale(userId, 'checkins', 15))) {
        const snapshot = await db
          .collection('users')
          .doc(userId)
          .collection('checkins')
          .where('date', '>=', startDate)
          .orderBy('date', 'desc')
          .limit(days)
          .get();

        const checkins = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Checkin[];

        set({ recentCheckins: checkins, isLoading: false });

        // Update cache with fresh data
        await cacheCheckins(userId, checkins);
      } else if (cachedRecent.length === 0) {
        set({ recentCheckins: [], isLoading: false });
      }
    } catch (error: any) {
      // On error, keep cached data
      console.error('Error fetching recent checkins:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Create new check-in (offline-first)
  createCheckin: async (data) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) throw new Error('Not authenticated');

    set({ isLoading: true, error: null });

    try {
      const today = getTodayString();

      const checkinData = {
        ...data,
        date: today,
        crisisDetected: data.crisisDetected ?? false,
        crisisHandled: data.crisisHandled ?? false,
        photoUri: data.photoUri,
      };

      // Use offline-first create function
      const newCheckin = await createCheckinOffline(userId, checkinData);

      set({
        todayCheckin: newCheckin,
        isLoading: false,
        draft: { ...initialDraft },
      });

      // Track check-in completion in analytics
      trackCheckInCompleted({
        mood_score: data.mood,
        stress_level: data.stress,
        sleep_hours: data.sleep,
        energy_level: data.energy,
        crisis_detected: data.crisisDetected,
      });

      // Track crisis events if detected
      if (data.crisisDetected) {
        trackEvent('crisis_detected', {
          handled: data.crisisHandled,
        });
      }

      // Update streak after successful check-in
      useStreakStore.getState().incrementStreak();

      return newCheckin;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Update draft
  updateDraft: (updates) => {
    set((state) => ({
      draft: { ...state.draft, ...updates },
    }));
  },

  // Clear draft
  clearDraft: () => {
    set({ draft: { ...initialDraft } });
  },

  // Refresh all data
  refresh: async () => {
    await Promise.all([
      get().fetchTodayCheckin(),
      get().fetchRecentCheckins(),
    ]);
  },
}));
