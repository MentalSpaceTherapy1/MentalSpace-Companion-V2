/**
 * Bad Day Mode Utilities
 * Determines when to activate/deactivate lighter support mode
 */

import type { Checkin } from '@mentalspace/shared';
import type { PlannedAction } from '../stores/planStore';

export interface BadDayTrigger {
  type: 'low_mood' | 'sos_used' | 'missed_actions' | 'trigger_date' | 'manual';
  description: string;
  timestamp: string;
}

export interface BadDayModeConfig {
  maxActions: number;
  gentlerMessaging: boolean;
  extraSupportPrompts: boolean;
  simplifiedActionsOnly: boolean;
}

const DEFAULT_BAD_DAY_CONFIG: BadDayModeConfig = {
  maxActions: 1,
  gentlerMessaging: true,
  extraSupportPrompts: true,
  simplifiedActionsOnly: true,
};

/**
 * Check if bad day mode should be activated based on current conditions
 */
export function shouldActivateBadDayMode(
  todayCheckin: Checkin | null,
  sosUsedToday: boolean,
  missedActionsCount: number,
  isTriggerDate: boolean
): { shouldActivate: boolean; triggers: BadDayTrigger[] } {
  const triggers: BadDayTrigger[] = [];

  // Trigger 1: Very low mood (< 2)
  if (todayCheckin && todayCheckin.mood < 2) {
    triggers.push({
      type: 'low_mood',
      description: `Mood rating of ${todayCheckin.mood}`,
      timestamp: new Date().toISOString(),
    });
  }

  // Trigger 2: SOS was used today
  if (sosUsedToday) {
    triggers.push({
      type: 'sos_used',
      description: 'SOS support accessed',
      timestamp: new Date().toISOString(),
    });
  }

  // Trigger 3: 3+ missed actions from plan
  if (missedActionsCount >= 3) {
    triggers.push({
      type: 'missed_actions',
      description: `${missedActionsCount} actions not completed`,
      timestamp: new Date().toISOString(),
    });
  }

  // Trigger 4: User-defined trigger date
  if (isTriggerDate) {
    triggers.push({
      type: 'trigger_date',
      description: 'Difficult date',
      timestamp: new Date().toISOString(),
    });
  }

  return {
    shouldActivate: triggers.length > 0,
    triggers,
  };
}

/**
 * Check if bad day mode should be deactivated
 */
export function shouldDeactivateBadDayMode(
  todayCheckin: Checkin | null,
  badDayModeActivatedDate: string | null
): boolean {
  if (!badDayModeActivatedDate) return false;

  const today = new Date().toISOString().split('T')[0];
  const activatedDate = new Date(badDayModeActivatedDate).toISOString().split('T')[0];

  // Auto-deactivate next day
  if (today !== activatedDate) {
    // But check if there's a new check-in with better mood
    if (todayCheckin && todayCheckin.mood >= 3) {
      return true;
    }
    // Or if it's been more than 1 day, auto-deactivate regardless
    const daysDiff = Math.floor(
      (new Date(today).getTime() - new Date(activatedDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff > 1) {
      return true;
    }
  } else {
    // Same day - only deactivate if mood improved to >= 3
    if (todayCheckin && todayCheckin.mood >= 3) {
      return true;
    }
  }

  return false;
}

/**
 * Get the bad day mode configuration
 */
export function getBadDayModeConfig(): BadDayModeConfig {
  return { ...DEFAULT_BAD_DAY_CONFIG };
}

/**
 * Adjust actions for bad day mode (reduce to 1 simplified action)
 */
export function adjustActionsForBadDayMode(
  originalActions: PlannedAction[],
  config: BadDayModeConfig = DEFAULT_BAD_DAY_CONFIG
): PlannedAction[] {
  if (originalActions.length === 0) return [];

  // Find the simplest action (shortest duration, or already simplified)
  const simplest = originalActions.reduce((prev, curr) => {
    // Prioritize already simplified actions
    if (curr.simplified && !prev.simplified) return curr;
    if (!curr.simplified && prev.simplified) return prev;

    // Then by duration
    return curr.duration < prev.duration ? curr : prev;
  });

  // Return just the one simplest action, limited by config
  return [simplest].slice(0, config.maxActions);
}

/**
 * Get gentler messaging for bad day mode
 */
export function getGentlerMessage(messageType: 'welcome' | 'plan' | 'incomplete' | 'encouragement'): string {
  const messages = {
    welcome: "Today feels hard. That's okay. We're keeping things simple.",
    plan: "Here's one small thing that might help. No pressure.",
    incomplete: "It's okay if you can't do this right now. Tomorrow is a new day.",
    encouragement: "You're doing your best, and that's enough.",
  };

  return messages[messageType] || messages.encouragement;
}

/**
 * Get extra support prompts for bad day mode
 */
export function getSupportPrompts(): string[] {
  return [
    "Would you like to talk to someone from your safety plan?",
    "Remember: This feeling is temporary. You've gotten through hard days before.",
    "Consider reaching out to a friend or using the SOS resources.",
    "Your only job today is to take care of yourself.",
    "It's okay to rest. Recovery is not linear.",
  ];
}

/**
 * Calculate missed actions count from current plan
 */
export function calculateMissedActions(actions: PlannedAction[]): number {
  const now = new Date();
  const currentHour = now.getHours();

  // Count actions that should have been done by now but weren't
  let missedCount = 0;

  actions.forEach((action) => {
    // Skip if completed or skipped
    if (action.completed || action.skipped) return;

    // Determine if this action should have been done by now based on anchor
    let shouldBeDone = false;

    if (action.anchor) {
      const anchor = action.anchor.toLowerCase();

      if (anchor.includes('morning') || anchor.includes('waking') || anchor.includes('breakfast')) {
        shouldBeDone = currentHour >= 12; // Should be done by noon
      } else if (anchor.includes('lunch') || anchor.includes('afternoon')) {
        shouldBeDone = currentHour >= 17; // Should be done by 5 PM
      } else if (anchor.includes('dinner') || anchor.includes('evening') || anchor.includes('bed')) {
        shouldBeDone = currentHour >= 21; // Should be done by 9 PM
      }
    } else {
      // No anchor - assume should be done by end of day
      shouldBeDone = currentHour >= 21;
    }

    if (shouldBeDone) {
      missedCount++;
    }
  });

  return missedCount;
}

/**
 * Format bad day triggers for display
 */
export function formatBadDayTriggers(triggers: BadDayTrigger[]): string {
  if (triggers.length === 0) return '';

  if (triggers.length === 1) {
    return triggers[0].description;
  }

  return triggers.map((t) => t.description).join(', ');
}
