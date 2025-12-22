/**
 * Scheduled Cloud Functions
 * Functions that run on a schedule (cron)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Generate weekly summaries for all users
 * Runs every Monday at 6:00 AM UTC
 */
export const generateWeeklySummaries = functions.pubsub
  .schedule('0 6 * * 1') // Every Monday at 6:00 AM
  .timeZone('UTC')
  .onRun(async () => {
    console.log('Starting weekly summary generation');

    const db = admin.firestore();

    // Get all users who have check-ins
    const usersSnapshot = await db.collection('users').get();

    const results = await Promise.allSettled(
      usersSnapshot.docs.map((userDoc) =>
        generateUserWeeklySummary(userDoc.id)
      )
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(`Weekly summaries generated: ${successful} successful, ${failed} failed`);

    return { successful, failed };
  });

/**
 * Generate weekly summary for a single user
 */
async function generateUserWeeklySummary(userId: string): Promise<void> {
  const db = admin.firestore();

  // Calculate date range (last 7 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  // Get check-ins for the week
  const checkinsSnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('checkins')
    .where('date', '>=', startDateStr)
    .where('date', '<=', endDateStr)
    .orderBy('date', 'asc')
    .get();

  if (checkinsSnapshot.empty) {
    console.log(`No check-ins for user ${userId} this week, skipping summary`);
    return;
  }

  // Get plans for completion tracking
  const plansSnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('plans')
    .where('date', '>=', startDateStr)
    .where('date', '<=', endDateStr)
    .get();

  // Calculate metrics
  const checkins = checkinsSnapshot.docs.map((doc) => doc.data());
  const plans = plansSnapshot.docs.map((doc) => doc.data());

  const metricsSummary = calculateMetricsSummary(checkins);
  const completionRate = calculateCompletionRate(plans);
  const streaks = await calculateStreaks(userId);
  const insights = generateInsights(metricsSummary, completionRate);
  const topActions = getTopActions(plans);

  // Save weekly summary
  await db
    .collection('users')
    .doc(userId)
    .collection('weekly_summaries')
    .add({
      weekStart: startDateStr,
      weekEnd: endDateStr,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      metrics: metricsSummary,
      completionRate,
      streaks,
      insights,
      topActions,
    });

  console.log(`Weekly summary generated for user ${userId}`);
}

/**
 * Calculate summary statistics for each metric
 */
function calculateMetricsSummary(checkins: FirebaseFirestore.DocumentData[]): Record<string, object> {
  const metrics = ['mood', 'stress', 'sleep', 'energy', 'focus', 'anxiety'];
  const summary: Record<string, object> = {};

  for (const metric of metrics) {
    const values = checkins.map((c) => c[metric]).filter((v) => v != null);

    if (values.length === 0) {
      summary[metric] = { average: 0, min: 0, max: 0, trend: 'stable', values: [] };
      continue;
    }

    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Determine trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;

    let trend = 'stable';
    const isInverted = metric === 'stress' || metric === 'anxiety';

    if (Math.abs(secondAvg - firstAvg) > 0.5) {
      if (isInverted) {
        trend = secondAvg < firstAvg ? 'improving' : 'declining';
      } else {
        trend = secondAvg > firstAvg ? 'improving' : 'declining';
      }
    }

    summary[metric] = {
      average: Math.round(average * 10) / 10,
      min,
      max,
      trend,
      values,
    };
  }

  return summary;
}

/**
 * Calculate overall completion rate for plans
 */
function calculateCompletionRate(plans: FirebaseFirestore.DocumentData[]): number {
  if (plans.length === 0) return 0;

  let totalCompleted = 0;
  let totalActions = 0;

  for (const plan of plans) {
    totalCompleted += plan.completedCount || 0;
    totalActions += plan.totalCount || 0;
  }

  if (totalActions === 0) return 0;
  return Math.round((totalCompleted / totalActions) * 100);
}

/**
 * Calculate current streaks
 */
async function calculateStreaks(userId: string): Promise<object> {
  const db = admin.firestore();

  // Get all check-in dates
  const checkinsSnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('checkins')
    .orderBy('date', 'desc')
    .limit(365) // Look back up to a year
    .get();

  const dates = checkinsSnapshot.docs.map((doc) => doc.data().date as string);

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (dates.length > 0 && (dates[0] === today || dates[0] === yesterday)) {
    currentStreak = 1;
    let expectedDate = dates[0] === today ? yesterday : new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

    for (let i = 1; i < dates.length; i++) {
      if (dates[i] === expectedDate) {
        currentStreak++;
        const d = new Date(expectedDate);
        d.setDate(d.getDate() - 1);
        expectedDate = d.toISOString().split('T')[0];
      } else if (dates[i] < expectedDate) {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentCheckinStreak: currentStreak,
    longestCheckinStreak: longestStreak,
    currentCompletionStreak: 0, // Would need plan completion data
    longestCompletionStreak: 0,
  };
}

/**
 * Generate insights based on metrics and completion
 */
function generateInsights(
  metrics: Record<string, object>,
  completionRate: number
): string[] {
  const insights: string[] = [];

  // Check for improving metrics
  for (const [metric, data] of Object.entries(metrics)) {
    const metricData = data as { trend: string; average: number };
    if (metricData.trend === 'improving') {
      const label = metric.charAt(0).toUpperCase() + metric.slice(1);
      insights.push(`Your ${label.toLowerCase()} has been improving this week!`);
    }
  }

  // Check completion rate
  if (completionRate >= 80) {
    insights.push('Great job completing your action plans!');
  } else if (completionRate < 50 && completionRate > 0) {
    insights.push('Try to complete more actions next week for better results.');
  }

  // Check for concerning patterns
  const moodData = metrics.mood as { average: number };
  if (moodData && moodData.average <= 4) {
    insights.push('Your mood has been lower than usual. Consider reaching out for support.');
  }

  // Limit to 3 insights
  return insights.slice(0, 3);
}

/**
 * Get top completed actions
 */
function getTopActions(plans: FirebaseFirestore.DocumentData[]): object[] {
  const actionCounts: Record<string, { title: string; category: string; count: number }> = {};

  for (const plan of plans) {
    if (!plan.actions) continue;

    for (const action of plan.actions) {
      if (action.completed) {
        if (!actionCounts[action.actionId]) {
          actionCounts[action.actionId] = {
            title: action.title,
            category: action.category,
            count: 0,
          };
        }
        actionCounts[action.actionId].count++;
      }
    }
  }

  return Object.entries(actionCounts)
    .map(([actionId, data]) => ({
      actionId,
      title: data.title,
      category: data.category,
      completedCount: data.count,
    }))
    .sort((a, b) => b.completedCount - a.completedCount)
    .slice(0, 5);
}
