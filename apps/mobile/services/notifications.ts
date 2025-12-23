/**
 * Push Notifications Service
 * Handles push notification setup, permissions, and scheduling
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Storage keys
const PUSH_TOKEN_KEY = 'push_token';
const NOTIFICATION_PREFS_KEY = 'notification_preferences';

// Notification categories for different types of notifications
export const NOTIFICATION_CATEGORIES = {
  DAILY_CHECKIN: 'daily_checkin',
  GENTLE_NUDGE: 'gentle_nudge',
  ACTION_REMINDER: 'action_reminder',
  WEEKLY_SUMMARY: 'weekly_summary',
  STREAK_CELEBRATION: 'streak_celebration',
  SESSION_REMINDER: 'session_reminder',
  RE_ENGAGEMENT: 're_engagement',
} as const;

export type NotificationCategory = typeof NOTIFICATION_CATEGORIES[keyof typeof NOTIFICATION_CATEGORIES];

export interface NotificationPreferences {
  dailyCheckin: boolean;
  dailyCheckinTime: string; // HH:MM format
  gentleNudges: boolean;
  actionReminders: boolean;
  weeklySummary: boolean;
  streakCelebrations: boolean;
  sessionReminders: boolean;
  privacyMode: boolean; // Hides notification content
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  dailyCheckin: true,
  dailyCheckinTime: '09:00',
  gentleNudges: true,
  actionReminders: true,
  weeklySummary: true,
  streakCelebrations: true,
  sessionReminders: true,
  privacyMode: false,
};

// ========================================
// NOTIFICATION SETUP
// ========================================

/**
 * Configure notification handler
 * Should be called at app startup
 */
export function configureNotifications() {
  // Notifications not supported on web
  if (Platform.OS === 'web') return;

  // Set notification handler for foreground notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Set up notification categories with actions
  if (Platform.OS === 'ios') {
    Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.DAILY_CHECKIN, [
      {
        identifier: 'start_checkin',
        buttonTitle: 'Start Check-in',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'snooze',
        buttonTitle: 'Remind me later',
        options: { opensAppToForeground: false },
      },
    ]);

    Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.ACTION_REMINDER, [
      {
        identifier: 'start_action',
        buttonTitle: 'Start Now',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'skip_action',
        buttonTitle: 'Skip',
        options: { opensAppToForeground: false },
      },
    ]);
  }
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  // Notifications not supported on web
  if (Platform.OS === 'web') return false;

  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notification permissions not granted');
    return false;
  }

  // Get and store push token
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'MentalSpace',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#38B6E0',
    });

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250],
      lightColor: '#38B6E0',
    });
  }

  return true;
}

/**
 * Get the push notification token
 */
export async function getPushToken(): Promise<string | null> {
  // Not available on web
  if (Platform.OS === 'web') return null;

  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    // Store locally
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token.data);

    return token.data;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
}

/**
 * Register push token with the server
 */
export async function registerPushToken(userId: string): Promise<void> {
  const token = await getPushToken();
  if (!token) return;

  try {
    await updateDoc(doc(db, 'users', userId), {
      pushToken: token,
      pushTokenUpdatedAt: new Date(),
      devicePlatform: Platform.OS,
    });
  } catch (error) {
    console.error('Failed to register push token:', error);
  }
}

// ========================================
// LOCAL NOTIFICATIONS (SCHEDULED)
// ========================================

/**
 * Schedule daily check-in reminder
 */
export async function scheduleDailyCheckinReminder(time: string): Promise<string | null> {
  // Not available on web
  if (Platform.OS === 'web') return null;

  const [hours, minutes] = time.split(':').map(Number);
  const prefs = await getNotificationPreferences();

  // Cancel existing daily check-in notifications
  await cancelNotificationsByCategory(NOTIFICATION_CATEGORIES.DAILY_CHECKIN);

  const content: Notifications.NotificationContentInput = prefs.privacyMode
    ? {
        title: 'MentalSpace',
        body: 'Tap to open',
        data: { type: NOTIFICATION_CATEGORIES.DAILY_CHECKIN },
      }
    : {
        title: 'Ready for your check-in?',
        body: '60 seconds to check in and get your personalized plan.',
        data: { type: NOTIFICATION_CATEGORIES.DAILY_CHECKIN },
        categoryIdentifier: NOTIFICATION_CATEGORIES.DAILY_CHECKIN,
      };

  const identifier = await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });

  return identifier;
}

/**
 * Schedule a gentle nudge if check-in is missed
 * Triggered 4 hours after daily check-in time
 */
export async function scheduleGentleNudge(checkinTime: string): Promise<string | null> {
  // Not available on web
  if (Platform.OS === 'web') return null;

  const [hours, minutes] = checkinTime.split(':').map(Number);
  const prefs = await getNotificationPreferences();

  if (!prefs.gentleNudges) return null;

  // Calculate nudge time (4 hours after check-in time)
  let nudgeHours = hours + 4;
  if (nudgeHours >= 24) nudgeHours -= 24;

  const content: Notifications.NotificationContentInput = prefs.privacyMode
    ? {
        title: 'MentalSpace',
        body: 'Tap to open',
        data: { type: NOTIFICATION_CATEGORIES.GENTLE_NUDGE },
      }
    : {
        title: "You haven't checked in today",
        body: 'How are you feeling? Take a moment to check in.',
        data: { type: NOTIFICATION_CATEGORIES.GENTLE_NUDGE },
      };

  const identifier = await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      hour: nudgeHours,
      minute: minutes,
      repeats: true,
    },
  });

  return identifier;
}

/**
 * Schedule an action reminder
 */
export async function scheduleActionReminder(
  actionId: string,
  actionTitle: string,
  scheduledTime: Date
): Promise<string | null> {
  // Not available on web
  if (Platform.OS === 'web') return null;

  const prefs = await getNotificationPreferences();

  if (!prefs.actionReminders) return null;

  const content: Notifications.NotificationContentInput = prefs.privacyMode
    ? {
        title: 'MentalSpace',
        body: 'Tap to open',
        data: { type: NOTIFICATION_CATEGORIES.ACTION_REMINDER, actionId },
      }
    : {
        title: 'Time for your wellness action',
        body: actionTitle,
        data: { type: NOTIFICATION_CATEGORIES.ACTION_REMINDER, actionId },
        categoryIdentifier: NOTIFICATION_CATEGORIES.ACTION_REMINDER,
      };

  const identifier = await Notifications.scheduleNotificationAsync({
    content,
    trigger: scheduledTime,
  });

  return identifier;
}

/**
 * Schedule weekly summary notification (Sunday 7pm)
 */
export async function scheduleWeeklySummary(): Promise<string | null> {
  // Not available on web
  if (Platform.OS === 'web') return null;

  const prefs = await getNotificationPreferences();

  if (!prefs.weeklySummary) return null;

  // Cancel existing weekly summary notifications
  await cancelNotificationsByCategory(NOTIFICATION_CATEGORIES.WEEKLY_SUMMARY);

  const content: Notifications.NotificationContentInput = prefs.privacyMode
    ? {
        title: 'MentalSpace',
        body: 'Tap to open',
        data: { type: NOTIFICATION_CATEGORIES.WEEKLY_SUMMARY },
      }
    : {
        title: 'Your weekly summary is ready',
        body: 'See your progress and trends from this week.',
        data: { type: NOTIFICATION_CATEGORIES.WEEKLY_SUMMARY },
      };

  const identifier = await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      weekday: 1, // Sunday
      hour: 19,
      minute: 0,
      repeats: true,
    },
  });

  return identifier;
}

/**
 * Send streak celebration notification
 */
export async function sendStreakCelebration(streakDays: number): Promise<void> {
  // Not available on web
  if (Platform.OS === 'web') return;

  const prefs = await getNotificationPreferences();

  if (!prefs.streakCelebrations) return;

  let message: string;
  switch (streakDays) {
    case 3:
      message = "You're building a habit!";
      break;
    case 7:
      message = 'One week! You are showing up for yourself.';
      break;
    case 14:
      message = 'Two weeks strong!';
      break;
    case 30:
      message = 'One month. This is becoming part of who you are.';
      break;
    default:
      message = `${streakDays} days and counting!`;
  }

  const content: Notifications.NotificationContentInput = prefs.privacyMode
    ? {
        title: 'MentalSpace',
        body: 'Tap to open',
        data: { type: NOTIFICATION_CATEGORIES.STREAK_CELEBRATION, streakDays },
      }
    : {
        title: `${streakDays} Day Streak!`,
        body: message,
        data: { type: NOTIFICATION_CATEGORIES.STREAK_CELEBRATION, streakDays },
      };

  await Notifications.scheduleNotificationAsync({
    content,
    trigger: null, // Immediate
  });
}

/**
 * Schedule therapy session reminder
 */
export async function scheduleSessionReminder(
  sessionId: string,
  therapistName: string,
  sessionTime: Date
): Promise<string[]> {
  // Not available on web
  if (Platform.OS === 'web') return [];

  const prefs = await getNotificationPreferences();
  const identifiers: string[] = [];

  if (!prefs.sessionReminders) return identifiers;

  // 24 hours before
  const dayBefore = new Date(sessionTime.getTime() - 24 * 60 * 60 * 1000);
  if (dayBefore > new Date()) {
    const id1 = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Session Tomorrow',
        body: `Your session with ${therapistName} is tomorrow.`,
        data: { type: NOTIFICATION_CATEGORIES.SESSION_REMINDER, sessionId },
      },
      trigger: dayBefore,
    });
    identifiers.push(id1);
  }

  // 1 hour before
  const hourBefore = new Date(sessionTime.getTime() - 60 * 60 * 1000);
  if (hourBefore > new Date()) {
    const id2 = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Session in 1 Hour',
        body: `Your session with ${therapistName} starts in 1 hour.`,
        data: { type: NOTIFICATION_CATEGORIES.SESSION_REMINDER, sessionId },
      },
      trigger: hourBefore,
    });
    identifiers.push(id2);
  }

  return identifiers;
}

// ========================================
// NOTIFICATION MANAGEMENT
// ========================================

/**
 * Cancel all notifications of a specific category
 */
export async function cancelNotificationsByCategory(category: NotificationCategory): Promise<void> {
  // Not available on web
  if (Platform.OS === 'web') return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter(
    (notification) => notification.content.data?.type === category
  );

  for (const notification of toCancel) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
}

/**
 * Cancel a specific notification
 */
export async function cancelNotification(identifier: string): Promise<void> {
  // Not available on web
  if (Platform.OS === 'web') return;

  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  // Not available on web
  if (Platform.OS === 'web') return;

  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  // Not available on web
  if (Platform.OS === 'web') return 0;

  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  // Not available on web
  if (Platform.OS === 'web') return;

  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear badge
 */
export async function clearBadge(): Promise<void> {
  await setBadgeCount(0);
}

// ========================================
// PREFERENCES
// ========================================

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to get notification preferences:', error);
  }
  return DEFAULT_PREFERENCES;
}

/**
 * Save notification preferences
 */
export async function saveNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  try {
    const current = await getNotificationPreferences();
    const updated = { ...current, ...preferences };
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(updated));

    // Re-schedule notifications based on new preferences
    if (preferences.dailyCheckin !== undefined || preferences.dailyCheckinTime !== undefined) {
      if (updated.dailyCheckin) {
        await scheduleDailyCheckinReminder(updated.dailyCheckinTime);
        await scheduleGentleNudge(updated.dailyCheckinTime);
      } else {
        await cancelNotificationsByCategory(NOTIFICATION_CATEGORIES.DAILY_CHECKIN);
        await cancelNotificationsByCategory(NOTIFICATION_CATEGORIES.GENTLE_NUDGE);
      }
    }

    if (preferences.weeklySummary !== undefined) {
      if (updated.weeklySummary) {
        await scheduleWeeklySummary();
      } else {
        await cancelNotificationsByCategory(NOTIFICATION_CATEGORIES.WEEKLY_SUMMARY);
      }
    }
  } catch (error) {
    console.error('Failed to save notification preferences:', error);
    throw error;
  }
}

// ========================================
// NOTIFICATION LISTENERS
// ========================================

/**
 * Add a listener for when a notification is received while app is foregrounded
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription | null {
  // Not available on web
  if (Platform.OS === 'web') return null;

  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add a listener for when user interacts with a notification
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription | null {
  // Not available on web
  if (Platform.OS === 'web') return null;

  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Remove a notification listener
 */
export function removeNotificationListener(subscription: Notifications.Subscription | null): void {
  if (subscription) {
    subscription.remove();
  }
}
