/**
 * Accessibility Store
 * Zustand store for accessibility settings with AsyncStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TextSize = 'default' | 'large' | 'xlarge';

interface AccessibilitySettings {
  textSize: TextSize;
  highContrast: boolean;
  reduceMotion: boolean;
  dyslexiaFont: boolean;
  largerTouchTargets: boolean;
}

interface AccessibilityState extends AccessibilitySettings {
  // Actions
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const defaultSettings: AccessibilitySettings = {
  textSize: 'default',
  highContrast: false,
  reduceMotion: false,
  dyslexiaFont: false,
  largerTouchTargets: false,
};

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...defaultSettings,

      // Update a specific setting
      updateSetting: async (key, value) => {
        set({ [key]: value });
      },

      // Reset all settings to defaults
      resetToDefaults: async () => {
        set(defaultSettings);
      },
    }),
    {
      name: 'mentalspace-accessibility',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/**
 * Get text size multiplier based on setting
 */
export const getTextSizeMultiplier = (size: TextSize): number => {
  switch (size) {
    case 'large':
      return 1.15;
    case 'xlarge':
      return 1.3;
    default:
      return 1;
  }
};

/**
 * Get touch target size multiplier based on setting
 */
export const getTouchTargetMultiplier = (largerTargets: boolean): number => {
  return largerTargets ? 1.2 : 1;
};
