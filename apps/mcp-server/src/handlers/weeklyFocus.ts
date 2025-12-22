/**
 * Weekly Focus Handlers
 * Manages weekly focus and daily micro-goals
 */

import type { Firestore } from 'firebase-admin/firestore';

const WEEKLY_FOCUS_LABELS: Record<string, { title: string; description: string }> = {
  stress_relief: {
    title: 'Stress Relief',
    description: 'Learning to release tension and find calm',
  },
  sleep_hygiene: {
    title: 'Sleep Hygiene',
    description: 'Building better sleep habits and routines',
  },
  mindfulness: {
    title: 'Mindfulness',
    description: 'Practicing present-moment awareness',
  },
  physical_wellness: {
    title: 'Physical Wellness',
    description: 'Moving your body and honoring physical health',
  },
  social_connection: {
    title: 'Social Connection',
    description: 'Nurturing relationships and community',
  },
  emotional_processing: {
    title: 'Emotional Processing',
    description: 'Understanding and working through feelings',
  },
  self_compassion: {
    title: 'Self-Compassion',
    description: 'Treating yourself with kindness and understanding',
  },
  productivity: {
    title: 'Productivity',
    description: 'Building focus and achieving goals mindfully',
  },
  creativity: {
    title: 'Creativity',
    description: 'Expressing yourself and exploring new ideas',
  },
  gratitude: {
    title: 'Gratitude',
    description: 'Recognizing and appreciating the good in life',
  },
};

const MICRO_GOALS: Record<string, string[]> = {
  stress_relief: [
    'Take three 2-minute breathing breaks throughout the day',
    'Do a 10-minute body scan meditation',
    'Write down 3 things causing stress and one action for each',
    'Take a 15-minute walk without your phone',
    'Practice progressive muscle relaxation before bed',
    'Spend 20 minutes on a hobby you enjoy',
    'Reflect on stress patterns and identify one boundary to set',
  ],
  sleep_hygiene: [
    'Set a consistent bedtime alarm for tonight',
    'Avoid screens for 30 minutes before bed',
    'Create a brief bedtime ritual (stretch, read, tea)',
    'Keep your bedroom cool and dark tonight',
    'Write tomorrow\'s to-do list before bed to clear your mind',
    'Limit caffeine after 2 PM today',
    'Practice 4-7-8 breathing before falling asleep',
  ],
  mindfulness: [
    'Practice 5 minutes of focused breathing',
    'Eat one meal mindfully, without screens',
    'Take a 10-minute mindful walk, noticing your surroundings',
    'Do a body scan meditation for 5 minutes',
    'Practice mindful listening in one conversation',
    'Spend 5 minutes observing your thoughts without judgment',
    'End the day with 3 minutes of gratitude reflection',
  ],
  physical_wellness: [
    'Take a 15-minute walk today',
    'Stretch for 5 minutes when you wake up',
    'Drink 8 glasses of water throughout the day',
    'Do 10 minutes of light exercise or yoga',
    'Take the stairs instead of the elevator today',
    'Stand up and move for 2 minutes every hour',
    'Go to bed 30 minutes earlier than usual',
  ],
  social_connection: [
    'Text a friend you haven\'t talked to in a while',
    'Have a 10-minute phone call with someone you care about',
    'Express appreciation to someone in your life',
    'Share something about your day with someone',
    'Ask someone how they\'re really doing and listen',
    'Make plans to see a friend this week or next',
    'Reflect on the relationships that matter most to you',
  ],
  emotional_processing: [
    'Journal about how you\'re feeling for 10 minutes',
    'Name and acknowledge 3 emotions you felt today',
    'Practice saying "I feel..." statements out loud',
    'Sit with an uncomfortable emotion for 2 minutes without fixing it',
    'Write a letter to yourself about a current challenge',
    'Identify one emotion you\'ve been avoiding and explore it',
    'Practice self-compassion for a difficult feeling',
  ],
  self_compassion: [
    'Write 3 kind things about yourself',
    'Speak to yourself like you would a good friend',
    'Forgive yourself for one mistake from the past',
    'Take a break when you need one without guilt',
    'Celebrate one small win from today',
    'Practice self-compassion meditation for 5 minutes',
    'Write a letter of encouragement to yourself',
  ],
  productivity: [
    'Identify your top 3 priorities for the day',
    'Work in one 25-minute focused block (Pomodoro)',
    'Complete one task you\'ve been putting off',
    'Clear and organize your workspace for 10 minutes',
    'Set a specific goal for tomorrow before you finish today',
    'Review what you accomplished and celebrate progress',
    'Identify and eliminate one distraction source',
  ],
  creativity: [
    'Spend 15 minutes on a creative activity',
    'Try something new, no matter how small',
    'Doodle or sketch for 5 minutes without judgment',
    'Listen to a new genre of music',
    'Write freely for 10 minutes about anything',
    'Take a photo of something beautiful you notice',
    'Create something, anything, just for fun',
  ],
  gratitude: [
    'Write down 3 things you\'re grateful for',
    'Tell someone why you appreciate them',
    'Notice 5 simple pleasures throughout the day',
    'Take a photo of something that makes you grateful',
    'Write a thank you note (even if you don\'t send it)',
    'Reflect on a challenge that taught you something',
    'End the day listing 3 good things that happened',
  ],
};

export async function handleSetWeeklyFocus(
  db: Firestore,
  userId: string,
  args: { focusArea: string; intention?: string }
) {
  const focusConfig = WEEKLY_FOCUS_LABELS[args.focusArea];

  if (!focusConfig) {
    return {
      content: [
        {
          type: 'text',
          text: 'Unknown focus area. Please choose from: stress_relief, sleep_hygiene, mindfulness, physical_wellness, social_connection, emotional_processing, self_compassion, productivity, creativity, gratitude',
        },
      ],
      isError: true,
    };
  }

  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const microGoals = MICRO_GOALS[args.focusArea] || [];

  // Save weekly focus
  const focusDoc = await db.collection('users').doc(userId).collection('weekly_focus').add({
    focusArea: args.focusArea,
    intention: args.intention || `Focus on ${focusConfig.title.toLowerCase()} this week`,
    weekStart: monday.toISOString().split('T')[0],
    weekEnd: sunday.toISOString().split('T')[0],
    selectedAt: new Date(),
    dailyMicroGoals: microGoals.map((goal, index) => ({
      day: index,
      goal,
      completed: false,
      completedAt: null,
      reflection: null,
    })),
    completed: false,
    completionRate: 0,
  });

  const todayIndex = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);

  return {
    content: [
      {
        type: 'text',
        text: `**Weekly Focus Set: ${focusConfig.title}** 🎯

${focusConfig.description}

${args.intention ? `**Your Intention:** "${args.intention}"` : ''}

---

**Your Daily Micro-Goals This Week:**

${microGoals.map((goal, i) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const isToday = i === todayIndex;
  return `${isToday ? '▶️' : '○'} **${days[i]}:** ${goal}`;
}).join('\n')}

---

**Today's Goal:**
${microGoals[todayIndex]}

I'll check in with you about this goal later. You've got this!`,
      },
    ],
  };
}

export async function handleGetWeeklyFocus(db: Firestore, userId: string) {
  // Get current week's focus
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const weekStart = monday.toISOString().split('T')[0];

  const focusQuery = await db
    .collection('users')
    .doc(userId)
    .collection('weekly_focus')
    .where('weekStart', '==', weekStart)
    .limit(1)
    .get();

  if (focusQuery.empty) {
    return {
      content: [
        {
          type: 'text',
          text: `**No Weekly Focus Set**

You haven't set a focus for this week yet. Would you like to choose one?

Available focus areas:
• **Stress Relief** - Learning to release tension and find calm
• **Sleep Hygiene** - Building better sleep habits
• **Mindfulness** - Present-moment awareness
• **Physical Wellness** - Moving your body and honoring health
• **Social Connection** - Nurturing relationships
• **Emotional Processing** - Understanding your feelings
• **Self-Compassion** - Treating yourself with kindness
• **Productivity** - Building focus mindfully
• **Creativity** - Expressing yourself
• **Gratitude** - Appreciating the good in life

Just tell me which focus resonates with you, or ask me to recommend one based on how you've been feeling!`,
        },
      ],
    };
  }

  const focus = focusQuery.docs[0].data();
  const focusConfig = WEEKLY_FOCUS_LABELS[focus.focusArea];
  const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const todayGoal = focus.dailyMicroGoals[todayIndex];

  const completedCount = focus.dailyMicroGoals.filter((g: any) => g.completed).length;
  const progressPercent = Math.round((completedCount / 7) * 100);

  return {
    content: [
      {
        type: 'text',
        text: `**This Week's Focus: ${focusConfig.title}** 🎯

${focus.intention ? `*"${focus.intention}"*` : ''}

**Progress:** ${completedCount}/7 days (${progressPercent}%)
${'█'.repeat(Math.floor(progressPercent / 10))}${'░'.repeat(10 - Math.floor(progressPercent / 10))}

---

**Today's Micro-Goal:**
${todayGoal.completed ? '✅' : '○'} ${todayGoal.goal}

${todayGoal.completed ? '**Great job completing today\'s goal!**' : 'Have you had a chance to work on this today?'}

---

**Week Overview:**
${focus.dailyMicroGoals.map((g: any, i: number) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const isToday = i === todayIndex;
  return `${g.completed ? '✅' : isToday ? '▶️' : '○'} ${days[i]}: ${g.goal.substring(0, 40)}...`;
}).join('\n')}`,
      },
    ],
  };
}

export async function handleCompleteDailyGoal(
  db: Firestore,
  userId: string,
  args: { reflection?: string }
) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const weekStart = monday.toISOString().split('T')[0];

  const focusQuery = await db
    .collection('users')
    .doc(userId)
    .collection('weekly_focus')
    .where('weekStart', '==', weekStart)
    .limit(1)
    .get();

  if (focusQuery.empty) {
    return {
      content: [
        {
          type: 'text',
          text: 'No weekly focus set. Would you like to set one?',
        },
      ],
    };
  }

  const focusDoc = focusQuery.docs[0];
  const focus = focusDoc.data();
  const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Update the goal
  const updatedGoals = [...focus.dailyMicroGoals];
  updatedGoals[todayIndex] = {
    ...updatedGoals[todayIndex],
    completed: true,
    completedAt: new Date(),
    reflection: args.reflection || null,
  };

  const completedCount = updatedGoals.filter((g) => g.completed).length;

  await focusDoc.ref.update({
    dailyMicroGoals: updatedGoals,
    completionRate: Math.round((completedCount / 7) * 100),
  });

  const encouragements = [
    '🎉 Amazing work! Every small step counts.',
    '✨ You showed up for yourself today. That matters.',
    '💪 Progress, not perfection. Keep going!',
    '🌟 You\'re building momentum. Great job!',
    '🙌 Consistency is key, and you\'re doing it!',
  ];

  const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

  return {
    content: [
      {
        type: 'text',
        text: `**Goal Completed!** ✅

${randomEncouragement}

**Completed:** ${updatedGoals[todayIndex].goal}

${args.reflection ? `**Your Reflection:** "${args.reflection}"` : ''}

**Weekly Progress:** ${completedCount}/7 days complete
${'█'.repeat(completedCount)}${'░'.repeat(7 - completedCount)}

${completedCount === 7 ? '\n🏆 **Amazing! You completed the entire week!** Time for a new focus next week?' : ''}`,
      },
    ],
  };
}
