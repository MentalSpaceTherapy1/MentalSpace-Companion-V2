/**
 * Prediction Examples
 * Demonstrates how the pattern prediction algorithms work with sample data
 */

import type { Checkin } from '@mentalspace/shared';
import {
  analyzeDayOfWeekPatterns,
  predictTomorrowMood,
  detectTriggerPatterns,
  generateProactiveAlert,
} from '../services/patternPrediction';

// Helper to create sample checkin with required fields
const makeCheckin = (data: { id: string; date: string; mood: number; stress: number; sleep: number; energy: number; focus: number; anxiety: number }): Checkin => ({
  ...data,
  userId: 'sample-user',
  createdAt: new Date(data.date),
  crisisDetected: false,
  crisisHandled: false,
});

// Sample check-in data over 3 weeks
const sampleCheckins: Checkin[] = [
  // Week 3 (most recent)
  makeCheckin({ id: '21', date: '2024-01-21', mood: 4, stress: 2, sleep: 4, energy: 4, focus: 3, anxiety: 2 }), // Sunday
  makeCheckin({ id: '20', date: '2024-01-20', mood: 3, stress: 3, sleep: 3, energy: 3, focus: 3, anxiety: 3 }), // Saturday
  makeCheckin({ id: '19', date: '2024-01-19', mood: 2, stress: 4, sleep: 2, energy: 2, focus: 2, anxiety: 4 }), // Friday
  makeCheckin({ id: '18', date: '2024-01-18', mood: 3, stress: 3, sleep: 3, energy: 3, focus: 3, anxiety: 3 }), // Thursday
  makeCheckin({ id: '17', date: '2024-01-17', mood: 3, stress: 3, sleep: 3, energy: 3, focus: 3, anxiety: 3 }), // Wednesday
  makeCheckin({ id: '16', date: '2024-01-16', mood: 2, stress: 4, sleep: 2, energy: 2, focus: 2, anxiety: 4 }), // Tuesday
  makeCheckin({ id: '15', date: '2024-01-15', mood: 2, stress: 4, sleep: 2, energy: 2, focus: 2, anxiety: 4 }), // Monday

  // Week 2
  makeCheckin({ id: '14', date: '2024-01-14', mood: 4, stress: 2, sleep: 4, energy: 4, focus: 4, anxiety: 2 }), // Sunday
  makeCheckin({ id: '13', date: '2024-01-13', mood: 3, stress: 3, sleep: 3, energy: 3, focus: 3, anxiety: 3 }), // Saturday
  makeCheckin({ id: '12', date: '2024-01-12', mood: 2, stress: 4, sleep: 2, energy: 2, focus: 2, anxiety: 4 }), // Friday
  makeCheckin({ id: '11', date: '2024-01-11', mood: 3, stress: 3, sleep: 3, energy: 3, focus: 3, anxiety: 3 }), // Thursday
  makeCheckin({ id: '10', date: '2024-01-10', mood: 3, stress: 3, sleep: 4, energy: 3, focus: 3, anxiety: 3 }), // Wednesday
  makeCheckin({ id: '9', date: '2024-01-09', mood: 2, stress: 4, sleep: 2, energy: 2, focus: 2, anxiety: 4 }),  // Tuesday
  makeCheckin({ id: '8', date: '2024-01-08', mood: 1, stress: 5, sleep: 2, energy: 1, focus: 1, anxiety: 5 }),  // Monday

  // Week 1
  makeCheckin({ id: '7', date: '2024-01-07', mood: 4, stress: 2, sleep: 4, energy: 4, focus: 4, anxiety: 2 }),  // Sunday
  makeCheckin({ id: '6', date: '2024-01-06', mood: 3, stress: 3, sleep: 3, energy: 3, focus: 3, anxiety: 3 }),  // Saturday
  makeCheckin({ id: '5', date: '2024-01-05', mood: 2, stress: 4, sleep: 2, energy: 2, focus: 2, anxiety: 4 }),  // Friday
  makeCheckin({ id: '4', date: '2024-01-04', mood: 3, stress: 3, sleep: 3, energy: 3, focus: 3, anxiety: 3 }),  // Thursday
  makeCheckin({ id: '3', date: '2024-01-03', mood: 4, stress: 2, sleep: 4, energy: 4, focus: 4, anxiety: 2 }),  // Wednesday
  makeCheckin({ id: '2', date: '2024-01-02', mood: 2, stress: 4, sleep: 2, energy: 2, focus: 2, anxiety: 4 }),  // Tuesday
  makeCheckin({ id: '1', date: '2024-01-01', mood: 2, stress: 4, sleep: 3, energy: 2, focus: 2, anxiety: 4 }),  // Monday
];

/**
 * Example 1: Analyze Day of Week Patterns
 */
export function exampleDayOfWeekAnalysis() {
  console.log('=== Day of Week Pattern Analysis ===\n');

  const patterns = analyzeDayOfWeekPatterns(sampleCheckins);

  patterns.forEach((pattern) => {
    console.log(`${pattern.dayName}:`);
    console.log(`  Average Mood: ${pattern.averageMood}`);
    console.log(`  Average Stress: ${pattern.averageStress}`);
    console.log(`  Check-ins: ${pattern.checkinsCount}`);
    console.log(`  Is Harder: ${pattern.isHarder ? 'YES' : 'NO'}`);
    console.log('');
  });

  // Expected output:
  // Mondays and Tuesdays tend to be harder (lower mood, higher stress)
  // Sundays tend to be better (higher mood, lower stress)
}

/**
 * Example 2: Predict Tomorrow's Mood
 */
export function exampleMoodPrediction() {
  console.log('=== Tomorrow Mood Prediction ===\n');

  const prediction = predictTomorrowMood(sampleCheckins);

  if (prediction) {
    console.log(`Predicted Mood: ${prediction.predictedMood}`);
    console.log(`Confidence: ${(prediction.confidence * 100).toFixed(0)}%`);
    console.log(`Reasoning: ${prediction.reasoning}`);
    console.log(`Based on Day of Week: ${prediction.basedOnDayOfWeek ? 'Yes' : 'No'}`);
    console.log(`Based on Recent Trend: ${prediction.basedOnRecentTrend ? 'Yes' : 'No'}`);
  } else {
    console.log('Not enough data for prediction');
  }

  // Expected output:
  // If tomorrow is Monday: Lower predicted mood (2-2.5)
  // If tomorrow is Sunday: Higher predicted mood (4-4.5)
}

/**
 * Example 3: Detect Trigger Patterns
 */
export function exampleTriggerDetection() {
  console.log('=== Trigger Pattern Detection ===\n');

  const patterns = detectTriggerPatterns(sampleCheckins);

  patterns.forEach((pattern) => {
    console.log(`Type: ${pattern.type}`);
    console.log(`Description: ${pattern.description}`);
    console.log(`Severity: ${pattern.severity}`);
    console.log(`Occurrences: ${pattern.occurrences}`);
    if (pattern.lastOccurred) {
      console.log(`Last Occurred: ${pattern.lastOccurred}`);
    }
    console.log('');
  });

  // Expected output:
  // - Day of week pattern: Mondays, Tuesdays tend to be harder
  // - Stress spike pattern: Multiple high stress days detected
}

/**
 * Example 4: Generate Proactive Alert
 */
export function exampleProactiveAlert() {
  console.log('=== Proactive Alert Generation ===\n');

  const prediction = predictTomorrowMood(sampleCheckins);
  const patterns = detectTriggerPatterns(sampleCheckins);
  const triggerDates = [
    {
      date: '2024-01-25', // 4 days from now
      label: 'Anniversary of loss',
    },
  ];

  const alert = generateProactiveAlert(
    prediction,
    patterns,
    triggerDates,
    sampleCheckins.slice(0, 7)
  );

  if (alert) {
    console.log(`Type: ${alert.type}`);
    console.log(`Title: ${alert.title}`);
    console.log(`Message: ${alert.message}`);
    console.log(`Severity: ${alert.severity}`);
    console.log(`Actionable: ${alert.actionable ? 'Yes' : 'No'}`);
    if (alert.suggestedAction) {
      console.log(`Suggested Action: ${alert.suggestedAction}`);
    }
  } else {
    console.log('No alert generated');
  }

  // Expected output:
  // Alert about tomorrow being harder (if prediction is low)
  // Or alert about upcoming trigger date
}

/**
 * Example 5: Bad Day Mode Scenario
 */
export function exampleBadDayModeScenario() {
  console.log('=== Bad Day Mode Scenario ===\n');

  // Simulate check-ins showing declining mood
  const decliningCheckins: Checkin[] = [
    makeCheckin({ id: '5', date: '2024-01-22', mood: 1, stress: 5, sleep: 2, energy: 1, focus: 1, anxiety: 5 }),
    makeCheckin({ id: '4', date: '2024-01-21', mood: 2, stress: 4, sleep: 2, energy: 2, focus: 2, anxiety: 4 }),
    makeCheckin({ id: '3', date: '2024-01-20', mood: 2, stress: 4, sleep: 3, energy: 2, focus: 2, anxiety: 4 }),
    makeCheckin({ id: '2', date: '2024-01-19', mood: 3, stress: 3, sleep: 3, energy: 3, focus: 3, anxiety: 3 }),
    makeCheckin({ id: '1', date: '2024-01-18', mood: 4, stress: 2, sleep: 4, energy: 4, focus: 4, anxiety: 2 }),
  ];

  const prediction = predictTomorrowMood(decliningCheckins);
  const patterns = detectTriggerPatterns(decliningCheckins);
  const alert = generateProactiveAlert(prediction, patterns, [], decliningCheckins.slice(0, 3));

  console.log('Recent Check-ins:');
  decliningCheckins.slice(0, 3).forEach((c) => {
    console.log(`  ${c.date}: Mood ${c.mood}, Stress ${c.stress}`);
  });
  console.log('');

  if (prediction) {
    console.log(`Tomorrow's Predicted Mood: ${prediction.predictedMood}`);
  }

  if (alert) {
    console.log(`\nAlert Type: ${alert.type}`);
    console.log(`Message: ${alert.message}`);
  }

  console.log('\nBad Day Mode would be activated because:');
  console.log('- Most recent mood is 1 (< 2 threshold)');
  console.log('- Showing declining trend');
  console.log('- Multiple consecutive low days detected');

  // Expected output:
  // Recovery mode alert
  // Recommendation for lighter plan
}

/**
 * Example 6: Trigger Date Approaching
 */
export function exampleTriggerDateApproaching() {
  console.log('=== Trigger Date Approaching ===\n');

  const today = new Date('2024-01-23');
  const triggerDates = [
    {
      date: '2024-01-24', // Tomorrow
      label: 'Difficult anniversary',
    },
  ];

  const alert = generateProactiveAlert(
    null,
    [],
    triggerDates,
    sampleCheckins.slice(0, 7)
  );

  if (alert) {
    console.log(`Alert Type: ${alert.type}`);
    console.log(`Title: ${alert.title}`);
    console.log(`Message: ${alert.message}`);
    console.log(`Severity: ${alert.severity}`);
    console.log(`Trigger Date: ${alert.triggerDate}`);
  }

  // Expected output:
  // Critical severity alert
  // Message about tomorrow being a difficult date
  // Suggestion to prepare lighter plan
}

/**
 * Run all examples
 */
export function runAllExamples() {
  exampleDayOfWeekAnalysis();
  console.log('\n' + '='.repeat(50) + '\n');

  exampleMoodPrediction();
  console.log('\n' + '='.repeat(50) + '\n');

  exampleTriggerDetection();
  console.log('\n' + '='.repeat(50) + '\n');

  exampleProactiveAlert();
  console.log('\n' + '='.repeat(50) + '\n');

  exampleBadDayModeScenario();
  console.log('\n' + '='.repeat(50) + '\n');

  exampleTriggerDateApproaching();
}

/**
 * Usage in app:
 *
 * import { runAllExamples } from './examples/PredictionExamples';
 *
 * // In a test/debug screen or console:
 * runAllExamples();
 */
