/**
 * Streak Store
 * Zustand store for streak state management
 */

import { create } from 'zustand';
import { useAuthStore } from './authStore';
import {
  StreakData,
  calculateStreak,
  getCachedStreak,
  isCachedStreakStale,
  checkStreakMilestone,
  getStreakMessage,
} from '../services/streakService';

interface StreakState {
  // State
  streak: StreakData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStreak: () => Promise<void>;
  refreshStreak: () => Promise<void>;
  incrementStreak: () => Promise<void>;
}

const initialStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  totalCheckins: 0,
  lastCheckinDate: null,
  streakStartDate: null,
  isActive: false,
};

export const useStreakStore = create<StreakState>((set, get) => ({
  // Initial state
  streak: null,
  isLoading: false,
  error: null,

  // Fetch streak (uses cache first, then fetches fresh if stale)
  fetchStreak: async () => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      // Check cache first
      const cached = await getCachedStreak(userId);

      if (cached && !isCachedStreakStale(cached)) {
        set({ streak: cached.data, isLoading: false });
        return;
      }

      // Cache is stale or missing, calculate fresh
      const streakData = await calculateStreak(userId);
      set({ streak: streakData, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching streak:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Force refresh streak (bypasses cache)
  refreshStreak: async () => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      const streakData = await calculateStreak(userId);
      set({ streak: streakData, isLoading: false });

      // Check for milestone celebrations
      if (streakData.currentStreak > 0) {
        await checkStreakMilestone(userId, streakData.currentStreak);
      }
    } catch (error: any) {
      console.error('Error refreshing streak:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Increment streak after a check-in (optimistic update + validation)
  incrementStreak: async () => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    const currentStreak = get().streak;

    // Optimistic update
    if (currentStreak) {
      const today = new Date().toISOString().split('T')[0];

      // Only increment if not already checked in today
      if (currentStreak.lastCheckinDate !== today) {
        const newStreak = currentStreak.currentStreak + 1;
        set({
          streak: {
            ...currentStreak,
            currentStreak: newStreak,
            longestStreak: Math.max(currentStreak.longestStreak, newStreak),
            lastCheckinDate: today,
            totalCheckins: currentStreak.totalCheckins + 1,
            isActive: true,
          },
        });

        // Check for milestone celebration
        await checkStreakMilestone(userId, newStreak);
      }
    }

    // Validate with server in background
    try {
      const validatedStreak = await calculateStreak(userId);
      set({ streak: validatedStreak });
    } catch (error) {
      console.error('Error validating streak:', error);
      // Keep optimistic update on error
    }
  },
}));

// Export helper function
export { getStreakMessage };
