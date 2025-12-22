/**
 * Crisis Event Triggers
 * Cloud Functions triggered when crisis events occur
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Triggered when a crisis event is created
 * Can be used for:
 * - Sending notifications to designated contacts
 * - Logging to analytics
 * - Triggering follow-up workflows
 */
export const onCrisisEventCreated = functions.firestore
  .document('users/{userId}/crisis_events/{eventId}')
  .onCreate(async (snapshot, context) => {
    const { userId, eventId } = context.params;
    const eventData = snapshot.data();

    console.log(`Crisis event ${eventId} created for user ${userId}`);
    console.log(`Severity: ${eventData.severity}, Trigger: ${eventData.triggerType}`);

    // Log to analytics (aggregated, no PII)
    await logCrisisAnalytics(eventData.severity, eventData.triggerType);

    // For high severity events, schedule a follow-up
    if (eventData.severity === 'high') {
      await scheduleFollowUp(userId, eventId);
    }

    return { success: true };
  });

/**
 * Log crisis event to analytics collection (aggregated data only)
 */
async function logCrisisAnalytics(
  severity: string,
  triggerType: string
): Promise<void> {
  const db = admin.firestore();
  const today = new Date().toISOString().split('T')[0];

  const analyticsRef = db.collection('analytics').doc(`crisis_${today}`);

  await analyticsRef.set(
    {
      date: today,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      [`severity_${severity}`]: admin.firestore.FieldValue.increment(1),
      [`trigger_${triggerType}`]: admin.firestore.FieldValue.increment(1),
      total: admin.firestore.FieldValue.increment(1),
    },
    { merge: true }
  );
}

/**
 * Schedule a follow-up for high severity crisis events
 */
async function scheduleFollowUp(userId: string, eventId: string): Promise<void> {
  const db = admin.firestore();

  // Mark the event as having a follow-up scheduled
  await db
    .collection('users')
    .doc(userId)
    .collection('crisis_events')
    .doc(eventId)
    .update({
      followUpScheduled: true,
    });

  // In a production app, you would:
  // 1. Send a push notification to check in on the user
  // 2. Schedule a reminder notification for 24 hours later
  // 3. Potentially notify emergency contacts if configured

  console.log(`Follow-up scheduled for crisis event ${eventId}`);
}
