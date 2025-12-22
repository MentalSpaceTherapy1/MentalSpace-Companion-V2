/**
 * Crisis Detection Service
 * Multi-layer crisis detection with context awareness
 */

import * as admin from 'firebase-admin';

// Crisis severity levels
export type CrisisSeverity = 'low' | 'medium' | 'high';

export interface CrisisDetectionResult {
  detected: boolean;
  severity?: CrisisSeverity;
  triggerType?: 'keyword' | 'low_mood_pattern' | 'sentiment_analysis';
  detectionMethod: string;
}

// Thresholds
const LOW_MOOD_THRESHOLD = 3;
const HIGH_ANXIETY_THRESHOLD = 8;
const HIGH_STRESS_THRESHOLD = 8;
const CONSECUTIVE_LOW_DAYS = 3;

// Crisis detection patterns with context awareness
// Note: We use patterns that consider context to reduce false positives
const CRISIS_PATTERNS = {
  high: [
    // Explicit statements of intent
    /\b(want|going|plan|planning|decided)\s+to\s+(kill|end|hurt)\s+(myself|my\s*self|my\s+life)/i,
    /\b(suicide|suicidal)\b/i,
    /\bend\s+(it\s+all|my\s+life|everything)\b/i,
    /\bcan'?t\s+go\s+on\b/i,
    /\bno\s+(reason|point)\s+(to\s+live|in\s+living)/i,
  ],
  medium: [
    // Indirect expressions of hopelessness
    /\bwish\s+I\s+(wasn'?t|were\s+not)\s+(here|alive|born)/i,
    /\b(everyone|world)\s+.*\s+better\s+(off|without)\s+.*\s+me\b/i,
    /\bcan'?t\s+take\s+(it|this)\s+anymore\b/i,
    /\bfeeling\s+(hopeless|worthless|empty)\b/i,
  ],
  low: [
    // General distress indicators
    /\b(self[- ]?harm|hurting\s+myself)\b/i,
    /\bgiving\s+up\b/i,
    /\bno\s+hope\b/i,
  ],
};

// Negation patterns that indicate the text is NOT a crisis
const NEGATION_PATTERNS = [
  /\b(don'?t|do\s+not|never|no\s+longer)\s+want\s+to\s+(die|kill|hurt)/i,
  /\bnot\s+(suicidal|thinking\s+about\s+suicide)/i,
  /\b(glad|happy|grateful)\s+.*\s+(alive|here|living)/i,
  /\bused\s+to\s+(feel|think|want)/i, // Past tense indicates past, not current
  /\bif\s+I\s+(ever|was|were)/i, // Hypothetical
];

/**
 * Check if text contains negation that invalidates crisis detection
 */
function hasNegation(text: string): boolean {
  return NEGATION_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Detect crisis from journal text
 */
export function detectCrisisFromText(text: string): CrisisDetectionResult {
  if (!text || text.trim().length === 0) {
    return { detected: false, detectionMethod: 'no_text' };
  }

  const normalizedText = text.toLowerCase().trim();

  // Check for negation first
  if (hasNegation(normalizedText)) {
    return {
      detected: false,
      detectionMethod: 'negation_detected',
    };
  }

  // Check high severity patterns
  for (const pattern of CRISIS_PATTERNS.high) {
    if (pattern.test(normalizedText)) {
      return {
        detected: true,
        severity: 'high',
        triggerType: 'keyword',
        detectionMethod: 'high_severity_pattern',
      };
    }
  }

  // Check medium severity patterns
  for (const pattern of CRISIS_PATTERNS.medium) {
    if (pattern.test(normalizedText)) {
      return {
        detected: true,
        severity: 'medium',
        triggerType: 'keyword',
        detectionMethod: 'medium_severity_pattern',
      };
    }
  }

  // Check low severity patterns
  for (const pattern of CRISIS_PATTERNS.low) {
    if (pattern.test(normalizedText)) {
      return {
        detected: true,
        severity: 'low',
        triggerType: 'keyword',
        detectionMethod: 'low_severity_pattern',
      };
    }
  }

  return { detected: false, detectionMethod: 'no_crisis_patterns' };
}

/**
 * Detect crisis from metrics
 */
export function detectCrisisFromMetrics(metrics: {
  mood: number;
  stress: number;
  anxiety: number;
  energy: number;
}): CrisisDetectionResult {
  const issues: string[] = [];

  // Check for extremely low mood (1-2)
  if (metrics.mood <= 2) {
    issues.push('very_low_mood');
  }

  // Check for very high anxiety
  if (metrics.anxiety >= HIGH_ANXIETY_THRESHOLD) {
    issues.push('high_anxiety');
  }

  // Check for very high stress
  if (metrics.stress >= HIGH_STRESS_THRESHOLD) {
    issues.push('high_stress');
  }

  // Check for combination
  const lowMood = metrics.mood <= LOW_MOOD_THRESHOLD;
  const highAnxiety = metrics.anxiety >= 7;
  const highStress = metrics.stress >= 7;
  const lowEnergy = metrics.energy <= 2;

  const concerningCount = [lowMood, highAnxiety, highStress, lowEnergy].filter(Boolean).length;

  if (concerningCount >= 3 || metrics.mood <= 2) {
    return {
      detected: true,
      severity: concerningCount >= 3 ? 'medium' : 'low',
      triggerType: 'sentiment_analysis',
      detectionMethod: `metric_combination:${issues.join(',')}`,
    };
  }

  return { detected: false, detectionMethod: 'metrics_ok' };
}

/**
 * Check for low mood pattern over multiple days
 */
export async function detectLowMoodPattern(
  userId: string,
  currentMood: number
): Promise<CrisisDetectionResult> {
  if (currentMood > LOW_MOOD_THRESHOLD) {
    return { detected: false, detectionMethod: 'current_mood_ok' };
  }

  const db = admin.firestore();

  // Get recent check-ins
  const recentCheckins = await db
    .collection('users')
    .doc(userId)
    .collection('checkins')
    .orderBy('date', 'desc')
    .limit(CONSECUTIVE_LOW_DAYS)
    .get();

  if (recentCheckins.size < CONSECUTIVE_LOW_DAYS - 1) {
    // Not enough history
    return { detected: false, detectionMethod: 'insufficient_history' };
  }

  // Check if all recent check-ins have low mood
  const allLowMood = recentCheckins.docs.every((doc) => {
    const data = doc.data();
    return data.mood <= LOW_MOOD_THRESHOLD;
  });

  if (allLowMood) {
    return {
      detected: true,
      severity: 'medium',
      triggerType: 'low_mood_pattern',
      detectionMethod: `consecutive_low_mood:${CONSECUTIVE_LOW_DAYS}_days`,
    };
  }

  return { detected: false, detectionMethod: 'no_pattern' };
}

/**
 * Check if crisis was already triggered recently (cooldown)
 */
export async function hasRecentCrisisEvent(userId: string, cooldownHours: number = 24): Promise<boolean> {
  const db = admin.firestore();
  const cooldownTime = new Date(Date.now() - cooldownHours * 60 * 60 * 1000);

  const recentEvents = await db
    .collection('users')
    .doc(userId)
    .collection('crisis_events')
    .where('createdAt', '>', admin.firestore.Timestamp.fromDate(cooldownTime))
    .limit(1)
    .get();

  return !recentEvents.empty;
}

/**
 * Create crisis event in Firestore
 */
export async function createCrisisEvent(
  userId: string,
  checkinId: string,
  result: CrisisDetectionResult
): Promise<string> {
  const db = admin.firestore();

  const eventRef = await db
    .collection('users')
    .doc(userId)
    .collection('crisis_events')
    .add({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      checkinId,
      triggerType: result.triggerType,
      severity: result.severity,
      detectionMethod: result.detectionMethod,
      resourcesShown: [],
      userAcknowledged: false,
      followUpScheduled: false,
    });

  return eventRef.id;
}
