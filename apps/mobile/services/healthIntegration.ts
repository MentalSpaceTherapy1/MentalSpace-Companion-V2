/**
 * Health Integration Service
 * Provides cross-platform health data integration (Apple Health / Google Fit)
 * Handles gracefully when health APIs aren't available (web, unsupported devices)
 */

import { Platform } from 'react-native';

// Dynamic import to handle when expo-health-connect isn't fully supported
let HealthConnect: any = null;
try {
  // Only import on Android since expo-health-connect is Android-specific
  if (Platform.OS === 'android') {
    HealthConnect = require('expo-health-connect');
  }
} catch (e) {
  console.log('expo-health-connect not available');
}

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
 */
export const isAvailable = async (): Promise<HealthAvailability> => {
  // Health APIs are not available on web
  if (Platform.OS === 'web') {
    return {
      isAvailable: false,
      platform: 'web',
      permissions: {
        sleep: false,
        steps: false,
        heartRate: false,
      },
    };
  }

  // Check if expo-health-connect is available (Android)
  if (Platform.OS === 'android') {
    try {
      // Check if HealthConnect module is loaded and has the isAvailable function
      if (!HealthConnect || typeof HealthConnect.isAvailable !== 'function') {
        // Fall back to checking if the module exists but with different API
        if (HealthConnect && typeof HealthConnect.initialize === 'function') {
          await HealthConnect.initialize();
          return {
            isAvailable: true,
            platform: 'android',
            permissions: { sleep: false, steps: false, heartRate: false },
          };
        }
        return {
          isAvailable: false,
          platform: 'android',
          permissions: { sleep: false, steps: false, heartRate: false },
        };
      }

      const available = await HealthConnect.isAvailable();
      if (!available) {
        return {
          isAvailable: false,
          platform: 'android',
          permissions: {
            sleep: false,
            steps: false,
            heartRate: false,
          },
        };
      }

      // Check current permissions
      const permissions = await checkPermissions();

      return {
        isAvailable: true,
        platform: 'android',
        permissions,
      };
    } catch (error) {
      console.error('Error checking Health Connect availability:', error);
      return {
        isAvailable: false,
        platform: 'android',
        permissions: {
          sleep: false,
          steps: false,
          heartRate: false,
        },
      };
    }
  }

  // For iOS, we would use expo-apple-healthkit (not included in expo-health-connect)
  if (Platform.OS === 'ios') {
    // Since we're using expo-health-connect which is Android-only,
    // iOS would require a different package (expo-apple-healthkit or react-native-health)
    // For now, we'll return unsupported, but this can be extended
    return {
      isAvailable: false,
      platform: 'ios',
      permissions: {
        sleep: false,
        steps: false,
        heartRate: false,
      },
    };
  }

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
 * Check current health data permissions
 */
const checkPermissions = async (): Promise<{
  sleep: boolean;
  steps: boolean;
  heartRate: boolean;
}> => {
  if (Platform.OS !== 'android' || !HealthConnect) {
    return { sleep: false, steps: false, heartRate: false };
  }

  try {
    // Check if the API method exists
    if (typeof HealthConnect.getGrantedPermissions !== 'function') {
      // API not available - return defaults
      return { sleep: false, steps: false, heartRate: false };
    }

    const grantedPermissions = await HealthConnect.getGrantedPermissions();

    // Handle both array format and object format
    if (Array.isArray(grantedPermissions)) {
      const SleepSession = HealthConnect.HealthPermission?.SleepSession ?? 'SleepSession';
      const Steps = HealthConnect.HealthPermission?.Steps ?? 'Steps';
      const HeartRate = HealthConnect.HealthPermission?.HeartRate ?? 'HeartRate';

      return {
        sleep: grantedPermissions.includes(SleepSession),
        steps: grantedPermissions.includes(Steps),
        heartRate: grantedPermissions.includes(HeartRate),
      };
    }

    return { sleep: false, steps: false, heartRate: false };
  } catch (error) {
    console.error('Error checking permissions:', error);
    return { sleep: false, steps: false, heartRate: false };
  }
};

/**
 * Request permissions to access health data
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
  const availability = await isAvailable();

  if (!availability.isAvailable) {
    return {
      success: false,
      granted: { sleep: false, steps: false, heartRate: false },
      error: `Health integration is not available on ${availability.platform}`,
    };
  }

  if (Platform.OS === 'android') {
    try {
      if (!HealthConnect || typeof HealthConnect.requestPermission !== 'function') {
        return {
          success: false,
          granted: { sleep: false, steps: false, heartRate: false },
          error: 'Health Connect API not available',
        };
      }

      // Request permissions for sleep, steps, and heart rate
      const ReadType = HealthConnect.HealthPermissionType?.Read ?? 'read';
      const SleepSession = HealthConnect.HealthPermission?.SleepSession ?? 'SleepSession';
      const Steps = HealthConnect.HealthPermission?.Steps ?? 'Steps';
      const HeartRate = HealthConnect.HealthPermission?.HeartRate ?? 'HeartRate';

      const permissions = [
        { accessType: ReadType, recordType: SleepSession },
        { accessType: ReadType, recordType: Steps },
        { accessType: ReadType, recordType: HeartRate },
      ];

      await HealthConnect.requestPermission(permissions);

      // Check which permissions were actually granted
      const granted = await checkPermissions();

      return {
        success: true,
        granted,
      };
    } catch (error: any) {
      console.error('Error requesting health permissions:', error);
      return {
        success: false,
        granted: { sleep: false, steps: false, heartRate: false },
        error: error.message || 'Failed to request health permissions',
      };
    }
  }

  return {
    success: false,
    granted: { sleep: false, steps: false, heartRate: false },
    error: 'Platform not supported',
  };
};

/**
 * Fetch sleep data for a date range
 */
export const getSleepData = async (
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; data?: SleepSession[]; error?: string }> => {
  const availability = await isAvailable();

  if (!availability.isAvailable) {
    return {
      success: false,
      error: 'Health integration not available',
    };
  }

  if (!availability.permissions.sleep) {
    return {
      success: false,
      error: 'Sleep permission not granted',
    };
  }

  if (Platform.OS === 'android') {
    try {
      if (!HealthConnect || typeof HealthConnect.readRecords !== 'function') {
        return { success: false, error: 'Health Connect API not available' };
      }

      const SleepSession = HealthConnect.HealthPermission?.SleepSession ?? 'SleepSession';
      const sleepRecords = await HealthConnect.readRecords(SleepSession, {
        timeRangeFilter: {
          operator: 'between',
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        },
      });

      const sessions: SleepSession[] = sleepRecords.map((record: any) => {
        const startTime = new Date(record.startTime);
        const endTime = new Date(record.endTime);
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

        // Calculate quality score based on sleep stages if available
        let quality: number | undefined;
        let stages: SleepSession['stages'] | undefined;

        if (record.stages && Array.isArray(record.stages)) {
          const totalMinutes = duration;
          let deepMinutes = 0;
          let remMinutes = 0;
          let lightMinutes = 0;
          let awakeMinutes = 0;

          record.stages.forEach((stage: any) => {
            const stageDuration = Math.round(
              (new Date(stage.endTime).getTime() - new Date(stage.startTime).getTime()) / (1000 * 60)
            );

            switch (stage.stage) {
              case 1: // Awake
                awakeMinutes += stageDuration;
                break;
              case 2: // Light
                lightMinutes += stageDuration;
                break;
              case 3: // Deep
                deepMinutes += stageDuration;
                break;
              case 4: // REM
                remMinutes += stageDuration;
                break;
            }
          });

          stages = {
            awake: awakeMinutes,
            light: lightMinutes,
            deep: deepMinutes,
            rem: remMinutes,
          };

          // Quality score: weighted by sleep stages
          // Deep sleep and REM are most restorative
          const deepPercent = (deepMinutes / totalMinutes) * 100;
          const remPercent = (remMinutes / totalMinutes) * 100;
          const awakePercent = (awakeMinutes / totalMinutes) * 100;

          // Optimal: 20% deep, 20% REM, <5% awake
          const deepScore = Math.min((deepPercent / 20) * 3, 3);
          const remScore = Math.min((remPercent / 20) * 3, 3);
          const awakeScore = Math.max(4 - (awakePercent / 5) * 4, 0);

          quality = Math.round(deepScore + remScore + awakeScore + 1); // 1-10 scale
          quality = Math.max(1, Math.min(10, quality));
        }

        return {
          id: record.metadata?.id || `sleep_${startTime.getTime()}`,
          startTime,
          endTime,
          duration,
          quality,
          stages,
        };
      });

      return {
        success: true,
        data: sessions,
      };
    } catch (error: any) {
      console.error('Error fetching sleep data:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch sleep data',
      };
    }
  }

  return {
    success: false,
    error: 'Platform not supported',
  };
};

/**
 * Fetch steps data for a date range
 */
export const getStepsData = async (
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; data?: StepsData[]; error?: string }> => {
  const availability = await isAvailable();

  if (!availability.isAvailable) {
    return {
      success: false,
      error: 'Health integration not available',
    };
  }

  if (!availability.permissions.steps) {
    return {
      success: false,
      error: 'Steps permission not granted',
    };
  }

  if (Platform.OS === 'android') {
    try {
      if (!HealthConnect || typeof HealthConnect.readRecords !== 'function') {
        return { success: false, error: 'Health Connect API not available' };
      }

      const Steps = HealthConnect.HealthPermission?.Steps ?? 'Steps';
      const stepsRecords = await HealthConnect.readRecords(Steps, {
        timeRangeFilter: {
          operator: 'between',
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        },
      });

      // Group by date
      const stepsMap = new Map<string, number>();

      stepsRecords.forEach((record: any) => {
        const date = new Date(record.startTime).toISOString().split('T')[0];
        const currentSteps = stepsMap.get(date) || 0;
        stepsMap.set(date, currentSteps + (record.count || 0));
      });

      const data: StepsData[] = Array.from(stepsMap.entries()).map(([date, steps]) => ({
        date,
        steps,
      }));

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error('Error fetching steps data:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch steps data',
      };
    }
  }

  return {
    success: false,
    error: 'Platform not supported',
  };
};

/**
 * Fetch heart rate data for today
 */
export const getHeartRateData = async (): Promise<{
  success: boolean;
  data?: HeartRateData;
  error?: string;
}> => {
  const availability = await isAvailable();

  if (!availability.isAvailable) {
    return {
      success: false,
      error: 'Health integration not available',
    };
  }

  if (!availability.permissions.heartRate) {
    return {
      success: false,
      error: 'Heart rate permission not granted',
    };
  }

  if (Platform.OS === 'android') {
    try {
      if (!HealthConnect || typeof HealthConnect.readRecords !== 'function') {
        return { success: false, error: 'Health Connect API not available' };
      }

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const HeartRate = HealthConnect.HealthPermission?.HeartRate ?? 'HeartRate';
      const heartRateRecords = await HealthConnect.readRecords(HeartRate, {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: now.toISOString(),
        },
      });

      if (heartRateRecords.length === 0) {
        return {
          success: false,
          error: 'No heart rate data available',
        };
      }

      // Get the most recent heart rate reading
      const latestRecord = heartRateRecords[heartRateRecords.length - 1];

      // Calculate average as resting rate
      const allBpms = heartRateRecords.map((r: any) => r.beatsPerMinute || 0).filter((bpm: number) => bpm > 0);
      const restingBpm = allBpms.length > 0
        ? Math.round(allBpms.reduce((a: number, b: number) => a + b, 0) / allBpms.length)
        : undefined;

      return {
        success: true,
        data: {
          timestamp: new Date(latestRecord.time),
          bpm: latestRecord.beatsPerMinute || 0,
          restingBpm,
        },
      };
    } catch (error: any) {
      console.error('Error fetching heart rate data:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch heart rate data',
      };
    }
  }

  return {
    success: false,
    error: 'Platform not supported',
  };
};

/**
 * Get the most recent sleep session (for pre-filling check-in data)
 */
export const getLastNightSleep = async (): Promise<{
  success: boolean;
  data?: SleepSession;
  error?: string;
}> => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(12, 0, 0, 0); // Start from noon yesterday

  const result = await getSleepData(yesterday, now);

  if (!result.success || !result.data || result.data.length === 0) {
    return {
      success: false,
      error: result.error || 'No sleep data available',
    };
  }

  // Return the most recent sleep session
  const sortedSessions = result.data.sort(
    (a, b) => b.endTime.getTime() - a.endTime.getTime()
  );

  return {
    success: true,
    data: sortedSessions[0],
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
