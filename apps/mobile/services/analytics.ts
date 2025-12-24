/**
 * Analytics & Crashlytics Service
 * Production-ready Firebase Analytics and error tracking for MentalSpace Companion
 *
 * Features:
 * - Screen tracking
 * - Event tracking for key user actions
 * - User properties management
 * - Error logging for non-fatal errors
 * - Performance tracing for API calls
 * - Graceful degradation when analytics is unavailable (Expo Go, web, etc.)
 * - Type-safe event tracking
 *
 * Since this is Expo, we use Firebase compat library for analytics.
 * For native builds, Firebase Analytics will work automatically.
 * For Expo Go and web, events are logged to console.
 */

import { Platform } from 'react-native';
import { firebase } from './firebase';

// ============================================================================
// Types
// ============================================================================

export type AnalyticsEventName =
  | 'check_in_completed'
  | 'action_completed'
  | 'sos_triggered'
  | 'therapist_booked'
  | 'streak_milestone'
  | 'weekly_focus_set'
  | 'journal_entry_created'
  | 'screen_view'
  | 'crisis_detected'
  | 'crisis_handled'
  | 'safety_plan_created'
  | 'safety_plan_accessed'
  | 'telehealth_session_started'
  | 'voice_note_recorded'
  | 'goal_completed'
  | 'sleep_logged'
  | 'insights_viewed'
  | 'crisis_resource_accessed';

export interface CheckInCompletedParams {
  mood_score: number;
  stress_level: number;
  sleep_hours: number;
  energy_level: number;
  crisis_detected?: boolean;
}

export interface ActionCompletedParams {
  action_id: string;
  action_title: string;
  action_category: 'coping' | 'lifestyle' | 'connection' | 'therapist-homework';
  duration_minutes?: number;
  is_simplified?: boolean;
}

export interface SOSTriggeredParams {
  protocol_type: 'overwhelm' | 'panic' | 'anger' | 'cant_sleep' | 'struggling';
  crisis_level?: 'low' | 'medium' | 'high';
  resource_accessed?: string;
}

export interface TherapistBookedParams {
  provider?: string;
  session_type?: 'initial' | 'follow_up';
  scheduled_date?: string;
}

export interface StreakMilestoneParams {
  streak_days: number;
  is_longest_streak: boolean;
  total_checkins: number;
}

export interface WeeklyFocusSetParams {
  focus_area: string;
  num_goals: number;
}

export interface JournalEntryCreatedParams {
  word_count: number;
  has_voice_note: boolean;
  mood_score?: number;
  tags?: string[];
}

export interface ScreenViewParams {
  screen_name: string;
  screen_class?: string;
}

export interface PerformanceTraceParams {
  trace_name: string;
  duration_ms: number;
  success: boolean;
  error_message?: string;
}

export type AnalyticsEventParams =
  | CheckInCompletedParams
  | ActionCompletedParams
  | SOSTriggeredParams
  | TherapistBookedParams
  | StreakMilestoneParams
  | WeeklyFocusSetParams
  | JournalEntryCreatedParams
  | ScreenViewParams
  | PerformanceTraceParams
  | Record<string, any>;

export interface UserProperties {
  user_id?: string;
  user_type?: 'free' | 'premium';
  onboarding_completed?: boolean;
  has_therapist?: boolean;
  crisis_protocol_enabled?: boolean;
  primary_concern?: string;
  checkin_frequency?: 'daily' | 'weekly' | 'occasional';
}

// ============================================================================
// Analytics Service
// ============================================================================

class AnalyticsService {
  private isAvailable: boolean = false;
  private isInitialized: boolean = false;
  private analytics: firebase.analytics.Analytics | null = null;
  private performanceTraces: Map<string, number> = new Map();

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Firebase Analytics
   * Only available in native builds with Firebase SDK
   */
  private initialize() {
    try {
      // Check if we're in a native environment with Firebase Analytics
      if (Platform.OS !== 'web' && firebase.analytics) {
        this.analytics = firebase.analytics();
        this.isAvailable = true;
        this.isInitialized = true;
        console.log('[Analytics] Firebase Analytics initialized');
      } else {
        console.log('[Analytics] Running in development mode - events will be logged to console');
        this.isAvailable = false;
        this.isInitialized = true;
      }
    } catch (error) {
      console.warn('[Analytics] Firebase Analytics not available:', error);
      this.isAvailable = false;
      this.isInitialized = true;
    }
  }

  /**
   * Wait for analytics to be initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.isInitialized) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });
  }

  /**
   * Track a screen view
   * @param screenName - Name of the screen
   * @param screenClass - Optional screen class/component name
   */
  async trackScreen(screenName: string, screenClass?: string): Promise<void> {
    await this.ensureInitialized();

    const params: ScreenViewParams = {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    };

    if (this.isAvailable && this.analytics) {
      try {
        await (this.analytics.logEvent as any)('screen_view', params);
      } catch (error) {
        console.error('[Analytics] Error tracking screen:', error);
      }
    } else {
      console.log('[Analytics] Screen View:', screenName, params);
    }
  }

  /**
   * Track a custom event
   * @param eventName - Name of the event
   * @param params - Event parameters
   */
  async trackEvent(
    eventName: AnalyticsEventName,
    params?: AnalyticsEventParams
  ): Promise<void> {
    await this.ensureInitialized();

    // Sanitize parameters to meet Firebase requirements
    const sanitizedParams = this.sanitizeParams(params || {});

    if (this.isAvailable && this.analytics) {
      try {
        await (this.analytics.logEvent as any)(eventName, sanitizedParams);
      } catch (error) {
        console.error('[Analytics] Error tracking event:', error);
      }
    } else {
      console.log(`[Analytics] Event: ${eventName}`, sanitizedParams);
    }
  }

  /**
   * Set user properties
   * @param properties - User properties to set
   */
  async setUserProperties(properties: UserProperties): Promise<void> {
    await this.ensureInitialized();

    if (this.isAvailable && this.analytics) {
      try {
        // Set each property individually using the compat API
        for (const [key, value] of Object.entries(properties)) {
          if (value !== undefined && value !== null) {
            await (this.analytics as any).setUserProperties({ [key]: String(value) });
          }
        }
      } catch (error) {
        console.error('[Analytics] Error setting user properties:', error);
      }
    } else {
      console.log('[Analytics] User Properties:', properties);
    }
  }

  /**
   * Set user ID for analytics
   * @param userId - User ID to set
   */
  async setUserId(userId: string | null): Promise<void> {
    await this.ensureInitialized();

    if (this.isAvailable && this.analytics) {
      try {
        if (userId) {
          await this.analytics.setUserId(userId);
        } else {
          // Clear user ID by setting empty string (Firebase compat workaround)
          await (this.analytics.setUserId as any)(null as any);
        }
      } catch (error) {
        console.error('[Analytics] Error setting user ID:', error);
      }
    } else {
      console.log('[Analytics] User ID:', userId);
    }
  }

  /**
   * Log a non-fatal error
   * In production, this would integrate with Crashlytics
   * @param error - Error object or message
   * @param context - Additional context
   */
  async logError(error: Error | string, context?: Record<string, any>): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log to console
    console.error('[Analytics] Error:', errorMessage, context);

    // In a production environment with Crashlytics, you would do:
    // crashlytics().recordError(error);
    // crashlytics().log(JSON.stringify(context));

    // For now, track as analytics event
    await this.trackEvent('app_error' as AnalyticsEventName, {
      error_message: errorMessage,
      error_stack: errorStack,
      ...context,
    });
  }

  /**
   * Start a performance trace for API calls
   * @param traceName - Name of the trace
   */
  startTrace(traceName: string): void {
    this.performanceTraces.set(traceName, Date.now());
  }

  /**
   * Stop a performance trace and log the duration
   * @param traceName - Name of the trace
   * @param success - Whether the operation succeeded
   * @param errorMessage - Optional error message if failed
   */
  async stopTrace(
    traceName: string,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    const startTime = this.performanceTraces.get(traceName);

    if (!startTime) {
      console.warn(`[Analytics] Trace "${traceName}" was not started`);
      return;
    }

    const duration = Date.now() - startTime;
    this.performanceTraces.delete(traceName);

    // Log performance metric
    const params: PerformanceTraceParams = {
      trace_name: traceName,
      duration_ms: duration,
      success,
      error_message: errorMessage,
    };

    await this.trackEvent('performance_trace' as AnalyticsEventName, params);

    if (__DEV__) {
      console.log(`[Analytics] Performance: ${traceName} took ${duration}ms`);
    }
  }

  /**
   * Sanitize event parameters to meet Firebase requirements
   * - Convert arrays to comma-separated strings
   * - Ensure all values are strings, numbers, or booleans
   * - Remove undefined/null values
   */
  private sanitizeParams(params: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        continue;
      }

      // Convert arrays to comma-separated strings
      if (Array.isArray(value)) {
        sanitized[key] = value.join(',');
      }
      // Convert objects to JSON strings
      else if (typeof value === 'object') {
        sanitized[key] = JSON.stringify(value);
      }
      // Keep primitives as-is
      else if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        sanitized[key] = value;
      }
      // Convert everything else to string
      else {
        sanitized[key] = String(value);
      }
    }

    return sanitized;
  }

  /**
   * Reset analytics (useful for logout)
   */
  async reset(): Promise<void> {
    await this.setUserId(null);
    this.performanceTraces.clear();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

const analytics = new AnalyticsService();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Track a screen view
 */
export const trackScreen = (screenName: string, screenClass?: string) => {
  return analytics.trackScreen(screenName, screenClass);
};

/**
 * Track an event
 */
export const trackEvent = (
  eventName: AnalyticsEventName,
  params?: AnalyticsEventParams
) => {
  return analytics.trackEvent(eventName, params);
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: UserProperties) => {
  return analytics.setUserProperties(properties);
};

/**
 * Set user ID
 */
export const setUserId = (userId: string | null) => {
  return analytics.setUserId(userId);
};

/**
 * Log non-fatal error
 */
export const logError = (error: Error | string, context?: Record<string, any>) => {
  return analytics.logError(error, context);
};

/**
 * Start performance trace
 */
export const startTrace = (traceName: string) => {
  return analytics.startTrace(traceName);
};

/**
 * Stop performance trace
 */
export const stopTrace = (
  traceName: string,
  success?: boolean,
  errorMessage?: string
) => {
  return analytics.stopTrace(traceName, success, errorMessage);
};

/**
 * Reset analytics
 */
export const resetAnalytics = () => {
  return analytics.reset();
};

// ============================================================================
// Specialized Event Trackers
// ============================================================================

/**
 * Track check-in completion
 */
export const trackCheckInCompleted = (params: CheckInCompletedParams) => {
  return trackEvent('check_in_completed', params);
};

/**
 * Track action completion
 */
export const trackActionCompleted = (params: ActionCompletedParams) => {
  return trackEvent('action_completed', params);
};

/**
 * Track SOS trigger
 */
export const trackSOSTriggered = (params: SOSTriggeredParams) => {
  return trackEvent('sos_triggered', params);
};

/**
 * Track therapist booking
 */
export const trackTherapistBooked = (params: TherapistBookedParams) => {
  return trackEvent('therapist_booked', params);
};

/**
 * Track streak milestone
 */
export const trackStreakMilestone = (params: StreakMilestoneParams) => {
  return trackEvent('streak_milestone', params);
};

/**
 * Track weekly focus set
 */
export const trackWeeklyFocusSet = (params: WeeklyFocusSetParams) => {
  return trackEvent('weekly_focus_set', params);
};

/**
 * Track journal entry creation
 */
export const trackJournalEntryCreated = (params: JournalEntryCreatedParams) => {
  return trackEvent('journal_entry_created', params);
};

// Export default instance
export default analytics;
