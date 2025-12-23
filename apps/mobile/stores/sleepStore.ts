/**
 * Sleep Store
 * Manages sleep tracking data with offline-first sync
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SLEEP_STORAGE_KEY = '@mentalspace/sleep_records';

export interface SleepRecord {
  id: string;
  date: string; // YYYY-MM-DD
  bedtime: string; // HH:MM (24h format)
  wakeTime: string; // HH:MM (24h format)
  duration: number; // minutes
  quality: number; // 1-10 scale
  factors: SleepFactor[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export type SleepFactor =
  | 'caffeine'
  | 'alcohol'
  | 'exercise'
  | 'screen_time'
  | 'stress'
  | 'nap'
  | 'medication'
  | 'noise'
  | 'temperature'
  | 'late_meal';

export const SLEEP_FACTORS: { key: SleepFactor; label: string; icon: string; positive: boolean }[] = [
  { key: 'caffeine', label: 'Caffeine', icon: 'cafe', positive: false },
  { key: 'alcohol', label: 'Alcohol', icon: 'wine', positive: false },
  { key: 'exercise', label: 'Exercise', icon: 'fitness', positive: true },
  { key: 'screen_time', label: 'Screen Time', icon: 'phone-portrait', positive: false },
  { key: 'stress', label: 'Stress', icon: 'flash', positive: false },
  { key: 'nap', label: 'Napped', icon: 'bed', positive: false },
  { key: 'medication', label: 'Medication', icon: 'medkit', positive: false },
  { key: 'noise', label: 'Noise', icon: 'volume-high', positive: false },
  { key: 'temperature', label: 'Too Hot/Cold', icon: 'thermometer', positive: false },
  { key: 'late_meal', label: 'Late Meal', icon: 'restaurant', positive: false },
];

export interface SleepGoal {
  targetBedtime: string; // HH:MM
  targetWakeTime: string; // HH:MM
  targetDuration: number; // minutes (e.g., 480 = 8 hours)
  enabled: boolean;
}

export interface SleepStats {
  averageDuration: number;
  averageQuality: number;
  averageBedtime: string;
  averageWakeTime: string;
  totalRecords: number;
  bestDay: string | null;
  worstDay: string | null;
  consistencyScore: number; // 0-100
}

interface SleepState {
  records: SleepRecord[];
  goal: SleepGoal;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSleepData: () => Promise<void>;
  addSleepRecord: (record: Omit<SleepRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced' | 'duration'>) => Promise<void>;
  updateSleepRecord: (id: string, updates: Partial<SleepRecord>) => Promise<void>;
  deleteSleepRecord: (id: string) => Promise<void>;
  updateGoal: (goal: Partial<SleepGoal>) => Promise<void>;
  getRecordForDate: (date: string) => SleepRecord | undefined;
  getWeekRecords: () => SleepRecord[];
  getMonthRecords: () => SleepRecord[];
  calculateStats: (days?: number) => SleepStats;
  getSleepDebt: () => number; // minutes of sleep debt
}

// Calculate duration between bedtime and wake time
const calculateDuration = (bedtime: string, wakeTime: string): number => {
  const [bedHour, bedMin] = bedtime.split(':').map(Number);
  const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);

  let bedMinutes = bedHour * 60 + bedMin;
  let wakeMinutes = wakeHour * 60 + wakeMin;

  // If wake time is earlier than bed time, it's the next day
  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60;
  }

  return wakeMinutes - bedMinutes;
};

// Format minutes to hours and minutes string
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

// Parse time string to minutes since midnight
const timeToMinutes = (time: string): number => {
  const [hour, min] = time.split(':').map(Number);
  return hour * 60 + min;
};

// Calculate average time from array of time strings
const averageTime = (times: string[]): string => {
  if (times.length === 0) return '00:00';

  // Convert to minutes, handling overnight times for bedtimes
  const minutes = times.map((t) => {
    const m = timeToMinutes(t);
    // If it's a bedtime after noon, treat it as evening (don't adjust)
    // If it's before 6am, it's probably a late-night bedtime from previous day
    return m < 360 ? m + 1440 : m; // Add 24 hours if before 6am
  });

  const avg = Math.round(minutes.reduce((a, b) => a + b, 0) / minutes.length) % 1440;
  const hours = Math.floor(avg / 60);
  const mins = avg % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const useSleepStore = create<SleepState>((set, get) => ({
  records: [],
  goal: {
    targetBedtime: '22:30',
    targetWakeTime: '06:30',
    targetDuration: 480, // 8 hours
    enabled: true,
  },
  isLoading: false,
  error: null,

  loadSleepData: async () => {
    set({ isLoading: true, error: null });
    try {
      const stored = await AsyncStorage.getItem(SLEEP_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        set({
          records: data.records || [],
          goal: data.goal || get().goal,
        });
      }
    } catch (error) {
      console.error('Failed to load sleep data:', error);
      set({ error: 'Failed to load sleep data' });
    } finally {
      set({ isLoading: false });
    }
  },

  addSleepRecord: async (recordData) => {
    const { records, goal } = get();

    const duration = calculateDuration(recordData.bedtime, recordData.wakeTime);
    const now = new Date().toISOString();

    const newRecord: SleepRecord = {
      ...recordData,
      id: `sleep_${Date.now()}`,
      duration,
      createdAt: now,
      updatedAt: now,
      synced: false,
    };

    const updatedRecords = [newRecord, ...records].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    set({ records: updatedRecords });

    try {
      await AsyncStorage.setItem(
        SLEEP_STORAGE_KEY,
        JSON.stringify({ records: updatedRecords, goal })
      );
    } catch (error) {
      console.error('Failed to save sleep record:', error);
    }
  },

  updateSleepRecord: async (id, updates) => {
    const { records, goal } = get();

    const updatedRecords = records.map((record) => {
      if (record.id !== id) return record;

      const updatedRecord = { ...record, ...updates, updatedAt: new Date().toISOString() };

      // Recalculate duration if times changed
      if (updates.bedtime || updates.wakeTime) {
        updatedRecord.duration = calculateDuration(
          updates.bedtime || record.bedtime,
          updates.wakeTime || record.wakeTime
        );
      }

      return updatedRecord;
    });

    set({ records: updatedRecords });

    try {
      await AsyncStorage.setItem(
        SLEEP_STORAGE_KEY,
        JSON.stringify({ records: updatedRecords, goal })
      );
    } catch (error) {
      console.error('Failed to update sleep record:', error);
    }
  },

  deleteSleepRecord: async (id) => {
    const { records, goal } = get();
    const updatedRecords = records.filter((r) => r.id !== id);

    set({ records: updatedRecords });

    try {
      await AsyncStorage.setItem(
        SLEEP_STORAGE_KEY,
        JSON.stringify({ records: updatedRecords, goal })
      );
    } catch (error) {
      console.error('Failed to delete sleep record:', error);
    }
  },

  updateGoal: async (goalUpdates) => {
    const { records, goal } = get();
    const updatedGoal = { ...goal, ...goalUpdates };

    // Recalculate target duration if times changed
    if (goalUpdates.targetBedtime || goalUpdates.targetWakeTime) {
      updatedGoal.targetDuration = calculateDuration(
        goalUpdates.targetBedtime || goal.targetBedtime,
        goalUpdates.targetWakeTime || goal.targetWakeTime
      );
    }

    set({ goal: updatedGoal });

    try {
      await AsyncStorage.setItem(
        SLEEP_STORAGE_KEY,
        JSON.stringify({ records, goal: updatedGoal })
      );
    } catch (error) {
      console.error('Failed to update sleep goal:', error);
    }
  },

  getRecordForDate: (date) => {
    return get().records.find((r) => r.date === date);
  },

  getWeekRecords: () => {
    const { records } = get();
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return records.filter((r) => {
      const recordDate = new Date(r.date);
      return recordDate >= weekAgo && recordDate <= today;
    });
  },

  getMonthRecords: () => {
    const { records } = get();
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    return records.filter((r) => {
      const recordDate = new Date(r.date);
      return recordDate >= monthAgo && recordDate <= today;
    });
  },

  calculateStats: (days = 7) => {
    const { records } = get();
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);

    const filteredRecords = records.filter((r) => {
      const recordDate = new Date(r.date);
      return recordDate >= startDate && recordDate <= today;
    });

    if (filteredRecords.length === 0) {
      return {
        averageDuration: 0,
        averageQuality: 0,
        averageBedtime: '--:--',
        averageWakeTime: '--:--',
        totalRecords: 0,
        bestDay: null,
        worstDay: null,
        consistencyScore: 0,
      };
    }

    const durations = filteredRecords.map((r) => r.duration);
    const qualities = filteredRecords.map((r) => r.quality);
    const bedtimes = filteredRecords.map((r) => r.bedtime);
    const wakeTimes = filteredRecords.map((r) => r.wakeTime);

    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const avgQuality = Number((qualities.reduce((a, b) => a + b, 0) / qualities.length).toFixed(1));

    const bestRecord = filteredRecords.reduce((best, r) =>
      r.quality > (best?.quality || 0) ? r : best
    );
    const worstRecord = filteredRecords.reduce((worst, r) =>
      r.quality < (worst?.quality || 11) ? r : worst
    );

    // Calculate consistency score based on bedtime variance
    const bedtimeMinutes = bedtimes.map(timeToMinutes);
    const avgBedtimeMin = bedtimeMinutes.reduce((a, b) => a + b, 0) / bedtimeMinutes.length;
    const bedtimeVariance = bedtimeMinutes.reduce((sum, m) => sum + Math.pow(m - avgBedtimeMin, 2), 0) / bedtimeMinutes.length;
    const bedtimeStdDev = Math.sqrt(bedtimeVariance);
    // Score: 100 if stdDev is 0, decreases as variance increases (60 min stdDev = ~50 score)
    const consistencyScore = Math.max(0, Math.round(100 - (bedtimeStdDev / 60) * 50));

    return {
      averageDuration: avgDuration,
      averageQuality: avgQuality,
      averageBedtime: averageTime(bedtimes),
      averageWakeTime: averageTime(wakeTimes),
      totalRecords: filteredRecords.length,
      bestDay: bestRecord?.date || null,
      worstDay: worstRecord?.date || null,
      consistencyScore,
    };
  },

  getSleepDebt: () => {
    const { goal } = get();
    const stats = get().calculateStats(7);

    if (stats.totalRecords === 0) return 0;

    // Sleep debt = (target - actual) * days tracked
    const dailyDebt = goal.targetDuration - stats.averageDuration;
    return Math.max(0, dailyDebt * stats.totalRecords);
  },
}));

// Sleep tips content
export const SLEEP_TIPS = [
  {
    id: 'consistent_schedule',
    title: 'Keep a Consistent Schedule',
    description: 'Go to bed and wake up at the same time every day, even on weekends. This helps regulate your body\'s internal clock.',
    icon: 'time',
    category: 'habits',
  },
  {
    id: 'limit_screens',
    title: 'Limit Screen Time',
    description: 'Avoid screens for at least 30-60 minutes before bed. The blue light can interfere with melatonin production.',
    icon: 'phone-portrait-outline',
    category: 'habits',
  },
  {
    id: 'bedroom_environment',
    title: 'Optimize Your Bedroom',
    description: 'Keep your bedroom cool (65-68°F), dark, and quiet. Consider blackout curtains or a white noise machine.',
    icon: 'bed',
    category: 'environment',
  },
  {
    id: 'limit_caffeine',
    title: 'Limit Caffeine',
    description: 'Avoid caffeine at least 6 hours before bedtime. This includes coffee, tea, soda, and chocolate.',
    icon: 'cafe',
    category: 'habits',
  },
  {
    id: 'exercise_timing',
    title: 'Exercise at the Right Time',
    description: 'Regular exercise improves sleep, but avoid vigorous workouts within 3-4 hours of bedtime.',
    icon: 'fitness',
    category: 'habits',
  },
  {
    id: 'wind_down',
    title: 'Create a Wind-Down Routine',
    description: 'Spend 30-60 minutes before bed doing relaxing activities like reading, gentle stretching, or meditation.',
    icon: 'moon',
    category: 'routine',
  },
  {
    id: 'avoid_alcohol',
    title: 'Limit Alcohol',
    description: 'While alcohol may help you fall asleep, it disrupts sleep quality and REM sleep later in the night.',
    icon: 'wine',
    category: 'habits',
  },
  {
    id: 'dont_force_sleep',
    title: 'Don\'t Force Sleep',
    description: 'If you can\'t fall asleep after 20 minutes, get up and do something relaxing until you feel sleepy.',
    icon: 'walk',
    category: 'routine',
  },
  {
    id: 'sunlight_exposure',
    title: 'Get Morning Sunlight',
    description: 'Exposure to natural light in the morning helps regulate your circadian rhythm and improves nighttime sleep.',
    icon: 'sunny',
    category: 'habits',
  },
  {
    id: 'nap_wisely',
    title: 'Nap Wisely',
    description: 'If you nap, keep it under 30 minutes and before 3pm to avoid interfering with nighttime sleep.',
    icon: 'timer',
    category: 'habits',
  },
];

export const SLEEP_QUALITY_LABELS: Record<number, { label: string; emoji: string }> = {
  1: { label: 'Terrible', emoji: '😫' },
  2: { label: 'Very Poor', emoji: '😣' },
  3: { label: 'Poor', emoji: '😔' },
  4: { label: 'Below Average', emoji: '😕' },
  5: { label: 'Average', emoji: '😐' },
  6: { label: 'Okay', emoji: '🙂' },
  7: { label: 'Good', emoji: '😊' },
  8: { label: 'Very Good', emoji: '😄' },
  9: { label: 'Excellent', emoji: '😁' },
  10: { label: 'Perfect', emoji: '🤩' },
};
