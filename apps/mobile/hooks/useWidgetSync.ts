/**
 * useWidgetSync Hook
 * Keeps widget data in sync with app state
 */

import { useEffect, useRef } from 'react';
import {
  initializeWidgetData,
  updateWidgetAfterCheckin,
  clearWidgetData,
} from '../services/widgetBridge';
import { useCheckinStore } from '../stores/checkinStore';
import { useStreakStore } from '../stores/streakStore';
import { useAuthStore } from '../stores/authStore';

interface UseWidgetSyncOptions {
  enabled?: boolean;
}

export function useWidgetSync(options: UseWidgetSyncOptions = {}) {
  const { enabled = true } = options;
  const lastSyncRef = useRef<string | null>(null);

  const { user } = useAuthStore();
  const { todayCheckin, weekCheckins } = useCheckinStore();
  const { streak } = useStreakStore();

  // Initialize widget data on mount
  useEffect(() => {
    if (!enabled || !user) return;

    const init = async () => {
      try {
        const hasCheckedIn = !!todayCheckin;
        const currentStreak = streak?.currentStreak ?? 0;
        const lastMood = todayCheckin?.mood ?? null;
        const weeklyMoods = (weekCheckins || [])
          .map((c) => c.mood)
          .filter((m): m is number => m !== undefined);

        await initializeWidgetData(hasCheckedIn, currentStreak, lastMood, weeklyMoods);
      } catch (error) {
        console.error('Failed to initialize widget data:', error);
      }
    };

    init();
  }, [enabled, user]);

  // Update widget when check-in changes
  useEffect(() => {
    if (!enabled || !user || !todayCheckin) return;

    // Prevent duplicate syncs
    const syncKey = `${todayCheckin.id}-${todayCheckin.mood}`;
    if (lastSyncRef.current === syncKey) return;
    lastSyncRef.current = syncKey;

    const sync = async () => {
      try {
        const weeklyMoods = (weekCheckins || [])
          .map((c) => c.mood)
          .filter((m): m is number => m !== undefined);

        await updateWidgetAfterCheckin(
          todayCheckin.mood,
          streak?.currentStreak ?? 0,
          weeklyMoods
        );
      } catch (error) {
        console.error('Failed to sync widget data:', error);
      }
    };

    sync();
  }, [enabled, user, todayCheckin, weekCheckins, streak]);

  // Clear widget data on sign out
  useEffect(() => {
    if (!enabled) return;

    if (!user) {
      clearWidgetData();
      lastSyncRef.current = null;
    }
  }, [enabled, user]);
}
