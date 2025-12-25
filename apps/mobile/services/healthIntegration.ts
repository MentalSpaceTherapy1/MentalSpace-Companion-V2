/**
 * Health Integration Service
 * Provides cross-platform health data integration (Apple Health / Google Fit)
 *
 * NOTE: Currently disabled due to expo-health-connect bundling issues.
 * The package imports @expo/config-plugins which contains Node.js-only code.
 */

// Type definitions for health data
export interface SleepSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  quality?: number; // 1-10 scale (derived from sleep stages if available)
  stages?: {
    awake?: number;
    light?: number;
    deep?: number;
    rem?: number;
  };
}

export interface StepsData {
  date: string; // YYYY-MM-DD
  steps: number;
  distance?: number; // meters
  caloriesBurned?: number;
}

export interface HeartRateData {
  timestamp: Date;
  bpm: number;
  restingBpm?: number;
}

export interface HealthAvailability {
  isAvailable: boolean;
  platform: 'ios' | 'android' | 'web' | 'unsupported';
  permissions: {
    sleep: boolean;
    steps: boolean;
    heartRate: boolean;
  };
}

/**
 * Check if health integration is supported on this platform
 * Currently returns false - health integration is disabled
 */
export const isAvailable = async (): Promise<HealthAvailability> => {
  return {
    isAvailable: false,
    platform: 'unsupported',
    permissions: {
      sleep: false,
      steps: false,
      heartRate: false,
    },
  };
};

/**
 * Request permissions to access health data
 * Currently disabled
 */
export const requestPermissions = async (): Promise<{
  success: boolean;
  granted: {
    sleep: boolean;
    steps: boolean;
    heartRate: boolean;
  };
  error?: string;
}> => {
  return {
    success: false,
    granted: { sleep: false, steps: false, heartRate: false },
    error: 'Health integration is temporarily disabled',
  };
};

/**
 * Fetch sleep data for a date range
 * Currently disabled
 */
export const getSleepData = async (
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; data?: SleepSession[]; error?: string }> => {
  return {
    success: false,
    error: 'Health integration is temporarily disabled',
  };
};

/**
 * Fetch steps data for a date range
 * Currently disabled
 */
export const getStepsData = async (
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; data?: StepsData[]; error?: string }> => {
  return {
    success: false,
    error: 'Health integration is temporarily disabled',
  };
};

/**
 * Fetch heart rate data for today
 * Currently disabled
 */
export const getHeartRateData = async (): Promise<{
  success: boolean;
  data?: HeartRateData;
  error?: string;
}> => {
  return {
    success: false,
    error: 'Health integration is temporarily disabled',
  };
};

/**
 * Get the most recent sleep session (for pre-filling check-in data)
 * Currently disabled
 */
export const getLastNightSleep = async (): Promise<{
  success: boolean;
  data?: SleepSession;
  error?: string;
}> => {
  return {
    success: false,
    error: 'Health integration is temporarily disabled',
  };
};

/**
 * Convert sleep duration to quality rating (1-10 scale)
 * Based on recommended 7-9 hours for adults
 */
export const convertDurationToQuality = (durationMinutes: number): number => {
  const hours = durationMinutes / 60;

  if (hours < 4) return 1;
  if (hours < 5) return 2;
  if (hours < 6) return 4;
  if (hours >= 7 && hours <= 9) return 8;
  if (hours > 9 && hours <= 10) return 7;
  if (hours > 10) return 5;

  // 6-7 hours
  return 6;
};
