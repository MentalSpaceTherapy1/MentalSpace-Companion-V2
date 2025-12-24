/**
 * Content Store
 * Zustand store for content library, viewing history, favorites, and recommendations
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContentItem, contentLibrary } from '../data/contentLibrary';
import {
  getRecommendations,
  getForYouToday,
  RecommendedContent,
  UserState,
} from '../utils/contentRecommendation';
import { useCheckinStore } from './checkinStore';

interface ViewHistoryItem {
  contentId: string;
  viewedAt: string;
  completed: boolean;
  progress?: number; // For tracking reading/listening progress
}

interface ContentState {
  // Content library (static)
  content: ContentItem[];

  // User interactions
  viewHistory: ViewHistoryItem[];
  favorites: string[];

  // Current viewing state
  currentContent: ContentItem | null;
  readingProgress: Record<string, number>; // contentId -> percentage

  // Actions
  markAsViewed: (contentId: string, completed?: boolean) => void;
  toggleFavorite: (contentId: string) => void;
  updateProgress: (contentId: string, progress: number) => void;
  setCurrentContent: (content: ContentItem | null) => void;
  clearHistory: () => void;

  // Recommendation getters
  getRecommendations: (limit?: number) => RecommendedContent[];
  getForYouToday: () => RecommendedContent[];
  getViewedContent: () => ContentItem[];
  getFavoriteContent: () => ContentItem[];
  hasViewed: (contentId: string) => boolean;
  isFavorite: (contentId: string) => boolean;
  getProgress: (contentId: string) => number;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      // Initial state
      content: contentLibrary,
      viewHistory: [],
      favorites: [],
      currentContent: null,
      readingProgress: {},

      // Mark content as viewed
      markAsViewed: (contentId: string, completed: boolean = true) => {
        const { viewHistory } = get();

        // Check if already in history
        const existingIndex = viewHistory.findIndex(
          (item) => item.contentId === contentId
        );

        if (existingIndex !== -1) {
          // Update existing entry
          const updated = [...viewHistory];
          updated[existingIndex] = {
            ...updated[existingIndex],
            viewedAt: new Date().toISOString(),
            completed,
          };

          // Move to front of history
          const [item] = updated.splice(existingIndex, 1);
          updated.unshift(item);

          set({ viewHistory: updated });
        } else {
          // Add new entry at the front
          set({
            viewHistory: [
              {
                contentId,
                viewedAt: new Date().toISOString(),
                completed,
              },
              ...viewHistory,
            ],
          });
        }
      },

      // Toggle favorite status
      toggleFavorite: (contentId: string) => {
        const { favorites } = get();

        if (favorites.includes(contentId)) {
          set({
            favorites: favorites.filter((id) => id !== contentId),
          });
        } else {
          set({
            favorites: [...favorites, contentId],
          });
        }
      },

      // Update reading/listening progress
      updateProgress: (contentId: string, progress: number) => {
        const { readingProgress } = get();

        set({
          readingProgress: {
            ...readingProgress,
            [contentId]: Math.min(100, Math.max(0, progress)),
          },
        });

        // If progress >= 90%, mark as viewed and completed
        if (progress >= 90) {
          get().markAsViewed(contentId, true);
        }
      },

      // Set current content being viewed
      setCurrentContent: (content: ContentItem | null) => {
        set({ currentContent: content });
      },

      // Clear all viewing history
      clearHistory: () => {
        set({
          viewHistory: [],
          readingProgress: {},
        });
      },

      // Get personalized recommendations
      getRecommendations: (limit: number = 6) => {
        const { viewHistory, favorites } = get();
        const checkinStore = useCheckinStore.getState();

        const userState: UserState = {
          recentCheckin: checkinStore.todayCheckin || undefined,
          viewHistory: viewHistory.map((item) => item.contentId),
          favorites,
          // weeklyFocus could be added from a weekly focus store
        };

        return getRecommendations(userState, limit);
      },

      // Get "For You Today" recommendations
      getForYouToday: () => {
        const { viewHistory, favorites } = get();
        const checkinStore = useCheckinStore.getState();

        const userState: UserState = {
          recentCheckin: checkinStore.todayCheckin || undefined,
          viewHistory: viewHistory.map((item) => item.contentId),
          favorites,
        };

        return getForYouToday(userState);
      },

      // Get viewed content sorted by recency
      getViewedContent: () => {
        const { viewHistory, content } = get();

        return viewHistory
          .map((item) => content.find((c) => c.id === item.contentId))
          .filter((item): item is ContentItem => item !== undefined);
      },

      // Get favorite content
      getFavoriteContent: () => {
        const { favorites, content } = get();

        return favorites
          .map((id) => content.find((c) => c.id === id))
          .filter((item): item is ContentItem => item !== undefined);
      },

      // Check if content has been viewed
      hasViewed: (contentId: string) => {
        const { viewHistory } = get();
        return viewHistory.some((item) => item.contentId === contentId);
      },

      // Check if content is favorited
      isFavorite: (contentId: string) => {
        const { favorites } = get();
        return favorites.includes(contentId);
      },

      // Get reading progress for content
      getProgress: (contentId: string) => {
        const { readingProgress } = get();
        return readingProgress[contentId] || 0;
      },
    }),
    {
      name: 'content-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user data, not the full content library
      partialize: (state) => ({
        viewHistory: state.viewHistory,
        favorites: state.favorites,
        readingProgress: state.readingProgress,
      }),
    }
  )
);

// Export helper function to get content by ID
export const getContentById = (id: string): ContentItem | undefined => {
  return contentLibrary.find((item) => item.id === id);
};

// Export helper to format duration
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Export helper to get content type icon
export const getContentTypeIcon = (type: ContentItem['type']): string => {
  const icons = {
    article: 'document-text',
    audio: 'headset',
    video: 'videocam',
  };
  return icons[type] || 'document';
};

// Export helper to get category color
export const getCategoryColor = (category: ContentItem['category']): string => {
  const colors = {
    stress: '#8B5CF6', // Purple
    sleep: '#6366F1', // Indigo
    anxiety: '#EC4899', // Pink
    energy: '#F59E0B', // Amber
    focus: '#10B981', // Green
    mindfulness: '#14B8A6', // Teal
    connection: '#F97316', // Orange
    coping: '#8B5CF6', // Purple
  };
  return colors[category] || '#6B7280';
};
