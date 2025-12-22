/**
 * MentalSpace Companion - Firebase Cloud Functions
 * Main entry point for all Cloud Functions
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export Firestore triggers
export { onCheckinCreated } from './triggers/checkin';
export { onCrisisEventCreated } from './triggers/crisis';

// Export scheduled functions
export { generateWeeklySummaries } from './triggers/scheduled';

// Export callable functions (for admin operations)
export { seedActionsLibrary, seedFocusModules } from './triggers/admin';
