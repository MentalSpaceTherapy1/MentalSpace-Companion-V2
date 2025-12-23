/**
 * Quick Actions Service
 * Handles iOS Quick Actions (3D Touch/Haptic Touch) and Android App Shortcuts
 */

import { Platform } from 'react-native';
import { router } from 'expo-router';

// Types for Quick Actions
export interface QuickAction {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  params?: Record<string, string>;
}

// Define available quick actions
export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'checkin',
    title: 'Check-in Now',
    subtitle: 'Start your daily check-in',
    icon: 'add_circle',
    params: { screen: 'checkin' },
  },
  {
    id: 'journal',
    title: 'New Journal Entry',
    subtitle: 'Write in your journal',
    icon: 'book',
    params: { screen: 'journal' },
  },
  {
    id: 'plan',
    title: 'View Today\'s Plan',
    subtitle: 'See your action plan',
    icon: 'list',
    params: { screen: 'plan' },
  },
  {
    id: 'sos',
    title: 'Get Help',
    subtitle: 'Access crisis resources',
    icon: 'heart',
    params: { screen: 'sos' },
  },
];

// Try to import expo-quick-actions if available
let QuickActions: any = null;

try {
  // Dynamic import to handle cases where the package isn't installed
  QuickActions = require('expo-quick-actions');
} catch (e) {
  console.log('expo-quick-actions not available, using fallback');
}

/**
 * Initialize quick actions for the app
 */
export async function initializeQuickActions(): Promise<void> {
  if (!QuickActions) {
    console.log('Quick actions not supported on this platform');
    return;
  }

  try {
    // Set up static quick actions
    await QuickActions.setItems(
      QUICK_ACTIONS.map((action) => ({
        id: action.id,
        title: action.title,
        subtitle: action.subtitle,
        icon: Platform.select({
          ios: action.icon,
          android: action.icon,
        }),
        params: action.params,
      }))
    );

    console.log('Quick actions initialized successfully');
  } catch (error) {
    console.error('Failed to initialize quick actions:', error);
  }
}

/**
 * Handle quick action when app is opened via quick action
 */
export async function handleQuickAction(action: QuickAction | null): Promise<void> {
  if (!action) return;

  console.log('Handling quick action:', action.id);

  // Navigate based on the action
  switch (action.id) {
    case 'checkin':
      router.push('/(tabs)/checkin');
      break;
    case 'journal':
      router.push('/(journal)/entry');
      break;
    case 'plan':
      router.push('/(tabs)/plan');
      break;
    case 'sos':
      router.push('/(tabs)/sos');
      break;
    default:
      console.log('Unknown quick action:', action.id);
  }
}

/**
 * Get the initial quick action that launched the app
 */
export async function getInitialQuickAction(): Promise<QuickAction | null> {
  if (!QuickActions) return null;

  try {
    const initial = await QuickActions.getInitialAction();
    return initial;
  } catch (error) {
    console.error('Failed to get initial quick action:', error);
    return null;
  }
}

/**
 * Subscribe to quick action events
 */
export function subscribeToQuickActions(
  callback: (action: QuickAction) => void
): () => void {
  if (!QuickActions) {
    return () => {}; // No-op unsubscribe
  }

  const subscription = QuickActions.addListener((action: QuickAction) => {
    callback(action);
  });

  return () => {
    subscription.remove();
  };
}

/**
 * Update dynamic quick actions based on user state
 * Call this when user state changes (e.g., after check-in)
 */
export async function updateDynamicActions(
  hasCheckedInToday: boolean,
  currentStreak: number
): Promise<void> {
  if (!QuickActions) return;

  try {
    const dynamicActions = [...QUICK_ACTIONS];

    // Update check-in action based on whether user has checked in
    if (hasCheckedInToday) {
      const checkinIndex = dynamicActions.findIndex((a) => a.id === 'checkin');
      if (checkinIndex >= 0) {
        dynamicActions[checkinIndex] = {
          ...dynamicActions[checkinIndex],
          title: 'View Check-in',
          subtitle: `${currentStreak} day streak!`,
        };
      }
    }

    await QuickActions.setItems(
      dynamicActions.map((action) => ({
        id: action.id,
        title: action.title,
        subtitle: action.subtitle,
        icon: action.icon,
        params: action.params,
      }))
    );
  } catch (error) {
    console.error('Failed to update dynamic actions:', error);
  }
}
