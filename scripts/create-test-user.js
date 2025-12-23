/**
 * Create Test User for GPT App Directory Review
 * Run with: node scripts/create-test-user.js
 * Requires GOOGLE_APPLICATION_CREDENTIALS environment variable
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
// Supports: FIREBASE_SERVICE_ACCOUNT env var (JSON string) or local file
function getCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    return admin.credential.cert(serviceAccount);
  }

  // Try local file as fallback
  try {
    const serviceAccount = require('../firebase/service-account.json');
    return admin.credential.cert(serviceAccount);
  } catch {
    console.error('No Firebase credentials found!');
    console.error('Set FIREBASE_SERVICE_ACCOUNT env var or create firebase/service-account.json');
    process.exit(1);
  }
}

admin.initializeApp({
  credential: getCredential(),
  projectId: 'mentalspace-companion'
});

const db = admin.firestore();

const TEST_USER_ID = 'test-reviewer-user-001';
const TEST_USER_EMAIL = 'reviewer@mentalspace-test.com';

async function createTestUser() {
  console.log('Creating test user for GPT App Directory review...\n');

  // 1. Create user profile
  const userProfile = {
    uid: TEST_USER_ID,
    email: TEST_USER_EMAIL,
    displayName: 'Test Reviewer',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    onboardingComplete: true,
    carePreferences: {
      preferredSupportStyle: 'gentle_encouragement',
      primaryGoals: ['reduce_stress', 'improve_sleep', 'increase_mindfulness'],
      therapyStatus: 'considering',
      socialSupport: 'moderate',
      updatedAt: new Date()
    }
  };

  await db.collection('users').doc(TEST_USER_ID).set(userProfile);
  console.log('✅ Created user profile');

  // 2. Create sample check-ins (last 7 days)
  const checkins = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const checkin = {
      userId: TEST_USER_ID,
      date: dateStr,
      mood: Math.floor(Math.random() * 3) + 5, // 5-7
      stress: Math.floor(Math.random() * 3) + 3, // 3-5
      sleep: Math.floor(Math.random() * 3) + 5, // 5-7
      energy: Math.floor(Math.random() * 3) + 5, // 5-7
      focus: Math.floor(Math.random() * 3) + 5, // 5-7
      anxiety: Math.floor(Math.random() * 3) + 2, // 2-4
      journalEntry: i === 0 ? 'Feeling optimistic about trying this new wellness app!' : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(TEST_USER_ID)
      .collection('checkins').doc(dateStr).set(checkin);
    checkins.push(checkin);
  }
  console.log('✅ Created 7 days of check-in history');

  // 3. Create today's action plan
  const todayStr = today.toISOString().split('T')[0];
  const actionPlan = {
    userId: TEST_USER_ID,
    date: todayStr,
    actions: [
      {
        id: 'action-001',
        title: '5-Minute Mindful Breathing',
        description: 'Take a short break to practice box breathing and center yourself.',
        category: 'coping',
        duration: 5,
        completed: false
      },
      {
        id: 'action-002',
        title: 'Take a 15-Minute Walk',
        description: 'Get outside for a brief walk to boost your mood and energy.',
        category: 'lifestyle',
        duration: 15,
        completed: false
      },
      {
        id: 'action-003',
        title: 'Send a Kind Message',
        description: 'Reach out to someone you care about with a quick message.',
        category: 'social',
        duration: 5,
        completed: false
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('users').doc(TEST_USER_ID)
    .collection('actionPlans').doc(todayStr).set(actionPlan);
  console.log('✅ Created today\'s action plan');

  // 4. Create weekly focus
  const weeklyFocus = {
    userId: TEST_USER_ID,
    focusArea: 'mindfulness',
    intention: 'Practice being more present in daily activities',
    startDate: new Date(today.setDate(today.getDate() - today.getDay())), // Start of week
    dailyGoals: [
      { day: 0, goal: 'Notice 3 things you\'re grateful for', completed: true },
      { day: 1, goal: 'Take 3 mindful breaths before each meal', completed: true },
      { day: 2, goal: 'Spend 5 minutes in quiet reflection', completed: false },
      { day: 3, goal: 'Practice mindful listening in one conversation', completed: false },
      { day: 4, goal: 'Do a body scan before bed', completed: false },
      { day: 5, goal: 'Take a mindful walk, noticing your surroundings', completed: false },
      { day: 6, goal: 'Write about your mindfulness journey this week', completed: false }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('users').doc(TEST_USER_ID)
    .collection('weeklyFocus').doc('current').set(weeklyFocus);
  console.log('✅ Created weekly focus');

  // 5. Create streak info
  const streakInfo = {
    userId: TEST_USER_ID,
    currentStreak: 7,
    longestStreak: 14,
    totalCheckins: 21,
    lastCheckinDate: todayStr,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('users').doc(TEST_USER_ID)
    .collection('stats').doc('streak').set(streakInfo);
  console.log('✅ Created streak information');

  console.log('\n========================================');
  console.log('TEST ACCOUNT CREATED SUCCESSFULLY');
  console.log('========================================');
  console.log(`\nTest User ID: ${TEST_USER_ID}`);
  console.log(`Test Email: ${TEST_USER_EMAIL}`);
  console.log('\nThis user has:');
  console.log('- 7 days of check-in history');
  console.log('- Active action plan for today');
  console.log('- Weekly focus on mindfulness');
  console.log('- 7-day streak');
  console.log('- Care preferences configured');
  console.log('\n');
}

createTestUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error creating test user:', error);
    process.exit(1);
  });
