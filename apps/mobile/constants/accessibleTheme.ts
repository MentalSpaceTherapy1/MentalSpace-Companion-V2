/**
 * Accessible Theme Constants
 * Enhanced colors, spacing, and font sizes for accessibility
 */

import { colors, spacing, typography } from './theme';
import type { TextSize } from '../stores/accessibilityStore';

/**
 * Get accessible colors with higher contrast ratios
 * Ensures WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
 */
export const getAccessibleColors = (highContrast: boolean) => {
  if (!highContrast) {
    return colors;
  }

  return {
    ...colors,
    // Enhanced primary colors with higher contrast
    primary: '#2A9BC5',
    primaryLight: '#38B6E0',
    primaryDark: '#1B7FA0',

    // Enhanced secondary colors
    secondary: '#1B8A56',
    secondaryLight: '#22A267',
    secondaryDark: '#126B3E',

    // Enhanced text colors for better contrast
    text: '#0A1520',
    textSecondary: '#2A3B4C',
    textTertiary: '#5A6B7C',

    // Enhanced background colors
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSecondary: '#F8FAFB',
    border: '#1A2B3C',
    borderLight: '#2A3B4C',

    // Enhanced semantic colors
    success: '#1B8A56',
    warning: '#D97706',
    error: '#C53030',
    info: '#2A9BC5',

    // Enhanced SOS colors
    sos: '#C53030',
    sosLight: '#E85A5A',
    sosDark: '#9B2C2C',

    // Enhanced dark mode variants
    dark: {
      background: '#000000',
      surface: '#0A1520',
      surfaceSecondary: '#1A2B3C',
      border: '#5A6B7C',
      borderLight: '#2A3B4C',
      text: '#FFFFFF',
      textSecondary: '#E2E8F0',
      textTertiary: '#B0C0D0',
    },
  };
};

/**
 * Get accessible spacing with larger touch targets
 * Minimum 44pt touch target size as per iOS HIG and Android Material Design
 */
export const getAccessibleSpacing = (largerTouchTargets: boolean) => {
  if (!largerTouchTargets) {
    return spacing;
  }

  return {
    xs: 6,    // +2pt
    sm: 12,   // +4pt
    md: 20,   // +4pt
    lg: 28,   // +4pt
    xl: 40,   // +8pt
    xxl: 56,  // +8pt
  };
};

/**
 * Get accessible font sizes with text scaling
 * Scales all typography sizes by the selected multiplier
 */
export const getAccessibleFontSize = (size: TextSize) => {
  const multiplier = getTextSizeMultiplier(size);

  return {
    xs: Math.round(typography.fontSize.xs * multiplier),
    sm: Math.round(typography.fontSize.sm * multiplier),
    base: Math.round(typography.fontSize.base * multiplier),
    lg: Math.round(typography.fontSize.lg * multiplier),
    xl: Math.round(typography.fontSize.xl * multiplier),
    '2xl': Math.round(typography.fontSize['2xl'] * multiplier),
    '3xl': Math.round(typography.fontSize['3xl'] * multiplier),
    '4xl': Math.round(typography.fontSize['4xl'] * multiplier),
  };
};

/**
 * Text size multiplier helper
 */
function getTextSizeMultiplier(size: TextSize): number {
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
 * Get minimum touch target size
 * Returns the minimum size for interactive elements
 */
export const getMinimumTouchTarget = (largerTouchTargets: boolean): number => {
  return largerTouchTargets ? 52 : 44;
};

/**
 * OpenDyslexic font family
 * Note: Font must be loaded via expo-font
 */
export const dyslexicFontFamily = 'OpenDyslexic';

/**
 * Animation duration helper
 * Returns 0 if reduce motion is enabled
 */
export const getAnimationDuration = (
  reduceMotion: boolean,
  defaultDuration: number
): number => {
  return reduceMotion ? 0 : defaultDuration;
};

/**
 * Get accessible border radius
 * Larger touch targets may benefit from slightly larger border radius
 */
export const getAccessibleBorderRadius = (largerTouchTargets: boolean) => {
  if (!largerTouchTargets) {
    return {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      xxl: 24,
      full: 9999,
    };
  }

  return {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    xxl: 28,
    full: 9999,
  };
};
