/**
 * Offline Storage Service
 * Provides offline-first data persistence with sync capabilities
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Checkin, DailyPlan, SOSSession, WeeklyFocus } from '@mentalspace/shared';

// Storage keys
const STORAGE_KEYS = {
  CHECKINS: 'offline_checkins',
  PLANS: 'offline_plans',
  SOS_SESSIONS: 'offline_sos_sessions',
  WEEKLY_FOCUS: 'offline_weekly_focus',
  SYNC_QUEUE: 'offline_sync_queue',
  LAST_SYNC: 'offline_last_sync',
  CACHED_USER_ID: 'offline_user_id',
} as const;

// Sync operation types
type SyncOperation = 'create' | 'update' | 'delete';

interface SyncQueueItem {
  id: string;
  collection: string;
  operation: SyncOperation;
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

interface CacheMetadata {
  userId: string;
  lastSynced: number;
  version: number;
}

// Network state
let isOnline = true;
let syncInProgress = false;

// ========================================
// NETWORK MONITORING
// ========================================

/**
 * Initialize network state monitoring
 */
export function initializeNetworkMonitoring(): () => void {
  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const wasOffline = !isOnline;
    isOnline = state.isConnected ?? false;

    // If we just came online, trigger a sync
    if (wasOffline && isOnline) {
      console.log('Network restored, initiating sync...');
      syncPendingOperations().catch(console.error);
    }
  });

  // Check initial state
  NetInfo.fetch().then((state) => {
    isOnline = state.isConnected ?? false;
  });

  return unsubscribe;
}

/**
 * Check if device is online
 */
export function isDeviceOnline(): boolean {
  return isOnline;
}

/**
 * Manually check network status
 */
export async function checkNetworkStatus(): Promise<boolean> {
  const state = await NetInfo.fetch();
  isOnline = state.isConnected ?? false;
  return isOnline;
}

// ========================================
// CHECKIN OFFLINE STORAGE
// ========================================

/**
 * Cache checkins locally
 */
export async function cacheCheckins(userId: string, checkins: Checkin[]): Promise<void> {
  try {
    const key = `${STORAGE_KEYS.CHECKINS}_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(checkins));
    await updateLastSync(userId, 'checkins');
  } catch (error) {
    console.error('Failed to cache checkins:', error);
  }
}

/**
 * Get cached checkins
 */
export async function getCachedCheckins(userId: string): Promise<Checkin[]> {
  try {
    const key = `${STORAGE_KEYS.CHECKINS}_${userId}`;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as Checkin[];
    }
  } catch (error) {
    console.error('Failed to get cached checkins:', error);
  }
  return [];
}

/**
 * Add a checkin to local cache
 */
export async function addCheckinToCache(userId: string, checkin: Checkin): Promise<void> {
  try {
    const cached = await getCachedCheckins(userId);
    // Replace if same date exists, otherwise add
    const existingIndex = cached.findIndex((c) => c.date === checkin.date);
    if (existingIndex >= 0) {
      cached[existingIndex] = checkin;
    } else {
      cached.unshift(checkin); // Add to beginning
    }
    // Keep only last 30 days
    const trimmed = cached.slice(0, 30);
    await cacheCheckins(userId, trimmed);
  } catch (error) {
    console.error('Failed to add checkin to cache:', error);
  }
}

/**
 * Create a checkin with offline support
 */
export async function createCheckinOffline(
  userId: string,
  checkinData: Omit<Checkin, 'id' | 'userId' | 'createdAt'>
): Promise<Checkin> {
  const tempId = `temp_${Date.now()}`;
  const checkin: Checkin = {
    ...checkinData,
    id: tempId,
    userId,
    createdAt: new Date(),
  };

  // Always save to local cache first
  await addCheckinToCache(userId, checkin);

  if (isOnline) {
    try {
      // Try to save to Firebase
      const checkinsRef = collection(db, 'users', userId, 'checkins');
      const docRef = await addDoc(checkinsRef, {
        ...checkinData,
        createdAt: serverTimestamp(),
      });

      // Update local cache with real ID
      const savedCheckin = { ...checkin, id: docRef.id };
      await addCheckinToCache(userId, savedCheckin);

      return savedCheckin;
    } catch (error) {
      console.error('Failed to save checkin online, queuing for sync:', error);
      // Add to sync queue
      await addToSyncQueue({
        id: tempId,
        collection: `users/${userId}/checkins`,
        operation: 'create',
        data: checkinData as Record<string, unknown>,
        timestamp: Date.now(),
        retryCount: 0,
      });
    }
  } else {
    // Queue for later sync
    await addToSyncQueue({
      id: tempId,
      collection: `users/${userId}/checkins`,
      operation: 'create',
      data: checkinData as Record<string, unknown>,
      timestamp: Date.now(),
      retryCount: 0,
    });
  }

  return checkin;
}

// ========================================
// DAILY PLAN OFFLINE STORAGE
// ========================================

/**
 * Cache daily plans locally
 */
export async function cachePlans(userId: string, plans: DailyPlan[]): Promise<void> {
  try {
    const key = `${STORAGE_KEYS.PLANS}_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(plans));
    await updateLastSync(userId, 'plans');
  } catch (error) {
    console.error('Failed to cache plans:', error);
  }
}

/**
 * Get cached daily plans
 */
export async function getCachedPlans(userId: string): Promise<DailyPlan[]> {
  try {
    const key = `${STORAGE_KEYS.PLANS}_${userId}`;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as DailyPlan[];
    }
  } catch (error) {
    console.error('Failed to get cached plans:', error);
  }
  return [];
}

/**
 * Update action completion status offline
 */
export async function updateActionCompletionOffline(
  userId: string,
  planId: string,
  actionId: string,
  completed: boolean
): Promise<void> {
  // Update local cache
  const plans = await getCachedPlans(userId);
  const planIndex = plans.findIndex((p) => p.id === planId);

  if (planIndex >= 0) {
    const actionIndex = plans[planIndex].actions.findIndex((a) => a.id === actionId);
    if (actionIndex >= 0) {
      plans[planIndex].actions[actionIndex].completed = completed;
      plans[planIndex].actions[actionIndex].completedAt = completed ? new Date() : undefined;
      plans[planIndex].completedCount = plans[planIndex].actions.filter((a) => a.completed).length;
      await cachePlans(userId, plans);
    }
  }

  if (isOnline) {
    try {
      const planRef = doc(db, 'users', userId, 'plans', planId);
      await updateDoc(planRef, {
        [`actions.${actionId}.completed`]: completed,
        [`actions.${actionId}.completedAt`]: completed ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to update action online, queuing for sync:', error);
      await addToSyncQueue({
        id: `${planId}_${actionId}`,
        collection: `users/${userId}/plans/${planId}`,
        operation: 'update',
        data: { actionId, completed },
        timestamp: Date.now(),
        retryCount: 0,
      });
    }
  } else {
    await addToSyncQueue({
      id: `${planId}_${actionId}`,
      collection: `users/${userId}/plans/${planId}`,
      operation: 'update',
      data: { actionId, completed },
      timestamp: Date.now(),
      retryCount: 0,
    });
  }
}

// ========================================
// SOS SESSION OFFLINE STORAGE
// ========================================

/**
 * Cache SOS sessions locally
 */
export async function cacheSOSSessions(userId: string, sessions: SOSSession[]): Promise<void> {
  try {
    const key = `${STORAGE_KEYS.SOS_SESSIONS}_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to cache SOS sessions:', error);
  }
}

/**
 * Get cached SOS sessions
 */
export async function getCachedSOSSessions(userId: string): Promise<SOSSession[]> {
  try {
    const key = `${STORAGE_KEYS.SOS_SESSIONS}_${userId}`;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as SOSSession[];
    }
  } catch (error) {
    console.error('Failed to get cached SOS sessions:', error);
  }
  return [];
}

/**
 * Save SOS session with offline support
 */
export async function saveSOSSessionOffline(userId: string, session: SOSSession): Promise<void> {
  // Always save locally first
  const sessions = await getCachedSOSSessions(userId);
  sessions.unshift(session);
  const trimmed = sessions.slice(0, 50); // Keep last 50 sessions
  await cacheSOSSessions(userId, trimmed);

  if (isOnline) {
    try {
      const sessionsRef = collection(db, 'users', userId, 'sos_sessions');
      await addDoc(sessionsRef, {
        ...session,
        startedAt: Timestamp.fromDate(session.startedAt),
        completedAt: session.completedAt ? Timestamp.fromDate(session.completedAt) : null,
      });
    } catch (error) {
      console.error('Failed to save SOS session online, queuing for sync:', error);
      await addToSyncQueue({
        id: session.id,
        collection: `users/${userId}/sos_sessions`,
        operation: 'create',
        data: session as unknown as Record<string, unknown>,
        timestamp: Date.now(),
        retryCount: 0,
      });
    }
  } else {
    await addToSyncQueue({
      id: session.id,
      collection: `users/${userId}/sos_sessions`,
      operation: 'create',
      data: session as unknown as Record<string, unknown>,
      timestamp: Date.now(),
      retryCount: 0,
    });
  }
}

// ========================================
// WEEKLY FOCUS OFFLINE STORAGE
// ========================================

/**
 * Cache weekly focus locally
 */
export async function cacheWeeklyFocus(userId: string, focus: WeeklyFocus | null): Promise<void> {
  try {
    const key = `${STORAGE_KEYS.WEEKLY_FOCUS}_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(focus));
  } catch (error) {
    console.error('Failed to cache weekly focus:', error);
  }
}

/**
 * Get cached weekly focus
 */
export async function getCachedWeeklyFocus(userId: string): Promise<WeeklyFocus | null> {
  try {
    const key = `${STORAGE_KEYS.WEEKLY_FOCUS}_${userId}`;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as WeeklyFocus;
    }
  } catch (error) {
    console.error('Failed to get cached weekly focus:', error);
  }
  return null;
}

// ========================================
// SYNC QUEUE MANAGEMENT
// ========================================

/**
 * Add item to sync queue
 */
async function addToSyncQueue(item: SyncQueueItem): Promise<void> {
  try {
    const queue = await getSyncQueue();
    // Remove existing item with same ID if exists
    const filtered = queue.filter((q) => q.id !== item.id);
    filtered.push(item);
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to add to sync queue:', error);
  }
}

/**
 * Get sync queue
 */
async function getSyncQueue(): Promise<SyncQueueItem[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    if (data) {
      return JSON.parse(data) as SyncQueueItem[];
    }
  } catch (error) {
    console.error('Failed to get sync queue:', error);
  }
  return [];
}

/**
 * Remove item from sync queue
 */
async function removeFromSyncQueue(itemId: string): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const filtered = queue.filter((item) => item.id !== itemId);
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove from sync queue:', error);
  }
}

/**
 * Get pending sync count
 */
export async function getPendingSyncCount(): Promise<number> {
  const queue = await getSyncQueue();
  return queue.length;
}

/**
 * Sync pending operations to Firebase
 */
export async function syncPendingOperations(): Promise<{
  synced: number;
  failed: number;
}> {
  if (syncInProgress) {
    return { synced: 0, failed: 0 };
  }

  if (!isOnline) {
    console.log('Device offline, skipping sync');
    return { synced: 0, failed: 0 };
  }

  syncInProgress = true;
  let synced = 0;
  let failed = 0;

  try {
    const queue = await getSyncQueue();

    for (const item of queue) {
      try {
        if (item.operation === 'create') {
          // Create document
          const collectionRef = collection(db, ...item.collection.split('/'));
          await addDoc(collectionRef, {
            ...item.data,
            createdAt: serverTimestamp(),
            _syncedAt: serverTimestamp(),
          });
        } else if (item.operation === 'update') {
          // Update document
          const docRef = doc(db, item.collection);
          await updateDoc(docRef, {
            ...item.data,
            updatedAt: serverTimestamp(),
            _syncedAt: serverTimestamp(),
          });
        }

        await removeFromSyncQueue(item.id);
        synced++;
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
        item.retryCount++;

        if (item.retryCount >= 5) {
          // Max retries reached, remove from queue
          await removeFromSyncQueue(item.id);
          console.error(`Sync item ${item.id} exceeded max retries, removed from queue`);
        }

        failed++;
      }
    }
  } finally {
    syncInProgress = false;
  }

  console.log(`Sync completed: ${synced} synced, ${failed} failed`);
  return { synced, failed };
}

// ========================================
// CACHE MANAGEMENT
// ========================================

/**
 * Update last sync timestamp
 */
async function updateLastSync(userId: string, dataType: string): Promise<void> {
  try {
    const key = `${STORAGE_KEYS.LAST_SYNC}_${userId}_${dataType}`;
    await AsyncStorage.setItem(key, Date.now().toString());
  } catch (error) {
    console.error('Failed to update last sync:', error);
  }
}

/**
 * Get last sync timestamp
 */
export async function getLastSync(userId: string, dataType: string): Promise<number | null> {
  try {
    const key = `${STORAGE_KEYS.LAST_SYNC}_${userId}_${dataType}`;
    const data = await AsyncStorage.getItem(key);
    return data ? parseInt(data, 10) : null;
  } catch (error) {
    console.error('Failed to get last sync:', error);
    return null;
  }
}

/**
 * Check if cache is stale (older than specified minutes)
 */
export async function isCacheStale(
  userId: string,
  dataType: string,
  staleThresholdMinutes = 15
): Promise<boolean> {
  const lastSync = await getLastSync(userId, dataType);
  if (!lastSync) return true;

  const staleThreshold = staleThresholdMinutes * 60 * 1000;
  return Date.now() - lastSync > staleThreshold;
}

/**
 * Clear all cached data for a user
 */
export async function clearUserCache(userId: string): Promise<void> {
  try {
    const keysToRemove = [
      `${STORAGE_KEYS.CHECKINS}_${userId}`,
      `${STORAGE_KEYS.PLANS}_${userId}`,
      `${STORAGE_KEYS.SOS_SESSIONS}_${userId}`,
      `${STORAGE_KEYS.WEEKLY_FOCUS}_${userId}`,
      `${STORAGE_KEYS.LAST_SYNC}_${userId}_checkins`,
      `${STORAGE_KEYS.LAST_SYNC}_${userId}_plans`,
    ];
    await AsyncStorage.multiRemove(keysToRemove);
  } catch (error) {
    console.error('Failed to clear user cache:', error);
  }
}

/**
 * Clear all offline data (for logout)
 */
export async function clearAllOfflineData(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const offlineKeys = allKeys.filter((key) => key.startsWith('offline_'));
    await AsyncStorage.multiRemove(offlineKeys);
  } catch (error) {
    console.error('Failed to clear all offline data:', error);
  }
}

// ========================================
// DATA FRESHNESS & SYNC UTILITIES
// ========================================

/**
 * Perform full sync for a user (fetch all data from Firebase and cache locally)
 */
export async function performFullSync(userId: string): Promise<void> {
  if (!isOnline) {
    console.log('Cannot perform full sync while offline');
    return;
  }

  try {
    // Sync pending operations first
    await syncPendingOperations();

    // Fetch and cache checkins (last 30 days)
    const checkinsRef = collection(db, 'users', userId, 'checkins');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const checkinsQuery = query(
      checkinsRef,
      where('date', '>=', dateStr),
      orderBy('date', 'desc'),
      limit(30)
    );
    const checkinsSnapshot = await getDocs(checkinsQuery);
    const checkins = checkinsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Checkin[];
    await cacheCheckins(userId, checkins);

    // Fetch and cache plans (last 7 days)
    const plansRef = collection(db, 'users', userId, 'plans');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const planDateStr = sevenDaysAgo.toISOString().split('T')[0];

    const plansQuery = query(
      plansRef,
      where('date', '>=', planDateStr),
      orderBy('date', 'desc'),
      limit(7)
    );
    const plansSnapshot = await getDocs(plansQuery);
    const plans = plansSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as DailyPlan[];
    await cachePlans(userId, plans);

    console.log('Full sync completed');
  } catch (error) {
    console.error('Full sync failed:', error);
    throw error;
  }
}

/**
 * Initialize offline storage for a user
 */
export async function initializeOfflineStorage(userId: string): Promise<void> {
  // Store user ID
  await AsyncStorage.setItem(STORAGE_KEYS.CACHED_USER_ID, userId);

  // Initialize network monitoring
  initializeNetworkMonitoring();

  // Perform initial sync if online
  if (isOnline) {
    await performFullSync(userId);
  }
}
