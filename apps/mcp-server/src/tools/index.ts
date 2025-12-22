/**
 * MCP Tool Definitions
 * Defines the tools available for ChatGPT to use
 * MentalSpace Companion - GPT App Directory Compatible
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const tools: Tool[] = [
  // ========================================
  // CHECK-IN TOOLS
  // ========================================
  {
    name: 'daily_checkin',
    description: `Record user's daily mental health check-in. This tool allows users to log their current mental state including mood, stress levels, sleep quality, energy, focus, and anxiety. Each metric is on a scale of 1-10. Users can also optionally add a journal entry. After completing a check-in, personalized actions will be generated.`,
    inputSchema: {
      type: 'object',
      properties: {
        mood: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'Current mood level (1 = very low, 10 = excellent)',
        },
        stress: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'Current stress level (1 = calm, 10 = very stressed)',
        },
        sleep: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'Sleep quality last night (1 = poor, 10 = excellent)',
        },
        energy: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'Current energy level (1 = exhausted, 10 = energized)',
        },
        focus: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'Mental clarity and focus (1 = scattered, 10 = sharp)',
        },
        anxiety: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'Current anxiety level (1 = calm, 10 = very anxious)',
        },
        journalEntry: {
          type: 'string',
          description: 'Optional journal entry or notes about how they are feeling',
          maxLength: 2000,
        },
      },
      required: ['mood', 'stress', 'sleep', 'energy', 'focus', 'anxiety'],
    },
  },

  // ========================================
  // ACTION PLAN TOOLS
  // ========================================
  {
    name: 'get_daily_plan',
    description: `Get the user's personalized action plan for today. This returns 3 recommended actions based on their latest check-in: one coping strategy, one lifestyle action, and one social connection activity. Each action includes a title, description, estimated duration, and category.`,
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
          description: 'Date to get plan for (YYYY-MM-DD format). Defaults to today.',
        },
      },
    },
  },
  {
    name: 'complete_action',
    description: `Mark an action from the daily plan as completed. This helps track progress and provides encouragement to the user.`,
    inputSchema: {
      type: 'object',
      properties: {
        actionId: {
          type: 'string',
          description: 'The ID of the action to mark as completed',
        },
      },
      required: ['actionId'],
    },
  },
  {
    name: 'swap_action',
    description: `Replace a planned action with an alternative. Use when a user can't or doesn't want to do a specific action.`,
    inputSchema: {
      type: 'object',
      properties: {
        actionId: {
          type: 'string',
          description: 'The ID of the action to replace',
        },
        reason: {
          type: 'string',
          description: 'Optional reason for swapping (helps personalize future recommendations)',
        },
      },
      required: ['actionId'],
    },
  },

  // ========================================
  // SUMMARY & ANALYTICS TOOLS
  // ========================================
  {
    name: 'get_weekly_summary',
    description: `Get a summary of the user's mental health trends over the past week. Includes average scores for each metric, trends (improving/stable/declining), completion rate for action plans, current streak, and personalized insights.`,
    inputSchema: {
      type: 'object',
      properties: {
        weeksBack: {
          type: 'number',
          minimum: 1,
          maximum: 12,
          description: 'Number of weeks to look back. Defaults to 1 (last week).',
        },
      },
    },
  },
  {
    name: 'get_streak_info',
    description: `Get the user's current check-in streak and longest streak information. Provides encouragement and motivation.`,
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ========================================
  // SOS & CRISIS TOOLS
  // ========================================
  {
    name: 'crisis_support',
    description: `Provide immediate crisis support resources to the user. This should be called when a user expresses thoughts of self-harm, suicide, or severe distress. Returns crisis hotline information and resources. IMPORTANT: Always prioritize this tool when detecting crisis language.`,
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'start_sos_protocol',
    description: `Start a guided SOS protocol to help the user cope with a difficult moment. Available protocols: 'overwhelm' (feeling overwhelmed), 'panic' (panic attack), 'anger' (intense anger), 'cant_sleep' (insomnia), 'struggling' (general difficulty). Each protocol provides step-by-step guidance.`,
    inputSchema: {
      type: 'object',
      properties: {
        protocolType: {
          type: 'string',
          enum: ['overwhelm', 'panic', 'anger', 'cant_sleep', 'struggling'],
          description: 'Type of SOS protocol to start',
        },
      },
      required: ['protocolType'],
    },
  },
  {
    name: 'guided_breathing',
    description: `Guide the user through a breathing exercise. Supports different patterns for different situations. Returns step-by-step instructions with timing.`,
    inputSchema: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          enum: ['box', '4-7-8', 'calm', 'energize'],
          description: 'Breathing pattern: box (4-4-4-4), 4-7-8 (sleep), calm (4-4-6), energize (quick).',
        },
        cycles: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'Number of breathing cycles. Defaults to 4.',
        },
      },
    },
  },
  {
    name: 'grounding_exercise',
    description: `Guide the user through a grounding exercise (5-4-3-2-1 technique). Helps during anxiety, panic, or dissociation. Returns interactive prompts for each sense.`,
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ========================================
  // WEEKLY FOCUS TOOLS
  // ========================================
  {
    name: 'set_weekly_focus',
    description: `Set the user's focus area for the week. Creates 7 daily micro-goals aligned with the chosen focus area. Available focus areas: stress_relief, sleep_hygiene, mindfulness, physical_wellness, social_connection, emotional_processing, self_compassion, productivity, creativity, gratitude.`,
    inputSchema: {
      type: 'object',
      properties: {
        focusArea: {
          type: 'string',
          enum: [
            'stress_relief',
            'sleep_hygiene',
            'mindfulness',
            'physical_wellness',
            'social_connection',
            'emotional_processing',
            'self_compassion',
            'productivity',
            'creativity',
            'gratitude',
          ],
          description: 'The focus area for this week',
        },
        intention: {
          type: 'string',
          description: 'Personal intention or goal for the week (optional)',
          maxLength: 200,
        },
      },
      required: ['focusArea'],
    },
  },
  {
    name: 'get_weekly_focus',
    description: `Get the user's current weekly focus, including today's micro-goal and overall progress.`,
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'complete_daily_goal',
    description: `Mark today's weekly focus micro-goal as completed.`,
    inputSchema: {
      type: 'object',
      properties: {
        reflection: {
          type: 'string',
          description: 'Optional reflection on completing the goal',
          maxLength: 500,
        },
      },
    },
  },

  // ========================================
  // CARE PREFERENCES TOOLS
  // ========================================
  {
    name: 'get_care_preferences',
    description: `Get the user's care preferences including support style, goals, and personalization settings. Useful for tailoring responses and recommendations.`,
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'update_care_preferences',
    description: `Update specific care preferences. Use when the user expresses preferences about how they want to be supported.`,
    inputSchema: {
      type: 'object',
      properties: {
        preferredSupportStyle: {
          type: 'string',
          enum: ['gentle_encouragement', 'direct_coaching', 'reflective_listening', 'structured_guidance'],
          description: 'How the user prefers to receive support',
        },
        primaryGoals: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'reduce_anxiety',
              'manage_depression',
              'improve_sleep',
              'reduce_stress',
              'build_resilience',
              'improve_relationships',
              'increase_mindfulness',
              'manage_anger',
              'boost_confidence',
              'process_trauma',
              'grief_support',
              'work_life_balance',
            ],
          },
          description: 'User\'s primary mental health goals (select up to 5)',
        },
      },
    },
  },

  // ========================================
  // JOURNALING TOOLS
  // ========================================
  {
    name: 'journal_prompt',
    description: `Provide the user with a personalized journaling prompt based on their recent check-ins and current state. Good for reflection and self-discovery.`,
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['gratitude', 'reflection', 'goals', 'emotions', 'relationships', 'growth'],
          description: 'Category of journaling prompt. Defaults to personalized selection.',
        },
      },
    },
  },

  // ========================================
  // ENCOURAGEMENT TOOLS
  // ========================================
  {
    name: 'get_encouragement',
    description: `Get a personalized encouragement message for the user based on their current state and progress. Use when the user needs a boost or after completing actions.`,
    inputSchema: {
      type: 'object',
      properties: {
        context: {
          type: 'string',
          enum: ['morning', 'struggling', 'achievement', 'setback', 'evening'],
          description: 'Context for the encouragement message',
        },
      },
    },
  },
];
