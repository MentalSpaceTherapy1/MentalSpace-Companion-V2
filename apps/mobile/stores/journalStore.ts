/**
 * Journal Store
 * Zustand store for journal entries with voice note support
 *
 * Supports:
 * - Text journal entries
 * - Voice note recordings
 * - Mood tagging
 * - Offline-first with Firebase sync
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from './authStore';
import { isDeviceOnline } from '../services/offlineStorage';

// Types
export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;

  // Content
  title?: string;
  content: string;

  // Voice note
  voiceNoteUri?: string;
  voiceNoteDuration?: number; // in seconds
  transcription?: string;

  // Mood and context
  moodScore?: number; // 1-10
  moodEmoji?: string;
  tags: string[];

  // Related check-in
  checkinId?: string;

  // Metadata
  wordCount: number;
  isPrivate: boolean;
  isFavorite: boolean;
}

export interface JournalPrompt {
  id: string;
  text: string;
  category: 'gratitude' | 'reflection' | 'goals' | 'emotions' | 'general';
}

interface JournalState {
  // State
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  isLoading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;

  // Actions
  loadEntries: (limit?: number) => Promise<void>;
  loadEntry: (entryId: string) => Promise<void>;
  createEntry: (entry: Partial<JournalEntry>) => Promise<JournalEntry>;
  updateEntry: (entryId: string, updates: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;

  // Draft management
  setCurrentEntry: (entry: Partial<JournalEntry> | null) => void;
  saveDraft: () => Promise<void>;
  clearDraft: () => void;

  // Voice note actions
  setVoiceNote: (uri: string, duration: number) => void;
  setTranscription: (text: string) => void;
  removeVoiceNote: () => void;

  // Mood and tags
  setMood: (score: number, emoji?: string) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;

  // Favorites
  toggleFavorite: (entryId: string) => Promise<void>;

  // Stats
  getEntriesForDateRange: (startDate: string, endDate: string) => JournalEntry[];
  getWordCountStats: () => { total: number; average: number; longest: number };

  // Reset
  reset: () => void;
}

const STORAGE_KEY = 'mentalspace_journal_entries';
const DRAFT_KEY = 'mentalspace_journal_draft';

// Default journal prompts
export const JOURNAL_PROMPTS: JournalPrompt[] = [
  { id: '1', text: 'What are you grateful for today?', category: 'gratitude' },
  { id: '2', text: 'What challenged you today and how did you handle it?', category: 'reflection' },
  { id: '3', text: 'What is one thing you want to accomplish tomorrow?', category: 'goals' },
  { id: '4', text: 'How are you really feeling right now?', category: 'emotions' },
  { id: '5', text: 'What made you smile today?', category: 'gratitude' },
  { id: '6', text: 'What would you tell your past self about today?', category: 'reflection' },
  { id: '7', text: 'What is weighing on your mind?', category: 'emotions' },
  { id: '8', text: 'Describe a moment of peace you experienced today.', category: 'general' },
  { id: '9', text: 'What are you looking forward to?', category: 'goals' },
  { id: '10', text: 'What did you learn about yourself today?', category: 'reflection' },
];

const createEmptyEntry = (): Partial<JournalEntry> => ({
  date: new Date().toISOString().split('T')[0],
  content: '',
  tags: [],
  wordCount: 0,
  isPrivate: false,
  isFavorite: false,
});

export const useJournalStore = create<JournalState>((set, get) => ({
  // Initial state
  entries: [],
  currentEntry: null,
  isLoading: false,
  error: null,
  hasUnsavedChanges: false,

  // Load entries
  loadEntries: async (limit = 50) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      // Load from local storage first
      const cached = await AsyncStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (cached) {
        const parsedEntries = JSON.parse(cached) as JournalEntry[];
        set({ entries: parsedEntries });
      }

      // If online, sync with Firebase
      if (isDeviceOnline()) {
        const entriesRef = collection(db, 'users', userId, 'journal');
        const q = query(
          entriesRef,
          orderBy('createdAt', 'desc'),
        );
        const snapshot = await getDocs(q);

        const entries: JournalEntry[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          entries.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as JournalEntry);
        });

        set({ entries });

        // Update local cache
        await AsyncStorage.setItem(
          `${STORAGE_KEY}_${userId}`,
          JSON.stringify(entries)
        );
      }

      set({ isLoading: false });
    } catch (error: any) {
      console.error('Error loading journal entries:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Load single entry
  loadEntry: async (entryId: string) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      // Check local entries first
      const { entries } = get();
      const localEntry = entries.find((e) => e.id === entryId);
      if (localEntry) {
        set({ currentEntry: localEntry, isLoading: false });
        return;
      }

      // Fetch from Firebase if online
      if (isDeviceOnline()) {
        const docRef = doc(db, 'users', userId, 'journal', entryId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const entry: JournalEntry = {
            ...data,
            id: docSnap.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as JournalEntry;

          set({ currentEntry: entry, isLoading: false });
        }
      }

      set({ isLoading: false });
    } catch (error: any) {
      console.error('Error loading journal entry:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Create entry
  createEntry: async (entry: Partial<JournalEntry>) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) throw new Error('Not authenticated');

    set({ isLoading: true, error: null });

    try {
      const now = new Date();
      const newEntry: JournalEntry = {
        id: `journal-${Date.now()}`,
        date: entry.date || now.toISOString().split('T')[0],
        createdAt: now,
        updatedAt: now,
        content: entry.content || '',
        title: entry.title,
        voiceNoteUri: entry.voiceNoteUri,
        voiceNoteDuration: entry.voiceNoteDuration,
        transcription: entry.transcription,
        moodScore: entry.moodScore,
        moodEmoji: entry.moodEmoji,
        tags: entry.tags || [],
        checkinId: entry.checkinId,
        wordCount: entry.content?.split(/\s+/).filter(Boolean).length || 0,
        isPrivate: entry.isPrivate ?? false,
        isFavorite: entry.isFavorite ?? false,
      };

      // Save locally first
      const { entries } = get();
      const updatedEntries = [newEntry, ...entries];
      set({ entries: updatedEntries, currentEntry: newEntry });

      await AsyncStorage.setItem(
        `${STORAGE_KEY}_${userId}`,
        JSON.stringify(updatedEntries)
      );

      // Sync to Firebase if online
      if (isDeviceOnline()) {
        const docRef = doc(db, 'users', userId, 'journal', newEntry.id);
        await setDoc(docRef, {
          ...newEntry,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Clear draft
      await AsyncStorage.removeItem(`${DRAFT_KEY}_${userId}`);

      set({ isLoading: false, hasUnsavedChanges: false });
      return newEntry;
    } catch (error: any) {
      console.error('Error creating journal entry:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Update entry
  updateEntry: async (entryId: string, updates: Partial<JournalEntry>) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      const { entries } = get();
      const entryIndex = entries.findIndex((e) => e.id === entryId);
      if (entryIndex === -1) throw new Error('Entry not found');

      const updatedEntry: JournalEntry = {
        ...entries[entryIndex],
        ...updates,
        updatedAt: new Date(),
        wordCount: updates.content?.split(/\s+/).filter(Boolean).length || entries[entryIndex].wordCount,
      };

      const updatedEntries = [...entries];
      updatedEntries[entryIndex] = updatedEntry;

      set({ entries: updatedEntries, currentEntry: updatedEntry });

      await AsyncStorage.setItem(
        `${STORAGE_KEY}_${userId}`,
        JSON.stringify(updatedEntries)
      );

      // Sync to Firebase if online
      if (isDeviceOnline()) {
        const docRef = doc(db, 'users', userId, 'journal', entryId);
        await setDoc(docRef, {
          ...updatedEntry,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      set({ isLoading: false, hasUnsavedChanges: false });
    } catch (error: any) {
      console.error('Error updating journal entry:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Delete entry
  deleteEntry: async (entryId: string) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      const { entries } = get();
      const updatedEntries = entries.filter((e) => e.id !== entryId);

      set({ entries: updatedEntries, currentEntry: null });

      await AsyncStorage.setItem(
        `${STORAGE_KEY}_${userId}`,
        JSON.stringify(updatedEntries)
      );

      // Delete from Firebase if online
      if (isDeviceOnline()) {
        const docRef = doc(db, 'users', userId, 'journal', entryId);
        await deleteDoc(docRef);
      }

      set({ isLoading: false });
    } catch (error: any) {
      console.error('Error deleting journal entry:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Draft management
  setCurrentEntry: (entry: Partial<JournalEntry> | null) => {
    if (entry === null) {
      set({ currentEntry: null, hasUnsavedChanges: false });
    } else {
      const fullEntry: JournalEntry = {
        id: entry.id || '',
        date: entry.date || new Date().toISOString().split('T')[0],
        createdAt: entry.createdAt || new Date(),
        updatedAt: new Date(),
        content: entry.content || '',
        title: entry.title,
        voiceNoteUri: entry.voiceNoteUri,
        voiceNoteDuration: entry.voiceNoteDuration,
        transcription: entry.transcription,
        moodScore: entry.moodScore,
        moodEmoji: entry.moodEmoji,
        tags: entry.tags || [],
        checkinId: entry.checkinId,
        wordCount: entry.content?.split(/\s+/).filter(Boolean).length || 0,
        isPrivate: entry.isPrivate ?? false,
        isFavorite: entry.isFavorite ?? false,
      };
      set({ currentEntry: fullEntry, hasUnsavedChanges: true });
    }
  },

  saveDraft: async () => {
    const userId = useAuthStore.getState().user?.uid;
    const { currentEntry } = get();
    if (!userId || !currentEntry) return;

    await AsyncStorage.setItem(
      `${DRAFT_KEY}_${userId}`,
      JSON.stringify(currentEntry)
    );
  },

  clearDraft: async () => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    await AsyncStorage.removeItem(`${DRAFT_KEY}_${userId}`);
    set({ hasUnsavedChanges: false });
  },

  // Voice note actions
  setVoiceNote: (uri: string, duration: number) => {
    const { currentEntry } = get();
    if (!currentEntry) return;

    set({
      currentEntry: {
        ...currentEntry,
        voiceNoteUri: uri,
        voiceNoteDuration: duration,
      },
      hasUnsavedChanges: true,
    });
  },

  setTranscription: (text: string) => {
    const { currentEntry } = get();
    if (!currentEntry) return;

    set({
      currentEntry: {
        ...currentEntry,
        transcription: text,
        content: currentEntry.content
          ? `${currentEntry.content}\n\n[Voice Note Transcription]\n${text}`
          : text,
      },
      hasUnsavedChanges: true,
    });
  },

  removeVoiceNote: () => {
    const { currentEntry } = get();
    if (!currentEntry) return;

    set({
      currentEntry: {
        ...currentEntry,
        voiceNoteUri: undefined,
        voiceNoteDuration: undefined,
        transcription: undefined,
      },
      hasUnsavedChanges: true,
    });
  },

  // Mood and tags
  setMood: (score: number, emoji?: string) => {
    const { currentEntry } = get();
    if (!currentEntry) return;

    set({
      currentEntry: {
        ...currentEntry,
        moodScore: score,
        moodEmoji: emoji,
      },
      hasUnsavedChanges: true,
    });
  },

  addTag: (tag: string) => {
    const { currentEntry } = get();
    if (!currentEntry || currentEntry.tags.includes(tag)) return;

    set({
      currentEntry: {
        ...currentEntry,
        tags: [...currentEntry.tags, tag],
      },
      hasUnsavedChanges: true,
    });
  },

  removeTag: (tag: string) => {
    const { currentEntry } = get();
    if (!currentEntry) return;

    set({
      currentEntry: {
        ...currentEntry,
        tags: currentEntry.tags.filter((t) => t !== tag),
      },
      hasUnsavedChanges: true,
    });
  },

  // Favorites
  toggleFavorite: async (entryId: string) => {
    const { entries } = get();
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    await get().updateEntry(entryId, { isFavorite: !entry.isFavorite });
  },

  // Stats
  getEntriesForDateRange: (startDate: string, endDate: string) => {
    const { entries } = get();
    return entries.filter((e) => e.date >= startDate && e.date <= endDate);
  },

  getWordCountStats: () => {
    const { entries } = get();
    if (entries.length === 0) {
      return { total: 0, average: 0, longest: 0 };
    }

    const wordCounts = entries.map((e) => e.wordCount);
    const total = wordCounts.reduce((sum, count) => sum + count, 0);
    const average = Math.round(total / entries.length);
    const longest = Math.max(...wordCounts);

    return { total, average, longest };
  },

  // Reset
  reset: () => {
    set({
      entries: [],
      currentEntry: null,
      isLoading: false,
      error: null,
      hasUnsavedChanges: false,
    });
  },
}));

// Helper function to get a random prompt
export const getRandomPrompt = (category?: JournalPrompt['category']): JournalPrompt => {
  const prompts = category
    ? JOURNAL_PROMPTS.filter((p) => p.category === category)
    : JOURNAL_PROMPTS;

  return prompts[Math.floor(Math.random() * prompts.length)];
};

// Mood emoji mapping
export const MOOD_EMOJIS: Record<number, string> = {
  1: '\ud83d\ude2d', // Crying face
  2: '\ud83d\ude1e', // Disappointed face
  3: '\ud83d\ude14', // Pensive face
  4: '\ud83d\ude15', // Confused face
  5: '\ud83d\ude10', // Neutral face
  6: '\ud83d\ude42', // Slightly smiling face
  7: '\ud83d\ude0a', // Smiling face with smiling eyes
  8: '\ud83d\ude04', // Grinning face
  9: '\ud83d\ude01', // Beaming face
  10: '\ud83e\udd29', // Star-struck
};
