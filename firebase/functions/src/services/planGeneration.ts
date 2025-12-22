/**
 * Plan Generation Service
 * Generates personalized daily action plans based on check-in data
 */

import * as admin from 'firebase-admin';

// Types
interface CheckinData {
  mood: number;
  stress: number;
  sleep: number;
  energy: number;
  focus: number;
  anxiety: number;
}

interface ActionTemplate {
  id: string;
  title: string;
  description: string;
  category: 'coping' | 'lifestyle' | 'connection';
  duration: number;
  targetMetrics: {
    metric: keyof CheckinData;
    condition: 'low' | 'high';
    threshold: number;
  }[];
  focusModules: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface PlannedAction {
  id: string;
  actionId: string;
  title: string;
  description: string;
  category: 'coping' | 'lifestyle' | 'connection';
  duration: number;
  completed: boolean;
  skipped: boolean;
}

const ACTIONS_PER_PLAN = 3;

/**
 * Score how well an action matches the user's current state
 */
function scoreActionMatch(action: ActionTemplate, checkin: CheckinData): number {
  let score = 0;

  for (const target of action.targetMetrics) {
    const value = checkin[target.metric];

    if (target.condition === 'low' && value <= target.threshold) {
      // Action targets low values and user has low value
      score += (target.threshold - value + 1) * 2;
    } else if (target.condition === 'high' && value >= target.threshold) {
      // Action targets high values and user has high value
      score += (value - target.threshold + 1) * 2;
    }
  }

  return score;
}

/**
 * Get user's focus areas from preferences
 */
async function getUserFocusAreas(userId: string): Promise<string[]> {
  const db = admin.firestore();
  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    return [];
  }

  const userData = userDoc.data();
  return userData?.preferences?.focusAreas || [];
}

/**
 * Get recently used actions to avoid repetition
 */
async function getRecentActions(userId: string, daysBack: number = 3): Promise<Set<string>> {
  const db = admin.firestore();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const recentPlans = await db
    .collection('users')
    .doc(userId)
    .collection('plans')
    .where('createdAt', '>', admin.firestore.Timestamp.fromDate(cutoffDate))
    .get();

  const usedActions = new Set<string>();

  recentPlans.forEach((doc) => {
    const planData = doc.data();
    if (planData.actions) {
      planData.actions.forEach((action: PlannedAction) => {
        usedActions.add(action.actionId);
      });
    }
  });

  return usedActions;
}

/**
 * Get all active actions from the library
 */
async function getActionsLibrary(): Promise<ActionTemplate[]> {
  const db = admin.firestore();

  const actionsSnapshot = await db
    .collection('actions_library')
    .where('isActive', '==', true)
    .get();

  return actionsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ActionTemplate[];
}

/**
 * Select actions for a category with smart matching
 */
function selectActionsForCategory(
  actions: ActionTemplate[],
  category: 'coping' | 'lifestyle' | 'connection',
  checkin: CheckinData,
  focusAreas: string[],
  recentlyUsed: Set<string>,
  difficulty: 'easy' | 'medium' | 'hard' = 'easy'
): ActionTemplate | null {
  // Filter to category
  let candidates = actions.filter((a) => a.category === category);

  // Prefer actions matching user's focus areas
  const focusMatched = candidates.filter((a) =>
    a.focusModules.some((fm) => focusAreas.includes(fm))
  );

  if (focusMatched.length > 0) {
    candidates = focusMatched;
  }

  // Filter by difficulty
  const difficultyMatched = candidates.filter((a) => a.difficulty === difficulty);
  if (difficultyMatched.length > 0) {
    candidates = difficultyMatched;
  }

  // Prefer actions not recently used
  const notRecentlyUsed = candidates.filter((a) => !recentlyUsed.has(a.id));
  if (notRecentlyUsed.length > 0) {
    candidates = notRecentlyUsed;
  }

  if (candidates.length === 0) {
    return null;
  }

  // Score remaining candidates
  const scored = candidates.map((action) => ({
    action,
    score: scoreActionMatch(action, checkin),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Add some randomness - pick from top 3
  const topCandidates = scored.slice(0, 3);
  const randomIndex = Math.floor(Math.random() * topCandidates.length);

  return topCandidates[randomIndex].action;
}

/**
 * Determine appropriate difficulty based on user state
 */
function determineDifficulty(checkin: CheckinData): 'easy' | 'medium' | 'hard' {
  const energyLow = checkin.energy <= 4;
  const stressHigh = checkin.stress >= 7;
  const moodLow = checkin.mood <= 4;

  const concerningCount = [energyLow, stressHigh, moodLow].filter(Boolean).length;

  if (concerningCount >= 2) {
    return 'easy';
  } else if (concerningCount === 1) {
    return 'medium';
  }

  return 'hard';
}

/**
 * Generate a personalized daily plan
 */
export async function generateDailyPlan(
  userId: string,
  checkinId: string,
  checkin: CheckinData,
  date: string
): Promise<{ planId: string; actions: PlannedAction[] }> {
  const db = admin.firestore();

  // Get context
  const [focusAreas, recentlyUsed, actionsLibrary] = await Promise.all([
    getUserFocusAreas(userId),
    getRecentActions(userId),
    getActionsLibrary(),
  ]);

  const difficulty = determineDifficulty(checkin);
  const categories: ('coping' | 'lifestyle' | 'connection')[] = ['coping', 'lifestyle', 'connection'];
  const selectedActions: PlannedAction[] = [];

  // Select one action per category
  for (const category of categories) {
    const action = selectActionsForCategory(
      actionsLibrary,
      category,
      checkin,
      focusAreas,
      recentlyUsed,
      difficulty
    );

    if (action) {
      selectedActions.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        actionId: action.id,
        title: action.title,
        description: action.description,
        category: action.category,
        duration: action.duration,
        completed: false,
        skipped: false,
      });
    }
  }

  // Create plan document
  const planRef = await db
    .collection('users')
    .doc(userId)
    .collection('plans')
    .add({
      date,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      checkinId,
      actions: selectedActions,
      completedCount: 0,
      totalCount: selectedActions.length,
    });

  return {
    planId: planRef.id,
    actions: selectedActions,
  };
}

/**
 * Swap an action in a plan
 */
export async function swapAction(
  userId: string,
  planId: string,
  currentActionId: string
): Promise<PlannedAction | null> {
  const db = admin.firestore();

  // Get current plan
  const planRef = db.collection('users').doc(userId).collection('plans').doc(planId);
  const planDoc = await planRef.get();

  if (!planDoc.exists) {
    throw new Error('Plan not found');
  }

  const planData = planDoc.data()!;
  const currentAction = planData.actions.find((a: PlannedAction) => a.id === currentActionId);

  if (!currentAction) {
    throw new Error('Action not found in plan');
  }

  // Get replacement action
  const [focusAreas, recentlyUsed, actionsLibrary] = await Promise.all([
    getUserFocusAreas(userId),
    getRecentActions(userId),
    getActionsLibrary(),
  ]);

  // Add current action to recently used to avoid selecting it again
  recentlyUsed.add(currentAction.actionId);

  // Also add all actions in current plan
  planData.actions.forEach((a: PlannedAction) => {
    recentlyUsed.add(a.actionId);
  });

  // Get user's current check-in for scoring
  const checkinDoc = await db
    .collection('users')
    .doc(userId)
    .collection('checkins')
    .doc(planData.checkinId)
    .get();

  const checkinData = checkinDoc.data() as CheckinData;

  const newAction = selectActionsForCategory(
    actionsLibrary,
    currentAction.category,
    checkinData,
    focusAreas,
    recentlyUsed
  );

  if (!newAction) {
    return null;
  }

  const replacement: PlannedAction = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    actionId: newAction.id,
    title: newAction.title,
    description: newAction.description,
    category: newAction.category,
    duration: newAction.duration,
    completed: false,
    skipped: false,
  };

  // Update plan with new action
  const updatedActions = planData.actions.map((a: PlannedAction) =>
    a.id === currentActionId ? replacement : a
  );

  await planRef.update({ actions: updatedActions });

  return replacement;
}
