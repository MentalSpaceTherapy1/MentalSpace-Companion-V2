/**
 * Check-in Store
 * Zustand store for check-in state management
 */

import { create } from 'zustand';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from './authStore';
import type { Checkin, CheckinMetrics } from '@mentalspace/shared';
import { getTodayString, getDateDaysAgo } from '@mentalspace/shared';

interface CheckinState {
  // State
  todayCheckin: Checkin | null;
  recentCheckins: Checkin[];
  isLoading: boolean;
  error: string | null;

  // Draft state for in-progress check-in
  draft: Partial<CheckinMetrics> & { journalEntry?: string };

  // Actions
  fetchTodayCheckin: () => Promise<void>;
  fetchRecentCheckins: (days?: number) => Promise<void>;
  createCheckin: (data: CheckinMetrics & { journalEntry?: string; crisisDetected?: boolean; crisisHandled?: boolean }) => Promise<Checkin>;
  updateDraft: (updates: Partial<CheckinState['draft']>) => void;
  clearDraft: () => void;
  refresh: () => Promise<void>;
}

const initialDraft: CheckinState['draft'] = {
  mood: undefined,
  stress: undefined,
  sleep: undefined,
  energy: undefined,
  focus: undefined,
  anxiety: undefined,
  journalEntry: '',
};

export const useCheckinStore = create<CheckinState>((set, get) => ({
  // Initial state
  todayCheckin: null,
  recentCheckins: [],
  isLoading: false,
  error: null,
  draft: { ...initialDraft },

  // Fetch today's check-in
  fetchTodayCheckin: async () => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      const today = getTodayString();
      const checkinsRef = collection(db, 'users', userId, 'checkins');
      const q = query(checkinsRef, where('date', '==', today), limit(1));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        set({
          todayCheckin: { id: doc.id, ...doc.data() } as Checkin,
          isLoading: false,
        });
      } else {
        set({ todayCheckin: null, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch recent check-ins
  fetchRecentCheckins: async (days = 7) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      const startDate = getDateDaysAgo(days);
      const checkinsRef = collection(db, 'users', userId, 'checkins');
      const q = query(
        checkinsRef,
        where('date', '>=', startDate),
        orderBy('date', 'desc'),
        limit(days)
      );
      const snapshot = await getDocs(q);

      const checkins = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Checkin[];

      set({ recentCheckins: checkins, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Create new check-in
  createCheckin: async (data) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) throw new Error('Not authenticated');

    set({ isLoading: true, error: null });

    try {
      const today = getTodayString();
      const checkinsRef = collection(db, 'users', userId, 'checkins');

      const checkinData = {
        ...data,
        date: today,
        createdAt: serverTimestamp(),
        crisisDetected: data.crisisDetected ?? false,
        crisisHandled: data.crisisHandled ?? false,
      };

      const docRef = await addDoc(checkinsRef, checkinData);

      const newCheckin: Checkin = {
        id: docRef.id,
        userId,
        ...data,
        date: today,
        createdAt: new Date(),
        crisisDetected: data.crisisDetected ?? false,
        crisisHandled: data.crisisHandled ?? false,
      };

      set({
        todayCheckin: newCheckin,
        isLoading: false,
        draft: { ...initialDraft },
      });

      return newCheckin;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Update draft
  updateDraft: (updates) => {
    set((state) => ({
      draft: { ...state.draft, ...updates },
    }));
  },

  // Clear draft
  clearDraft: () => {
    set({ draft: { ...initialDraft } });
  },

  // Refresh all data
  refresh: async () => {
    await Promise.all([
      get().fetchTodayCheckin(),
      get().fetchRecentCheckins(),
    ]);
  },
}));
