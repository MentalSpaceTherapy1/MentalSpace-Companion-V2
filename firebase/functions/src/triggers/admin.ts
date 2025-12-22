/**
 * Admin Cloud Functions
 * Callable functions for administrative operations
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Seed the actions library with initial actions
 * Only callable by authenticated admin users
 */
export const seedActionsLibrary = functions.https.onCall(async (data, context) => {
  // Check if user is admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const db = admin.firestore();
  const adminDoc = await db.collection('admin_users').doc(context.auth.uid).get();

  if (!adminDoc.exists) {
    throw new functions.https.HttpsError('permission-denied', 'Must be an admin');
  }

  // Initial actions library
  const actions = [
    // Coping Strategies
    {
      title: '4-7-8 Breathing Exercise',
      description: 'Breathe in for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Repeat 4 times.',
      category: 'coping',
      duration: 5,
      targetMetrics: [
        { metric: 'stress', condition: 'high', threshold: 6 },
        { metric: 'anxiety', condition: 'high', threshold: 6 },
      ],
      focusModules: ['stress_management', 'anxiety_relief', 'mindfulness'],
      difficulty: 'easy',
      isActive: true,
    },
    {
      title: 'Progressive Muscle Relaxation',
      description: 'Tense and relax each muscle group from toes to head, holding tension for 5 seconds.',
      category: 'coping',
      duration: 15,
      targetMetrics: [
        { metric: 'stress', condition: 'high', threshold: 5 },
        { metric: 'anxiety', condition: 'high', threshold: 5 },
      ],
      focusModules: ['stress_management', 'anxiety_relief'],
      difficulty: 'medium',
      isActive: true,
    },
    {
      title: 'Grounding: 5-4-3-2-1 Technique',
      description: 'Notice 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste.',
      category: 'coping',
      duration: 5,
      targetMetrics: [
        { metric: 'anxiety', condition: 'high', threshold: 7 },
        { metric: 'focus', condition: 'low', threshold: 4 },
      ],
      focusModules: ['anxiety_relief', 'mindfulness'],
      difficulty: 'easy',
      isActive: true,
    },
    {
      title: 'Journaling: Thought Dump',
      description: 'Write freely for 10 minutes about whatever is on your mind without filtering.',
      category: 'coping',
      duration: 10,
      targetMetrics: [
        { metric: 'stress', condition: 'high', threshold: 5 },
        { metric: 'mood', condition: 'low', threshold: 5 },
      ],
      focusModules: ['stress_management', 'self_discovery'],
      difficulty: 'easy',
      isActive: true,
    },
    {
      title: 'Body Scan Meditation',
      description: 'Lie down and slowly scan your body from head to toe, noticing sensations without judgment.',
      category: 'coping',
      duration: 20,
      targetMetrics: [
        { metric: 'stress', condition: 'high', threshold: 6 },
        { metric: 'sleep', condition: 'low', threshold: 5 },
      ],
      focusModules: ['mindfulness', 'sleep_improvement'],
      difficulty: 'medium',
      isActive: true,
    },

    // Lifestyle Actions
    {
      title: 'Take a 10-Minute Walk',
      description: 'Step outside for a brief walk. Focus on your surroundings and breathe fresh air.',
      category: 'lifestyle',
      duration: 10,
      targetMetrics: [
        { metric: 'energy', condition: 'low', threshold: 5 },
        { metric: 'mood', condition: 'low', threshold: 5 },
      ],
      focusModules: ['mood_tracking', 'stress_management'],
      difficulty: 'easy',
      isActive: true,
    },
    {
      title: 'Hydration Check',
      description: 'Drink a full glass of water and set a reminder to stay hydrated throughout the day.',
      category: 'lifestyle',
      duration: 2,
      targetMetrics: [
        { metric: 'energy', condition: 'low', threshold: 4 },
        { metric: 'focus', condition: 'low', threshold: 4 },
      ],
      focusModules: ['mood_tracking'],
      difficulty: 'easy',
      isActive: true,
    },
    {
      title: 'Healthy Snack Break',
      description: 'Have a nutritious snack like fruit, nuts, or yogurt to fuel your body.',
      category: 'lifestyle',
      duration: 10,
      targetMetrics: [
        { metric: 'energy', condition: 'low', threshold: 5 },
      ],
      focusModules: ['mood_tracking'],
      difficulty: 'easy',
      isActive: true,
    },
    {
      title: 'Quick Stretching Routine',
      description: 'Do 5-7 simple stretches focusing on neck, shoulders, back, and legs.',
      category: 'lifestyle',
      duration: 7,
      targetMetrics: [
        { metric: 'energy', condition: 'low', threshold: 5 },
        { metric: 'stress', condition: 'high', threshold: 6 },
      ],
      focusModules: ['stress_management'],
      difficulty: 'easy',
      isActive: true,
    },
    {
      title: 'Digital Detox Break',
      description: 'Put away all screens for 30 minutes. Read, draw, or do something analog.',
      category: 'lifestyle',
      duration: 30,
      targetMetrics: [
        { metric: 'focus', condition: 'low', threshold: 4 },
        { metric: 'anxiety', condition: 'high', threshold: 6 },
      ],
      focusModules: ['mindfulness', 'stress_management'],
      difficulty: 'medium',
      isActive: true,
    },
    {
      title: 'Sleep Preparation Routine',
      description: 'Dim lights, avoid screens, and do a calming activity 1 hour before bed.',
      category: 'lifestyle',
      duration: 60,
      targetMetrics: [
        { metric: 'sleep', condition: 'low', threshold: 5 },
      ],
      focusModules: ['sleep_improvement'],
      difficulty: 'medium',
      isActive: true,
    },

    // Connection Actions
    {
      title: 'Send a Kind Message',
      description: 'Text or message someone you care about just to check in or share something positive.',
      category: 'connection',
      duration: 5,
      targetMetrics: [
        { metric: 'mood', condition: 'low', threshold: 5 },
      ],
      focusModules: ['mood_tracking', 'therapy_support'],
      difficulty: 'easy',
      isActive: true,
    },
    {
      title: 'Call a Friend or Family Member',
      description: 'Have a brief phone call with someone you trust. Share how you are feeling.',
      category: 'connection',
      duration: 15,
      targetMetrics: [
        { metric: 'mood', condition: 'low', threshold: 4 },
        { metric: 'stress', condition: 'high', threshold: 6 },
      ],
      focusModules: ['therapy_support', 'stress_management'],
      difficulty: 'medium',
      isActive: true,
    },
    {
      title: 'Express Gratitude',
      description: 'Tell someone specific what you appreciate about them or write them a note.',
      category: 'connection',
      duration: 10,
      targetMetrics: [
        { metric: 'mood', condition: 'low', threshold: 5 },
      ],
      focusModules: ['mood_tracking', 'mindfulness'],
      difficulty: 'easy',
      isActive: true,
    },
    {
      title: 'Plan a Social Activity',
      description: 'Schedule a coffee date, video call, or outing with a friend for this week.',
      category: 'connection',
      duration: 10,
      targetMetrics: [
        { metric: 'mood', condition: 'low', threshold: 5 },
        { metric: 'energy', condition: 'low', threshold: 4 },
      ],
      focusModules: ['mood_tracking'],
      difficulty: 'medium',
      isActive: true,
    },
    {
      title: 'Community Engagement',
      description: 'Participate in an online or local community group related to your interests.',
      category: 'connection',
      duration: 30,
      targetMetrics: [
        { metric: 'mood', condition: 'low', threshold: 4 },
      ],
      focusModules: ['self_discovery', 'mood_tracking'],
      difficulty: 'hard',
      isActive: true,
    },
  ];

  // Batch write actions
  const batch = db.batch();

  for (const action of actions) {
    const docRef = db.collection('actions_library').doc();
    batch.set(docRef, {
      ...action,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();

  return { success: true, count: actions.length };
});

/**
 * Seed focus modules
 */
export const seedFocusModules = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const db = admin.firestore();
  const adminDoc = await db.collection('admin_users').doc(context.auth.uid).get();

  if (!adminDoc.exists) {
    throw new functions.https.HttpsError('permission-denied', 'Must be an admin');
  }

  const focusModules = [
    // Mental
    {
      title: 'Stress Management',
      description: 'Tools and techniques to manage daily stress and prevent burnout.',
      category: 'mental',
      icon: 'zap',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'Anxiety Relief',
      description: 'Evidence-based practices to reduce anxiety and find calm.',
      category: 'mental',
      icon: 'heart',
      sortOrder: 2,
      isActive: true,
    },
    {
      title: 'Mood Tracking',
      description: 'Understand your emotional patterns and what affects them.',
      category: 'mental',
      icon: 'trending-up',
      sortOrder: 3,
      isActive: true,
    },
    {
      title: 'Self-Discovery',
      description: 'Explore your values, strengths, and personal growth areas.',
      category: 'mental',
      icon: 'compass',
      sortOrder: 4,
      isActive: true,
    },

    // Physical
    {
      title: 'Sleep Improvement',
      description: 'Develop better sleep habits for improved rest and recovery.',
      category: 'physical',
      icon: 'moon',
      sortOrder: 5,
      isActive: true,
    },
    {
      title: 'Energy Boost',
      description: 'Natural ways to increase your daily energy levels.',
      category: 'physical',
      icon: 'battery-charging',
      sortOrder: 6,
      isActive: true,
    },

    // Mindfulness
    {
      title: 'Mindfulness Practice',
      description: 'Build present-moment awareness through meditation and mindfulness.',
      category: 'mindfulness',
      icon: 'eye',
      sortOrder: 7,
      isActive: true,
    },
    {
      title: 'Focus Enhancement',
      description: 'Improve concentration and mental clarity.',
      category: 'mindfulness',
      icon: 'target',
      sortOrder: 8,
      isActive: true,
    },

    // Social
    {
      title: 'Therapy Support',
      description: 'Complement your therapy journey with daily practices.',
      category: 'social',
      icon: 'users',
      sortOrder: 9,
      isActive: true,
    },
    {
      title: 'Crisis Support',
      description: 'Resources and tools for when you need extra support.',
      category: 'social',
      icon: 'shield',
      sortOrder: 10,
      isActive: true,
    },
  ];

  const batch = db.batch();

  for (const module of focusModules) {
    const docRef = db.collection('focus_modules').doc();
    batch.set(docRef, {
      ...module,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();

  return { success: true, count: focusModules.length };
});
