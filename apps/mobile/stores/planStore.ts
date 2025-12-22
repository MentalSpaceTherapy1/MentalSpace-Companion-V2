/**
 * Plan Store with Adherence Engine
 * Tracks action completion patterns and provides smart suggestions
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ActionCategory = 'coping' | 'lifestyle' | 'connection';

export interface PlannedAction {
  id: string;
  title: string;
  description: string;
  category: ActionCategory;
  duration: number;
  completed: boolean;
  skipped: boolean;
  anchor?: string; // e.g., "After breakfast", "Before bed"
  simplified?: boolean; // Is this a simplified version
}

export interface DailyPlan {
  id: string;
  date: string;
  actions: PlannedAction[];
  completedCount: number;
  totalCount: number;
}

interface ActionStats {
  timesAssigned: number;
  timesCompleted: number;
  timesSkipped: number;
  averageDuration: number;
  lastCompleted?: string;
}

interface CategoryStats {
  totalAssigned: number;
  totalCompleted: number;
  totalSkipped: number;
  consecutiveSkips: number;
  needsSimplification: boolean;
}

interface HabitAnchor {
  id: string;
  label: string;
  time: 'morning' | 'afternoon' | 'evening';
  description: string;
}

interface AdherenceInsight {
  type: 'simplify' | 'anchor' | 'encourage' | 'pattern';
  category?: ActionCategory;
  message: string;
  actionId?: string;
  suggestedAnchor?: HabitAnchor;
}

interface PlanState {
  // Current plan
  currentPlan: DailyPlan | null;

  // Historical tracking
  actionStats: Record<string, ActionStats>;
  categoryStats: Record<ActionCategory, CategoryStats>;

  // Adherence engine
  adherenceInsights: AdherenceInsight[];
  showAdherenceHint: boolean;

  // Habit anchors
  availableAnchors: HabitAnchor[];
  selectedAnchors: Record<string, string>; // actionId -> anchorId

  // Actions
  setPlan: (plan: DailyPlan) => void;
  completeAction: (actionId: string) => void;
  skipAction: (actionId: string) => void;
  swapAction: (actionId: string, newAction: PlannedAction) => void;
  setAnchor: (actionId: string, anchorId: string) => void;

  // Adherence engine
  checkAdherence: () => void;
  dismissInsight: (index: number) => void;
  getSimplifiedAction: (category: ActionCategory) => PlannedAction | null;
  getSuggestedAnchor: (actionId: string) => HabitAnchor | null;
}

// Simplified actions for each category (shorter, easier versions)
const simplifiedActions: Record<ActionCategory, PlannedAction[]> = {
  coping: [
    {
      id: 'simple-coping-1',
      title: 'One Deep Breath',
      description: 'Take just one slow, deep breath. Inhale for 4 counts, exhale for 4 counts.',
      category: 'coping',
      duration: 1,
      completed: false,
      skipped: false,
      simplified: true,
    },
    {
      id: 'simple-coping-2',
      title: 'Name 3 Things You See',
      description: 'Look around and name 3 things you can see right now. Simple grounding.',
      category: 'coping',
      duration: 1,
      completed: false,
      skipped: false,
      simplified: true,
    },
    {
      id: 'simple-coping-3',
      title: 'Shoulder Shrug',
      description: 'Raise your shoulders to your ears, hold for 3 seconds, then release. Repeat twice.',
      category: 'coping',
      duration: 1,
      completed: false,
      skipped: false,
      simplified: true,
    },
  ],
  lifestyle: [
    {
      id: 'simple-lifestyle-1',
      title: 'Drink Some Water',
      description: 'Take a few sips of water right now.',
      category: 'lifestyle',
      duration: 1,
      completed: false,
      skipped: false,
      simplified: true,
    },
    {
      id: 'simple-lifestyle-2',
      title: 'Stand and Stretch',
      description: 'Just stand up from where you are and stretch your arms overhead once.',
      category: 'lifestyle',
      duration: 1,
      completed: false,
      skipped: false,
      simplified: true,
    },
    {
      id: 'simple-lifestyle-3',
      title: 'Look Outside',
      description: 'Look out a window for 30 seconds. Notice what you see.',
      category: 'lifestyle',
      duration: 1,
      completed: false,
      skipped: false,
      simplified: true,
    },
  ],
  connection: [
    {
      id: 'simple-connection-1',
      title: 'Send an Emoji',
      description: 'Send a simple emoji to someone you care about. Just one is enough.',
      category: 'connection',
      duration: 1,
      completed: false,
      skipped: false,
      simplified: true,
    },
    {
      id: 'simple-connection-2',
      title: 'Like a Post',
      description: 'Find one post from a friend or family member and like/react to it.',
      category: 'connection',
      duration: 1,
      completed: false,
      skipped: false,
      simplified: true,
    },
    {
      id: 'simple-connection-3',
      title: 'Think of Someone',
      description: 'Think of one person you appreciate. Visualize their face for 10 seconds.',
      category: 'connection',
      duration: 1,
      completed: false,
      skipped: false,
      simplified: true,
    },
  ],
};

// Common habit anchors
const defaultAnchors: HabitAnchor[] = [
  { id: 'anchor-1', label: 'After waking up', time: 'morning', description: 'Right after you get out of bed' },
  { id: 'anchor-2', label: 'After brushing teeth', time: 'morning', description: 'Part of your morning routine' },
  { id: 'anchor-3', label: 'After breakfast', time: 'morning', description: 'When you finish eating' },
  { id: 'anchor-4', label: 'After lunch', time: 'afternoon', description: 'A natural midday break' },
  { id: 'anchor-5', label: 'After work/school', time: 'afternoon', description: 'When your main tasks are done' },
  { id: 'anchor-6', label: 'After dinner', time: 'evening', description: 'End of the day routine' },
  { id: 'anchor-7', label: 'Before bed', time: 'evening', description: 'Wind down for the night' },
  { id: 'anchor-8', label: 'During commute', time: 'morning', description: 'While traveling to work/school' },
];

const SKIP_THRESHOLD = 2; // Consecutive skips before suggesting simplification

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      currentPlan: null,
      actionStats: {},
      categoryStats: {
        coping: { totalAssigned: 0, totalCompleted: 0, totalSkipped: 0, consecutiveSkips: 0, needsSimplification: false },
        lifestyle: { totalAssigned: 0, totalCompleted: 0, totalSkipped: 0, consecutiveSkips: 0, needsSimplification: false },
        connection: { totalAssigned: 0, totalCompleted: 0, totalSkipped: 0, consecutiveSkips: 0, needsSimplification: false },
      },
      adherenceInsights: [],
      showAdherenceHint: true,
      availableAnchors: defaultAnchors,
      selectedAnchors: {},

      setPlan: (plan) => {
        set({ currentPlan: plan });

        // Update category stats for new assignments
        const { categoryStats } = get();
        const updatedStats = { ...categoryStats };

        plan.actions.forEach((action) => {
          updatedStats[action.category] = {
            ...updatedStats[action.category],
            totalAssigned: updatedStats[action.category].totalAssigned + 1,
          };
        });

        set({ categoryStats: updatedStats });
      },

      completeAction: (actionId) => {
        const { currentPlan, categoryStats, actionStats } = get();
        if (!currentPlan) return;

        const action = currentPlan.actions.find((a) => a.id === actionId);
        if (!action) return;

        // Update plan
        const updatedActions = currentPlan.actions.map((a) =>
          a.id === actionId ? { ...a, completed: !a.completed } : a
        );

        const completedCount = updatedActions.filter((a) => a.completed).length;

        set({
          currentPlan: {
            ...currentPlan,
            actions: updatedActions,
            completedCount,
          },
        });

        // Update category stats - reset consecutive skips on completion
        const updatedCategoryStats = {
          ...categoryStats,
          [action.category]: {
            ...categoryStats[action.category],
            totalCompleted: categoryStats[action.category].totalCompleted + (action.completed ? -1 : 1),
            consecutiveSkips: 0, // Reset on completion
            needsSimplification: false,
          },
        };

        // Update action stats
        const updatedActionStats = {
          ...actionStats,
          [action.title]: {
            ...actionStats[action.title],
            timesCompleted: (actionStats[action.title]?.timesCompleted || 0) + (action.completed ? -1 : 1),
            lastCompleted: action.completed ? undefined : new Date().toISOString(),
          },
        };

        set({ categoryStats: updatedCategoryStats, actionStats: updatedActionStats });
        get().checkAdherence();
      },

      skipAction: (actionId) => {
        const { currentPlan, categoryStats, actionStats } = get();
        if (!currentPlan) return;

        const action = currentPlan.actions.find((a) => a.id === actionId);
        if (!action) return;

        // Update plan
        const updatedActions = currentPlan.actions.map((a) =>
          a.id === actionId ? { ...a, skipped: true } : a
        );

        set({
          currentPlan: {
            ...currentPlan,
            actions: updatedActions,
          },
        });

        // Update category stats - increment consecutive skips
        const newConsecutiveSkips = categoryStats[action.category].consecutiveSkips + 1;
        const needsSimplification = newConsecutiveSkips >= SKIP_THRESHOLD;

        const updatedCategoryStats = {
          ...categoryStats,
          [action.category]: {
            ...categoryStats[action.category],
            totalSkipped: categoryStats[action.category].totalSkipped + 1,
            consecutiveSkips: newConsecutiveSkips,
            needsSimplification,
          },
        };

        // Update action stats
        const updatedActionStats = {
          ...actionStats,
          [action.title]: {
            ...actionStats[action.title],
            timesSkipped: (actionStats[action.title]?.timesSkipped || 0) + 1,
          },
        };

        set({ categoryStats: updatedCategoryStats, actionStats: updatedActionStats });
        get().checkAdherence();
      },

      swapAction: (actionId, newAction) => {
        const { currentPlan } = get();
        if (!currentPlan) return;

        const updatedActions = currentPlan.actions.map((a) =>
          a.id === actionId ? { ...newAction, id: `swapped-${Date.now()}` } : a
        );

        set({
          currentPlan: {
            ...currentPlan,
            actions: updatedActions,
          },
        });
      },

      setAnchor: (actionId, anchorId) => {
        const { selectedAnchors, currentPlan, availableAnchors } = get();

        set({
          selectedAnchors: {
            ...selectedAnchors,
            [actionId]: anchorId,
          },
        });

        // Update the action with the anchor
        if (currentPlan) {
          const anchor = availableAnchors.find((a) => a.id === anchorId);
          if (anchor) {
            const updatedActions = currentPlan.actions.map((a) =>
              a.id === actionId ? { ...a, anchor: anchor.label } : a
            );
            set({
              currentPlan: {
                ...currentPlan,
                actions: updatedActions,
              },
            });
          }
        }
      },

      checkAdherence: () => {
        const { categoryStats, currentPlan } = get();
        const insights: AdherenceInsight[] = [];

        // Check each category for simplification needs
        (Object.keys(categoryStats) as ActionCategory[]).forEach((category) => {
          const stats = categoryStats[category];

          if (stats.needsSimplification) {
            insights.push({
              type: 'simplify',
              category,
              message: `We noticed you've been skipping ${category} actions. Would you like to try a simpler version?`,
            });
          }
        });

        // Check for unanchored actions
        if (currentPlan) {
          const unanchoredActions = currentPlan.actions.filter(
            (a) => !a.anchor && !a.completed && !a.skipped
          );

          if (unanchoredActions.length > 0) {
            const action = unanchoredActions[0];
            insights.push({
              type: 'anchor',
              actionId: action.id,
              message: `Tip: Link "${action.title}" to a daily routine for better follow-through.`,
            });
          }
        }

        // Check for positive patterns
        const allCategories = Object.keys(categoryStats) as ActionCategory[];
        const goodCategories = allCategories.filter(
          (cat) => categoryStats[cat].consecutiveSkips === 0 && categoryStats[cat].totalCompleted > 3
        );

        if (goodCategories.length > 0) {
          insights.push({
            type: 'encourage',
            category: goodCategories[0],
            message: `Great job with your ${goodCategories[0]} actions! You're building a strong habit.`,
          });
        }

        set({ adherenceInsights: insights });
      },

      dismissInsight: (index) => {
        const { adherenceInsights } = get();
        set({
          adherenceInsights: adherenceInsights.filter((_, i) => i !== index),
        });
      },

      getSimplifiedAction: (category) => {
        const { currentPlan } = get();
        const simplified = simplifiedActions[category];

        if (!simplified || simplified.length === 0) return null;

        // Find one not already in the plan
        const existingTitles = currentPlan?.actions.map((a) => a.title) || [];
        const available = simplified.filter((s) => !existingTitles.includes(s.title));

        if (available.length === 0) return simplified[0];
        return available[Math.floor(Math.random() * available.length)];
      },

      getSuggestedAnchor: (actionId) => {
        const { currentPlan, availableAnchors, selectedAnchors } = get();
        if (!currentPlan) return null;

        const action = currentPlan.actions.find((a) => a.id === actionId);
        if (!action) return null;

        // Find unused anchors
        const usedAnchorIds = Object.values(selectedAnchors);
        const unusedAnchors = availableAnchors.filter((a) => !usedAnchorIds.includes(a.id));

        // Suggest based on action category
        if (action.category === 'coping') {
          // Morning anchors work well for coping
          const morningAnchor = unusedAnchors.find((a) => a.time === 'morning');
          if (morningAnchor) return morningAnchor;
        } else if (action.category === 'lifestyle') {
          // Afternoon anchors for lifestyle
          const afternoonAnchor = unusedAnchors.find((a) => a.time === 'afternoon');
          if (afternoonAnchor) return afternoonAnchor;
        } else if (action.category === 'connection') {
          // Evening anchors for connection
          const eveningAnchor = unusedAnchors.find((a) => a.time === 'evening');
          if (eveningAnchor) return eveningAnchor;
        }

        // Return first unused anchor as fallback
        return unusedAnchors[0] || null;
      },
    }),
    {
      name: 'plan-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        actionStats: state.actionStats,
        categoryStats: state.categoryStats,
        selectedAnchors: state.selectedAnchors,
      }),
    }
  )
);
