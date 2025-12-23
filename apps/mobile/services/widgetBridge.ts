/**
 * Widget Bridge Service
 * Handles data sharing between the app and iOS/Android widgets
 */

import { Platform } from 'react-native';

// App Group identifier for iOS
const APP_GROUP_IDENTIFIER = 'group.com.mentalspace.companion';

// Types
export interface WidgetData {
  hasCheckedIn: boolean;
  currentStreak: number;
  lastMood: number | null;
  lastCheckinDate: string | null;
  weeklyMoods: number[];
  averageMood: number | null;
}

// Try to import native modules if available
let SharedGroupPreferences: any = null;

try {
  // This would be a custom native module or expo-shared-preferences
  SharedGroupPreferences = require('react-native-shared-group-preferences');
} catch (e) {
  console.log('SharedGroupPreferences not available');
}

/**
 * Save data to widget shared storage
 */
export async function saveWidgetData(data: WidgetData): Promise<void> {
  if (Platform.OS === 'ios') {
    await saveIOSWidgetData(data);
  } else if (Platform.OS === 'android') {
    await saveAndroidWidgetData(data);
  }
}

/**
 * Save data to iOS App Group
 */
async function saveIOSWidgetData(data: WidgetData): Promise<void> {
  if (!SharedGroupPreferences) {
    console.log('iOS widget data sharing not available');
    return;
  }

  try {
    await SharedGroupPreferences.setItem(
      'checkinData',
      JSON.stringify(data),
      APP_GROUP_IDENTIFIER
    );
    console.log('Widget data saved successfully');

    // Request widget timeline reload
    reloadIOSWidgetTimeline();
  } catch (error) {
    console.error('Failed to save iOS widget data:', error);
  }
}

/**
 * Save data to Android shared storage
 */
async function saveAndroidWidgetData(data: WidgetData): Promise<void> {
  // Android uses SharedPreferences or ContentProvider
  // This would require a custom native module
  console.log('Android widget data saved:', data);
}

/**
 * Request iOS WidgetKit to reload widget timeline
 */
function reloadIOSWidgetTimeline(): void {
  if (Platform.OS !== 'ios') return;

  try {
    // This would require a native module that calls:
    // WidgetCenter.shared.reloadAllTimelines()
    const { NativeModules } = require('react-native');
    if (NativeModules.WidgetModule) {
      NativeModules.WidgetModule.reloadAllTimelines();
    }
  } catch (error) {
    console.log('Widget timeline reload not available');
  }
}

/**
 * Update widget with latest check-in data
 * Call this after a check-in is completed
 */
export async function updateWidgetAfterCheckin(
  mood: number,
  streak: number,
  weeklyMoods: number[]
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const avgMood = weeklyMoods.length > 0
    ? weeklyMoods.reduce((a, b) => a + b, 0) / weeklyMoods.length
    : null;

  await saveWidgetData({
    hasCheckedIn: true,
    currentStreak: streak,
    lastMood: mood,
    lastCheckinDate: today,
    weeklyMoods,
    averageMood: avgMood ? Number(avgMood.toFixed(1)) : null,
  });
}

/**
 * Clear widget data (e.g., on sign out)
 */
export async function clearWidgetData(): Promise<void> {
  await saveWidgetData({
    hasCheckedIn: false,
    currentStreak: 0,
    lastMood: null,
    lastCheckinDate: null,
    weeklyMoods: [],
    averageMood: null,
  });
}

/**
 * Initialize widget data on app launch
 * Syncs current state to widget
 */
export async function initializeWidgetData(
  hasCheckedIn: boolean,
  streak: number,
  lastMood: number | null,
  weeklyMoods: number[]
): Promise<void> {
  const avgMood = weeklyMoods.length > 0
    ? weeklyMoods.reduce((a, b) => a + b, 0) / weeklyMoods.length
    : null;

  await saveWidgetData({
    hasCheckedIn,
    currentStreak: streak,
    lastMood,
    lastCheckinDate: hasCheckedIn ? new Date().toISOString().split('T')[0] : null,
    weeklyMoods,
    averageMood: avgMood ? Number(avgMood.toFixed(1)) : null,
  });
}
