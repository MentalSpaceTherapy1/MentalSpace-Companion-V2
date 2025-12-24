/**
 * Pattern Prediction Service
 * Analyzes check-in patterns to predict difficult periods and provide proactive support
 */

import type { Checkin } from '@mentalspace/shared';

export interface DayOfWeekPattern {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  dayName: string;
  averageMood: number;
  averageStress: number;
  checkinsCount: number;
  isHarder: boolean; // If average mood < 3 or stress > 3
}

export interface MoodPrediction {
  predictedMood: number;
  confidence: number; // 0-1
  reasoning: string;
  basedOnDayOfWeek: boolean;
  basedOnRecentTrend: boolean;
}

export interface TriggerPattern {
  type: 'day_of_week' | 'date_proximity' | 'consecutive_low' | 'stress_spike';
  description: string;
  severity: 'low' | 'medium' | 'high';
  occurrences: number;
  lastOccurred?: string;
  affectedDays?: number[]; // For day of week patterns
}

export interface ProactiveAlert {
  type: 'tomorrow_hard' | 'trigger_approaching' | 'pattern_detected' | 'recovery_mode';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  actionable: boolean;
  suggestedAction?: string;
  triggerDate?: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Analyze which days of the week tend to be harder
 */
export function analyzeDayOfWeekPatterns(checkins: Checkin[]): DayOfWeekPattern[] {
  if (checkins.length < 7) {
    // Not enough data for meaningful analysis
    return [];
  }

  // Group check-ins by day of week
  const dayGroups: Map<number, Checkin[]> = new Map();

  checkins.forEach((checkin) => {
    const date = new Date(checkin.date);
    const dayOfWeek = date.getDay();

    if (!dayGroups.has(dayOfWeek)) {
      dayGroups.set(dayOfWeek, []);
    }
    dayGroups.get(dayOfWeek)!.push(checkin);
  });

  // Calculate averages for each day
  const patterns: DayOfWeekPattern[] = [];

  for (let day = 0; day < 7; day++) {
    const dayCheckins = dayGroups.get(day) || [];

    if (dayCheckins.length === 0) continue;

    const totalMood = dayCheckins.reduce((sum, c) => sum + c.mood, 0);
    const totalStress = dayCheckins.reduce((sum, c) => sum + c.stress, 0);

    const averageMood = totalMood / dayCheckins.length;
    const averageStress = totalStress / dayCheckins.length;

    // A day is "harder" if average mood is low or stress is high
    const isHarder = averageMood < 3 || averageStress > 3;

    patterns.push({
      dayOfWeek: day,
      dayName: DAY_NAMES[day],
      averageMood: Math.round(averageMood * 10) / 10,
      averageStress: Math.round(averageStress * 10) / 10,
      checkinsCount: dayCheckins.length,
      isHarder,
    });
  }

  return patterns.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

/**
 * Predict tomorrow's mood based on patterns and recent trends
 */
export function predictTomorrowMood(checkins: Checkin[]): MoodPrediction | null {
  if (checkins.length < 3) {
    return null; // Not enough data
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDayOfWeek = tomorrow.getDay();

  // Get day of week pattern
  const dayPatterns = analyzeDayOfWeekPatterns(checkins);
  const tomorrowPattern = dayPatterns.find((p) => p.dayOfWeek === tomorrowDayOfWeek);

  // Calculate recent trend (last 3 days)
  const recent = checkins.slice(0, 3);
  const recentAvgMood = recent.reduce((sum, c) => sum + c.mood, 0) / recent.length;
  const recentTrend = recent.length >= 2 ? recent[0].mood - recent[recent.length - 1].mood : 0;

  let predictedMood: number;
  let confidence: number;
  let reasoning: string;
  let basedOnDayOfWeek = false;
  let basedOnRecentTrend = false;

  // Prediction logic
  if (tomorrowPattern && tomorrowPattern.checkinsCount >= 3) {
    // Use day of week pattern with recent trend adjustment
    predictedMood = tomorrowPattern.averageMood;
    basedOnDayOfWeek = true;

    // Adjust based on recent trend
    if (Math.abs(recentTrend) > 1) {
      predictedMood += recentTrend * 0.3; // 30% weight to recent trend
      basedOnRecentTrend = true;
    }

    confidence = Math.min(tomorrowPattern.checkinsCount / 10, 0.85); // Max 85% confidence
    reasoning = `Based on ${tomorrowPattern.checkinsCount} ${DAY_NAMES[tomorrowDayOfWeek]}s`;

    if (basedOnRecentTrend) {
      reasoning += ' and recent trend';
    }
  } else {
    // Use recent trend only
    predictedMood = recentAvgMood + (recentTrend * 0.5);
    basedOnRecentTrend = true;
    confidence = 0.5;
    reasoning = 'Based on recent check-ins';
  }

  // Clamp prediction to valid range
  predictedMood = Math.max(1, Math.min(5, predictedMood));

  return {
    predictedMood: Math.round(predictedMood * 10) / 10,
    confidence: Math.round(confidence * 100) / 100,
    reasoning,
    basedOnDayOfWeek,
    basedOnRecentTrend,
  };
}

/**
 * Detect recurring trigger patterns in check-in data
 */
export function detectTriggerPatterns(checkins: Checkin[]): TriggerPattern[] {
  if (checkins.length < 7) {
    return [];
  }

  const patterns: TriggerPattern[] = [];

  // 1. Detect consistent hard days of the week
  const dayPatterns = analyzeDayOfWeekPatterns(checkins);
  const hardDays = dayPatterns.filter((p) => p.isHarder && p.checkinsCount >= 3);

  if (hardDays.length > 0) {
    patterns.push({
      type: 'day_of_week',
      description: `${hardDays.map((d) => d.dayName).join(', ')} tend${hardDays.length === 1 ? 's' : ''} to be harder`,
      severity: hardDays.length >= 3 ? 'high' : hardDays.length === 2 ? 'medium' : 'low',
      occurrences: Math.max(...hardDays.map((d) => d.checkinsCount)),
      affectedDays: hardDays.map((d) => d.dayOfWeek),
    });
  }

  // 2. Detect consecutive low mood periods
  let consecutiveLow = 0;
  let maxConsecutiveLow = 0;
  let lowPeriodCount = 0;
  let lastLowDate: string | undefined;

  checkins.forEach((checkin) => {
    if (checkin.mood <= 2) {
      consecutiveLow++;
      lastLowDate = checkin.date;

      if (consecutiveLow > maxConsecutiveLow) {
        maxConsecutiveLow = consecutiveLow;
      }
    } else {
      if (consecutiveLow >= 2) {
        lowPeriodCount++;
      }
      consecutiveLow = 0;
    }
  });

  // Count final period
  if (consecutiveLow >= 2) {
    lowPeriodCount++;
  }

  if (lowPeriodCount >= 2) {
    patterns.push({
      type: 'consecutive_low',
      description: `${lowPeriodCount} periods of consecutive low mood days`,
      severity: maxConsecutiveLow >= 4 ? 'high' : maxConsecutiveLow >= 3 ? 'medium' : 'low',
      occurrences: lowPeriodCount,
      lastOccurred: lastLowDate,
    });
  }

  // 3. Detect stress spikes (stress >= 4)
  const stressSpikes = checkins.filter((c) => c.stress >= 4);

  if (stressSpikes.length >= 3) {
    patterns.push({
      type: 'stress_spike',
      description: `${stressSpikes.length} high stress days`,
      severity: stressSpikes.length >= 7 ? 'high' : stressSpikes.length >= 5 ? 'medium' : 'low',
      occurrences: stressSpikes.length,
      lastOccurred: stressSpikes[0]?.date,
    });
  }

  return patterns;
}

/**
 * Generate a proactive alert based on predictions and patterns
 */
export function generateProactiveAlert(
  prediction: MoodPrediction | null,
  patterns: TriggerPattern[],
  triggerDates: Array<{ date: string; label: string }>,
  recentCheckins: Checkin[]
): ProactiveAlert | null {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Check for upcoming trigger dates (within next 2 days)
  const upcomingTrigger = triggerDates.find((trigger) => {
    const triggerDate = new Date(trigger.date);
    const daysUntil = Math.floor((triggerDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 2;
  });

  if (upcomingTrigger) {
    const triggerDate = new Date(upcomingTrigger.date);
    const daysUntil = Math.floor((triggerDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      type: 'trigger_approaching',
      title: 'Upcoming Difficult Date',
      message: daysUntil === 0
        ? `Today is ${upcomingTrigger.label}. We're here for you with extra support.`
        : daysUntil === 1
        ? `Tomorrow is ${upcomingTrigger.label}. Would you like to prepare a lighter plan?`
        : `${upcomingTrigger.label} is in ${daysUntil} days. Let's prepare together.`,
      severity: daysUntil <= 1 ? 'critical' : 'warning',
      actionable: true,
      suggestedAction: 'Activate lighter plan for tomorrow',
      triggerDate: upcomingTrigger.date,
    };
  }

  // Check if currently in recovery mode (recent very low mood)
  if (recentCheckins.length > 0) {
    const recentLows = recentCheckins.slice(0, 3).filter((c) => c.mood <= 2);

    if (recentLows.length >= 2) {
      return {
        type: 'recovery_mode',
        title: 'Recovery Support Active',
        message: 'We noticed you\'ve been having a tough time. Your plan is adjusted to focus on what matters most.',
        severity: 'warning',
        actionable: true,
        suggestedAction: 'Continue with lighter plan',
      };
    }
  }

  // Check prediction for tomorrow
  if (prediction && prediction.predictedMood < 3 && prediction.confidence > 0.6) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowName = DAY_NAMES[tomorrow.getDay()];

    return {
      type: 'tomorrow_hard',
      title: 'Tomorrow Might Be Challenging',
      message: `${tomorrowName}s tend to be harder for you. Would you like a lighter, more manageable plan?`,
      severity: 'info',
      actionable: true,
      suggestedAction: 'Accept lighter plan for tomorrow',
    };
  }

  // Check for detected patterns
  const highSeverityPattern = patterns.find((p) => p.severity === 'high');

  if (highSeverityPattern && !prediction) {
    return {
      type: 'pattern_detected',
      title: 'Pattern Noticed',
      message: highSeverityPattern.description + '. We can help you prepare for these times.',
      severity: 'info',
      actionable: false,
    };
  }

  return null;
}

/**
 * Check if a given date matches any trigger dates (considering repeat annually)
 */
export function checkTriggerDateMatch(
  date: Date,
  triggerDates: Array<{ date: string; repeatAnnually?: boolean }>
): boolean {
  const checkDate = date.toISOString().split('T')[0];

  return triggerDates.some((trigger) => {
    const triggerDate = new Date(trigger.date);
    const triggerDateStr = triggerDate.toISOString().split('T')[0];

    // Exact match
    if (checkDate === triggerDateStr) return true;

    // Annual repeat match (same month and day)
    if (trigger.repeatAnnually) {
      return date.getMonth() === triggerDate.getMonth() &&
             date.getDate() === triggerDate.getDate();
    }

    return false;
  });
}
