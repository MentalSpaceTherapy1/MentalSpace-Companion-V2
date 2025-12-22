/**
 * Check-in Triggers
 * Cloud Functions triggered when a new check-in is created
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  detectCrisisFromText,
  detectCrisisFromMetrics,
  detectLowMoodPattern,
  hasRecentCrisisEvent,
  createCrisisEvent,
} from '../services/crisisDetection';
import { generateDailyPlan } from '../services/planGeneration';

const CRISIS_COOLDOWN_HOURS = 24;

/**
 * Triggered when a new check-in document is created
 * - Runs crisis detection
 * - Generates daily action plan
 */
export const onCheckinCreated = functions.firestore
  .document('users/{userId}/checkins/{checkinId}')
  .onCreate(async (snapshot, context) => {
    const { userId, checkinId } = context.params;
    const checkinData = snapshot.data();

    console.log(`Processing check-in ${checkinId} for user ${userId}`);

    // Run crisis detection and plan generation in parallel
    const [crisisResult, planResult] = await Promise.allSettled([
      runCrisisDetection(userId, checkinId, checkinData),
      generateDailyPlan(userId, checkinId, checkinData, checkinData.date),
    ]);

    // Log results
    if (crisisResult.status === 'fulfilled') {
      console.log(`Crisis detection completed:`, crisisResult.value);
    } else {
      console.error(`Crisis detection failed:`, crisisResult.reason);
    }

    if (planResult.status === 'fulfilled') {
      console.log(`Plan generation completed: ${planResult.value.planId}`);
    } else {
      console.error(`Plan generation failed:`, planResult.reason);
    }

    // Update check-in with crisis detection result
    if (crisisResult.status === 'fulfilled' && crisisResult.value.detected) {
      await snapshot.ref.update({
        crisisDetected: true,
        crisisHandled: false,
      });
    }

    return {
      checkinId,
      crisisDetected: crisisResult.status === 'fulfilled' ? crisisResult.value.detected : false,
      planGenerated: planResult.status === 'fulfilled',
    };
  });

/**
 * Run multi-layer crisis detection
 */
async function runCrisisDetection(
  userId: string,
  checkinId: string,
  checkinData: FirebaseFirestore.DocumentData
): Promise<{ detected: boolean; eventId?: string }> {
  // Check if we're in cooldown period
  const recentCrisis = await hasRecentCrisisEvent(userId, CRISIS_COOLDOWN_HOURS);
  if (recentCrisis) {
    console.log(`User ${userId} in crisis cooldown period, skipping detection`);
    return { detected: false };
  }

  // Layer 1: Check journal text for crisis indicators
  if (checkinData.journalEntry) {
    const textResult = detectCrisisFromText(checkinData.journalEntry);
    if (textResult.detected) {
      console.log(`Crisis detected from text: ${textResult.detectionMethod}`);
      const eventId = await createCrisisEvent(userId, checkinId, textResult);
      return { detected: true, eventId };
    }
  }

  // Layer 2: Check metrics for concerning patterns
  const metricsResult = detectCrisisFromMetrics({
    mood: checkinData.mood,
    stress: checkinData.stress,
    anxiety: checkinData.anxiety,
    energy: checkinData.energy,
  });

  if (metricsResult.detected && metricsResult.severity === 'high') {
    console.log(`Crisis detected from metrics: ${metricsResult.detectionMethod}`);
    const eventId = await createCrisisEvent(userId, checkinId, metricsResult);
    return { detected: true, eventId };
  }

  // Layer 3: Check for low mood pattern over multiple days
  const patternResult = await detectLowMoodPattern(userId, checkinData.mood);
  if (patternResult.detected) {
    console.log(`Crisis detected from pattern: ${patternResult.detectionMethod}`);
    const eventId = await createCrisisEvent(userId, checkinId, patternResult);
    return { detected: true, eventId };
  }

  return { detected: false };
}
