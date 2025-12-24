/**
 * MentalSpace Companion - Shared Utilities
 * Helper functions used across all packages
 */

import {
  METRIC_MIN,
  METRIC_MAX,
  METRICS,
  LOW_MOOD_THRESHOLD,
  HIGH_ANXIETY_THRESHOLD,
  HIGH_STRESS_THRESHOLD,
  CONSECUTIVE_LOW_DAYS_TRIGGER,
  DATE_FORMAT,
} from '../constants';
import type { CheckinMetrics, MetricType, MetricTrend, Checkin } from '../types';

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Format a date to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to Date
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayString(): string {
  return formatDateString(new Date());
}

/**
 * Get date N days ago as YYYY-MM-DD string
 */
export function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateString(date);
}

/**
 * Check if two date strings represent the same day
 */
export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

/**
 * Get the start of the week (Monday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get array of date strings for the past N days
 */
export function getDateRange(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(getDateDaysAgo(i));
  }
  return dates;
}

// ============================================================================
// Metric Utilities
// ============================================================================

/**
 * Normalize a metric value to 0-100 scale
 */
export function normalizeMetric(value: number): number {
  return ((value - METRIC_MIN) / (METRIC_MAX - METRIC_MIN)) * 100;
}

/**
 * Get the label for a metric value (e.g., "Good", "Poor")
 */
export function getMetricLabel(metric: MetricType, value: number): string {
  const config = METRICS[metric];
  if (!config) return '';

  const normalized = normalizeMetric(value);

  if (config.invertedScale) {
    // For stress/anxiety, lower is better
    if (normalized <= 30) return 'Low';
    if (normalized <= 60) return 'Moderate';
    return 'High';
  } else {
    // For mood/energy/etc, higher is better
    if (normalized <= 30) return 'Poor';
    if (normalized <= 60) return 'Moderate';
    return 'Good';
  }
}

/**
 * Calculate average of metric values
 */
export function calculateMetricAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

/**
 * Determine trend direction from values
 */
export function calculateTrend(values: number[], invertedScale: boolean = false): MetricTrend['trend'] {
  if (values.length < 2) return 'stable';

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = calculateMetricAverage(firstHalf);
  const secondAvg = calculateMetricAverage(secondHalf);

  const diff = secondAvg - firstAvg;
  const threshold = 0.5; // Minimum change to be considered a trend

  if (Math.abs(diff) < threshold) return 'stable';

  if (invertedScale) {
    // For stress/anxiety, decreasing is improving
    return diff < 0 ? 'improving' : 'declining';
  } else {
    // For mood/energy, increasing is improving
    return diff > 0 ? 'improving' : 'declining';
  }
}

/**
 * Calculate metric summary for a set of check-ins
 */
export function calculateMetricSummary(
  checkins: Pick<Checkin, MetricType>[],
  metric: MetricType
): MetricTrend {
  const values = checkins.map((c) => c[metric]).filter((v): v is number => v != null);

  if (values.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      trend: 'stable',
      values: [],
    };
  }

  const config = METRICS[metric];

  return {
    average: calculateMetricAverage(values),
    min: Math.min(...values),
    max: Math.max(...values),
    trend: calculateTrend(values, config?.invertedScale),
    values,
  };
}

// ============================================================================
// Crisis Detection Utilities
// ============================================================================

/**
 * Check if metrics indicate potential crisis state
 * Returns severity level or null if no crisis indicators
 */
export function checkMetricCrisisIndicators(
  metrics: CheckinMetrics
): { severity: 'low' | 'medium' | 'high'; reason: string } | null {
  const issues: string[] = [];

  // Check for extremely low mood
  if (metrics.mood <= 2) {
    issues.push('very low mood');
  }

  // Check for very high anxiety
  if (metrics.anxiety >= HIGH_ANXIETY_THRESHOLD) {
    issues.push('high anxiety');
  }

  // Check for very high stress
  if (metrics.stress >= HIGH_STRESS_THRESHOLD) {
    issues.push('high stress');
  }

  // Check for combination of concerning metrics
  const lowMood = metrics.mood <= LOW_MOOD_THRESHOLD;
  const highAnxiety = metrics.anxiety >= 7;
  const highStress = metrics.stress >= 7;
  const lowEnergy = metrics.energy <= 2;

  const concerningCount = [lowMood, highAnxiety, highStress, lowEnergy].filter(Boolean).length;

  if (concerningCount >= 3) {
    return {
      severity: 'high',
      reason: `Multiple concerning indicators: ${issues.join(', ')}`,
    };
  }

  if (metrics.mood <= 2 || concerningCount >= 2) {
    return {
      severity: 'medium',
      reason: issues.length > 0 ? issues.join(', ') : 'Concerning metric combination',
    };
  }

  if (issues.length > 0) {
    return {
      severity: 'low',
      reason: issues.join(', '),
    };
  }

  return null;
}

/**
 * Check for consecutive low mood pattern
 */
export function checkLowMoodPattern(
  recentCheckins: Pick<Checkin, 'mood' | 'date'>[]
): boolean {
  if (recentCheckins.length < CONSECUTIVE_LOW_DAYS_TRIGGER) {
    return false;
  }

  // Sort by date descending and take most recent
  const sorted = [...recentCheckins]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, CONSECUTIVE_LOW_DAYS_TRIGGER);

  // Check if all are below threshold
  return sorted.every((c) => c.mood <= LOW_MOOD_THRESHOLD);
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a simple unique ID (not cryptographically secure)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Check if a value is within metric range
 */
export function isValidMetricValue(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= METRIC_MIN &&
    value <= METRIC_MAX
  );
}

/**
 * Check if string is valid date format
 */
export function isValidDateString(str: unknown): str is string {
  if (typeof str !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(str)) return false;

  const date = new Date(str);
  return !isNaN(date.getTime());
}

// ============================================================================
// Action Plan Utilities
// ============================================================================

/**
 * Calculate completion percentage
 */
export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Format duration in minutes to human readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

// ============================================================================
// Streak Utilities
// ============================================================================

/**
 * Calculate current streak from array of date strings
 */
export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = [...dates].sort((a, b) => b.localeCompare(a)); // Descending
  const today = getTodayString();

  // Check if most recent date is today or yesterday
  const mostRecent = sortedDates[0];
  const yesterday = getDateDaysAgo(1);

  if (mostRecent !== today && mostRecent !== yesterday) {
    return 0; // Streak broken
  }

  let streak = 1;
  let expectedDate = mostRecent === today ? yesterday : getDateDaysAgo(2);

  for (let i = 1; i < sortedDates.length; i++) {
    if (sortedDates[i] === expectedDate) {
      streak++;
      // Move to previous day
      const d = parseDateString(expectedDate);
      d.setDate(d.getDate() - 1);
      expectedDate = formatDateString(d);
    } else if (sortedDates[i] < expectedDate) {
      break; // Gap in streak
    }
    // Skip duplicate dates
  }

  return streak;
}

// ============================================================================
// Error Utilities
// ============================================================================

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
