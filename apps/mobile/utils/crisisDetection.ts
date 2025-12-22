/**
 * Crisis Detection Utility
 * Detects potential crisis indicators in user input
 */

import { CRISIS_KEYWORDS } from '@mentalspace/shared';
import type { CheckinMetrics, CrisisSeverity, CrisisTriggerType } from '@mentalspace/shared';

export interface CrisisDetectionResult {
  detected: boolean;
  severity: CrisisSeverity;
  triggerType: CrisisTriggerType;
  matchedKeywords: string[];
  riskFactors: string[];
}

/**
 * Analyze text for crisis keywords
 */
export function analyzeTextForCrisis(text: string): CrisisDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      detected: false,
      severity: 'low',
      triggerType: 'keyword',
      matchedKeywords: [],
      riskFactors: [],
    };
  }

  const normalizedText = text.toLowerCase();
  const matchedKeywords: string[] = [];
  const riskFactors: string[] = [];

  // Check for high severity keywords (immediate concern)
  const highSeverityKeywords = [
    'suicide', 'suicidal', 'kill myself', 'end my life', 'end it all',
    'want to die', 'better off dead', 'no reason to live', 'self harm',
    'hurt myself', 'cutting myself', 'overdose', 'take all my pills',
  ];

  // Check for medium severity keywords (concerning patterns)
  const mediumSeverityKeywords = [
    'hopeless', 'worthless', 'no point', 'give up', 'cant go on',
    'cant take it', 'breaking point', 'falling apart', 'losing control',
    'in crisis', 'need help now', 'emergency', 'desperate', 'drowning',
  ];

  // Check for low severity keywords (early warning signs)
  const lowSeverityKeywords = [
    'overwhelmed', 'exhausted', 'burned out', 'burned-out', 'cant cope',
    'cant handle', 'too much', 'want to escape', 'running away',
    'hiding from', 'isolating', 'alone', 'nobody cares', 'no one understands',
  ];

  // Check high severity first
  for (const keyword of highSeverityKeywords) {
    if (normalizedText.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  }

  if (matchedKeywords.length > 0) {
    return {
      detected: true,
      severity: 'high',
      triggerType: 'keyword',
      matchedKeywords,
      riskFactors: ['Contains high-severity crisis language'],
    };
  }

  // Check medium severity
  for (const keyword of mediumSeverityKeywords) {
    if (normalizedText.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  }

  if (matchedKeywords.length >= 2) {
    return {
      detected: true,
      severity: 'medium',
      triggerType: 'keyword',
      matchedKeywords,
      riskFactors: ['Multiple concerning phrases detected'],
    };
  }

  if (matchedKeywords.length > 0) {
    return {
      detected: true,
      severity: 'low',
      triggerType: 'keyword',
      matchedKeywords,
      riskFactors: ['Concerning language detected'],
    };
  }

  // Check low severity
  for (const keyword of lowSeverityKeywords) {
    if (normalizedText.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  }

  if (matchedKeywords.length >= 3) {
    return {
      detected: true,
      severity: 'low',
      triggerType: 'sentiment_analysis',
      matchedKeywords,
      riskFactors: ['Multiple stress indicators detected'],
    };
  }

  return {
    detected: false,
    severity: 'low',
    triggerType: 'keyword',
    matchedKeywords,
    riskFactors: [],
  };
}

/**
 * Analyze metrics for crisis patterns
 */
export function analyzeMetricsForCrisis(metrics: CheckinMetrics): CrisisDetectionResult {
  const riskFactors: string[] = [];
  let riskScore = 0;

  // Very low mood is a strong indicator
  if (metrics.mood <= 2) {
    riskScore += 3;
    riskFactors.push('Very low mood rating');
  } else if (metrics.mood <= 4) {
    riskScore += 1;
    riskFactors.push('Low mood rating');
  }

  // Very high stress is concerning
  if (metrics.stress >= 9) {
    riskScore += 2;
    riskFactors.push('Extremely high stress');
  } else if (metrics.stress >= 7) {
    riskScore += 1;
    riskFactors.push('High stress level');
  }

  // High anxiety combined with other factors
  if (metrics.anxiety >= 8) {
    riskScore += 2;
    riskFactors.push('Very high anxiety');
  } else if (metrics.anxiety >= 6) {
    riskScore += 1;
    riskFactors.push('Elevated anxiety');
  }

  // Poor sleep affects mental health
  if (metrics.sleep <= 2) {
    riskScore += 1;
    riskFactors.push('Severely poor sleep');
  }

  // Very low energy
  if (metrics.energy <= 2) {
    riskScore += 1;
    riskFactors.push('Very low energy');
  }

  // Combination of concerning metrics
  const lowMoodHighStress = metrics.mood <= 3 && metrics.stress >= 8;
  const lowEverything = metrics.mood <= 3 && metrics.energy <= 3 && metrics.sleep <= 3;

  if (lowMoodHighStress) {
    riskScore += 2;
    riskFactors.push('Combination of low mood and high stress');
  }

  if (lowEverything) {
    riskScore += 2;
    riskFactors.push('Multiple areas of concern');
  }

  // Determine severity based on risk score
  let severity: CrisisSeverity = 'low';
  let detected = false;

  if (riskScore >= 6) {
    severity = 'high';
    detected = true;
  } else if (riskScore >= 4) {
    severity = 'medium';
    detected = true;
  } else if (riskScore >= 2) {
    severity = 'low';
    detected = true;
  }

  return {
    detected,
    severity,
    triggerType: 'low_mood_pattern',
    matchedKeywords: [],
    riskFactors,
  };
}

/**
 * Combined crisis detection
 */
export function detectCrisis(
  journalText: string | undefined,
  metrics: CheckinMetrics
): CrisisDetectionResult {
  // Analyze both text and metrics
  const textResult = journalText ? analyzeTextForCrisis(journalText) : null;
  const metricsResult = analyzeMetricsForCrisis(metrics);

  // If high severity text is detected, prioritize that
  if (textResult?.severity === 'high') {
    return textResult;
  }

  // If high severity from metrics
  if (metricsResult.severity === 'high') {
    // Combine with text results if available
    return {
      ...metricsResult,
      matchedKeywords: textResult?.matchedKeywords || [],
      riskFactors: [
        ...metricsResult.riskFactors,
        ...(textResult?.riskFactors || []),
      ],
    };
  }

  // Medium severity text
  if (textResult?.severity === 'medium') {
    // Elevate if metrics are also concerning
    if (metricsResult.detected) {
      return {
        detected: true,
        severity: 'high',
        triggerType: 'sentiment_analysis',
        matchedKeywords: textResult.matchedKeywords,
        riskFactors: [
          ...textResult.riskFactors,
          ...metricsResult.riskFactors,
          'Combined text and metric concerns',
        ],
      };
    }
    return textResult;
  }

  // Medium metrics
  if (metricsResult.severity === 'medium') {
    if (textResult?.detected) {
      return {
        detected: true,
        severity: 'medium',
        triggerType: 'sentiment_analysis',
        matchedKeywords: textResult.matchedKeywords,
        riskFactors: [
          ...metricsResult.riskFactors,
          ...textResult.riskFactors,
        ],
      };
    }
    return metricsResult;
  }

  // Low severity - return whichever is detected
  if (textResult?.detected) {
    return textResult;
  }

  if (metricsResult.detected) {
    return metricsResult;
  }

  // No crisis detected
  return {
    detected: false,
    severity: 'low',
    triggerType: 'keyword',
    matchedKeywords: [],
    riskFactors: [],
  };
}

/**
 * Get appropriate response based on severity
 */
export function getCrisisResponse(severity: CrisisSeverity): {
  title: string;
  message: string;
  showResources: boolean;
  showEmergency: boolean;
} {
  switch (severity) {
    case 'high':
      return {
        title: 'We\'re Here for You',
        message:
          'It sounds like you\'re going through a really difficult time. You don\'t have to face this alone. Please consider reaching out to someone who can help.',
        showResources: true,
        showEmergency: true,
      };
    case 'medium':
      return {
        title: 'We Notice You\'re Struggling',
        message:
          'It looks like things are tough right now. Remember, it\'s okay to ask for help. Here are some resources that might help.',
        showResources: true,
        showEmergency: false,
      };
    case 'low':
      return {
        title: 'Checking In',
        message:
          'We noticed some signs that you might be having a hard time. Would you like to explore some support resources?',
        showResources: true,
        showEmergency: false,
      };
  }
}
