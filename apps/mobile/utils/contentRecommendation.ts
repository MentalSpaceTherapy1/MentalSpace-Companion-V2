/**
 * Content Recommendation Engine
 * Intelligent content recommendations based on user state, time of day, and weekly focus
 */

import { ContentItem, ContentCategory, contentLibrary } from '../data/contentLibrary';
import type { Checkin } from '@mentalspace/shared';

export interface UserState {
  recentCheckin?: Checkin;
  weeklyFocus?: string;
  viewHistory?: string[];
  favorites?: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
}

export interface RecommendedContent {
  item: ContentItem;
  reason: string;
  score: number;
}

/**
 * Get the current time of day
 */
export const getCurrentTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
};

/**
 * Determine primary need based on check-in metrics
 */
const determinePrimaryNeed = (checkin?: Checkin): ContentCategory | null => {
  if (!checkin) return null;

  const { mood, stress, sleep, energy, focus, anxiety } = checkin;

  // Prioritize critical needs
  if (stress >= 8) return 'stress';
  if (anxiety >= 8) return 'anxiety';
  if (sleep <= 3) return 'sleep';

  // Identify biggest opportunity area
  const needScores = [
    { category: 'stress' as ContentCategory, score: stress },
    { category: 'anxiety' as ContentCategory, score: anxiety },
    { category: 'sleep' as ContentCategory, score: 10 - sleep }, // Invert sleep (lower is worse)
    { category: 'energy' as ContentCategory, score: 10 - energy }, // Invert energy
    { category: 'focus' as ContentCategory, score: 10 - focus }, // Invert focus
  ];

  // Find highest need
  needScores.sort((a, b) => b.score - a.score);
  return needScores[0].category;
};

/**
 * Map weekly focus to content category
 */
const mapWeeklyFocusToCategory = (focus?: string): ContentCategory | null => {
  if (!focus) return null;

  const focusMap: Record<string, ContentCategory> = {
    'reduce-stress': 'stress',
    'improve-sleep': 'sleep',
    'manage-anxiety': 'anxiety',
    'boost-energy': 'energy',
    'increase-focus': 'focus',
    'practice-mindfulness': 'mindfulness',
    'strengthen-connections': 'connection',
    'build-coping-skills': 'coping',
  };

  return focusMap[focus] || null;
};

/**
 * Calculate content score based on user state
 */
const scoreContent = (
  content: ContentItem,
  userState: UserState
): { score: number; reasons: string[] } => {
  let score = 50; // Base score
  const reasons: string[] = [];

  const {
    recentCheckin,
    weeklyFocus,
    viewHistory = [],
    favorites = [],
    timeOfDay = getCurrentTimeOfDay(),
  } = userState;

  // 1. Time of day match (0-15 points)
  if (content.timeOfDay === timeOfDay) {
    score += 15;
    reasons.push(`Perfect for ${timeOfDay}`);
  } else if (content.timeOfDay === 'anytime') {
    score += 8;
  }

  // 2. Weekly focus alignment (0-25 points)
  const focusCategory = mapWeeklyFocusToCategory(weeklyFocus);
  if (focusCategory && content.category === focusCategory) {
    score += 25;
    reasons.push('Aligns with your weekly focus');
  }

  // 3. Current need based on check-in (0-30 points)
  const primaryNeed = determinePrimaryNeed(recentCheckin);
  if (primaryNeed && content.category === primaryNeed) {
    score += 30;

    // Add specific reasons based on metrics
    if (recentCheckin) {
      if (primaryNeed === 'stress' && recentCheckin.stress >= 7) {
        reasons.push('Your stress levels are elevated');
      } else if (primaryNeed === 'anxiety' && recentCheckin.anxiety >= 7) {
        reasons.push('May help with anxiety you\'re experiencing');
      } else if (primaryNeed === 'sleep' && recentCheckin.sleep <= 5) {
        reasons.push('Your sleep could use some support');
      } else if (primaryNeed === 'energy' && recentCheckin.energy <= 5) {
        reasons.push('Could help boost your energy');
      } else if (primaryNeed === 'focus' && recentCheckin.focus <= 5) {
        reasons.push('Improve your concentration');
      }
    }
  }

  // 4. Time-specific recommendations based on check-in
  if (recentCheckin && timeOfDay === 'morning') {
    // Morning - energizing content for low energy
    if (recentCheckin.energy <= 5 && content.intensity === 'energizing') {
      score += 15;
      reasons.push('Energizing start to your day');
    }
  } else if (recentCheckin && timeOfDay === 'afternoon') {
    // Afternoon - focus and stress management
    if (recentCheckin.stress >= 6 && content.category === 'stress') {
      score += 15;
      reasons.push('Midday stress relief');
    }
    if (recentCheckin.focus <= 5 && content.category === 'focus') {
      score += 15;
      reasons.push('Afternoon concentration boost');
    }
  } else if (recentCheckin && timeOfDay === 'evening') {
    // Evening - calming and sleep preparation
    if (recentCheckin.sleep <= 6 && content.category === 'sleep') {
      score += 20;
      reasons.push('Prepare for better sleep tonight');
    }
    if (content.intensity === 'gentle') {
      score += 10;
      reasons.push('Wind down for the evening');
    }
  }

  // 5. Freshness bonus (0-20 points for unseen content)
  if (!viewHistory.includes(content.id)) {
    score += 20;
    reasons.push('New to you');
  } else if (favorites.includes(content.id)) {
    score += 15;
    reasons.push('One of your favorites');
  } else {
    // Penalize recently viewed content
    const viewIndex = viewHistory.indexOf(content.id);
    if (viewIndex < 5) {
      score -= 15; // Recently viewed
    } else if (viewIndex < 15) {
      score -= 5; // Viewed somewhat recently
    }
  }

  // 6. Duration appropriateness (0-10 points)
  if (timeOfDay === 'morning' && content.duration <= 10) {
    score += 10;
    reasons.push('Quick morning practice');
  } else if (timeOfDay === 'afternoon' && content.duration <= 15) {
    score += 8;
  } else if (timeOfDay === 'evening' && content.duration >= 10) {
    score += 10;
    reasons.push('Deep evening practice');
  }

  // 7. Content type variety
  // Prefer different types to avoid monotony
  const recentTypes = viewHistory
    .slice(0, 5)
    .map(id => contentLibrary.find(c => c.id === id)?.type)
    .filter(Boolean);

  const typeCount = recentTypes.filter(t => t === content.type).length;
  if (typeCount === 0) {
    score += 5;
    reasons.push('Try a different format');
  } else if (typeCount >= 3) {
    score -= 5;
  }

  return { score, reasons };
};

/**
 * Get personalized content recommendations
 */
export const getRecommendations = (
  userState: UserState,
  limit: number = 6
): RecommendedContent[] => {
  const recommendations: RecommendedContent[] = [];

  // Score all content
  for (const item of contentLibrary) {
    const { score, reasons } = scoreContent(item, userState);

    recommendations.push({
      item,
      reason: reasons[0] || 'Recommended for you',
      score,
    });
  }

  // Sort by score (highest first)
  recommendations.sort((a, b) => b.score - a.score);

  // Return top recommendations
  return recommendations.slice(0, limit);
};

/**
 * Get category-specific recommendations
 */
export const getRecommendationsByCategory = (
  category: ContentCategory,
  userState: UserState,
  limit: number = 4
): RecommendedContent[] => {
  const categoryContent = contentLibrary.filter(item => item.category === category);
  const recommendations: RecommendedContent[] = [];

  for (const item of categoryContent) {
    const { score, reasons } = scoreContent(item, userState);

    recommendations.push({
      item,
      reason: reasons[0] || `Top ${category} resource`,
      score,
    });
  }

  recommendations.sort((a, b) => b.score - a.score);
  return recommendations.slice(0, limit);
};

/**
 * Get "For You Today" main recommendations
 */
export const getForYouToday = (userState: UserState): RecommendedContent[] => {
  const timeOfDay = getCurrentTimeOfDay();
  const recommendations = getRecommendations(
    { ...userState, timeOfDay },
    3 // Top 3 for hero section
  );

  // Ensure variety in top 3
  const types = new Set<string>();
  const diverse: RecommendedContent[] = [];

  for (const rec of recommendations) {
    if (diverse.length < 3 && !types.has(rec.item.type)) {
      types.add(rec.item.type);
      diverse.push(rec);
    }
  }

  // Fill remaining slots if needed
  while (diverse.length < 3 && recommendations.length > diverse.length) {
    const next = recommendations.find(r => !diverse.includes(r));
    if (next) diverse.push(next);
  }

  return diverse;
};

/**
 * Get quick relief content (5 minutes or less)
 */
export const getQuickRelief = (userState: UserState): RecommendedContent[] => {
  const quickContent = contentLibrary.filter(item => item.duration <= 5);
  const recommendations: RecommendedContent[] = [];

  for (const item of quickContent) {
    const { score, reasons } = scoreContent(item, userState);
    recommendations.push({
      item,
      reason: reasons[0] || 'Quick relief',
      score,
    });
  }

  recommendations.sort((a, b) => b.score - a.score);
  return recommendations.slice(0, 3);
};

/**
 * Get evening wind-down content
 */
export const getEveningWindDown = (userState: UserState): RecommendedContent[] => {
  const eveningContent = contentLibrary.filter(
    item => item.timeOfDay === 'evening' ||
           (item.timeOfDay === 'anytime' && item.intensity === 'gentle')
  );

  const recommendations: RecommendedContent[] = [];

  for (const item of eveningContent) {
    const { score, reasons } = scoreContent(item, userState);
    recommendations.push({
      item,
      reason: reasons[0] || 'Wind down for the evening',
      score,
    });
  }

  recommendations.sort((a, b) => b.score - a.score);
  return recommendations.slice(0, 3);
};

/**
 * Get morning energizer content
 */
export const getMorningEnergizers = (userState: UserState): RecommendedContent[] => {
  const morningContent = contentLibrary.filter(
    item => item.timeOfDay === 'morning' ||
           (item.timeOfDay === 'anytime' && item.intensity === 'energizing')
  );

  const recommendations: RecommendedContent[] = [];

  for (const item of morningContent) {
    const { score, reasons } = scoreContent(item, userState);
    recommendations.push({
      item,
      reason: reasons[0] || 'Start your day right',
      score,
    });
  }

  recommendations.sort((a, b) => b.score - a.score);
  return recommendations.slice(0, 3);
};

/**
 * Get content similar to a given item
 */
export const getSimilarContent = (
  contentId: string,
  limit: number = 3
): ContentItem[] => {
  const baseItem = contentLibrary.find(item => item.id === contentId);
  if (!baseItem) return [];

  const similar = contentLibrary
    .filter(item => item.id !== contentId)
    .map(item => {
      let score = 0;

      // Same category gets highest score
      if (item.category === baseItem.category) score += 30;

      // Shared tags
      const sharedTags = item.tags.filter(tag => baseItem.tags.includes(tag));
      score += sharedTags.length * 10;

      // Same type
      if (item.type === baseItem.type) score += 15;

      // Similar duration
      const durationDiff = Math.abs(item.duration - baseItem.duration);
      if (durationDiff <= 2) score += 10;
      else if (durationDiff <= 5) score += 5;

      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);

  return similar;
};
