/**
 * MentalSpace Companion - Shared Constants
 * Centralized configuration values used across all packages
 */

import type {
  MetricConfig,
  CrisisResource,
  OnboardingReason,
  SOSProtocol,
  ActionTemplate,
  CareGoal,
  TherapyStatus,
  MentalStateLevel,
  SupportStyle,
  ExerciseFrequency,
  SocialSupportLevel,
  WeeklyFocusArea,
  TelehealthAppointmentType,
  TelehealthUrgency,
  USState,
  InsuranceProvider,
} from '../types';

// ============================================================================
// Metric Configuration
// ============================================================================

export const METRIC_MIN = 1;
export const METRIC_MAX = 10;
export const METRIC_DEFAULT = 5;

export const METRICS: Record<string, MetricConfig> = {
  mood: {
    key: 'mood',
    label: 'Mood',
    description: 'How are you feeling emotionally?',
    icon: 'smile',
    lowLabel: 'Very Low',
    highLabel: 'Excellent',
    invertedScale: false,
  },
  stress: {
    key: 'stress',
    label: 'Stress',
    description: 'How stressed are you feeling?',
    icon: 'zap',
    lowLabel: 'Calm',
    highLabel: 'Very Stressed',
    invertedScale: true,
  },
  sleep: {
    key: 'sleep',
    label: 'Sleep Quality',
    description: 'How well did you sleep last night?',
    icon: 'moon',
    lowLabel: 'Poor',
    highLabel: 'Excellent',
    invertedScale: false,
  },
  energy: {
    key: 'energy',
    label: 'Energy',
    description: 'How energetic do you feel?',
    icon: 'battery',
    lowLabel: 'Exhausted',
    highLabel: 'Energized',
    invertedScale: false,
  },
  focus: {
    key: 'focus',
    label: 'Focus',
    description: 'How focused and clear is your mind?',
    icon: 'target',
    lowLabel: 'Scattered',
    highLabel: 'Sharp',
    invertedScale: false,
  },
  anxiety: {
    key: 'anxiety',
    label: 'Anxiety',
    description: 'How anxious are you feeling?',
    icon: 'activity',
    lowLabel: 'Calm',
    highLabel: 'Very Anxious',
    invertedScale: true,
  },
} as const;

export const METRIC_ORDER: (keyof typeof METRICS)[] = [
  'mood',
  'stress',
  'sleep',
  'energy',
  'focus',
  'anxiety',
];

// ============================================================================
// Care Preferences Configuration (New for MVP 2.0)
// ============================================================================

export const MENTAL_STATE_OPTIONS: { id: MentalStateLevel; label: string; description: string; icon: string }[] = [
  { id: 'thriving', label: 'Thriving', description: 'Doing well, want to maintain my progress', icon: 'sunny' },
  { id: 'managing', label: 'Managing', description: 'Generally okay, dealing with some challenges', icon: 'partly-sunny' },
  { id: 'struggling', label: 'Struggling', description: 'Having difficulty, need extra support', icon: 'cloudy' },
  { id: 'crisis', label: 'In Crisis', description: 'Need immediate help and support', icon: 'alert-circle' },
];

export const THERAPY_STATUS_OPTIONS: { id: TherapyStatus; label: string }[] = [
  { id: 'currently_in_therapy', label: 'Currently seeing a therapist' },
  { id: 'looking_for_therapist', label: 'Looking for a therapist' },
  { id: 'between_therapists', label: 'Between therapists' },
  { id: 'not_in_therapy', label: 'Not currently in therapy' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const CARE_GOAL_OPTIONS: { id: CareGoal; label: string; icon: string }[] = [
  { id: 'reduce_anxiety', label: 'Reduce Anxiety', icon: 'pulse' },
  { id: 'manage_depression', label: 'Manage Depression', icon: 'cloudy-night' },
  { id: 'improve_sleep', label: 'Improve Sleep', icon: 'moon' },
  { id: 'reduce_stress', label: 'Reduce Stress', icon: 'flash' },
  { id: 'build_resilience', label: 'Build Resilience', icon: 'shield-checkmark' },
  { id: 'improve_relationships', label: 'Improve Relationships', icon: 'people' },
  { id: 'increase_mindfulness', label: 'Practice Mindfulness', icon: 'leaf' },
  { id: 'manage_anger', label: 'Manage Anger', icon: 'flame' },
  { id: 'boost_confidence', label: 'Boost Confidence', icon: 'star' },
  { id: 'process_trauma', label: 'Process Trauma', icon: 'heart' },
  { id: 'grief_support', label: 'Grief Support', icon: 'flower' },
  { id: 'work_life_balance', label: 'Work-Life Balance', icon: 'briefcase' },
];

export const SUPPORT_STYLE_OPTIONS: { id: SupportStyle; label: string; description: string }[] = [
  { id: 'gentle_encouragement', label: 'Gentle & Nurturing', description: 'Soft, supportive guidance with lots of encouragement' },
  { id: 'direct_coaching', label: 'Direct & Action-Oriented', description: 'Clear instructions with practical steps' },
  { id: 'reflective_listening', label: 'Empathetic & Validating', description: 'Focus on understanding and validating feelings' },
  { id: 'structured_guidance', label: 'Structured & Methodical', description: 'Step-by-step instructions with clear framework' },
];

export const EXERCISE_FREQUENCY_OPTIONS: { id: ExerciseFrequency; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'several_times_week', label: 'Several times a week' },
  { id: 'once_week', label: 'About once a week' },
  { id: 'rarely', label: 'Rarely' },
  { id: 'never', label: 'Never' },
];

export const SOCIAL_SUPPORT_OPTIONS: { id: SocialSupportLevel; label: string; description: string }[] = [
  { id: 'strong', label: 'Strong Support', description: 'I have people I can rely on' },
  { id: 'moderate', label: 'Some Support', description: 'I have a few people to turn to' },
  { id: 'limited', label: 'Limited Support', description: 'I don\'t have many people to talk to' },
  { id: 'isolated', label: 'Feeling Isolated', description: 'I feel alone most of the time' },
];

export const TRIGGER_TOPIC_OPTIONS: string[] = [
  'Death/dying',
  'Self-harm',
  'Abuse',
  'Violence',
  'Eating disorders',
  'Substance use',
  'Sexual content',
  'Discrimination',
  'War/conflict',
  'Natural disasters',
];

export const COPING_STRATEGY_OPTIONS: string[] = [
  'Deep breathing',
  'Meditation',
  'Exercise',
  'Journaling',
  'Talking to friends/family',
  'Music',
  'Art/creativity',
  'Nature walks',
  'Reading',
  'Prayer/spirituality',
  'Hot bath/shower',
  'Comfort food',
  'Sleep',
  'Distraction activities',
];

export const MIN_CARE_GOALS = 1;
export const MAX_CARE_GOALS = 5;

// ============================================================================
// SOS Protocols (New for MVP 2.0)
// ============================================================================

export const SOS_PROTOCOLS: SOSProtocol[] = [
  {
    id: 'overwhelm',
    title: "I'm Overwhelmed",
    subtitle: 'Feeling like everything is too much',
    icon: 'water',
    color: '#38B6E0',
    escalationThreshold: 6,
    resources: ['988', 'crisis-text'],
    steps: [
      {
        id: 'overwhelm-1',
        type: 'breathing',
        title: 'Pause and Breathe',
        instruction: 'Let\'s slow things down together. Follow the circle as it expands and contracts.',
        duration: 60,
        media: { type: 'animation', animationType: 'breathing' },
      },
      {
        id: 'overwhelm-2',
        type: 'grounding',
        title: '5-4-3-2-1 Grounding',
        instruction: 'Name 5 things you can see around you right now.',
        interactive: { type: 'tap', targetCount: 5 },
      },
      {
        id: 'overwhelm-3',
        type: 'grounding',
        title: 'Touch & Feel',
        instruction: 'Name 4 things you can touch or feel.',
        interactive: { type: 'tap', targetCount: 4 },
      },
      {
        id: 'overwhelm-4',
        type: 'grounding',
        title: 'Listen',
        instruction: 'Name 3 things you can hear.',
        interactive: { type: 'tap', targetCount: 3 },
      },
      {
        id: 'overwhelm-5',
        type: 'grounding',
        title: 'Smell',
        instruction: 'Name 2 things you can smell.',
        interactive: { type: 'tap', targetCount: 2 },
      },
      {
        id: 'overwhelm-6',
        type: 'grounding',
        title: 'Taste',
        instruction: 'Name 1 thing you can taste.',
        interactive: { type: 'tap', targetCount: 1 },
      },
      {
        id: 'overwhelm-7',
        type: 'affirmation',
        title: 'You Are Here',
        instruction: 'You are safe in this moment. You don\'t have to solve everything right now. Just this breath, just this moment.',
      },
      {
        id: 'overwhelm-8',
        type: 'reflection',
        title: 'One Small Step',
        instruction: 'What is ONE small thing you can do in the next 5 minutes? Just one.',
      },
    ],
  },
  {
    id: 'panic',
    title: "I'm Having a Panic Attack",
    subtitle: 'Heart racing, can\'t breathe',
    icon: 'pulse',
    color: '#E85A5A',
    escalationThreshold: 5,
    resources: ['988', 'crisis-text'],
    steps: [
      {
        id: 'panic-1',
        type: 'affirmation',
        title: 'You Are Safe',
        instruction: 'This is a panic attack. It feels scary but it WILL pass. You are not in danger. Your body is just reacting to stress.',
      },
      {
        id: 'panic-2',
        type: 'breathing',
        title: 'Box Breathing',
        instruction: 'Breathe in for 4 counts, hold for 4, out for 4, hold for 4. Let\'s do this together.',
        duration: 120,
        media: { type: 'animation', animationType: 'breathing' },
      },
      {
        id: 'panic-3',
        type: 'grounding',
        title: 'Cold Water',
        instruction: 'If possible, put cold water on your wrists or hold something cold. This activates your dive reflex and slows your heart.',
      },
      {
        id: 'panic-4',
        type: 'movement',
        title: 'Feet on the Ground',
        instruction: 'Press your feet firmly into the floor. Feel the solid ground beneath you. You are supported.',
      },
      {
        id: 'panic-5',
        type: 'affirmation',
        title: 'This Will Pass',
        instruction: 'Panic attacks peak within 10 minutes and then fade. You\'ve survived every panic attack you\'ve ever had. You will survive this one too.',
      },
      {
        id: 'panic-6',
        type: 'breathing',
        title: 'Slow Exhale',
        instruction: 'Now focus on making your exhale longer than your inhale. In for 4, out for 6.',
        duration: 90,
        media: { type: 'animation', animationType: 'breathing' },
      },
    ],
  },
  {
    id: 'anger',
    title: "I'm Really Angry",
    subtitle: 'Feeling rage or intense frustration',
    icon: 'flame',
    color: '#F59E0B',
    escalationThreshold: 7,
    resources: ['crisis-text'],
    steps: [
      {
        id: 'anger-1',
        type: 'affirmation',
        title: 'Anger is Valid',
        instruction: 'Your anger is trying to tell you something. It\'s okay to feel this. Let\'s find a safe way to process it.',
      },
      {
        id: 'anger-2',
        type: 'movement',
        title: 'Physical Release',
        instruction: 'Squeeze your fists as tight as you can for 10 seconds... then release. Feel the tension leaving your body.',
        duration: 15,
        interactive: { type: 'hold', duration: 10 },
      },
      {
        id: 'anger-3',
        type: 'breathing',
        title: 'Cooling Breath',
        instruction: 'Breathe in through your nose, out through your mouth like you\'re blowing through a straw. This cools your system.',
        duration: 60,
        media: { type: 'animation', animationType: 'breathing' },
      },
      {
        id: 'anger-4',
        type: 'movement',
        title: 'Shake It Out',
        instruction: 'Stand up and shake your hands, arms, and body for 30 seconds. Let the tension move through and out.',
        duration: 30,
      },
      {
        id: 'anger-5',
        type: 'grounding',
        title: 'Cold Splash',
        instruction: 'If you can, splash cold water on your face. This triggers your parasympathetic nervous system.',
      },
      {
        id: 'anger-6',
        type: 'reflection',
        title: 'Name It',
        instruction: 'What triggered this anger? Can you name it in one sentence?',
      },
      {
        id: 'anger-7',
        type: 'affirmation',
        title: 'Respond, Don\'t React',
        instruction: 'You have power over your actions. Taking time to cool down isn\'t weakness - it\'s wisdom.',
      },
    ],
  },
  {
    id: 'cant_sleep',
    title: "I Can't Sleep",
    subtitle: 'Mind racing, can\'t relax',
    icon: 'moon',
    color: '#8B5CF6',
    escalationThreshold: 8,
    resources: ['crisis-text'],
    steps: [
      {
        id: 'sleep-1',
        type: 'affirmation',
        title: 'Let Go of Sleep',
        instruction: 'First, let\'s take the pressure off. Rest is still valuable even if you don\'t fall asleep.',
      },
      {
        id: 'sleep-2',
        type: 'breathing',
        title: '4-7-8 Breathing',
        instruction: 'Breathe in for 4 counts, hold for 7, exhale slowly for 8. This activates your rest response.',
        duration: 120,
        media: { type: 'animation', animationType: 'breathing' },
      },
      {
        id: 'sleep-3',
        type: 'movement',
        title: 'Progressive Relaxation',
        instruction: 'Starting with your toes, tense each muscle group for 5 seconds, then release. Move up through your body.',
        duration: 180,
      },
      {
        id: 'sleep-4',
        type: 'grounding',
        title: 'Body Scan',
        instruction: 'Notice where your body touches the bed. Feel the weight of your body being supported.',
      },
      {
        id: 'sleep-5',
        type: 'reflection',
        title: 'Mind Dump',
        instruction: 'If thoughts are racing, write them down. Get them out of your head and onto paper.',
      },
      {
        id: 'sleep-6',
        type: 'audio',
        title: 'Calming Sounds',
        instruction: 'Close your eyes and listen to calming sounds. Don\'t try to sleep - just rest.',
        media: { type: 'audio' },
      },
      {
        id: 'sleep-7',
        type: 'affirmation',
        title: 'Safe & Cozy',
        instruction: 'You are safe. Tomorrow will come whether you sleep or not. For now, just rest.',
      },
    ],
  },
  {
    id: 'struggling',
    title: "I'm Struggling",
    subtitle: 'Need help but not sure where to start',
    icon: 'heart',
    color: '#22A267',
    escalationThreshold: 4,
    resources: ['988', 'crisis-text', 'samhsa'],
    steps: [
      {
        id: 'struggling-1',
        type: 'affirmation',
        title: 'You Reached Out',
        instruction: 'Asking for help takes courage. You\'re already doing something brave by being here.',
      },
      {
        id: 'struggling-2',
        type: 'breathing',
        title: 'Gentle Breathing',
        instruction: 'Let\'s take a few slow breaths together. There\'s no rush.',
        duration: 60,
        media: { type: 'animation', animationType: 'breathing' },
      },
      {
        id: 'struggling-3',
        type: 'affirmation',
        title: 'You Matter',
        instruction: 'Whatever you\'re going through, your feelings are valid. You deserve support and care.',
      },
      {
        id: 'struggling-4',
        type: 'contact',
        title: 'Reach Out',
        instruction: 'Is there someone you trust who you could talk to right now? Even a text message counts.',
      },
      {
        id: 'struggling-5',
        type: 'reflection',
        title: 'What Do You Need?',
        instruction: 'Right now, in this moment - what would help you feel even a tiny bit better?',
      },
      {
        id: 'struggling-6',
        type: 'affirmation',
        title: 'One Moment at a Time',
        instruction: 'You don\'t have to figure everything out. Just get through the next hour. That\'s enough.',
      },
    ],
  },
];

export const SOS_BUTTON_VISIBLE_ALWAYS = true;
export const SOS_SESSION_TIMEOUT_MINUTES = 30;

// ============================================================================
// Weekly Focus Configuration (New for MVP 2.0)
// ============================================================================

export const WEEKLY_FOCUS_OPTIONS: { id: WeeklyFocusArea; label: string; title: string; description: string; icon: string; color: string }[] = [
  { id: 'stress_relief', label: 'Stress Relief', title: 'Stress Relief', description: 'Focus on reducing daily stress', icon: 'flash-off', color: '#38B6E0' },
  { id: 'sleep_hygiene', label: 'Better Sleep', title: 'Better Sleep', description: 'Improve your sleep quality', icon: 'moon', color: '#6366F1' },
  { id: 'mindfulness', label: 'Mindfulness', title: 'Mindfulness', description: 'Stay present and aware', icon: 'leaf', color: '#22A267' },
  { id: 'physical_wellness', label: 'Physical Wellness', title: 'Physical Wellness', description: 'Move your body regularly', icon: 'fitness', color: '#F59E0B' },
  { id: 'social_connection', label: 'Social Connection', title: 'Social Connection', description: 'Strengthen relationships', icon: 'people', color: '#EC4899' },
  { id: 'emotional_processing', label: 'Emotional Processing', title: 'Emotional Processing', description: 'Work through feelings', icon: 'heart', color: '#EF4444' },
  { id: 'self_compassion', label: 'Self-Compassion', title: 'Self-Compassion', description: 'Be kinder to yourself', icon: 'flower', color: '#A855F7' },
  { id: 'productivity', label: 'Productivity', title: 'Productivity', description: 'Get things done mindfully', icon: 'checkmark-done', color: '#14B8A6' },
  { id: 'creativity', label: 'Creativity', title: 'Creativity', description: 'Express yourself', icon: 'color-palette', color: '#F97316' },
  { id: 'gratitude', label: 'Gratitude', title: 'Gratitude', description: 'Notice the good things', icon: 'sunny', color: '#FCD34D' },
];

export const WEEKLY_MICRO_GOALS: Record<WeeklyFocusArea, string[]> = {
  stress_relief: [
    'Take 3 deep breaths before starting work',
    'Do a 5-minute stretch break',
    'Take a 10-minute walk outside',
    'Practice the 4-7-8 breathing technique',
    'Listen to calming music for 10 minutes',
    'Do a body scan meditation',
    'Spend time in nature',
  ],
  sleep_hygiene: [
    'No screens 30 minutes before bed',
    'Go to bed at the same time tonight',
    'Create a calming bedtime routine',
    'Make your bedroom darker',
    'Avoid caffeine after 2pm',
    'Do relaxation exercises before sleep',
    'Keep your bedroom cool',
  ],
  mindfulness: [
    'Do a 5-minute meditation',
    'Eat one meal mindfully',
    'Take a mindful walk',
    'Practice gratitude journaling',
    'Do a body awareness check-in',
    'Practice single-tasking for 30 minutes',
    'Notice 5 things you\'re grateful for',
  ],
  physical_wellness: [
    'Take a 15-minute walk',
    'Do 10 minutes of stretching',
    'Drink 8 glasses of water',
    'Eat a nutritious breakfast',
    'Take the stairs instead of elevator',
    'Do a quick home workout',
    'Get some sunlight in the morning',
  ],
  social_connection: [
    'Send a message to a friend',
    'Call a family member',
    'Have a meaningful conversation',
    'Help someone with something',
    'Express appreciation to someone',
    'Plan a social activity',
    'Reach out to someone you miss',
  ],
  emotional_processing: [
    'Write in your journal',
    'Name your emotions',
    'Talk about your feelings',
    'Create art to express yourself',
    'Allow yourself to feel without judgment',
    'Practice self-validation',
    'Reflect on what triggered your emotions',
  ],
  self_compassion: [
    'Speak kindly to yourself',
    'Take a break without guilt',
    'Forgive yourself for a mistake',
    'Celebrate a small win',
    'Give yourself permission to rest',
    'Practice a self-compassion meditation',
    'Write yourself an encouraging note',
  ],
  productivity: [
    'Complete your most important task first',
    'Take regular breaks (Pomodoro technique)',
    'Clear your workspace',
    'Review and plan your day',
    'Single-task for a focused period',
    'Minimize distractions for 1 hour',
    'Celebrate completing tasks',
  ],
  creativity: [
    'Doodle or sketch something',
    'Write freely for 10 minutes',
    'Try a new recipe',
    'Listen to new music',
    'Take photos of interesting things',
    'Rearrange something in your space',
    'Start a creative project',
  ],
  gratitude: [
    'List 3 things you\'re grateful for',
    'Thank someone sincerely',
    'Notice beauty around you',
    'Appreciate your body',
    'Reflect on a positive memory',
    'Find something good in a challenge',
    'Share something you appreciate',
  ],
};

// ============================================================================
// Journal Configuration
// ============================================================================

export const JOURNAL_MAX_LENGTH = 2000;
export const JOURNAL_MIN_LENGTH = 0;
export const VOICE_NOTE_MAX_DURATION_SECONDS = 180; // 3 minutes

// ============================================================================
// Action Plan Configuration
// ============================================================================

export const ACTIONS_PER_PLAN = 3;
export const ACTION_CATEGORIES = ['coping', 'lifestyle', 'connection'] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  coping: 'Coping Strategy',
  lifestyle: 'Lifestyle Action',
  connection: 'Social Connection',
};

export const CATEGORY_COLORS: Record<string, string> = {
  coping: '#8B5CF6', // Purple
  lifestyle: '#22A267', // Green (brand)
  connection: '#F59E0B', // Amber
};

export const CATEGORY_ICONS: Record<string, string> = {
  coping: 'heart',
  lifestyle: 'leaf',
  connection: 'people',
};

// ============================================================================
// Action Library (100+ Actions)
// ============================================================================

export const ACTION_LIBRARY: ActionTemplate[] = [
  // COPING STRATEGIES (40+)
  // Breathing exercises
  {
    id: 'breathing-478',
    title: '4-7-8 Breathing Exercise',
    description: 'Calming breath technique to reduce anxiety',
    longDescription: 'Breathe in for 4 seconds, hold for 7 seconds, exhale slowly for 8 seconds. Repeat 4 times. This technique activates your parasympathetic nervous system.',
    category: 'coping',
    duration: 5,
    targetMetrics: [{ metric: 'anxiety', condition: 'high', threshold: 6 }, { metric: 'stress', condition: 'high', threshold: 6 }],
    focusModules: ['stress_relief', 'mindfulness'],
    difficulty: 'easy',
    isActive: true,
    tags: ['breathing', 'anxiety', 'quick'],
    steps: ['Find a comfortable position', 'Breathe in through your nose for 4 counts', 'Hold your breath for 7 counts', 'Exhale through your mouth for 8 counts', 'Repeat 4 times'],
  },
  {
    id: 'breathing-box',
    title: 'Box Breathing',
    description: 'Navy SEAL technique for calm and focus',
    category: 'coping',
    duration: 5,
    targetMetrics: [{ metric: 'stress', condition: 'high', threshold: 6 }],
    focusModules: ['stress_relief'],
    difficulty: 'easy',
    isActive: true,
    tags: ['breathing', 'focus'],
  },
  {
    id: 'breathing-diaphragmatic',
    title: 'Belly Breathing',
    description: 'Deep diaphragmatic breathing for relaxation',
    category: 'coping',
    duration: 10,
    targetMetrics: [{ metric: 'anxiety', condition: 'high', threshold: 5 }],
    focusModules: ['stress_relief'],
    difficulty: 'easy',
    isActive: true,
    tags: ['breathing', 'relaxation'],
  },

  // Grounding techniques
  {
    id: 'grounding-54321',
    title: '5-4-3-2-1 Grounding',
    description: 'Use your senses to anchor to the present',
    longDescription: 'Name 5 things you see, 4 things you can touch, 3 things you hear, 2 things you smell, and 1 thing you taste.',
    category: 'coping',
    duration: 5,
    targetMetrics: [{ metric: 'anxiety', condition: 'high', threshold: 7 }],
    focusModules: ['mindfulness'],
    difficulty: 'easy',
    isActive: true,
    tags: ['grounding', 'anxiety', 'present'],
  },
  {
    id: 'grounding-cold-water',
    title: 'Cold Water Reset',
    description: 'Use cold water to activate calm response',
    category: 'coping',
    duration: 2,
    targetMetrics: [{ metric: 'anxiety', condition: 'high', threshold: 8 }],
    focusModules: ['stress_relief'],
    difficulty: 'easy',
    isActive: true,
    tags: ['grounding', 'panic'],
  },
  {
    id: 'grounding-feet',
    title: 'Feet on the Ground',
    description: 'Feel your connection to the earth',
    category: 'coping',
    duration: 3,
    targetMetrics: [{ metric: 'anxiety', condition: 'high', threshold: 6 }],
    focusModules: ['mindfulness'],
    difficulty: 'easy',
    isActive: true,
    tags: ['grounding'],
  },

  // Mindfulness
  {
    id: 'mindfulness-body-scan',
    title: 'Body Scan Meditation',
    description: 'Bring awareness to each part of your body',
    category: 'coping',
    duration: 15,
    targetMetrics: [{ metric: 'stress', condition: 'high', threshold: 5 }, { metric: 'anxiety', condition: 'high', threshold: 5 }],
    focusModules: ['mindfulness'],
    difficulty: 'medium',
    isActive: true,
    tags: ['meditation', 'relaxation'],
  },
  {
    id: 'mindfulness-5min',
    title: '5-Minute Meditation',
    description: 'Quick mindfulness break',
    category: 'coping',
    duration: 5,
    targetMetrics: [{ metric: 'focus', condition: 'low', threshold: 5 }],
    focusModules: ['mindfulness'],
    difficulty: 'easy',
    isActive: true,
    tags: ['meditation', 'quick'],
  },
  {
    id: 'mindfulness-loving-kindness',
    title: 'Loving-Kindness Meditation',
    description: 'Send compassion to yourself and others',
    category: 'coping',
    duration: 10,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 5 }],
    focusModules: ['mindfulness', 'self_compassion'],
    difficulty: 'medium',
    isActive: true,
    tags: ['meditation', 'compassion'],
  },
  {
    id: 'mindfulness-eating',
    title: 'Mindful Eating',
    description: 'Eat your next meal with full attention',
    category: 'coping',
    duration: 15,
    targetMetrics: [{ metric: 'stress', condition: 'high', threshold: 5 }],
    focusModules: ['mindfulness'],
    difficulty: 'easy',
    isActive: true,
    tags: ['mindfulness', 'eating'],
  },

  // Journaling
  {
    id: 'journal-gratitude',
    title: 'Gratitude Journal',
    description: 'Write 3 things you\'re grateful for',
    category: 'coping',
    duration: 5,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 6 }],
    focusModules: ['gratitude'],
    difficulty: 'easy',
    isActive: true,
    tags: ['journaling', 'gratitude'],
  },
  {
    id: 'journal-feelings',
    title: 'Feelings Check-In',
    description: 'Write about your current emotions',
    category: 'coping',
    duration: 10,
    targetMetrics: [{ metric: 'anxiety', condition: 'high', threshold: 5 }],
    focusModules: ['emotional_processing'],
    difficulty: 'easy',
    isActive: true,
    tags: ['journaling', 'emotions'],
  },
  {
    id: 'journal-worry-dump',
    title: 'Worry Dump',
    description: 'Write out all your worries',
    category: 'coping',
    duration: 10,
    targetMetrics: [{ metric: 'anxiety', condition: 'high', threshold: 7 }],
    focusModules: ['emotional_processing'],
    difficulty: 'easy',
    isActive: true,
    tags: ['journaling', 'anxiety'],
  },
  {
    id: 'journal-wins',
    title: 'Daily Wins',
    description: 'List 3 things that went well today',
    category: 'coping',
    duration: 5,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 5 }],
    focusModules: ['gratitude', 'self_compassion'],
    difficulty: 'easy',
    isActive: true,
    tags: ['journaling', 'positive'],
  },

  // Cognitive techniques
  {
    id: 'cognitive-reframe',
    title: 'Thought Reframing',
    description: 'Challenge negative thoughts',
    category: 'coping',
    duration: 10,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 4 }],
    focusModules: ['emotional_processing'],
    difficulty: 'medium',
    isActive: true,
    tags: ['cognitive', 'thoughts'],
  },
  {
    id: 'cognitive-worst-case',
    title: 'Best/Worst/Likely',
    description: 'Analyze your worries realistically',
    category: 'coping',
    duration: 10,
    targetMetrics: [{ metric: 'anxiety', condition: 'high', threshold: 6 }],
    focusModules: ['emotional_processing'],
    difficulty: 'medium',
    isActive: true,
    tags: ['cognitive', 'anxiety'],
  },

  // Self-compassion
  {
    id: 'compassion-letter',
    title: 'Self-Compassion Letter',
    description: 'Write a kind letter to yourself',
    category: 'coping',
    duration: 15,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 4 }],
    focusModules: ['self_compassion'],
    difficulty: 'medium',
    isActive: true,
    tags: ['self-compassion', 'writing'],
  },
  {
    id: 'compassion-hand-heart',
    title: 'Hand on Heart',
    description: 'Physical self-soothing practice',
    category: 'coping',
    duration: 3,
    targetMetrics: [{ metric: 'anxiety', condition: 'high', threshold: 6 }],
    focusModules: ['self_compassion'],
    difficulty: 'easy',
    isActive: true,
    tags: ['self-compassion', 'soothing'],
  },
  {
    id: 'compassion-affirmations',
    title: 'Positive Affirmations',
    description: 'Repeat encouraging statements',
    category: 'coping',
    duration: 5,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 5 }],
    focusModules: ['self_compassion'],
    difficulty: 'easy',
    isActive: true,
    tags: ['affirmations', 'positive'],
  },

  // Relaxation
  {
    id: 'relaxation-pmr',
    title: 'Progressive Muscle Relaxation',
    description: 'Tense and release muscle groups',
    category: 'coping',
    duration: 15,
    targetMetrics: [{ metric: 'stress', condition: 'high', threshold: 6 }],
    focusModules: ['stress_relief'],
    difficulty: 'easy',
    isActive: true,
    tags: ['relaxation', 'body'],
  },
  {
    id: 'relaxation-visualization',
    title: 'Peaceful Place Visualization',
    description: 'Imagine a calming environment',
    category: 'coping',
    duration: 10,
    targetMetrics: [{ metric: 'anxiety', condition: 'high', threshold: 6 }],
    focusModules: ['mindfulness'],
    difficulty: 'easy',
    isActive: true,
    tags: ['visualization', 'relaxation'],
  },
  {
    id: 'relaxation-music',
    title: 'Calming Music Break',
    description: 'Listen to relaxing music',
    category: 'coping',
    duration: 10,
    targetMetrics: [{ metric: 'stress', condition: 'high', threshold: 5 }],
    focusModules: ['stress_relief'],
    difficulty: 'easy',
    isActive: true,
    tags: ['music', 'relaxation'],
  },

  // LIFESTYLE ACTIONS (40+)
  // Physical activity
  {
    id: 'lifestyle-walk-10',
    title: 'Take a 10-Minute Walk',
    description: 'Step outside for fresh air and movement',
    longDescription: 'Walk at a comfortable pace. Notice your surroundings, breathe deeply, and let your mind wander.',
    category: 'lifestyle',
    duration: 10,
    targetMetrics: [{ metric: 'energy', condition: 'low', threshold: 5 }, { metric: 'mood', condition: 'low', threshold: 5 }],
    focusModules: ['physical_wellness'],
    difficulty: 'easy',
    isActive: true,
    tags: ['exercise', 'outdoor'],
  },
  {
    id: 'lifestyle-stretch',
    title: '5-Minute Stretch Break',
    description: 'Release tension in your body',
    category: 'lifestyle',
    duration: 5,
    targetMetrics: [{ metric: 'energy', condition: 'low', threshold: 5 }],
    focusModules: ['physical_wellness'],
    difficulty: 'easy',
    isActive: true,
    tags: ['stretching', 'body'],
  },
  {
    id: 'lifestyle-yoga',
    title: 'Gentle Yoga Session',
    description: 'Flow through calming poses',
    category: 'lifestyle',
    duration: 20,
    targetMetrics: [{ metric: 'stress', condition: 'high', threshold: 5 }, { metric: 'energy', condition: 'low', threshold: 4 }],
    focusModules: ['physical_wellness', 'mindfulness'],
    difficulty: 'medium',
    isActive: true,
    tags: ['yoga', 'exercise'],
  },
  {
    id: 'lifestyle-dance',
    title: 'Dance Break',
    description: 'Put on music and move your body',
    category: 'lifestyle',
    duration: 5,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 5 }, { metric: 'energy', condition: 'low', threshold: 4 }],
    focusModules: ['physical_wellness', 'creativity'],
    difficulty: 'easy',
    isActive: true,
    tags: ['dancing', 'fun'],
  },
  {
    id: 'lifestyle-workout',
    title: 'Quick Home Workout',
    description: '15-minute bodyweight exercises',
    category: 'lifestyle',
    duration: 15,
    targetMetrics: [{ metric: 'energy', condition: 'low', threshold: 4 }],
    focusModules: ['physical_wellness'],
    difficulty: 'medium',
    isActive: true,
    tags: ['exercise', 'strength'],
  },

  // Sleep
  {
    id: 'lifestyle-sleep-routine',
    title: 'Wind Down Routine',
    description: 'Prepare your body for sleep',
    category: 'lifestyle',
    duration: 30,
    targetMetrics: [{ metric: 'sleep', condition: 'low', threshold: 5 }],
    focusModules: ['sleep_hygiene'],
    difficulty: 'easy',
    isActive: true,
    tags: ['sleep', 'routine'],
  },
  {
    id: 'lifestyle-no-screens',
    title: 'Screen-Free Hour',
    description: 'Put devices away before bed',
    category: 'lifestyle',
    duration: 60,
    targetMetrics: [{ metric: 'sleep', condition: 'low', threshold: 5 }],
    focusModules: ['sleep_hygiene'],
    difficulty: 'medium',
    isActive: true,
    tags: ['sleep', 'digital'],
  },
  {
    id: 'lifestyle-bedroom-dark',
    title: 'Darken Your Bedroom',
    description: 'Make your sleep space darker',
    category: 'lifestyle',
    duration: 10,
    targetMetrics: [{ metric: 'sleep', condition: 'low', threshold: 5 }],
    focusModules: ['sleep_hygiene'],
    difficulty: 'easy',
    isActive: true,
    tags: ['sleep', 'environment'],
  },

  // Nutrition & hydration
  {
    id: 'lifestyle-hydrate',
    title: 'Drink a Glass of Water',
    description: 'Stay hydrated for better mood',
    category: 'lifestyle',
    duration: 2,
    targetMetrics: [{ metric: 'energy', condition: 'low', threshold: 5 }],
    focusModules: ['physical_wellness'],
    difficulty: 'easy',
    isActive: true,
    tags: ['hydration', 'quick'],
  },
  {
    id: 'lifestyle-healthy-snack',
    title: 'Eat a Healthy Snack',
    description: 'Nourish your body with good food',
    category: 'lifestyle',
    duration: 10,
    targetMetrics: [{ metric: 'energy', condition: 'low', threshold: 4 }],
    focusModules: ['physical_wellness'],
    difficulty: 'easy',
    isActive: true,
    tags: ['nutrition', 'energy'],
  },
  {
    id: 'lifestyle-meal-prep',
    title: 'Prepare a Nutritious Meal',
    description: 'Cook something healthy',
    category: 'lifestyle',
    duration: 30,
    targetMetrics: [{ metric: 'energy', condition: 'low', threshold: 4 }],
    focusModules: ['physical_wellness'],
    difficulty: 'medium',
    isActive: true,
    tags: ['nutrition', 'cooking'],
  },

  // Nature
  {
    id: 'lifestyle-nature-15',
    title: 'Spend Time in Nature',
    description: 'Go outside and connect with nature',
    category: 'lifestyle',
    duration: 15,
    targetMetrics: [{ metric: 'stress', condition: 'high', threshold: 5 }, { metric: 'mood', condition: 'low', threshold: 5 }],
    focusModules: ['physical_wellness', 'mindfulness'],
    difficulty: 'easy',
    isActive: true,
    tags: ['nature', 'outdoor'],
  },
  {
    id: 'lifestyle-sunlight',
    title: 'Get Morning Sunlight',
    description: 'Expose yourself to natural light',
    category: 'lifestyle',
    duration: 10,
    targetMetrics: [{ metric: 'energy', condition: 'low', threshold: 4 }, { metric: 'sleep', condition: 'low', threshold: 5 }],
    focusModules: ['physical_wellness', 'sleep_hygiene'],
    difficulty: 'easy',
    isActive: true,
    tags: ['sunlight', 'morning'],
  },
  {
    id: 'lifestyle-plants',
    title: 'Care for Your Plants',
    description: 'Water and tend to houseplants',
    category: 'lifestyle',
    duration: 10,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 5 }],
    focusModules: ['mindfulness'],
    difficulty: 'easy',
    isActive: true,
    tags: ['plants', 'nurturing'],
  },

  // Rest & breaks
  {
    id: 'lifestyle-power-nap',
    title: '20-Minute Power Nap',
    description: 'Take a short restorative nap',
    category: 'lifestyle',
    duration: 20,
    targetMetrics: [{ metric: 'energy', condition: 'low', threshold: 3 }],
    focusModules: ['physical_wellness'],
    difficulty: 'easy',
    isActive: true,
    tags: ['rest', 'energy'],
  },
  {
    id: 'lifestyle-break',
    title: 'Take a Real Break',
    description: 'Step away from work completely',
    category: 'lifestyle',
    duration: 15,
    targetMetrics: [{ metric: 'focus', condition: 'low', threshold: 4 }],
    focusModules: ['productivity'],
    difficulty: 'easy',
    isActive: true,
    tags: ['break', 'rest'],
  },

  // Self-care
  {
    id: 'lifestyle-bath',
    title: 'Relaxing Bath or Shower',
    description: 'Pamper yourself with warm water',
    category: 'lifestyle',
    duration: 20,
    targetMetrics: [{ metric: 'stress', condition: 'high', threshold: 6 }],
    focusModules: ['stress_relief', 'self_compassion'],
    difficulty: 'easy',
    isActive: true,
    tags: ['self-care', 'relaxation'],
  },
  {
    id: 'lifestyle-skincare',
    title: 'Skincare Routine',
    description: 'Take time for self-care',
    category: 'lifestyle',
    duration: 10,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 5 }],
    focusModules: ['self_compassion'],
    difficulty: 'easy',
    isActive: true,
    tags: ['self-care'],
  },

  // Organization
  {
    id: 'lifestyle-tidy',
    title: 'Tidy Your Space',
    description: 'Clean and organize your area',
    category: 'lifestyle',
    duration: 15,
    targetMetrics: [{ metric: 'focus', condition: 'low', threshold: 4 }, { metric: 'anxiety', condition: 'high', threshold: 6 }],
    focusModules: ['productivity'],
    difficulty: 'easy',
    isActive: true,
    tags: ['cleaning', 'organization'],
  },
  {
    id: 'lifestyle-plan-tomorrow',
    title: 'Plan Tomorrow',
    description: 'Write down tomorrow\'s priorities',
    category: 'lifestyle',
    duration: 10,
    targetMetrics: [{ metric: 'anxiety', condition: 'high', threshold: 5 }],
    focusModules: ['productivity'],
    difficulty: 'easy',
    isActive: true,
    tags: ['planning', 'organization'],
  },

  // Hobbies & creativity
  {
    id: 'lifestyle-read',
    title: 'Read for Pleasure',
    description: 'Spend time with a good book',
    category: 'lifestyle',
    duration: 20,
    targetMetrics: [{ metric: 'stress', condition: 'high', threshold: 5 }],
    focusModules: ['creativity'],
    difficulty: 'easy',
    isActive: true,
    tags: ['reading', 'relaxation'],
  },
  {
    id: 'lifestyle-create',
    title: 'Creative Activity',
    description: 'Draw, write, craft, or create',
    category: 'lifestyle',
    duration: 30,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 5 }],
    focusModules: ['creativity'],
    difficulty: 'easy',
    isActive: true,
    tags: ['creativity', 'expression'],
  },
  {
    id: 'lifestyle-music-play',
    title: 'Play or Listen to Music',
    description: 'Engage with music actively',
    category: 'lifestyle',
    duration: 15,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 5 }],
    focusModules: ['creativity'],
    difficulty: 'easy',
    isActive: true,
    tags: ['music', 'creativity'],
  },

  // CONNECTION ACTIONS (30+)
  {
    id: 'connection-text-friend',
    title: 'Send a Kind Message',
    description: 'Reach out to someone you care about',
    longDescription: 'Text or message someone just to check in, share something positive, or let them know you\'re thinking of them.',
    category: 'connection',
    duration: 5,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 5 }],
    focusModules: ['social_connection'],
    difficulty: 'easy',
    isActive: true,
    tags: ['social', 'messaging'],
  },
  {
    id: 'connection-call',
    title: 'Call Someone',
    description: 'Have a voice conversation',
    category: 'connection',
    duration: 15,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 4 }],
    focusModules: ['social_connection'],
    difficulty: 'medium',
    isActive: true,
    tags: ['social', 'phone'],
  },
  {
    id: 'connection-video-chat',
    title: 'Video Chat',
    description: 'See someone\'s face virtually',
    category: 'connection',
    duration: 20,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 4 }],
    focusModules: ['social_connection'],
    difficulty: 'medium',
    isActive: true,
    tags: ['social', 'video'],
  },
  {
    id: 'connection-thank',
    title: 'Express Gratitude',
    description: 'Thank someone for something',
    category: 'connection',
    duration: 5,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 5 }],
    focusModules: ['social_connection', 'gratitude'],
    difficulty: 'easy',
    isActive: true,
    tags: ['gratitude', 'appreciation'],
  },
  {
    id: 'connection-help',
    title: 'Help Someone',
    description: 'Do something kind for another',
    category: 'connection',
    duration: 15,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 5 }],
    focusModules: ['social_connection'],
    difficulty: 'easy',
    isActive: true,
    tags: ['kindness', 'helping'],
  },
  {
    id: 'connection-compliment',
    title: 'Give a Genuine Compliment',
    description: 'Say something kind to someone',
    category: 'connection',
    duration: 2,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 5 }],
    focusModules: ['social_connection'],
    difficulty: 'easy',
    isActive: true,
    tags: ['kindness', 'positive'],
  },
  {
    id: 'connection-listen',
    title: 'Active Listening',
    description: 'Really listen to someone',
    category: 'connection',
    duration: 15,
    targetMetrics: [{ metric: 'focus', condition: 'low', threshold: 4 }],
    focusModules: ['social_connection'],
    difficulty: 'medium',
    isActive: true,
    tags: ['listening', 'empathy'],
  },
  {
    id: 'connection-hug',
    title: 'Give/Get a Hug',
    description: 'Physical connection with someone',
    category: 'connection',
    duration: 1,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 5 }, { metric: 'anxiety', condition: 'high', threshold: 6 }],
    focusModules: ['social_connection'],
    difficulty: 'easy',
    isActive: true,
    tags: ['touch', 'comfort'],
  },
  {
    id: 'connection-plan-social',
    title: 'Plan a Social Activity',
    description: 'Schedule time with someone',
    category: 'connection',
    duration: 10,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 4 }],
    focusModules: ['social_connection'],
    difficulty: 'easy',
    isActive: true,
    tags: ['planning', 'social'],
  },
  {
    id: 'connection-share-meal',
    title: 'Share a Meal',
    description: 'Eat with someone',
    category: 'connection',
    duration: 30,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 4 }],
    focusModules: ['social_connection'],
    difficulty: 'medium',
    isActive: true,
    tags: ['food', 'social'],
  },
  {
    id: 'connection-pet',
    title: 'Spend Time with a Pet',
    description: 'Connect with an animal',
    category: 'connection',
    duration: 15,
    targetMetrics: [{ metric: 'stress', condition: 'high', threshold: 5 }, { metric: 'mood', condition: 'low', threshold: 5 }],
    focusModules: ['social_connection'],
    difficulty: 'easy',
    isActive: true,
    tags: ['pets', 'comfort'],
  },
  {
    id: 'connection-community',
    title: 'Engage with Community',
    description: 'Participate in a group activity',
    category: 'connection',
    duration: 60,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 4 }],
    focusModules: ['social_connection'],
    difficulty: 'hard',
    isActive: true,
    tags: ['community', 'social'],
  },
  {
    id: 'connection-forgive',
    title: 'Practice Forgiveness',
    description: 'Let go of a grudge',
    category: 'connection',
    duration: 15,
    targetMetrics: [{ metric: 'stress', condition: 'high', threshold: 6 }],
    focusModules: ['social_connection', 'emotional_processing'],
    difficulty: 'hard',
    isActive: true,
    tags: ['forgiveness', 'healing'],
  },
  {
    id: 'connection-boundary',
    title: 'Set a Healthy Boundary',
    description: 'Communicate a limit kindly',
    category: 'connection',
    duration: 10,
    targetMetrics: [{ metric: 'anxiety', condition: 'high', threshold: 6 }],
    focusModules: ['social_connection'],
    difficulty: 'hard',
    isActive: true,
    tags: ['boundaries', 'communication'],
  },
  {
    id: 'connection-deep-convo',
    title: 'Have a Deep Conversation',
    description: 'Talk about something meaningful',
    category: 'connection',
    duration: 30,
    targetMetrics: [{ metric: 'mood', condition: 'low', threshold: 4 }],
    focusModules: ['social_connection'],
    difficulty: 'medium',
    isActive: true,
    tags: ['conversation', 'depth'],
  },
];

// ============================================================================
// Crisis Detection Configuration
// ============================================================================

export const LOW_MOOD_THRESHOLD = 3;
export const CONSECUTIVE_LOW_DAYS_TRIGGER = 3;
export const HIGH_ANXIETY_THRESHOLD = 8;
export const HIGH_STRESS_THRESHOLD = 8;

export const CRISIS_DETECTION_ENABLED = true;
export const CRISIS_COOLDOWN_HOURS = 24;

export const CRISIS_KEYWORDS = [
  'suicide',
  'kill myself',
  'end it all',
  'want to die',
  'self-harm',
  'hurt myself',
  'not worth living',
  'better off dead',
  'cant go on',
  'give up on life',
];

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    id: '988',
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free, confidential support 24/7',
    phone: '988',
    textLine: '988',
    website: 'https://988lifeline.org',
    available24x7: true,
  },
  {
    id: 'crisis-text',
    name: 'Crisis Text Line',
    description: 'Text HOME to 741741',
    textLine: '741741',
    website: 'https://www.crisistextline.org',
    available24x7: true,
  },
  {
    id: 'samhsa',
    name: 'SAMHSA National Helpline',
    description: 'Treatment referral service',
    phone: '1-800-662-4357',
    website: 'https://www.samhsa.gov/find-help/national-helpline',
    available24x7: true,
  },
  {
    id: 'trevor',
    name: 'The Trevor Project',
    description: 'LGBTQ+ youth crisis support',
    phone: '1-866-488-7386',
    textLine: '678-678',
    website: 'https://www.thetrevorproject.org',
    available24x7: true,
  },
  {
    id: 'veterans',
    name: 'Veterans Crisis Line',
    description: 'Support for veterans',
    phone: '1-800-273-8255',
    textLine: '838255',
    website: 'https://www.veteranscrisisline.net',
    available24x7: true,
  },
];

// ============================================================================
// Onboarding Configuration
// ============================================================================

export const ONBOARDING_REASONS: { id: OnboardingReason; label: string; icon: string }[] = [
  { id: 'stress_management', label: 'Manage Stress', icon: 'flash' },
  { id: 'anxiety_relief', label: 'Reduce Anxiety', icon: 'pulse' },
  { id: 'mood_tracking', label: 'Track My Mood', icon: 'happy' },
  { id: 'sleep_improvement', label: 'Improve Sleep', icon: 'moon' },
  { id: 'mindfulness', label: 'Practice Mindfulness', icon: 'leaf' },
  { id: 'therapy_support', label: 'Support Therapy', icon: 'heart' },
  { id: 'self_discovery', label: 'Self-Discovery', icon: 'compass' },
  { id: 'crisis_support', label: 'Crisis Support', icon: 'shield' },
];

export const MIN_ONBOARDING_REASONS = 1;
export const MAX_ONBOARDING_REASONS = 5;

// ============================================================================
// Focus Module Categories
// ============================================================================

export const FOCUS_CATEGORIES = ['mental', 'physical', 'social', 'mindfulness'] as const;

export const FOCUS_CATEGORY_LABELS: Record<string, string> = {
  mental: 'Mental Wellness',
  physical: 'Physical Health',
  social: 'Social Connection',
  mindfulness: 'Mindfulness',
};

// ============================================================================
// Streak Configuration
// ============================================================================

export const STREAK_MILESTONE_DAYS = [3, 7, 14, 30, 60, 90, 180, 365];
export const STREAK_GRACE_PERIOD_HOURS = 36;

// ============================================================================
// Rate Limiting
// ============================================================================

export const RATE_LIMITS = {
  checkin: { maxRequests: 10, windowMinutes: 60 },
  plan: { maxRequests: 20, windowMinutes: 60 },
  auth: { maxRequests: 5, windowMinutes: 15 },
  general: { maxRequests: 100, windowMinutes: 60 },
  sos: { maxRequests: 50, windowMinutes: 60 },
} as const;

// ============================================================================
// Date/Time Formats
// ============================================================================

export const DATE_FORMAT = 'yyyy-MM-dd';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx";
export const DISPLAY_DATE_FORMAT = 'MMMM d, yyyy';
export const DISPLAY_TIME_FORMAT = 'h:mm a';

// ============================================================================
// Validation Limits
// ============================================================================

export const VALIDATION = {
  displayName: { minLength: 2, maxLength: 50 },
  email: { maxLength: 255 },
  password: { minLength: 8, maxLength: 128 },
  phone: { minLength: 10, maxLength: 15 },
  intention: { minLength: 3, maxLength: 200 },
  reflection: { minLength: 10, maxLength: 1000 },
} as const;

// ============================================================================
// Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  authToken: 'mentalspace_auth_token',
  user: 'mentalspace_user',
  preferences: 'mentalspace_preferences',
  carePreferences: 'mentalspace_care_preferences',
  checkinDraft: 'mentalspace_checkin_draft',
  theme: 'mentalspace_theme',
  lastSync: 'mentalspace_last_sync',
  weeklyFocus: 'mentalspace_weekly_focus',
  sosHistory: 'mentalspace_sos_history',
} as const;

// ============================================================================
// Telehealth Configuration
// ============================================================================

export const TELEHEALTH_APPOINTMENT_TYPES: { id: TelehealthAppointmentType; label: string; description: string; icon: string }[] = [
  { id: 'video_session', label: 'Video Session', description: 'Face-to-face telehealth appointment via video', icon: 'videocam' },
  { id: 'phone_session', label: 'Phone Session', description: 'Voice-only therapy session', icon: 'call' },
  { id: 'text_therapy', label: 'Text Therapy', description: 'Asynchronous messaging with a therapist', icon: 'chatbubbles' },
  { id: 'initial_consult', label: 'Free Consultation', description: 'Brief intro call to see if we\'re a good fit', icon: 'person-add' },
];

export const TELEHEALTH_URGENCY_LEVELS: { id: TelehealthUrgency; label: string; description: string; responseTime: string; color: string }[] = [
  { id: 'routine', label: 'Routine', description: 'I can wait for a regular appointment', responseTime: 'Within 2 weeks', color: '#22A267' },
  { id: 'soon', label: 'Soon', description: 'I\'d like to talk relatively soon', responseTime: 'Within 1 week', color: '#38B6E0' },
  { id: 'urgent', label: 'Urgent', description: 'I need to talk to someone quickly', responseTime: 'Within 48 hours', color: '#F59E0B' },
  { id: 'crisis', label: 'Crisis', description: 'I\'m in crisis and need immediate help', responseTime: 'Same day', color: '#EF4444' },
];

export const US_STATES: { id: USState; label: string }[] = [
  { id: 'AL', label: 'Alabama' },
  { id: 'AK', label: 'Alaska' },
  { id: 'AZ', label: 'Arizona' },
  { id: 'AR', label: 'Arkansas' },
  { id: 'CA', label: 'California' },
  { id: 'CO', label: 'Colorado' },
  { id: 'CT', label: 'Connecticut' },
  { id: 'DE', label: 'Delaware' },
  { id: 'DC', label: 'District of Columbia' },
  { id: 'FL', label: 'Florida' },
  { id: 'GA', label: 'Georgia' },
  { id: 'HI', label: 'Hawaii' },
  { id: 'ID', label: 'Idaho' },
  { id: 'IL', label: 'Illinois' },
  { id: 'IN', label: 'Indiana' },
  { id: 'IA', label: 'Iowa' },
  { id: 'KS', label: 'Kansas' },
  { id: 'KY', label: 'Kentucky' },
  { id: 'LA', label: 'Louisiana' },
  { id: 'ME', label: 'Maine' },
  { id: 'MD', label: 'Maryland' },
  { id: 'MA', label: 'Massachusetts' },
  { id: 'MI', label: 'Michigan' },
  { id: 'MN', label: 'Minnesota' },
  { id: 'MS', label: 'Mississippi' },
  { id: 'MO', label: 'Missouri' },
  { id: 'MT', label: 'Montana' },
  { id: 'NE', label: 'Nebraska' },
  { id: 'NV', label: 'Nevada' },
  { id: 'NH', label: 'New Hampshire' },
  { id: 'NJ', label: 'New Jersey' },
  { id: 'NM', label: 'New Mexico' },
  { id: 'NY', label: 'New York' },
  { id: 'NC', label: 'North Carolina' },
  { id: 'ND', label: 'North Dakota' },
  { id: 'OH', label: 'Ohio' },
  { id: 'OK', label: 'Oklahoma' },
  { id: 'OR', label: 'Oregon' },
  { id: 'PA', label: 'Pennsylvania' },
  { id: 'PR', label: 'Puerto Rico' },
  { id: 'RI', label: 'Rhode Island' },
  { id: 'SC', label: 'South Carolina' },
  { id: 'SD', label: 'South Dakota' },
  { id: 'TN', label: 'Tennessee' },
  { id: 'TX', label: 'Texas' },
  { id: 'UT', label: 'Utah' },
  { id: 'VT', label: 'Vermont' },
  { id: 'VA', label: 'Virginia' },
  { id: 'VI', label: 'Virgin Islands' },
  { id: 'WA', label: 'Washington' },
  { id: 'WV', label: 'West Virginia' },
  { id: 'WI', label: 'Wisconsin' },
  { id: 'WY', label: 'Wyoming' },
];

export const INSURANCE_PROVIDERS: { id: InsuranceProvider; label: string; popular?: boolean }[] = [
  // Popular/Featured providers (shown first)
  { id: 'caresource', label: 'CareSource', popular: true },
  { id: 'peach_state', label: 'Peach State Health Plan', popular: true },
  { id: 'amerigroup', label: 'Amerigroup', popular: true },
  { id: 'wellcare', label: 'WellCare', popular: true },
  { id: 'molina', label: 'Molina Healthcare', popular: true },
  // National providers
  { id: 'united_healthcare', label: 'UnitedHealthcare' },
  { id: 'anthem_bcbs', label: 'Anthem Blue Cross Blue Shield' },
  { id: 'aetna', label: 'Aetna' },
  { id: 'cigna', label: 'Cigna' },
  { id: 'humana', label: 'Humana' },
  { id: 'kaiser', label: 'Kaiser Permanente' },
  // Government programs
  { id: 'medicaid', label: 'Medicaid' },
  { id: 'medicare', label: 'Medicare' },
  { id: 'tricare', label: 'TRICARE (Military)' },
  // Other
  { id: 'other', label: 'Other Insurance' },
];

export const TELEHEALTH_REASONS: string[] = [
  'Anxiety or worry',
  'Depression or low mood',
  'Stress management',
  'Relationship issues',
  'Grief or loss',
  'Trauma or PTSD',
  'Work/career concerns',
  'Family issues',
  'Life transitions',
  'Sleep problems',
  'Anger management',
  'Self-esteem issues',
  'Substance use concerns',
  'Eating concerns',
  'General mental wellness',
  'Other',
];

// ============================================================================
// Feature Flags
// ============================================================================

export const FEATURES = {
  voiceNotes: true,
  darkMode: true,
  offlineMode: true,
  analytics: true,
  crashReporting: true,
  biometricAuth: true,
  sosProtocols: true,
  weeklyFocus: true,
  carePreferences: true,
  therapistBooking: true, // Now enabled!
  telehealthRequest: true,
  crisisDetection: true,
} as const;
