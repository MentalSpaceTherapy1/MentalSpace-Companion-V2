/**
 * Health Store
 * Zustand store for managing health integration state and data
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isAvailable,
  requestPermissions,
  getSleepData,
  getStepsData,
  getHeartRateData,
  getLastNightSleep,
  type SleepSession,
  type StepsData,
  type HeartRateData,
  type HealthAvailability,
} from '../services/healthIntegration';

const HEALTH_STORAGE_KEY = '@mentalspace/health_integration';

export interface HealthState {
  // Connection state
  isConnected: boolean;
  isAvailable: boolean;
  platform: 'ios' | 'android' | 'web' | 'unsupported';
  permissions: {
    sleep: boolean;
    steps: boolean;
    heartRate: boolean;
  };

  // Sync state
  lastSyncDate: string | null; // ISO string
  isSyncing: boolean;
  syncError: string | null;

  // Health data
  sleepData: SleepSession[];
  stepsData: StepsData[];
  heartRateData: HeartRateData | null;

  // Actions
  checkAvailability: () => Promise<void>;
  connectHealth: () => Promise<{ success: boolean; error?: string }>;
  disconnectHealth: () => Promise<void>;
  syncHealthData: (days?: number) => Promise<{ success: boolean; error?: string }>;
  loadStoredData: () => Promise<void>;
  clearHealthData: () => Promise<void>;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  // Initial state
  isConnected: false,
  isAvailable: false,
  platform: 'unsupported',
  permissions: {
    sleep: false,
    steps: false,
    heartRate: false,
  },
  lastSyncDate: null,
  isSyncing: false,
  syncError: null,
  sleepData: [],
  stepsData: [],
  heartRateData: null,

  /**
   * Check if health integration is available on this device
   */
  checkAvailability: async () => {
    try {
      const availability = await isAvailable();

      set({
        isAvailable: availability.isAvailable,
        platform: availability.platform,
        permissions: availability.permissions,
        isConnected: availability.isAvailable && Object.values(availability.permissions).some((p) => p),
      });

      // Load stored data if connected
      if (availability.isAvailable && Object.values(availability.permissions).some((p) => p)) {
        await get().loadStoredData();
      }
    } catch (error) {
      console.error('Error checking health availability:', error);
      set({
        isAvailable: false,
        platform: 'unsupported',
        isConnected: false,
      });
    }
  },

  /**
   * Request permissions and connect to health data
   */
  connectHealth: async () => {
    try {
      const result = await requestPermissions();

      if (result.success) {
        const hasAnyPermission = Object.values(result.granted).some((p) => p);

        set({
          isConnected: hasAnyPermission,
          permissions: result.granted,
        });

        // Save connection state
        await AsyncStorage.setItem(
          HEALTH_STORAGE_KEY,
          JSON.stringify({
            isConnected: hasAnyPermission,
            permissions: result.granted,
            lastSyncDate: get().lastSyncDate,
          })
        );

        // Perform initial sync if connected
        if (hasAnyPermission) {
          await get().syncHealthData(7);
        }

        return { success: true };
      }

      return {
        success: false,
        error: result.error || 'Failed to request permissions',
      };
    } catch (error: any) {
      console.error('Error connecting to health:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to health data',
      };
    }
  },

  /**
   * Disconnect from health integration
   */
  disconnectHealth: async () => {
    set({
      isConnected: false,
      permissions: {
        sleep: false,
        steps: false,
        heartRate: false,
      },
      lastSyncDate: null,
      sleepData: [],
      stepsData: [],
      heartRateData: null,
    });

    try {
      await AsyncStorage.removeItem(HEALTH_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing health storage:', error);
    }
  },

  /**
   * Sync health data from the device
   */
  syncHealthData: async (days = 7) => {
    const { isConnected, permissions } = get();

    if (!isConnected) {
      return {
        success: false,
        error: 'Health integration not connected',
      };
    }

    set({ isSyncing: true, syncError: null });

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const results: {
        sleepData?: SleepSession[];
        stepsData?: StepsData[];
        heartRateData?: HeartRateData;
      } = {};

      // Fetch sleep data if permission granted
      if (permissions.sleep) {
        const sleepResult = await getSleepData(startDate, endDate);
        if (sleepResult.success && sleepResult.data) {
          results.sleepData = sleepResult.data;
        }
      }

      // Fetch steps data if permission granted
      if (permissions.steps) {
        const stepsResult = await getStepsData(startDate, endDate);
        if (stepsResult.success && stepsResult.data) {
          results.stepsData = stepsResult.data;
        }
      }

      // Fetch heart rate data if permission granted
      if (permissions.heartRate) {
        const heartRateResult = await getHeartRateData();
        if (heartRateResult.success && heartRateResult.data) {
          results.heartRateData = heartRateResult.data;
        }
      }

      const lastSyncDate = new Date().toISOString();

      set({
        sleepData: results.sleepData || get().sleepData,
        stepsData: results.stepsData || get().stepsData,
        heartRateData: results.heartRateData || get().heartRateData,
        lastSyncDate,
        isSyncing: false,
      });

      // Persist to storage
      await AsyncStorage.setItem(
        HEALTH_STORAGE_KEY,
        JSON.stringify({
          isConnected: get().isConnected,
          permissions: get().permissions,
          lastSyncDate,
          sleepData: results.sleepData || [],
          stepsData: results.stepsData || [],
          heartRateData: results.heartRateData || null,
        })
      );

      return { success: true };
    } catch (error: any) {
      console.error('Error syncing health data:', error);
      const errorMsg = error.message || 'Failed to sync health data';

      set({
        isSyncing: false,
        syncError: errorMsg,
      });

      return {
        success: false,
        error: errorMsg,
      };
    }
  },

  /**
   * Load stored health data from AsyncStorage
   */
  loadStoredData: async () => {
    try {
      const stored = await AsyncStorage.getItem(HEALTH_STORAGE_KEY);

      if (stored) {
        const data = JSON.parse(stored);

        set({
          isConnected: data.isConnected || false,
          permissions: data.permissions || {
            sleep: false,
            steps: false,
            heartRate: false,
          },
          lastSyncDate: data.lastSyncDate || null,
          sleepData: data.sleepData || [],
          stepsData: data.stepsData || [],
          heartRateData: data.heartRateData || null,
        });
      }
    } catch (error) {
      console.error('Error loading health data:', error);
    }
  },

  /**
   * Clear all health data from store and storage
   */
  clearHealthData: async () => {
    set({
      sleepData: [],
      stepsData: [],
      heartRateData: null,
      lastSyncDate: null,
    });

    try {
      const { isConnected, permissions } = get();
      await AsyncStorage.setItem(
        HEALTH_STORAGE_KEY,
        JSON.stringify({
          isConnected,
          permissions,
          lastSyncDate: null,
        })
      );
    } catch (error) {
      console.error('Error clearing health data:', error);
    }
  },
}));

/**
 * Helper function to get the latest sleep session for check-in pre-fill
 */
export const getLatestSleepForCheckin = async (): Promise<{
  duration?: number;
  quality?: number;
  error?: string;
}> => {
  try {
    const result = await getLastNightSleep();

    if (result.success && result.data) {
      return {
        duration: result.data.duration,
        quality: result.data.quality,
      };
    }

    return {
      error: result.error || 'No sleep data available',
    };
  } catch (error: any) {
    console.error('Error getting latest sleep:', error);
    return {
      error: error.message || 'Failed to get sleep data',
    };
  }
};
