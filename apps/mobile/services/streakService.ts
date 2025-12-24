/**
 * Streak Service
 * Calculates and manages user streaks for check-ins and completions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import { sendStreakCelebration } from './notifications';

// Storage keys
const STREAK_CACHE_KEY = 'streak_cache';
const LAST_CELEBRATION_KEY = 'last_streak_celebration';

// Streak milestones that trigger celebrations
const STREAK_MILESTONES = [3, 7, 14, 21, 30, 60, 90, 180, 365];

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalCheckins: number;
  lastCheckinDate: string | null;
  streakStartDate: string | null;
  isActive: boolean; // Whether streak is still active (checked in today or yesterday)
}

interface CachedStreak {
  data: StreakData;
  calculatedAt: number;
  userId: string;
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date string in YYYY-MM-DD format
 */
function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Calculate the number of consecutive days from a list of date strings
 */
function calculateConsecutiveDays(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0;

  let streak = 1;
  const today = getTodayString();
  const yesterday = getYesterdayString();

  // Check if the most recent date is today or yesterday
  // If not, streak is broken
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  // Count consecutive days backwards from most recent
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i - 1]);
    const previousDate = new Date(sortedDates[i]);

    // Calculate difference in days
    const diffTime = currentDate.getTime() - previousDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break; // Streak is broken
    }
  }

  return streak;
}

/**
 * Calculate the longest streak from a list of date strings
 */
function calculateLongestStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0;

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i - 1]);
    const previousDate = new Date(sortedDates[i]);

    const diffTime = currentDate.getTime() - previousDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

/**
 * Calculate streak data from check-in dates fetched from Firebase
 */
export async function calculateStreak(userId: string): Promise<StreakData> {
  try {
    // Fetch all check-in dates for the user (using compat API)
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('checkins')
      .orderBy('date', 'desc')
      .limit(365) // Look back up to a year
      .get();

    const dates = snapshot.docs.map((doc) => doc.data().date as string);
    const uniqueDates = [...new Set(dates)].sort((a, b) => b.localeCompare(a));

    if (uniqueDates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalCheckins: 0,
        lastCheckinDate: null,
        streakStartDate: null,
        isActive: false,
      };
    }

    const currentStreak = calculateConsecutiveDays(uniqueDates);
    const longestStreak = Math.max(currentStreak, calculateLongestStreak(uniqueDates));
    const lastCheckinDate = uniqueDates[0];

    // Calculate streak start date
    let streakStartDate: string | null = null;
    if (currentStreak > 0) {
      const startIndex = currentStreak - 1;
      streakStartDate = uniqueDates[startIndex] || uniqueDates[uniqueDates.length - 1];
    }

    const today = getTodayString();
    const yesterday = getYesterdayString();
    const isActive = lastCheckinDate === today || lastCheckinDate === yesterday;

    const streakData: StreakData = {
      currentStreak,
      longestStreak,
      totalCheckins: uniqueDates.length,
      lastCheckinDate,
      streakStartDate,
      isActive,
    };

    // Cache the result
    await cacheStreak(userId, streakData);

    return streakData;
  } catch (error) {
    console.error('Error calculating streak:', error);

    // Try to return cached data on error
    const cached = await getCachedStreak(userId);
    if (cached) {
      return cached.data;
    }

    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCheckins: 0,
      lastCheckinDate: null,
      streakStartDate: null,
      isActive: false,
    };
  }
}

/**
 * Cache streak data locally
 */
async function cacheStreak(userId: string, data: StreakData): Promise<void> {
  try {
    const cacheEntry: CachedStreak = {
      data,
      calculatedAt: Date.now(),
      userId,
    };
    await AsyncStorage.setItem(
      `${STREAK_CACHE_KEY}_${userId}`,
      JSON.stringify(cacheEntry)
    );
  } catch (error) {
    console.error('Error caching streak:', error);
  }
}

/**
 * Get cached streak data
 */
export async function getCachedStreak(userId: string): Promise<CachedStreak | null> {
  try {
    const cached = await AsyncStorage.getItem(`${STREAK_CACHE_KEY}_${userId}`);
    if (cached) {
      return JSON.parse(cached) as CachedStreak;
    }
  } catch (error) {
    console.error('Error getting cached streak:', error);
  }
  return null;
}

/**
 * Check if cached streak is stale (older than 5 minutes)
 */
export function isCachedStreakStale(cached: CachedStreak | null): boolean {
  if (!cached) return true;
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return cached.calculatedAt < fiveMinutesAgo;
}

/**
 * Check and send streak milestone celebration
 */
export async function checkStreakMilestone(
  userId: string,
  currentStreak: number
): Promise<void> {
  if (!STREAK_MILESTONES.includes(currentStreak)) return;

  try {
    // Check if we've already celebrated this milestone
    const lastCelebration = await AsyncStorage.getItem(
      `${LAST_CELEBRATION_KEY}_${userId}`
    );

    if (lastCelebration) {
      const { streak, date } = JSON.parse(lastCelebration);
      // Don't celebrate same milestone on same day
      if (streak === currentStreak && date === getTodayString()) {
        return;
      }
    }

    // Send celebration notification
    await sendStreakCelebration(currentStreak);

    // Record the celebration
    await AsyncStorage.setItem(
      `${LAST_CELEBRATION_KEY}_${userId}`,
      JSON.stringify({
        streak: currentStreak,
        date: getTodayString(),
      })
    );
  } catch (error) {
    console.error('Error checking streak milestone:', error);
  }
}

/**
 * Get streak message based on current streak
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your streak today!";
  if (streak === 1) return "Great start!";
  if (streak === 2) return "Building momentum!";
  if (streak < 7) return "Keep it up!";
  if (streak === 7) return "One week strong!";
  if (streak < 14) return "Amazing consistency!";
  if (streak === 14) return "Two weeks!";
  if (streak < 21) return "Incredible dedication!";
  if (streak === 21) return "Habit formed!";
  if (streak < 30) return "Unstoppable!";
  if (streak === 30) return "One month!";
  if (streak < 60) return "This is who you are now!";
  if (streak === 60) return "Two months!";
  if (streak < 90) return "Truly inspiring!";
  if (streak === 90) return "Three months!";
  if (streak < 180) return "Legend status!";
  if (streak === 180) return "Half a year!";
  if (streak < 365) return "Absolutely incredible!";
  if (streak >= 365) return "ONE YEAR! Legendary!";
  return "Keep it up!";
}

/**
 * Clear streak cache for a user
 */
export async function clearStreakCache(userId: string): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      `${STREAK_CACHE_KEY}_${userId}`,
      `${LAST_CELEBRATION_KEY}_${userId}`,
    ]);
  } catch (error) {
    console.error('Error clearing streak cache:', error);
  }
}
