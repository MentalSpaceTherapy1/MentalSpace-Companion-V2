/**
 * Check-in Handler
 * Processes daily check-in tool calls
 */

import type { Firestore } from 'firebase-admin/firestore';
import { z } from 'zod';

const checkinSchema = z.object({
  mood: z.number().int().min(1).max(10),
  stress: z.number().int().min(1).max(10),
  sleep: z.number().int().min(1).max(10),
  energy: z.number().int().min(1).max(10),
  focus: z.number().int().min(1).max(10),
  anxiety: z.number().int().min(1).max(10),
  journalEntry: z.string().max(2000).optional(),
});

export async function handleCheckin(
  db: Firestore,
  userId: string,
  args: unknown
) {
  // Validate input
  const result = checkinSchema.safeParse(args);
  if (!result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Invalid check-in data: ${result.error.message}`,
        },
      ],
      isError: true,
    };
  }

  const data = result.data;
  const today = new Date().toISOString().split('T')[0];

  // Check if already checked in today
  const existingCheckin = await db
    .collection('users')
    .doc(userId)
    .collection('checkins')
    .where('date', '==', today)
    .limit(1)
    .get();

  if (!existingCheckin.empty) {
    return {
      content: [
        {
          type: 'text',
          text: `You've already completed your check-in today. Your scores were: Mood ${existingCheckin.docs[0].data().mood}/10, Stress ${existingCheckin.docs[0].data().stress}/10.`,
        },
      ],
    };
  }

  // Create check-in
  const checkinRef = await db
    .collection('users')
    .doc(userId)
    .collection('checkins')
    .add({
      ...data,
      date: today,
      createdAt: new Date(),
      crisisDetected: false,
      crisisHandled: false,
    });

  // Generate response
  const insights = generateInsights(data);

  return {
    content: [
      {
        type: 'text',
        text: `Check-in recorded successfully!

**Your Metrics Today:**
- Mood: ${data.mood}/10
- Stress: ${data.stress}/10
- Sleep: ${data.sleep}/10
- Energy: ${data.energy}/10
- Focus: ${data.focus}/10
- Anxiety: ${data.anxiety}/10

${insights}

Would you like to see your personalized action plan for today?`,
      },
    ],
  };
}

function generateInsights(data: z.infer<typeof checkinSchema>): string {
  const insights: string[] = [];

  // Check for concerning patterns
  if (data.mood <= 3) {
    insights.push("I notice your mood is quite low today. Remember, it's okay to not be okay.");
  }

  if (data.stress >= 8) {
    insights.push('Your stress levels are high. Consider taking some time for a breathing exercise.');
  }

  if (data.sleep <= 3) {
    insights.push("It looks like you didn't sleep well. Rest is important for mental health.");
  }

  if (data.anxiety >= 8) {
    insights.push('Your anxiety seems elevated. Grounding exercises can help in the moment.');
  }

  // Positive observations
  if (data.mood >= 7 && data.energy >= 7) {
    insights.push("Great to see you're feeling good and energized today!");
  }

  if (data.sleep >= 7) {
    insights.push('Good sleep quality - this is a strong foundation for your day.');
  }

  if (insights.length === 0) {
    insights.push('Thank you for checking in. Every day is a step in your wellness journey.');
  }

  return insights.join('\n\n');
}
