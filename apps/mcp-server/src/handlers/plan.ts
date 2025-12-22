/**
 * Plan Handler
 * Retrieves and formats the daily action plan
 */

import type { Firestore } from 'firebase-admin/firestore';

export async function handleGetPlan(
  db: Firestore,
  userId: string,
  args: unknown
) {
  const date = (args as any)?.date || new Date().toISOString().split('T')[0];

  // Get today's plan
  const planSnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('plans')
    .where('date', '==', date)
    .limit(1)
    .get();

  if (planSnapshot.empty) {
    // Check if there's a check-in for today
    const checkinSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('checkins')
      .where('date', '==', date)
      .limit(1)
      .get();

    if (checkinSnapshot.empty) {
      return {
        content: [
          {
            type: 'text',
            text: `You haven't checked in yet today. Would you like to do your daily check-in first? This helps me create a personalized plan for you.`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Your plan is being generated. Please try again in a moment.`,
        },
      ],
    };
  }

  const plan = planSnapshot.docs[0].data();
  const actions = plan.actions || [];
  const completedCount = actions.filter((a: any) => a.completed).length;

  // Format the plan
  let response = `**Your Action Plan for Today**\n\nProgress: ${completedCount}/${actions.length} completed\n\n`;

  const categoryEmoji: Record<string, string> = {
    coping: '🧘',
    lifestyle: '🌿',
    connection: '💬',
  };

  const categoryLabels: Record<string, string> = {
    coping: 'Coping Strategy',
    lifestyle: 'Lifestyle Action',
    connection: 'Social Connection',
  };

  for (const action of actions) {
    const emoji = categoryEmoji[action.category] || '✨';
    const label = categoryLabels[action.category] || action.category;
    const status = action.completed ? '✅' : action.skipped ? '⏭️' : '⬜';

    response += `${status} **${emoji} ${label}**\n`;
    response += `**${action.title}** (${action.duration} min)\n`;
    response += `${action.description}\n`;
    if (!action.completed && !action.skipped) {
      response += `*Action ID: ${action.id}*\n`;
    }
    response += '\n';
  }

  if (completedCount === actions.length) {
    response += `🎉 **Amazing!** You've completed all your actions today!`;
  } else {
    response += `Ready to complete an action? Just tell me when you're done!`;
  }

  return {
    content: [
      {
        type: 'text',
        text: response,
      },
    ],
  };
}

export async function handleSwapAction(
  db: Firestore,
  userId: string,
  args: unknown
) {
  const { actionId, reason } = args as { actionId: string; reason?: string };
  const date = new Date().toISOString().split('T')[0];

  // Get today's plan
  const planSnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('plans')
    .where('date', '==', date)
    .limit(1)
    .get();

  if (planSnapshot.empty) {
    return {
      content: [
        {
          type: 'text',
          text: 'No plan found for today. Please check in first to generate your plan.',
        },
      ],
    };
  }

  const planDoc = planSnapshot.docs[0];
  const plan = planDoc.data();
  const actions = plan.actions || [];

  // Find the action to swap
  const actionIndex = actions.findIndex((a: any) => a.id === actionId);
  if (actionIndex === -1) {
    return {
      content: [
        {
          type: 'text',
          text: `Action not found. Please check the action ID and try again.`,
        },
      ],
    };
  }

  const originalAction = actions[actionIndex];
  const category = originalAction.category;

  // Simple swap - mark as skipped and add a placeholder for alternative
  actions[actionIndex] = {
    ...originalAction,
    skipped: true,
    skippedReason: reason || 'User requested swap',
    skippedAt: new Date(),
  };

  await planDoc.ref.update({ actions });

  return {
    content: [
      {
        type: 'text',
        text: `**Action Swapped** 🔄

"${originalAction.title}" has been skipped.
${reason ? `*Reason: ${reason}*` : ''}

**Alternative suggestion for ${category}:**
Try a similar activity that feels more accessible right now. For example:
- A shorter version of the same activity
- A different activity in the same category
- Something you enjoy that serves the same purpose

Would you like me to suggest a specific alternative?`,
      },
    ],
  };
}
