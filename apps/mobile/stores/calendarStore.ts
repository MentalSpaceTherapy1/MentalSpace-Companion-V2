/**
 * Calendar Store
 * Manages calendar integration state and actions
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  requestCalendarPermission,
  getEventsForDay,
  getUserCalendars,
  calculateBusyLevel,
  isAvailable,
  type BusyLevel,
  type CalendarEvent,
} from '../services/calendarIntegration';

interface CalendarState {
  // Connection state
  isConnected: boolean;
  isAvailable: boolean;
  selectedCalendarIds: string[];

  // Today's data
  todayEvents: CalendarEvent[];
  busyLevel: BusyLevel;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  checkAvailability: () => Promise<void>;
  connectCalendar: () => Promise<boolean>;
  disconnectCalendar: () => void;
  refreshEvents: () => Promise<void>;
  setSelectedCalendars: (calendarIds: string[]) => Promise<void>;
  getBusyLevelForDate: (date: Date) => Promise<BusyLevel>;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      isConnected: false,
      isAvailable: false,
      selectedCalendarIds: [],
      todayEvents: [],
      busyLevel: 'light',
      isLoading: false,
      error: null,

      /**
       * Check if calendar integration is available on this device
       */
      checkAvailability: async () => {
        const available = await isAvailable();
        set({ isAvailable: available });
      },

      /**
       * Connect to calendar and request permissions
       */
      connectCalendar: async () => {
        set({ isLoading: true, error: null });

        try {
          // Check availability first
          const available = await isAvailable();
          if (!available) {
            set({
              isLoading: false,
              error: 'Calendar integration is not available on this device',
              isAvailable: false,
            });
            return false;
          }

          // Request permissions
          const granted = await requestCalendarPermission();

          if (!granted) {
            set({
              isLoading: false,
              error: 'Calendar permissions not granted',
            });
            return false;
          }

          // Get available calendars
          const calendars = await getUserCalendars();

          if (calendars.length === 0) {
            set({
              isLoading: false,
              error: 'No calendars found',
            });
            return false;
          }

          // Select all calendars by default
          const calendarIds = calendars.map(cal => cal.id);

          set({
            isConnected: true,
            isAvailable: true,
            selectedCalendarIds: calendarIds,
            isLoading: false,
            error: null,
          });

          // Refresh events
          await get().refreshEvents();

          return true;
        } catch (error) {
          console.error('Failed to connect calendar:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to connect calendar',
          });
          return false;
        }
      },

      /**
       * Disconnect calendar integration
       */
      disconnectCalendar: () => {
        set({
          isConnected: false,
          selectedCalendarIds: [],
          todayEvents: [],
          busyLevel: 'light',
          error: null,
        });
      },

      /**
       * Refresh today's events
       */
      refreshEvents: async () => {
        const { isConnected, selectedCalendarIds } = get();

        if (!isConnected) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const today = new Date();
          const events = await getEventsForDay(today, selectedCalendarIds);
          const level = calculateBusyLevel(events);

          set({
            todayEvents: events,
            busyLevel: level,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Failed to refresh events:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to refresh events',
          });
        }
      },

      /**
       * Update selected calendars
       */
      setSelectedCalendars: async (calendarIds) => {
        set({ selectedCalendarIds: calendarIds });

        // Refresh events with new calendar selection
        await get().refreshEvents();
      },

      /**
       * Get busy level for a specific date
       */
      getBusyLevelForDate: async (date: Date): Promise<BusyLevel> => {
        const { isConnected, selectedCalendarIds } = get();

        if (!isConnected) {
          return 'light';
        }

        try {
          const events = await getEventsForDay(date, selectedCalendarIds);
          return calculateBusyLevel(events);
        } catch (error) {
          console.error('Failed to get busy level:', error);
          return 'light';
        }
      },
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isConnected: state.isConnected,
        selectedCalendarIds: state.selectedCalendarIds,
      }),
    }
  )
);
