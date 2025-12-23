/**
 * useQuickActions Hook
 * Handles initialization and handling of iOS Quick Actions / Android App Shortcuts
 */

import { useEffect, useCallback, useRef } from 'react';
import {
  initializeQuickActions,
  handleQuickAction,
  getInitialQuickAction,
  subscribeToQuickActions,
  updateDynamicActions,
  QuickAction,
} from '../services/quickActions';
import { useCheckinStore } from '../stores/checkinStore';
import { useStreakStore } from '../stores/streakStore';

interface UseQuickActionsOptions {
  enabled?: boolean;
}

export function useQuickActions(options: UseQuickActionsOptions = {}) {
  const { enabled = true } = options;
  const initialized = useRef(false);
  const { todayCheckin } = useCheckinStore();
  const { streak } = useStreakStore();

  // Initialize quick actions on mount
  useEffect(() => {
    if (!enabled || initialized.current) return;

    const init = async () => {
      try {
        // Initialize quick actions
        await initializeQuickActions();

        // Check if app was launched from a quick action
        const initialAction = await getInitialQuickAction();
        if (initialAction) {
          handleQuickAction(initialAction);
        }

        initialized.current = true;
      } catch (error) {
        console.error('Failed to initialize quick actions:', error);
      }
    };

    init();
  }, [enabled]);

  // Subscribe to quick action events
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribeToQuickActions((action: QuickAction) => {
      handleQuickAction(action);
    });

    return unsubscribe;
  }, [enabled]);

  // Update dynamic actions when check-in status changes
  useEffect(() => {
    if (!enabled) return;

    const hasCheckedIn = !!todayCheckin;
    const currentStreak = streak?.currentStreak ?? 0;

    updateDynamicActions(hasCheckedIn, currentStreak);
  }, [enabled, todayCheckin, streak]);

  // Manual trigger for handling a quick action
  const handleAction = useCallback((action: QuickAction) => {
    handleQuickAction(action);
  }, []);

  return {
    handleAction,
  };
}
