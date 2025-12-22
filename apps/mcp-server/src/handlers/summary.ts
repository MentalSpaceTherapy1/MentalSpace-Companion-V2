/**
 * Summary Handler
 * Retrieves and formats weekly summary
 */

import type { Firestore } from 'firebase-admin/firestore';

export async function handleGetSummary(
  db: Firestore,
  userId: string,
  args: unknown
) {
  const weeksBack = (args as any)?.weeksBack || 1;

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeksBack * 7);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  // Get check-ins for the period
  const checkinsSnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('checkins')
    .where('date', '>=', startStr)
    .where('date', '<=', endStr)
    .orderBy('date', 'asc')
    .get();

  if (checkinsSnapshot.empty) {
    return {
      content: [
        {
          type: 'text',
          text: `You don't have any check-ins for the past ${weeksBack === 1 ? 'week' : `${weeksBack} weeks`}. Start checking in daily to see your trends!`,
        },
      ],
    };
  }

  const checkins = checkinsSnapshot.docs.map((doc) => doc.data());

  // Calculate metrics
  const metrics = calculateMetrics(checkins);
  const insights = generateInsights(metrics);

  // Get plans for completion rate
  const plansSnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('plans')
    .where('date', '>=', startStr)
    .where('date', '<=', endStr)
    .get();

  const plans = plansSnapshot.docs.map((doc) => doc.data());
  const completionRate = calculateCompletionRate(plans);

  // Format response
  let response = `**Weekly Summary (${formatDate(startDate)} - ${formatDate(endDate)})**\n\n`;

  response += `📊 **Check-ins:** ${checkins.length} days\n`;
  response += `✅ **Completion Rate:** ${completionRate}%\n\n`;

  response += `**Your Averages This Week:**\n`;
  response += `- 😊 Mood: ${metrics.mood.average.toFixed(1)}/10 ${getTrendEmoji(metrics.mood.trend)}\n`;
  response += `- 😰 Stress: ${metrics.stress.average.toFixed(1)}/10 ${getTrendEmoji(metrics.stress.trend, true)}\n`;
  response += `- 😴 Sleep: ${metrics.sleep.average.toFixed(1)}/10 ${getTrendEmoji(metrics.sleep.trend)}\n`;
  response += `- ⚡ Energy: ${metrics.energy.average.toFixed(1)}/10 ${getTrendEmoji(metrics.energy.trend)}\n`;
  response += `- 🎯 Focus: ${metrics.focus.average.toFixed(1)}/10 ${getTrendEmoji(metrics.focus.trend)}\n`;
  response += `- 💭 Anxiety: ${metrics.anxiety.average.toFixed(1)}/10 ${getTrendEmoji(metrics.anxiety.trend, true)}\n\n`;

  response += `**Insights:**\n`;
  for (const insight of insights) {
    response += `• ${insight}\n`;
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

interface MetricSummary {
  average: number;
  trend: 'improving' | 'stable' | 'declining';
  values: number[];
}

function calculateMetrics(checkins: any[]): Record<string, MetricSummary> {
  const metricKeys = ['mood', 'stress', 'sleep', 'energy', 'focus', 'anxiety'];
  const result: Record<string, MetricSummary> = {};

  for (const key of metricKeys) {
    const values = checkins.map((c) => c[key]).filter((v) => v != null);
    const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    // Calculate trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (values.length >= 4) {
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      const diff = secondAvg - firstAvg;
      const isInverted = key === 'stress' || key === 'anxiety';

      if (Math.abs(diff) > 0.5) {
        if (isInverted) {
          trend = diff < 0 ? 'improving' : 'declining';
        } else {
          trend = diff > 0 ? 'improving' : 'declining';
        }
      }
    }

    result[key] = { average, trend, values };
  }

  return result;
}

function calculateCompletionRate(plans: any[]): number {
  if (plans.length === 0) return 0;

  let completed = 0;
  let total = 0;

  for (const plan of plans) {
    completed += plan.completedCount || 0;
    total += plan.totalCount || 0;
  }

  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function generateInsights(metrics: Record<string, MetricSummary>): string[] {
  const insights: string[] = [];

  // Check for improvements
  const improving = Object.entries(metrics)
    .filter(([_, m]) => m.trend === 'improving')
    .map(([k, _]) => k);

  if (improving.length > 0) {
    const formatted = improving.map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(', ');
    insights.push(`Great progress on ${formatted}!`);
  }

  // Check for concerns
  if (metrics.mood.average < 4) {
    insights.push('Your mood has been lower than usual. Consider talking to someone you trust.');
  }

  if (metrics.stress.average > 7) {
    insights.push('Stress levels have been high. Make time for relaxation and self-care.');
  }

  if (metrics.sleep.average < 5) {
    insights.push('Sleep quality could use some attention. Good sleep is foundational to mental health.');
  }

  // Default insight
  if (insights.length === 0) {
    insights.push("You're maintaining a steady baseline. Keep up the self-care!");
  }

  return insights;
}

function getTrendEmoji(trend: string, inverted: boolean = false): string {
  if (trend === 'stable') return '➡️';
  const isGood = inverted ? trend === 'declining' : trend === 'improving';
  return isGood ? '📈' : '📉';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export async function handleGetStreakInfo(db: Firestore, userId: string) {
  // Get all check-ins ordered by date descending
  const checkinsSnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('checkins')
    .orderBy('date', 'desc')
    .limit(365)
    .get();

  if (checkinsSnapshot.empty) {
    return {
      content: [
        {
          type: 'text',
          text: `**Your Streak Info**

🔥 Current Streak: 0 days
📅 Longest Streak: 0 days
✅ Total Check-ins: 0

Start your streak today by doing your first check-in!`,
        },
      ],
    };
  }

  const checkins = checkinsSnapshot.docs.map((doc) => doc.data());
  const dates = checkins.map((c) => c.date).filter(Boolean);

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Check if they checked in today or yesterday (to continue streak)
  if (dates.includes(today) || dates.includes(yesterday)) {
    const startDate = dates.includes(today) ? today : yesterday;
    let checkDate = new Date(startDate);

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (dates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  const sortedDates = [...new Set(dates)].sort().reverse();

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currentDate = new Date(sortedDates[i]);
    const nextDate = new Date(sortedDates[i + 1]);
    const diffDays = Math.round(
      (currentDate.getTime() - nextDate.getTime()) / 86400000
    );

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate weekly consistency
  const lastWeekStart = new Date();
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekStr = lastWeekStart.toISOString().split('T')[0];
  const weekCheckins = dates.filter((d) => d >= lastWeekStr).length;
  const weeklyConsistency = Math.round((weekCheckins / 7) * 100);

  // Streak milestones
  const milestones = [7, 14, 30, 60, 90, 180, 365];
  const nextMilestone = milestones.find((m) => m > currentStreak) || 365;
  const daysToMilestone = nextMilestone - currentStreak;

  // Encouragement message based on streak
  let encouragement = '';
  if (currentStreak === 0) {
    encouragement = "Ready to start fresh? Today is the perfect day!";
  } else if (currentStreak < 7) {
    encouragement = "You're building momentum! Keep it going!";
  } else if (currentStreak < 30) {
    encouragement = "Fantastic consistency! You're forming a real habit!";
  } else if (currentStreak < 100) {
    encouragement = "Incredible dedication! You're a self-care champion!";
  } else {
    encouragement = "You're absolutely amazing! Your commitment to self-care is inspiring!";
  }

  const streakEmoji = currentStreak >= 7 ? '🔥' : currentStreak > 0 ? '✨' : '💫';

  return {
    content: [
      {
        type: 'text',
        text: `**Your Streak Info** ${streakEmoji}

🔥 **Current Streak:** ${currentStreak} day${currentStreak !== 1 ? 's' : ''}
📅 **Longest Streak:** ${longestStreak} day${longestStreak !== 1 ? 's' : ''}
✅ **Total Check-ins:** ${dates.length}
📊 **Weekly Consistency:** ${weeklyConsistency}%

${currentStreak > 0 ? `🎯 **Next Milestone:** ${nextMilestone} days (${daysToMilestone} to go!)` : ''}

${encouragement}`,
      },
    ],
  };
}
