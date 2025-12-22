/**
 * MentalSpace MCP Server
 * Model Context Protocol server for ChatGPT integration
 * GPT App Directory Compatible
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as admin from 'firebase-admin';

import { tools } from './tools/index.js';
import { handleCheckin } from './handlers/checkin.js';
import { handleGetPlan, handleSwapAction } from './handlers/plan.js';
import { handleCompleteAction } from './handlers/actions.js';
import { handleGetSummary, handleGetStreakInfo } from './handlers/summary.js';
import { handleCrisisSupport } from './handlers/crisis.js';
import { handleStartSOSProtocol, handleGuidedBreathing, handleGroundingExercise } from './handlers/sos.js';
import { handleSetWeeklyFocus, handleGetWeeklyFocus, handleCompleteDailyGoal } from './handlers/weeklyFocus.js';

// Initialize Firebase Admin
const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore(app);

// Create MCP Server
const server = new Server(
  {
    name: 'mentalspace-companion',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Get user ID from the MCP context (passed by ChatGPT)
  const userId = (request.params as any)._meta?.userId;

  if (!userId) {
    return {
      content: [
        {
          type: 'text',
          text: 'Please connect your MentalSpace account first.',
        },
      ],
    };
  }

  try {
    switch (name) {
      // Check-in tools
      case 'daily_checkin':
        return await handleCheckin(db, userId, args);

      // Action plan tools
      case 'get_daily_plan':
        return await handleGetPlan(db, userId, args);

      case 'complete_action':
        return await handleCompleteAction(db, userId, args);

      case 'swap_action':
        return await handleSwapAction(db, userId, args);

      // Summary & analytics tools
      case 'get_weekly_summary':
        return await handleGetSummary(db, userId, args);

      case 'get_streak_info':
        return await handleGetStreakInfo(db, userId);

      // SOS & Crisis tools
      case 'crisis_support':
        return await handleCrisisSupport(db, userId);

      case 'start_sos_protocol':
        return await handleStartSOSProtocol(db, userId, args as any);

      case 'guided_breathing':
        return await handleGuidedBreathing(db, userId, args as any);

      case 'grounding_exercise':
        return await handleGroundingExercise(db, userId);

      // Weekly focus tools
      case 'set_weekly_focus':
        return await handleSetWeeklyFocus(db, userId, args as any);

      case 'get_weekly_focus':
        return await handleGetWeeklyFocus(db, userId);

      case 'complete_daily_goal':
        return await handleCompleteDailyGoal(db, userId, args as any);

      // Care preferences tools
      case 'get_care_preferences':
        return await handleGetCarePreferences(db, userId);

      case 'update_care_preferences':
        return await handleUpdateCarePreferences(db, userId, args as any);

      // Journaling tools
      case 'journal_prompt':
        return await handleJournalPrompt(db, userId, args as any);

      // Encouragement tools
      case 'get_encouragement':
        return await handleGetEncouragement(db, userId, args as any);

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    console.error(`Error handling tool ${name}:`, error);
    return {
      content: [
        {
          type: 'text',
          text: `An error occurred while processing your request. Please try again.`,
        },
      ],
      isError: true,
    };
  }
});

// Care Preferences Handlers
async function handleGetCarePreferences(db: admin.firestore.Firestore, userId: string) {
  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    return {
      content: [
        {
          type: 'text',
          text: 'User profile not found. Please complete onboarding first.',
        },
      ],
    };
  }

  const user = userDoc.data();
  const carePrefs = user?.carePreferences;

  if (!carePrefs) {
    return {
      content: [
        {
          type: 'text',
          text: `**Care Preferences Not Set**

To personalize your experience, please share:
- How you're generally feeling these days
- Your main mental health goals
- How you prefer to receive support

Would you like to set up your care preferences now?`,
        },
      ],
    };
  }

  const supportStyleLabels: Record<string, string> = {
    gentle_encouragement: 'Gentle, nurturing guidance',
    direct_coaching: 'Direct, action-oriented support',
    reflective_listening: 'Empathetic, validating responses',
    structured_guidance: 'Step-by-step instructions',
  };

  const goalLabels: Record<string, string> = {
    reduce_anxiety: 'Reduce anxiety',
    manage_depression: 'Manage depression',
    improve_sleep: 'Improve sleep',
    reduce_stress: 'Reduce stress',
    build_resilience: 'Build resilience',
    improve_relationships: 'Improve relationships',
    increase_mindfulness: 'Increase mindfulness',
    manage_anger: 'Manage anger',
    boost_confidence: 'Boost confidence',
    process_trauma: 'Process trauma',
    grief_support: 'Grief support',
    work_life_balance: 'Work-life balance',
  };

  return {
    content: [
      {
        type: 'text',
        text: `**Your Care Preferences**

**Support Style:** ${supportStyleLabels[carePrefs.preferredSupportStyle] || carePrefs.preferredSupportStyle}

**Primary Goals:**
${(carePrefs.primaryGoals || []).map((g: string) => `• ${goalLabels[g] || g}`).join('\n')}

**Therapy Status:** ${carePrefs.therapyStatus?.replace(/_/g, ' ') || 'Not specified'}

**Social Support:** ${carePrefs.socialSupport?.replace(/_/g, ' ') || 'Not specified'}

---

Want to update any of these preferences? Just let me know!`,
      },
    ],
  };
}

async function handleUpdateCarePreferences(
  db: admin.firestore.Firestore,
  userId: string,
  args: { preferredSupportStyle?: string; primaryGoals?: string[] }
) {
  const updates: any = {};

  if (args.preferredSupportStyle) {
    updates['carePreferences.preferredSupportStyle'] = args.preferredSupportStyle;
  }

  if (args.primaryGoals) {
    updates['carePreferences.primaryGoals'] = args.primaryGoals;
  }

  updates['carePreferences.updatedAt'] = new Date();

  await db.collection('users').doc(userId).update(updates);

  return {
    content: [
      {
        type: 'text',
        text: `**Preferences Updated** ✅

Your care preferences have been updated. I'll tailor my responses accordingly.

${args.preferredSupportStyle ? `**Support Style:** ${args.preferredSupportStyle.replace(/_/g, ' ')}` : ''}
${args.primaryGoals ? `**Goals:** ${args.primaryGoals.map(g => g.replace(/_/g, ' ')).join(', ')}` : ''}`,
      },
    ],
  };
}

// Journal Prompt Handler
async function handleJournalPrompt(
  db: admin.firestore.Firestore,
  userId: string,
  args: { category?: string }
) {
  const prompts: Record<string, string[]> = {
    gratitude: [
      'What are three things, big or small, that you\'re grateful for today?',
      'Who is someone that made a positive impact on you recently? Why?',
      'What is something about yourself that you appreciate?',
      'Describe a simple pleasure that brought you joy recently.',
    ],
    reflection: [
      'What lesson has this week taught you so far?',
      'How have you grown in the past month?',
      'What would you tell your past self from one year ago?',
      'What does your ideal day look like?',
    ],
    goals: [
      'What is one thing you want to accomplish this week?',
      'What is holding you back from something you want to do?',
      'Describe where you see yourself in one year.',
      'What small step can you take today toward a bigger goal?',
    ],
    emotions: [
      'What emotion has been most present for you today?',
      'Describe a moment when you felt truly at peace.',
      'What triggers stress for you, and how do you typically respond?',
      'What do you need right now that you\'re not getting?',
    ],
    relationships: [
      'Who do you feel most yourself around, and why?',
      'What quality do you most value in your relationships?',
      'Is there a conversation you\'ve been avoiding?',
      'How can you show up better for someone you care about?',
    ],
    growth: [
      'What fear would you like to overcome?',
      'What is something new you\'d like to learn?',
      'How do you want to feel at the end of this year?',
      'What habit would improve your life the most?',
    ],
  };

  const categories = Object.keys(prompts);
  const category = args.category || categories[Math.floor(Math.random() * categories.length)];
  const categoryPrompts = prompts[category] || prompts.reflection;
  const prompt = categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];

  return {
    content: [
      {
        type: 'text',
        text: `**Journal Prompt** 📝

*Category: ${category.charAt(0).toUpperCase() + category.slice(1)}*

---

${prompt}

---

Take your time with this. There's no right or wrong answer. Write as much or as little as feels right.

When you're ready, share your thoughts with me if you'd like.`,
      },
    ],
  };
}

// Encouragement Handler
async function handleGetEncouragement(
  db: admin.firestore.Firestore,
  userId: string,
  args: { context?: string }
) {
  const encouragements: Record<string, string[]> = {
    morning: [
      '🌅 Good morning! Today is a fresh start. You don\'t have to be perfect—just present.',
      '☀️ A new day means new possibilities. What\'s one small thing you can look forward to?',
      '🌸 Remember: You\'re allowed to take things one moment at a time today.',
    ],
    struggling: [
      '💙 I see you\'re having a hard time. That\'s okay. It\'s okay to not be okay.',
      '🤗 You\'re doing better than you think. The fact that you\'re here shows strength.',
      '🌧️ Even on difficult days, you matter. This feeling will pass.',
      '💪 You\'ve survived 100% of your worst days so far. You can get through this one too.',
    ],
    achievement: [
      '🎉 Amazing! You should be proud of yourself for showing up.',
      '⭐ Every small step counts. You\'re making progress!',
      '🏆 You did it! Remember this feeling when things get tough.',
      '✨ Look at you go! Consistency is building momentum.',
    ],
    setback: [
      '🌱 Setbacks are part of growth. Be gentle with yourself.',
      '💚 Progress isn\'t always linear. One tough day doesn\'t erase your progress.',
      '🔄 Tomorrow is another chance. Today doesn\'t define your journey.',
    ],
    evening: [
      '🌙 You made it through another day. That\'s worth celebrating.',
      '✨ As the day ends, let go of what didn\'t go perfectly. Rest now.',
      '🌜 Sleep well knowing you did your best today. Tomorrow is waiting.',
    ],
  };

  const context = args.context || 'achievement';
  const messages = encouragements[context] || encouragements.achievement;
  const message = messages[Math.floor(Math.random() * messages.length)];

  return {
    content: [
      {
        type: 'text',
        text: message,
      },
    ],
  };
}

// HTTP Server for Fly.io deployment
async function startHttpServer() {
  const expressApp = (await import('express')).default;
  const cors = (await import('cors')).default;
  const helmet = (await import('helmet')).default;

  const httpApp = expressApp();
  httpApp.use(cors());
  httpApp.use(helmet());
  httpApp.use(expressApp.json());

  // Health check endpoint
  httpApp.get('/health', (req, res) => {
    res.json({ status: 'healthy', version: '2.0.0', timestamp: new Date().toISOString() });
  });

  // Ready check endpoint
  httpApp.get('/ready', async (req, res) => {
    try {
      // Check Firebase connection
      await db.collection('health').doc('check').get();
      res.json({ status: 'ready', firebase: 'connected' });
    } catch (error) {
      res.status(503).json({ status: 'not ready', error: 'Firebase not connected' });
    }
  });

  // MCP tools list endpoint
  httpApp.get('/api/tools', (req, res) => {
    res.json({ tools });
  });

  // Version endpoint
  httpApp.get('/api/version', (req, res) => {
    res.json({ name: 'mentalspace-mcp', version: '2.0.0' });
  });

  const PORT = process.env.PORT || 8080;
  httpApp.listen(PORT, () => {
    console.log(`MentalSpace MCP HTTP Server running on port ${PORT}`);
  });
}

// Start the server based on environment
async function main() {
  const isHttpMode = process.env.HTTP_MODE === 'true' || process.env.PORT;

  if (isHttpMode) {
    // HTTP mode for Fly.io
    await startHttpServer();
    console.log('MentalSpace MCP Server v2.0 started (HTTP mode)');
  } else {
    // Stdio mode for local/ChatGPT
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('MentalSpace MCP Server v2.0 started (Stdio mode)');
  }
}

main().catch(console.error);
