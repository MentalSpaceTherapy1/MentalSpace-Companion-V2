/**
 * Theme Constants
 * MentalSpace Brand Design System
 * Primary: Sky Blue (#38B6E0)
 * Secondary: Fresh Green (#22A267)
 */

export const colors = {
  // Base colors
  white: '#FFFFFF',
  black: '#000000',

  // Primary brand colors (Sky Blue)
  primary: '#38B6E0',
  primaryLight: '#5CC7E8',
  primaryDark: '#2A9BC5',

  // Secondary colors (Fresh Green)
  secondary: '#22A267',
  secondaryLight: '#2EBB7A',
  secondaryDark: '#1B8A56',

  // Accent colors
  accent: '#14B8A6',
  accentLight: '#2DD4BF',
  accentDark: '#0D9488',

  // Category colors (aligned with brand)
  coping: '#8B5CF6',      // Purple - Stress Relief
  lifestyle: '#22A267',   // Green - Lifestyle
  connection: '#F59E0B',  // Amber - Connection

  // Semantic colors
  success: '#22A267',     // Green (brand aligned)
  warning: '#F59E0B',
  error: '#E85A5A',       // Alert Red
  info: '#38B6E0',        // Sky Blue (brand aligned)

  // SOS/Crisis colors
  sos: '#E85A5A',
  sosLight: '#F07070',
  sosDark: '#D04040',

  // Neutrals
  background: '#F8FAFB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F8',
  border: '#E2E8F0',
  borderLight: '#F1F5F8',

  // Text
  text: '#1A2B3C',
  textSecondary: '#5A6B7C',
  textTertiary: '#8A9AAC',
  textInverse: '#FFFFFF',

  // Dark mode variants
  dark: {
    background: '#0F1A24',
    surface: '#1A2B3C',
    surfaceSecondary: '#2A3B4C',
    border: '#2A3B4C',
    borderLight: '#3A4B5C',
    text: '#F8FAFB',
    textSecondary: '#B0C0D0',
    textTertiary: '#8A9AAC',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

export const typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // Font weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#1A2B3C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#1A2B3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1A2B3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// Metric colors for charts (brand aligned)
export const metricColors = {
  mood: '#38B6E0',      // Sky Blue
  stress: '#E85A5A',    // Alert Red
  sleep: '#8B5CF6',     // Purple
  energy: '#F59E0B',    // Amber
  focus: '#22A267',     // Green
  anxiety: '#EC4899',   // Pink
} as const;

// SOS Protocol colors
export const sosColors = {
  overwhelm: '#38B6E0',   // Sky Blue - Calm
  panic: '#E85A5A',       // Red - Urgent
  anger: '#F59E0B',       // Amber - Warning
  sleep: '#8B5CF6',       // Purple - Rest
  struggling: '#22A267',  // Green - Hope
} as const;

// Animation durations
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
