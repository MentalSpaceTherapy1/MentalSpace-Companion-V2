/**
 * Actions Handler
 * Handles completing and managing actions
 */

import type { Firestore } from 'firebase-admin/firestore';

export async function handleCompleteAction(
  db: Firestore,
  userId: string,
  args: unknown
) {
  const actionId = (args as any)?.actionId;

  if (!actionId) {
    return {
      content: [
        {
          type: 'text',
          text: 'Please specify which action you completed.',
        },
      ],
      isError: true,
    };
  }

  const today = new Date().toISOString().split('T')[0];

  // Get today's plan
  const planSnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('plans')
    .where('date', '==', today)
    .limit(1)
    .get();

  if (planSnapshot.empty) {
    return {
      content: [
        {
          type: 'text',
          text: "I couldn't find a plan for today. Have you completed your check-in?",
        },
      ],
      isError: true,
    };
  }

  const planDoc = planSnapshot.docs[0];
  const plan = planDoc.data();
  const actions = plan.actions || [];

  // Find and update the action
  const actionIndex = actions.findIndex((a: any) => a.id === actionId);

  if (actionIndex === -1) {
    return {
      content: [
        {
          type: 'text',
          text: "I couldn't find that action in your plan. Please check the action ID and try again.",
        },
      ],
      isError: true,
    };
  }

  const action = actions[actionIndex];

  if (action.completed) {
    return {
      content: [
        {
          type: 'text',
          text: `You've already completed "${action.title}". Great work! Would you like to work on another action?`,
        },
      ],
    };
  }

  // Mark as completed
  actions[actionIndex] = {
    ...action,
    completed: true,
    completedAt: new Date().toISOString(),
  };

  const completedCount = actions.filter((a: any) => a.completed).length;

  await planDoc.ref.update({
    actions,
    completedCount,
  });

  // Generate encouraging response
  const encouragement = getEncouragement(completedCount, actions.length, action.category);

  return {
    content: [
      {
        type: 'text',
        text: `✅ **"${action.title}"** marked as complete!

${encouragement}

**Progress:** ${completedCount}/${actions.length} actions completed

${completedCount === actions.length ? "🎉 **You've completed all your actions for today! Amazing work!**" : "Keep it up! You're doing great."}`,
      },
    ],
  };
}

function getEncouragement(completed: number, total: number, category: string): string {
  const categoryMessages: Record<string, string[]> = {
    coping: [
      "Taking care of your mental health is a sign of strength.",
      "You're building healthy coping skills.",
      "Great job prioritizing your wellbeing!",
    ],
    lifestyle: [
      "Small lifestyle changes add up to big results.",
      "You're investing in your health!",
      "Every healthy choice matters.",
    ],
    connection: [
      "Human connection is so important for mental health.",
      "Reaching out takes courage. Well done!",
      "Staying connected is a form of self-care.",
    ],
  };

  const messages = categoryMessages[category] || [
    "Great job!",
    "You're making progress!",
    "Keep up the good work!",
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  if (completed === 1) {
    return `${randomMessage} You've taken the first step today!`;
  } else if (completed === total) {
    return `${randomMessage} You've completed everything!`;
  } else {
    return `${randomMessage} You're on a roll!`;
  }
}
