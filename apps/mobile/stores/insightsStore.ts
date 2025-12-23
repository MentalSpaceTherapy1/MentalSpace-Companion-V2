/**
 * Insights Store
 * Zustand store for analytics, trends, and personalized insights
 *
 * Provides:
 * - Mood patterns and trends over time
 * - Correlation analysis between metrics
 * - Personal recommendations
 * - Achievement tracking
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';
import { useCheckinStore } from './checkinStore';

// Types
export interface MetricTrend {
  metric: string;
  currentAverage: number;
  previousAverage: number;
  change: number;
  changePercent: number;
  trend: 'improving' | 'declining' | 'stable';
  dataPoints: number[];
}

export interface Correlation {
  metric1: string;
  metric2: string;
  correlation: number; // -1 to 1
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  description: string;
}

export interface Insight {
  id: string;
  type: 'pattern' | 'achievement' | 'recommendation' | 'warning';
  title: string;
  description: string;
  icon: string;
  color: string;
  metric?: string;
  actionLabel?: string;
  actionRoute?: string;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date | null;
  progress: number; // 0-100
  requirement: number;
  current: number;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  checkinCount: number;
  averages: Record<string, number>;
  trends: MetricTrend[];
  topInsight: string;
}

interface InsightsState {
  // State
  trends: MetricTrend[];
  correlations: Correlation[];
  insights: Insight[];
  achievements: Achievement[];
  weeklySummaries: WeeklySummary[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  generateInsights: () => Promise<void>;
  calculateTrends: (days?: number) => Promise<MetricTrend[]>;
  findCorrelations: () => Promise<Correlation[]>;
  checkAchievements: () => Promise<void>;

  // Getters
  getInsightsByType: (type: Insight['type']) => Insight[];
  getBestDay: () => string | null;
  getWorstDay: () => string | null;
  getMostImprovedMetric: () => string | null;

  // Reset
  reset: () => void;
}

const STORAGE_KEY = 'mentalspace_insights';
const METRICS = ['mood', 'stress', 'sleep', 'energy', 'focus', 'anxiety'];
const INVERTED_METRICS = ['stress', 'anxiety']; // Lower is better

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlockedAt' | 'progress' | 'current'>[] = [
  {
    id: 'first_checkin',
    title: 'First Step',
    description: 'Complete your first check-in',
    icon: 'flag',
    requirement: 1,
  },
  {
    id: 'week_streak',
    title: 'Week Warrior',
    description: 'Check in for 7 days in a row',
    icon: 'flame',
    requirement: 7,
  },
  {
    id: 'month_streak',
    title: 'Monthly Master',
    description: 'Check in for 30 days in a row',
    icon: 'trophy',
    requirement: 30,
  },
  {
    id: 'mood_improver',
    title: 'Mood Lifter',
    description: 'Improve your average mood by 2 points',
    icon: 'happy',
    requirement: 2,
  },
  {
    id: 'stress_reducer',
    title: 'Stress Buster',
    description: 'Reduce your average stress by 2 points',
    icon: 'leaf',
    requirement: 2,
  },
  {
    id: 'consistent_sleep',
    title: 'Sleep Champion',
    description: 'Maintain 7+ sleep score for 7 days',
    icon: 'moon',
    requirement: 7,
  },
  {
    id: 'journal_starter',
    title: 'Journal Journey',
    description: 'Write 5 journal entries',
    icon: 'book',
    requirement: 5,
  },
  {
    id: 'safety_planner',
    title: 'Safety First',
    description: 'Complete your safety plan',
    icon: 'shield',
    requirement: 1,
  },
];

// Helper functions
const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
};

const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;

  const meanX = calculateAverage(x.slice(0, n));
  const meanY = calculateAverage(y.slice(0, n));

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denom = Math.sqrt(denomX * denomY);
  if (denom === 0) return 0;

  return numerator / denom;
};

const getCorrelationStrength = (correlation: number): Correlation['strength'] => {
  const abs = Math.abs(correlation);
  if (abs >= 0.7) return 'strong';
  if (abs >= 0.4) return 'moderate';
  if (abs >= 0.2) return 'weak';
  return 'none';
};

const getTrendDirection = (
  change: number,
  metric: string
): MetricTrend['trend'] => {
  const threshold = 0.5;
  const isInverted = INVERTED_METRICS.includes(metric);

  if (Math.abs(change) < threshold) return 'stable';

  if (isInverted) {
    return change < 0 ? 'improving' : 'declining';
  }
  return change > 0 ? 'improving' : 'declining';
};

export const useInsightsStore = create<InsightsState>((set, get) => ({
  // Initial state
  trends: [],
  correlations: [],
  insights: [],
  achievements: ACHIEVEMENT_DEFINITIONS.map((a) => ({
    ...a,
    unlockedAt: null,
    progress: 0,
    current: 0,
  })),
  weeklySummaries: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  // Generate all insights
  generateInsights: async () => {
    set({ isLoading: true, error: null });

    try {
      const trends = await get().calculateTrends();
      const correlations = await get().findCorrelations();
      await get().checkAchievements();

      // Generate insight messages
      const insights: Insight[] = [];
      const now = new Date();

      // Add trend-based insights
      trends.forEach((trend) => {
        if (trend.trend === 'improving' && trend.changePercent > 10) {
          insights.push({
            id: `trend-${trend.metric}-${Date.now()}`,
            type: 'pattern',
            title: `${trend.metric.charAt(0).toUpperCase() + trend.metric.slice(1)} is improving!`,
            description: `Your ${trend.metric} has improved by ${Math.abs(trend.changePercent).toFixed(0)}% this week.`,
            icon: 'trending-up',
            color: '#10B981',
            metric: trend.metric,
            createdAt: now,
          });
        } else if (trend.trend === 'declining' && trend.changePercent < -10) {
          insights.push({
            id: `trend-${trend.metric}-${Date.now()}`,
            type: 'warning',
            title: `${trend.metric.charAt(0).toUpperCase() + trend.metric.slice(1)} needs attention`,
            description: `Your ${trend.metric} has declined by ${Math.abs(trend.changePercent).toFixed(0)}% this week. Consider focusing on this area.`,
            icon: 'alert-circle',
            color: '#F59E0B',
            metric: trend.metric,
            actionLabel: 'See Tips',
            createdAt: now,
          });
        }
      });

      // Add correlation-based insights
      correlations
        .filter((c) => c.strength === 'strong' || c.strength === 'moderate')
        .slice(0, 2)
        .forEach((correlation) => {
          const isPositive = correlation.correlation > 0;
          insights.push({
            id: `correlation-${correlation.metric1}-${correlation.metric2}-${Date.now()}`,
            type: 'pattern',
            title: 'Pattern Discovered',
            description: correlation.description,
            icon: 'analytics',
            color: '#6366F1',
            createdAt: now,
          });
        });

      // Add recommendations based on data
      const checkinStore = useCheckinStore.getState();
      const recentCheckins = (checkinStore.recentCheckins || []).slice(0, 7);

      if (recentCheckins.length > 0) {
        const avgSleep = calculateAverage(recentCheckins.map((c) => c.sleep));
        const avgStress = calculateAverage(recentCheckins.map((c) => c.stress));

        if (avgSleep < 5) {
          insights.push({
            id: `rec-sleep-${Date.now()}`,
            type: 'recommendation',
            title: 'Improve Your Sleep',
            description: 'Your sleep scores have been low. Try establishing a consistent bedtime routine.',
            icon: 'moon',
            color: '#8B5CF6',
            actionLabel: 'Sleep Tips',
            createdAt: now,
          });
        }

        if (avgStress > 7) {
          insights.push({
            id: `rec-stress-${Date.now()}`,
            type: 'recommendation',
            title: 'Manage Your Stress',
            description: 'Your stress levels have been elevated. Consider trying breathing exercises or meditation.',
            icon: 'fitness',
            color: '#EC4899',
            actionLabel: 'Try Breathing',
            actionRoute: '/(sos)/protocol?type=overwhelm',
            createdAt: now,
          });
        }
      }

      set({
        trends,
        correlations,
        insights: insights.slice(0, 6), // Limit to 6 insights
        isLoading: false,
        lastUpdated: now,
      });

      // Cache insights
      const userId = useAuthStore.getState().user?.uid;
      if (userId) {
        await AsyncStorage.setItem(
          `${STORAGE_KEY}_${userId}`,
          JSON.stringify({
            trends,
            correlations,
            insights,
            lastUpdated: now.toISOString(),
          })
        );
      }
    } catch (error: any) {
      console.error('Error generating insights:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Calculate trends for all metrics
  calculateTrends: async (days = 14) => {
    const checkinStore = useCheckinStore.getState();
    const checkins = checkinStore.recentCheckins || [];

    if (checkins.length < 3) {
      return [];
    }

    const halfDays = Math.floor(days / 2);
    const recentCheckins = checkins.slice(0, halfDays);
    const olderCheckins = checkins.slice(halfDays, days);

    const trends: MetricTrend[] = METRICS.map((metric) => {
      const recentValues = recentCheckins.map((c) => (c as any)[metric] || 0);
      const olderValues = olderCheckins.map((c) => (c as any)[metric] || 0);

      const currentAverage = calculateAverage(recentValues);
      const previousAverage = calculateAverage(olderValues) || currentAverage;

      const change = currentAverage - previousAverage;
      const changePercent = previousAverage
        ? ((change / previousAverage) * 100)
        : 0;

      return {
        metric,
        currentAverage: Math.round(currentAverage * 10) / 10,
        previousAverage: Math.round(previousAverage * 10) / 10,
        change: Math.round(change * 10) / 10,
        changePercent: Math.round(changePercent),
        trend: getTrendDirection(change, metric),
        dataPoints: recentCheckins.map((c) => (c as any)[metric] || 0).reverse(),
      };
    });

    return trends;
  },

  // Find correlations between metrics
  findCorrelations: async () => {
    const checkinStore = useCheckinStore.getState();
    const checkins = (checkinStore.recentCheckins || []).slice(0, 30);

    if (checkins.length < 5) {
      return [];
    }

    const correlations: Correlation[] = [];
    const metricPairs: [string, string][] = [
      ['sleep', 'mood'],
      ['sleep', 'energy'],
      ['stress', 'sleep'],
      ['anxiety', 'focus'],
      ['energy', 'focus'],
      ['mood', 'energy'],
    ];

    metricPairs.forEach(([m1, m2]) => {
      const values1 = checkins.map((c) => (c as any)[m1] || 0);
      const values2 = checkins.map((c) => (c as any)[m2] || 0);

      const corr = calculateCorrelation(values1, values2);
      const strength = getCorrelationStrength(corr);

      if (strength !== 'none') {
        const direction = corr > 0 ? 'higher' : 'lower';
        const label1 = m1.charAt(0).toUpperCase() + m1.slice(1);
        const label2 = m2.charAt(0).toUpperCase() + m2.slice(1);

        correlations.push({
          metric1: m1,
          metric2: m2,
          correlation: Math.round(corr * 100) / 100,
          strength,
          description: `${label1} and ${label2} appear connected - when one is ${direction}, the other tends to follow.`,
        });
      }
    });

    // Sort by absolute correlation strength
    correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

    return correlations;
  },

  // Check and update achievements
  checkAchievements: async () => {
    const checkinStore = useCheckinStore.getState();
    const checkins = checkinStore.recentCheckins || [];
    const { achievements } = get();

    const updatedAchievements = achievements.map((achievement) => {
      let current = 0;
      let unlocked = achievement.unlockedAt;

      switch (achievement.id) {
        case 'first_checkin':
          current = checkins.length > 0 ? 1 : 0;
          break;

        case 'week_streak':
        case 'month_streak':
          // Calculate current streak
          let streak = 0;
          const today = new Date().toISOString().split('T')[0];
          for (let i = 0; i < checkins.length; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            if (checkins.some((c) => c.date === dateStr)) {
              streak++;
            } else {
              break;
            }
          }
          current = streak;
          break;

        case 'mood_improver':
          if (checkins.length >= 14) {
            const recent = calculateAverage(checkins.slice(0, 7).map((c) => c.mood));
            const older = calculateAverage(checkins.slice(7, 14).map((c) => c.mood));
            current = Math.max(0, recent - older);
          }
          break;

        case 'stress_reducer':
          if (checkins.length >= 14) {
            const recent = calculateAverage(checkins.slice(0, 7).map((c) => c.stress));
            const older = calculateAverage(checkins.slice(7, 14).map((c) => c.stress));
            current = Math.max(0, older - recent);
          }
          break;

        case 'consistent_sleep':
          let sleepStreak = 0;
          for (const checkin of checkins) {
            if (checkin.sleep >= 7) {
              sleepStreak++;
            } else {
              break;
            }
          }
          current = sleepStreak;
          break;
      }

      const progress = Math.min(100, (current / achievement.requirement) * 100);

      if (!unlocked && current >= achievement.requirement) {
        unlocked = new Date();
      }

      return {
        ...achievement,
        current,
        progress,
        unlockedAt: unlocked,
      };
    });

    set({ achievements: updatedAchievements });
  },

  // Getters
  getInsightsByType: (type) => {
    return get().insights.filter((i) => i.type === type);
  },

  getBestDay: () => {
    const checkinStore = useCheckinStore.getState();
    const checkins = (checkinStore.recentCheckins || []).slice(0, 30);

    if (checkins.length === 0) return null;

    // Group by day of week and calculate average mood
    const dayScores: Record<string, number[]> = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    checkins.forEach((checkin) => {
      const dayIndex = new Date(checkin.date).getDay();
      const day = days[dayIndex];
      if (!dayScores[day]) dayScores[day] = [];
      dayScores[day].push(checkin.mood);
    });

    let bestDay = null;
    let bestAvg = 0;

    Object.entries(dayScores).forEach(([day, scores]) => {
      const avg = calculateAverage(scores);
      if (avg > bestAvg) {
        bestAvg = avg;
        bestDay = day;
      }
    });

    return bestDay;
  },

  getWorstDay: () => {
    const checkinStore = useCheckinStore.getState();
    const checkins = (checkinStore.recentCheckins || []).slice(0, 30);

    if (checkins.length === 0) return null;

    const dayScores: Record<string, number[]> = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    checkins.forEach((checkin) => {
      const dayIndex = new Date(checkin.date).getDay();
      const day = days[dayIndex];
      if (!dayScores[day]) dayScores[day] = [];
      dayScores[day].push(checkin.mood);
    });

    let worstDay = null;
    let worstAvg = 11;

    Object.entries(dayScores).forEach(([day, scores]) => {
      const avg = calculateAverage(scores);
      if (avg < worstAvg && scores.length >= 2) {
        worstAvg = avg;
        worstDay = day;
      }
    });

    return worstDay;
  },

  getMostImprovedMetric: () => {
    const { trends } = get();
    const improving = trends
      .filter((t) => t.trend === 'improving')
      .sort((a, b) => b.changePercent - a.changePercent);

    return improving.length > 0 ? improving[0].metric : null;
  },

  // Reset
  reset: () => {
    set({
      trends: [],
      correlations: [],
      insights: [],
      achievements: ACHIEVEMENT_DEFINITIONS.map((a) => ({
        ...a,
        unlockedAt: null,
        progress: 0,
        current: 0,
      })),
      weeklySummaries: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
    });
  },
}));
