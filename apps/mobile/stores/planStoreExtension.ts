/**
 * Plan Store Extension for Therapist Homework
 * Adds therapist homework integration to the plan store
 */

import { PlannedAction } from './planStore';
import { useSessionStore } from './sessionStore';

export interface TherapistHomeworkAction extends PlannedAction {
  therapistAssigned: true;
  sessionId: string;
  homeworkIndex: number;
}

/**
 * Convert therapist homework to planned actions
 */
export function convertHomeworkToActions(sessionId: string): TherapistHomeworkAction[] {
  const session = useSessionStore.getState().getSessionById(sessionId);

  if (!session?.reflection?.homework) {
    return [];
  }

  return session.reflection.homework.map((homework, index) => ({
    id: `homework-${sessionId}-${index}`,
    title: homework,
    description: `Homework from ${session.therapistName}`,
    category: 'therapist-homework' as const,
    duration: 15, // Default 15 minutes
    completed: session.homeworkCompleted?.[index] || false,
    skipped: false,
    therapistAssigned: true,
    sessionId,
    homeworkIndex: index,
  }));
}

/**
 * Get all active therapist homework as planned actions
 */
export function getAllTherapistHomework(): TherapistHomeworkAction[] {
  const sessions = useSessionStore.getState().getPastSessions();

  const homeworkActions: TherapistHomeworkAction[] = [];

  for (const session of sessions) {
    if (!session.reflection?.homework) continue;

    // Only include homework that isn't fully completed
    const hasIncompleteHomework = session.homeworkCompleted?.some((completed) => !completed) ?? true;

    if (hasIncompleteHomework) {
      homeworkActions.push(...convertHomeworkToActions(session.id));
    }
  }

  return homeworkActions;
}

/**
 * Sync homework completion from plan store to session store
 */
export function syncHomeworkCompletion(
  sessionId: string,
  homeworkIndex: number,
  completed: boolean
): void {
  useSessionStore.getState().updateHomeworkStatus(sessionId, homeworkIndex, completed);
}

/**
 * Check if an action is therapist homework
 */
export function isTherapistHomework(action: PlannedAction): action is TherapistHomeworkAction {
  return 'therapistAssigned' in action && action.therapistAssigned === true;
}
