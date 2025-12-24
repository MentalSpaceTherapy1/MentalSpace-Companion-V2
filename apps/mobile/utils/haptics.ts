/**
 * Haptics Utility
 * Platform-safe wrapper for expo-haptics
 * Haptics are not available on web, so we check platform before triggering
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Trigger impact haptic feedback (safe for web)
 */
export const impactAsync = async (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium
): Promise<void> => {
  if (Platform.OS !== 'web') {
    await Haptics.impactAsync(style);
  }
};

/**
 * Trigger selection haptic feedback (safe for web)
 */
export const selectionAsync = async (): Promise<void> => {
  if (Platform.OS !== 'web') {
    await Haptics.selectionAsync();
  }
};

/**
 * Trigger notification haptic feedback (safe for web)
 */
export const notificationAsync = async (
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success
): Promise<void> => {
  if (Platform.OS !== 'web') {
    await Haptics.notificationAsync(type);
  }
};

// Re-export the enums for convenience
export const ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle;
export const NotificationFeedbackType = Haptics.NotificationFeedbackType;

/**
 * Alias for backward compatibility
 * Triggers a light impact haptic feedback
 */
export const triggerHaptic = async (
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' = 'light'
): Promise<void> => {
  if (Platform.OS === 'web') return;

  switch (type) {
    case 'light':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'medium':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'heavy':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'success':
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'warning':
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case 'error':
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
    case 'selection':
      await Haptics.selectionAsync();
      break;
  }
};
