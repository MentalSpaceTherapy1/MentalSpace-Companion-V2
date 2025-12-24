/**
 * Calendar Integration Service
 * Handles calendar access, event fetching, and busy level calculation
 */

import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export type BusyLevel = 'light' | 'moderate' | 'busy' | 'packed';

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string;
  notes?: string;
}

/**
 * Check if calendar access is available on this device
 */
export async function isAvailable(): Promise<boolean> {
  // Calendar API not available on web
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    // Try to get calendar permissions status to verify availability
    await Calendar.getCalendarPermissionsAsync();
    return true;
  } catch (error) {
    console.warn('Calendar API not available:', error);
    return false;
  }
}

/**
 * Request calendar permissions
 */
export async function requestCalendarPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const { status: existingStatus } = await Calendar.getCalendarPermissionsAsync();

    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to request calendar permissions:', error);
    return false;
  }
}

/**
 * Get the user's calendars
 */
export async function getUserCalendars(): Promise<Calendar.Calendar[]> {
  if (Platform.OS === 'web') {
    return [];
  }

  try {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    if (status !== 'granted') {
      return [];
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    return calendars;
  } catch (error) {
    console.error('Failed to get calendars:', error);
    return [];
  }
}

/**
 * Get events for a specific day
 */
export async function getEventsForDay(
  date: Date,
  calendarIds?: string[]
): Promise<CalendarEvent[]> {
  if (Platform.OS === 'web') {
    return [];
  }

  try {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    if (status !== 'granted') {
      return [];
    }

    // Start of day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    // End of day
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Get all calendars if none specified
    let targetCalendarIds = calendarIds;
    if (!targetCalendarIds || targetCalendarIds.length === 0) {
      const calendars = await getUserCalendars();
      targetCalendarIds = calendars.map(cal => cal.id);
    }

    if (targetCalendarIds.length === 0) {
      return [];
    }

    const events = await Calendar.getEventsAsync(
      targetCalendarIds,
      startDate,
      endDate
    );

    return events.map(event => ({
      id: event.id,
      title: event.title,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      allDay: event.allDay ?? false,
      location: event.location ?? undefined,
      notes: event.notes,
    }));
  } catch (error) {
    console.error('Failed to get events for day:', error);
    return [];
  }
}

/**
 * Get events for the week starting from a given date
 */
export async function getEventsForWeek(
  startDate: Date,
  calendarIds?: string[]
): Promise<CalendarEvent[]> {
  if (Platform.OS === 'web') {
    return [];
  }

  try {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    if (status !== 'granted') {
      return [];
    }

    // Start of start date
    const weekStart = new Date(startDate);
    weekStart.setHours(0, 0, 0, 0);

    // End of 7 days later
    const weekEnd = new Date(startDate);
    weekEnd.setDate(weekEnd.getDate() + 7);
    weekEnd.setHours(23, 59, 59, 999);

    // Get all calendars if none specified
    let targetCalendarIds = calendarIds;
    if (!targetCalendarIds || targetCalendarIds.length === 0) {
      const calendars = await getUserCalendars();
      targetCalendarIds = calendars.map(cal => cal.id);
    }

    if (targetCalendarIds.length === 0) {
      return [];
    }

    const events = await Calendar.getEventsAsync(
      targetCalendarIds,
      weekStart,
      weekEnd
    );

    return events.map(event => ({
      id: event.id,
      title: event.title,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      allDay: event.allDay ?? false,
      location: event.location ?? undefined,
      notes: event.notes,
    }));
  } catch (error) {
    console.error('Failed to get events for week:', error);
    return [];
  }
}

/**
 * Calculate busy level based on calendar events
 *
 * Algorithm:
 * - Filters out all-day events (they don't block time the same way)
 * - Calculates total meeting hours
 * - Counts number of meetings
 * - Determines level based on both metrics
 *
 * Levels:
 * - light: 0-2 hours or 0-2 meetings
 * - moderate: 2-4 hours or 3-4 meetings
 * - busy: 4-6 hours or 5-6 meetings
 * - packed: 6+ hours or 7+ meetings
 */
export function calculateBusyLevel(events: CalendarEvent[]): BusyLevel {
  if (!events || events.length === 0) {
    return 'light';
  }

  // Filter out all-day events
  const timedEvents = events.filter(event => !event.allDay);

  if (timedEvents.length === 0) {
    return 'light';
  }

  // Calculate total hours in meetings
  const totalMinutes = timedEvents.reduce((total, event) => {
    const duration = event.endDate.getTime() - event.startDate.getTime();
    return total + (duration / (1000 * 60)); // Convert to minutes
  }, 0);

  const totalHours = totalMinutes / 60;
  const meetingCount = timedEvents.length;

  // Determine busy level based on both hours and count
  if (totalHours >= 6 || meetingCount >= 7) {
    return 'packed';
  } else if (totalHours >= 4 || meetingCount >= 5) {
    return 'busy';
  } else if (totalHours >= 2 || meetingCount >= 3) {
    return 'moderate';
  } else {
    return 'light';
  }
}

/**
 * Get busy level label and color
 */
export function getBusyLevelInfo(level: BusyLevel): {
  label: string;
  description: string;
  color: string;
  emoji: string;
} {
  switch (level) {
    case 'light':
      return {
        label: 'Light Day',
        description: 'You have plenty of time for self-care',
        color: '#4CAF50',
        emoji: '🌤️',
      };
    case 'moderate':
      return {
        label: 'Moderate Day',
        description: 'A balanced day ahead',
        color: '#2196F3',
        emoji: '☀️',
      };
    case 'busy':
      return {
        label: 'Busy Day',
        description: "You've got a lot on your plate",
        color: '#FF9800',
        emoji: '⚡',
      };
    case 'packed':
      return {
        label: 'Packed Day',
        description: 'A very full schedule today',
        color: '#F44336',
        emoji: '🔥',
      };
  }
}

/**
 * Check if tomorrow has a busy schedule
 * Used for heads-up notifications
 */
export async function isTomorrowBusy(calendarIds?: string[]): Promise<{
  isBusy: boolean;
  level: BusyLevel;
  eventCount: number;
}> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const events = await getEventsForDay(tomorrow, calendarIds);
  const level = calculateBusyLevel(events);
  const timedEvents = events.filter(e => !e.allDay);

  return {
    isBusy: level === 'busy' || level === 'packed',
    level,
    eventCount: timedEvents.length,
  };
}
