/**
 * Plan Helpers
 * Helper functions for plan generation and adjustment
 */

import type { PlannedAction, DailyPlan } from '../stores/planStore';
import { adjustActionsForBadDayMode, getBadDayModeConfig } from './badDayMode';

/**
 * Apply bad day mode adjustments to a plan if needed
 */
export function applyBadDayModeIfNeeded(
  plan: DailyPlan,
  badDayModeActive: boolean
): DailyPlan {
  if (!badDayModeActive) return plan;

  const config = getBadDayModeConfig();
  const adjustedActions = adjustActionsForBadDayMode(plan.actions, config);

  return {
    ...plan,
    actions: adjustedActions,
    totalCount: adjustedActions.length,
    completedCount: adjustedActions.filter((a) => a.completed).length,
  };
}

/**
 * Generate a lighter plan with reduced actions
 */
export function generateLighterPlan(
  originalActions: PlannedAction[],
  maxActions: number = 1
): PlannedAction[] {
  if (originalActions.length === 0) return [];
  if (originalActions.length <= maxActions) return originalActions;

  // Prioritize: 1) Simplified actions, 2) Shortest duration, 3) Coping category
  const sorted = [...originalActions].sort((a, b) => {
    // Simplified actions first
    if (a.simplified && !b.simplified) return -1;
    if (!a.simplified && b.simplified) return 1;

    // Then by category priority (coping > lifestyle > connection > therapist-homework)
    const categoryPriority: Record<string, number> = { coping: 0, lifestyle: 1, connection: 2, 'therapist-homework': 3 };
    const aPriority = categoryPriority[a.category] ?? 4;
    const bPriority = categoryPriority[b.category] ?? 4;

    if (aPriority !== bPriority) return aPriority - bPriority;

    // Then by duration
    return a.duration - b.duration;
  });

  return sorted.slice(0, maxActions);
}

/**
 * Check if a plan should be simplified based on conditions
 */
export function shouldSimplifyPlan(
  badDayModeActive: boolean,
  calendarBusyLevel?: 'light' | 'moderate' | 'busy' | 'packed',
  recentCompletionRate?: number
): boolean {
  // Always simplify if bad day mode is active
  if (badDayModeActive) return true;

  // Simplify if calendar is packed
  if (calendarBusyLevel === 'packed') return true;

  // Simplify if recent completion rate is low (< 30%)
  if (recentCompletionRate !== undefined && recentCompletionRate < 0.3) return true;

  return false;
}
