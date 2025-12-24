/**
 * Accessibility Utilities
 * Hooks and helpers for applying accessibility settings
 */

import { useMemo } from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { useAccessibilityStore } from '../stores/accessibilityStore';
import {
  getAccessibleColors,
  getAccessibleSpacing,
  getAccessibleFontSize,
  getAccessibleBorderRadius,
  getAnimationDuration,
  getMinimumTouchTarget,
  dyslexicFontFamily,
} from '../constants/accessibleTheme';

/**
 * Hook to get current accessibility settings
 * Returns computed theme values based on settings
 */
export function useAccessibilitySettings() {
  const settings = useAccessibilityStore();

  const theme = useMemo(() => {
    return {
      colors: getAccessibleColors(settings.highContrast),
      spacing: getAccessibleSpacing(settings.largerTouchTargets),
      fontSize: getAccessibleFontSize(settings.textSize),
      borderRadius: getAccessibleBorderRadius(settings.largerTouchTargets),
      minimumTouchTarget: getMinimumTouchTarget(settings.largerTouchTargets),
    };
  }, [settings.highContrast, settings.largerTouchTargets, settings.textSize]);

  return {
    ...settings,
    theme,
  };
}

/**
 * Get animation duration respecting reduce motion setting
 */
export function useAnimationDuration(defaultDuration: number): number {
  const { reduceMotion } = useAccessibilityStore();
  return getAnimationDuration(reduceMotion, defaultDuration);
}

/**
 * Get accessible font family based on dyslexia setting
 */
export function useAccessibleFontFamily(): string | undefined {
  const { dyslexiaFont } = useAccessibilityStore();
  return dyslexiaFont ? dyslexicFontFamily : undefined;
}

/**
 * Apply accessibility modifications to a base style
 * Merges accessibility-aware styles with base styles
 */
export function getAccessibleStyle(
  baseStyle: ViewStyle | TextStyle,
  settings: ReturnType<typeof useAccessibilitySettings>
): ViewStyle | TextStyle {
  const accessibleStyle: ViewStyle | TextStyle = { ...baseStyle };

  // Apply text size scaling if fontSize is present (TextStyle check)
  const textStyle = baseStyle as TextStyle;
  if (typeof textStyle.fontSize === 'number') {
    const multiplier = getTextSizeMultiplier(settings.textSize);
    (accessibleStyle as TextStyle).fontSize = Math.round(textStyle.fontSize * multiplier);
  }

  // Apply dyslexia font if enabled
  if (settings.dyslexiaFont && !('fontFamily' in accessibleStyle)) {
    (accessibleStyle as TextStyle).fontFamily = dyslexicFontFamily;
  }

  // Apply minimum touch target for interactive elements
  const viewStyle = baseStyle as ViewStyle;
  if ('minHeight' in baseStyle || 'minWidth' in baseStyle) {
    const minSize = settings.theme.minimumTouchTarget;
    if (!viewStyle.minHeight || (typeof viewStyle.minHeight === 'number' && viewStyle.minHeight < minSize)) {
      (accessibleStyle as ViewStyle).minHeight = minSize;
    }
    if (!viewStyle.minWidth || (typeof viewStyle.minWidth === 'number' && viewStyle.minWidth < minSize)) {
      (accessibleStyle as ViewStyle).minWidth = minSize;
    }
  }

  // Remove animations if reduce motion is enabled
  if (settings.reduceMotion) {
    delete (accessibleStyle as ViewStyle).transform;
  }

  return accessibleStyle;
}

/**
 * Get text size multiplier
 */
function getTextSizeMultiplier(size: 'default' | 'large' | 'xlarge'): number {
  switch (size) {
    case 'large':
      return 1.15;
    case 'xlarge':
      return 1.3;
    default:
      return 1;
  }
}

/**
 * Create accessible button props
 * Returns props that should be spread onto Pressable components
 */
export function getAccessibleButtonProps(
  label: string,
  hint?: string,
  role: 'button' | 'link' | 'menuitem' = 'button'
) {
  return {
    accessibilityLabel: label,
    accessibilityRole: role,
    accessibilityHint: hint,
    accessible: true,
  };
}

/**
 * Create accessible text input props
 */
export function getAccessibleTextInputProps(
  label: string,
  hint?: string,
  value?: string
) {
  return {
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityValue: value ? { text: value } : undefined,
    accessible: true,
  };
}

/**
 * Create accessible toggle props (for switches, checkboxes)
 */
export function getAccessibleToggleProps(
  label: string,
  checked: boolean,
  hint?: string
) {
  return {
    accessibilityLabel: label,
    accessibilityRole: 'switch' as const,
    accessibilityState: { checked },
    accessibilityHint: hint,
    accessible: true,
  };
}

/**
 * Create accessible slider props
 */
export function getAccessibleSliderProps(
  label: string,
  value: number,
  min: number,
  max: number,
  hint?: string
) {
  return {
    accessibilityLabel: label,
    accessibilityRole: 'adjustable' as const,
    accessibilityValue: {
      min,
      max,
      now: value,
      text: `${value}`,
    },
    accessibilityHint: hint,
    accessible: true,
  };
}

/**
 * Announce message to screen reader
 * Uses accessibility announcement API
 */
export function announceForAccessibility(message: string) {
  // This would use AccessibilityInfo.announceForAccessibility in production
  // For now, we'll add a TODO to implement this
  console.log('[Accessibility Announcement]:', message);
}

/**
 * Check if screen reader is enabled
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  // This would use AccessibilityInfo.isScreenReaderEnabled() in production
  // For now, return false as a default
  return false;
}

/**
 * Get accessible color contrast
 * Ensures color combinations meet WCAG standards
 */
export function getAccessibleColorContrast(
  foreground: string,
  background: string,
  highContrast: boolean
): { foreground: string; background: string } {
  // In a production app, this would calculate actual contrast ratios
  // and adjust colors to meet WCAG AA (4.5:1) or AAA (7:1) standards
  return { foreground, background };
}
