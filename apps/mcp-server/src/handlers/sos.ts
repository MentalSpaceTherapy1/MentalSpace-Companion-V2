/**
 * SOS Protocol Handlers
 * Provides guided exercises for difficult moments
 */

import type { Firestore } from 'firebase-admin/firestore';

const SOS_PROTOCOLS: Record<string, { title: string; steps: string[] }> = {
  overwhelm: {
    title: 'Feeling Overwhelmed Protocol',
    steps: [
      '**Step 1: Pause** - Stop what you\'re doing and take a moment to acknowledge that you\'re feeling overwhelmed.',
      '**Step 2: Breathe** - Take 3 slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 4.',
      '**Step 3: Ground** - Name 5 things you can see around you right now.',
      '**Step 4: Simplify** - What is ONE small thing you can do right now? Just one.',
      '**Step 5: Reassure** - Remind yourself: "This feeling is temporary. I can handle this one moment at a time."',
    ],
  },
  panic: {
    title: 'Panic Attack Protocol',
    steps: [
      '**Step 1: You\'re Safe** - A panic attack cannot hurt you. It will pass.',
      '**Step 2: Slow Breathing** - Breathe in slowly for 4 counts... hold for 1... breathe out for 6 counts.',
      '**Step 3: Ground Yourself** - Feel your feet on the floor. Press them down firmly.',
      '**Step 4: Cold Water** - If possible, splash cold water on your face or hold ice.',
      '**Step 5: Repeat** - "This will pass. I am safe. I can get through this."',
    ],
  },
  anger: {
    title: 'Managing Intense Anger',
    steps: [
      '**Step 1: Remove Yourself** - If possible, step away from the situation for a moment.',
      '**Step 2: Physical Release** - Clench your fists tight for 5 seconds, then release. Repeat 3 times.',
      '**Step 3: Cooling Breath** - Breathe in through your nose, out through your mouth like you\'re cooling hot soup.',
      '**Step 4: Delay** - Tell yourself: "I will respond to this in 10 minutes, not right now."',
      '**Step 5: Reflect** - Ask: "What do I actually need right now?"',
    ],
  },
  cant_sleep: {
    title: 'Can\'t Sleep Protocol',
    steps: [
      '**Step 1: Accept** - Don\'t fight wakefulness. Resistance creates more tension.',
      '**Step 2: Get Up** - If you\'ve been awake 20+ minutes, get out of bed briefly.',
      '**Step 3: 4-7-8 Breathing** - Inhale 4 counts, hold 7 counts, exhale 8 counts. Repeat 4 times.',
      '**Step 4: Body Scan** - Starting at your toes, consciously relax each part of your body moving upward.',
      '**Step 5: Visualize** - Imagine a peaceful place. Focus on the details with all your senses.',
    ],
  },
  struggling: {
    title: 'When You\'re Struggling',
    steps: [
      '**Step 1: Acknowledge** - Say to yourself: "I\'m having a hard time right now, and that\'s okay."',
      '**Step 2: Self-Compassion** - Place a hand on your heart. Take a slow breath.',
      '**Step 3: Basic Needs** - Have you eaten? Had water? Rested? Sometimes basics help.',
      '**Step 4: One Thing** - What is ONE kind thing you could do for yourself right now?',
      '**Step 5: Reach Out** - Consider texting a friend, even just to say hi. Connection helps.',
    ],
  },
};

const BREATHING_PATTERNS: Record<string, { name: string; instruction: string; timing: string }> = {
  box: {
    name: 'Box Breathing',
    instruction: 'Breathe in a square pattern. Great for calming and focus.',
    timing: '**Inhale** for 4 seconds → **Hold** for 4 seconds → **Exhale** for 4 seconds → **Hold** for 4 seconds',
  },
  '4-7-8': {
    name: '4-7-8 Relaxation Breath',
    instruction: 'Powerful technique for sleep and deep relaxation.',
    timing: '**Inhale** for 4 seconds → **Hold** for 7 seconds → **Exhale** for 8 seconds',
  },
  calm: {
    name: 'Calming Breath',
    instruction: 'Extended exhale activates your relaxation response.',
    timing: '**Inhale** for 4 seconds → **Hold** for 4 seconds → **Exhale** for 6 seconds',
  },
  energize: {
    name: 'Energizing Breath',
    instruction: 'Quick breaths to increase alertness and energy.',
    timing: '**Quick inhale** → **Quick exhale** → Repeat 10 times → **Deep breath and hold** → **Slow exhale**',
  },
};

export async function handleStartSOSProtocol(
  db: Firestore,
  userId: string,
  args: { protocolType: string }
) {
  const protocol = SOS_PROTOCOLS[args.protocolType];

  if (!protocol) {
    return {
      content: [
        {
          type: 'text',
          text: 'Unknown protocol type. Available: overwhelm, panic, anger, cant_sleep, struggling',
        },
      ],
      isError: true,
    };
  }

  // Log SOS session
  await db.collection('users').doc(userId).collection('sos_sessions').add({
    protocolType: args.protocolType,
    startedAt: new Date(),
    completedAt: null,
    stepsCompleted: 0,
    totalSteps: protocol.steps.length,
  });

  return {
    content: [
      {
        type: 'text',
        text: `**${protocol.title}**

I'm here with you. Let's go through this together, one step at a time.

${protocol.steps.join('\n\n')}

---

Take your time with each step. When you're ready, let me know how you're feeling.`,
      },
    ],
  };
}

export async function handleGuidedBreathing(
  db: Firestore,
  userId: string,
  args: { pattern?: string; cycles?: number }
) {
  const pattern = args.pattern || 'box';
  const cycles = args.cycles || 4;
  const breathing = BREATHING_PATTERNS[pattern] || BREATHING_PATTERNS.box;

  return {
    content: [
      {
        type: 'text',
        text: `**${breathing.name}**

${breathing.instruction}

**The Pattern:**
${breathing.timing}

**Let's Practice:**
Repeat this pattern ${cycles} times. I'll count with you:

${Array.from({ length: cycles }, (_, i) => `**Cycle ${i + 1}:** ${breathing.timing.replace(/\*\*/g, '')}`).join('\n\n')}

---

Remember: There's no "wrong" way to breathe. Just follow along at your own pace.

How are you feeling after the breathing exercise?`,
      },
    ],
  };
}

export async function handleGroundingExercise(db: Firestore, userId: string) {
  return {
    content: [
      {
        type: 'text',
        text: `**5-4-3-2-1 Grounding Exercise**

This technique uses your five senses to anchor you in the present moment. Take your time with each step.

---

**5 things you can SEE** 👁️
Look around you. Name 5 things you can see right now.
*(A lamp, a window, your hands, the floor, a book...)*

**4 things you can TOUCH** ✋
What can you feel? The texture of your clothes, the chair you're sitting on?
*(Your phone, your shirt, the armrest, your hair...)*

**3 things you can HEAR** 👂
Close your eyes for a moment. What sounds do you notice?
*(Your breath, traffic outside, a fan, birds...)*

**2 things you can SMELL** 👃
Take a breath. What do you smell?
*(Coffee, fresh air, laundry, nothing at all...)*

**1 thing you can TASTE** 👅
What taste is in your mouth right now?
*(Toothpaste, coffee, lunch, just your mouth...)*

---

Take a deep breath. You are here. You are present. You are safe.

How do you feel now compared to before we started?`,
      },
    ],
  };
}
