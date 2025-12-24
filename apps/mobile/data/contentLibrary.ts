/**
 * Content Library
 * Comprehensive collection of mental health resources
 * Articles, audio guides, and video content for personalized recommendations
 */

export type ContentType = 'article' | 'audio' | 'video';
export type ContentCategory = 'stress' | 'sleep' | 'anxiety' | 'energy' | 'focus' | 'mindfulness' | 'connection' | 'coping';

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  duration: number; // in minutes
  category: ContentCategory;
  tags: string[];
  description: string;
  // For articles - markdown content
  content?: string;
  // For audio/video - URL or asset reference
  url?: string;
  thumbnailUrl?: string;
  // Metadata for recommendations
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  intensity?: 'gentle' | 'moderate' | 'energizing';
}

export const contentLibrary: ContentItem[] = [
  // ========== ARTICLES ==========
  {
    id: 'article-stress-1',
    title: '5-Minute Stress Reset',
    type: 'article',
    duration: 5,
    category: 'stress',
    tags: ['quick-relief', 'workplace', 'breathing'],
    description: 'Quick and effective techniques to reset your stress response in just 5 minutes',
    timeOfDay: 'anytime',
    intensity: 'gentle',
    content: `# 5-Minute Stress Reset

When stress hits, you don't always have time for a long break. These quick techniques can help reset your nervous system in just 5 minutes.

## 1. The 4-7-8 Breath (2 minutes)

This breathing technique activates your parasympathetic nervous system:
- Breathe in through your nose for 4 counts
- Hold your breath for 7 counts
- Exhale completely through your mouth for 8 counts
- Repeat 4 times

## 2. Progressive Muscle Release (2 minutes)

Quickly release physical tension:
- Clench your fists tightly for 5 seconds, then release
- Raise your shoulders to your ears, hold, then drop
- Squeeze your eyes shut, then relax your face
- Tense your whole body for 5 seconds, then let go

## 3. Grounding Technique (1 minute)

The 5-4-3-2-1 method brings you back to the present:
- Name 5 things you can see
- 4 things you can touch
- 3 things you can hear
- 2 things you can smell
- 1 thing you can taste

## Why This Works

These techniques work by interrupting your stress response and giving your body permission to calm down. Regular practice makes them even more effective.

**Remember:** It's okay to take 5 minutes for yourself. Your wellbeing matters.`
  },
  {
    id: 'article-stress-2',
    title: 'Understanding Your Stress Triggers',
    type: 'article',
    duration: 8,
    category: 'stress',
    tags: ['self-awareness', 'patterns', 'prevention'],
    description: 'Learn to identify and manage your personal stress triggers before they escalate',
    timeOfDay: 'anytime',
    intensity: 'moderate',
    content: `# Understanding Your Stress Triggers

Recognizing what triggers your stress is the first step toward managing it effectively.

## Common Stress Triggers

### Work-Related
- Deadlines and time pressure
- Difficult conversations or conflicts
- Overwhelming workload
- Lack of control or autonomy

### Personal
- Financial concerns
- Relationship challenges
- Health worries
- Major life changes

### Environmental
- Noise and distractions
- Cluttered spaces
- Poor sleep environment
- Lack of natural light

## Tracking Your Patterns

Keep a stress journal for one week:
1. Note when you feel stressed (time and situation)
2. Rate the intensity (1-10)
3. Identify what happened just before
4. Note how you responded

## Creating Your Action Plan

For each trigger you identify:
- **Prevent:** Can you avoid or prepare for this trigger?
- **Respond:** What coping strategy works best?
- **Recover:** How will you restore balance afterward?

## Example Action Plans

**Trigger:** Morning rush causes stress
- **Prevent:** Prepare clothes and lunch the night before
- **Respond:** Use 4-7-8 breathing in the car
- **Recover:** 5-minute meditation when you arrive

**Trigger:** Difficult meetings
- **Prevent:** Review agenda beforehand, prepare talking points
- **Respond:** Take notes to stay focused and grounded
- **Recover:** Walk around the block after the meeting

## Building Resilience

Over time, you'll notice:
- Triggers becoming easier to manage
- Faster recovery from stress
- More confidence in challenging situations
- Better overall emotional regulation

**Your stress responses are learned, which means they can be unlearned and replaced with healthier patterns.**`
  },
  {
    id: 'article-anxiety-1',
    title: 'Calming Anxious Thoughts',
    type: 'article',
    duration: 6,
    category: 'anxiety',
    tags: ['cognitive', 'thoughts', 'worry'],
    description: 'Evidence-based techniques to interrupt anxiety spirals and regain mental clarity',
    timeOfDay: 'anytime',
    intensity: 'gentle',
    content: `# Calming Anxious Thoughts

Anxiety often starts with a single worried thought that spirals. Here's how to interrupt that cycle.

## The Anxiety Spiral

Anxious thoughts tend to follow this pattern:
1. Trigger thought ("What if...")
2. Physical symptoms (racing heart, tension)
3. More worried thoughts
4. Increased physical response
5. Catastrophic thinking

## Technique 1: Name It to Tame It

When you notice anxiety building:
- Say out loud: "I'm having anxious thoughts"
- Label the thought: "This is worry, not fact"
- Remind yourself: "Thoughts are not reality"

**Why it works:** Labeling activates your rational brain and creates distance from the emotion.

## Technique 2: The 3-3-3 Rule

When anxiety hits:
- Name 3 things you see
- Name 3 sounds you hear
- Move 3 parts of your body

This grounds you in the present moment and interrupts rumination.

## Technique 3: Challenge the Thought

Ask yourself:
- Is this thought based on facts or feelings?
- What evidence do I have for and against this thought?
- What would I tell a friend having this thought?
- What's the worst that could happen, and could I handle it?

## Technique 4: Schedule Worry Time

- Set aside 15 minutes daily for worrying
- When anxious thoughts arise, write them down
- Tell yourself: "I'll think about this during worry time"
- During worry time, address the thoughts rationally

## Quick Anxiety Interrupters

- Hold an ice cube in your hand
- Count backward from 100 by 7s
- Name all the blue things in the room
- Describe an object in extreme detail
- Call or text someone you trust

## Building Long-Term Resilience

- Practice mindfulness meditation daily
- Regular physical exercise
- Limit caffeine and alcohol
- Prioritize sleep
- Challenge anxious thoughts before they spiral

**Remember:** Anxiety lies. It tells you things are worse than they are. With practice, you can learn to recognize and challenge these distortions.`
  },
  {
    id: 'article-sleep-1',
    title: 'Sleep Hygiene Essentials',
    type: 'article',
    duration: 7,
    category: 'sleep',
    tags: ['routine', 'environment', 'habits'],
    description: 'Create the perfect conditions for restorative sleep with these evidence-based practices',
    timeOfDay: 'evening',
    intensity: 'gentle',
    content: `# Sleep Hygiene Essentials

Quality sleep is foundational to mental health. These practices can dramatically improve your sleep quality.

## The Ideal Sleep Environment

### Temperature
- Keep your bedroom between 60-67°F (15-19°C)
- Cool environments promote deeper sleep
- Use breathable bedding

### Light
- Complete darkness is ideal
- Use blackout curtains or an eye mask
- Avoid blue light 2 hours before bed
- Use dim, warm lighting in the evening

### Sound
- Quiet is best, but consistency matters
- White noise can mask disruptive sounds
- Earplugs if needed
- Consider a fan for airflow and gentle noise

### Comfort
- Invest in a supportive mattress
- Replace pillows every 1-2 years
- Choose comfortable, breathable sleepwear
- Keep bedroom clutter-free

## The Perfect Evening Routine

### 2 Hours Before Bed
- Dim the lights throughout your home
- Stop using phones, tablets, and computers
- Avoid caffeine, alcohol, and heavy meals
- Begin winding down activities

### 1 Hour Before Bed
- Take a warm bath or shower
- Practice gentle stretching or yoga
- Read a physical book (not on a screen)
- Listen to calming music
- Practice relaxation exercises

### 30 Minutes Before Bed
- Prepare your bedroom (cool, dark, quiet)
- Put away all electronic devices
- Use the bathroom
- Write down tomorrow's priorities (clear your mind)

### In Bed
- Only use your bed for sleep (and intimacy)
- If you can't fall asleep in 20 minutes, get up
- Do a quiet, non-stimulating activity
- Return to bed when drowsy

## Sleep Schedule

### Consistency Is Key
- Go to bed at the same time every night
- Wake up at the same time every morning
- Yes, even on weekends
- Your body craves routine

### Finding Your Ideal Schedule
- Most adults need 7-9 hours
- Track your sleep for 2 weeks
- Notice when you feel most rested
- Adjust gradually (15 minutes at a time)

## What to Avoid

### Stimulants
- No caffeine after 2 PM
- Avoid nicotine close to bedtime
- Limit alcohol (it disrupts sleep cycles)

### Habits That Hurt Sleep
- Watching TV in bed
- Working in the bedroom
- Checking your phone during the night
- Napping late in the day
- Exercising within 3 hours of bedtime

## When Sleep Won't Come

If you're lying awake:
- Don't watch the clock
- Practice 4-7-8 breathing
- Progressive muscle relaxation
- Visualize a peaceful scene
- Get up if still awake after 20 minutes

## Building Better Sleep

Remember: Sleep improvements take time. Be patient with yourself and consistent with these practices. Within 2-4 weeks, you should notice significant improvements.

**Good sleep is not a luxury—it's a necessity for mental health.**`
  },
  {
    id: 'article-sleep-2',
    title: 'Overcoming Racing Thoughts at Bedtime',
    type: 'article',
    duration: 5,
    category: 'sleep',
    tags: ['insomnia', 'anxiety', 'thoughts'],
    description: 'Practical strategies to quiet your mind when thoughts keep you awake',
    timeOfDay: 'evening',
    intensity: 'gentle',
    content: `# Overcoming Racing Thoughts at Bedtime

One of the most common sleep complaints: "I can't turn my brain off." Here's how to quiet the mental noise.

## Why Thoughts Race at Bedtime

When you lie down, external stimulation decreases, making internal thoughts louder. Your brain also uses this quiet time to process the day and plan for tomorrow.

## Immediate Relief Techniques

### The Thought Parking Lot
1. Keep a notepad by your bed
2. When a thought appears, write it down
3. Tell yourself: "I'll deal with this tomorrow"
4. Return to relaxing

### The Alphabet Game
- Choose a category (animals, countries, foods)
- Think of one for each letter: A-Alligator, B-Bear, C-Cat...
- This occupies your mind without stimulating it

### Body Scan Relaxation
- Start at your toes
- Slowly move attention up your body
- Notice and release tension
- By the time you reach your head, you may be asleep

### Counting Breath
- Count each exhale: "1... 2... 3..."
- When you reach 10, start over
- If you lose count, start over
- Focus only on the numbers and breath

## Pre-Bedtime Prevention

### The Worry Dump (30 minutes before bed)
- Write down everything on your mind
- For each worry, write one action you can take tomorrow
- Close the notebook
- You've acknowledged your concerns, now rest

### Create a Buffer Zone
- Stop work 2 hours before bed
- Avoid difficult conversations in the evening
- No stressful news or social media
- Engage in calming activities only

## Long-Term Solutions

### Regular Meditation Practice
- Even 5 minutes daily helps
- Trains your brain to let thoughts pass
- Reduces baseline anxiety
- Makes nighttime easier

### Cognitive Behavioral Therapy for Insomnia (CBT-I)
If racing thoughts persist:
- Consider working with a therapist
- CBT-I is highly effective for chronic insomnia
- Addresses thought patterns that maintain sleeplessness

## What NOT to Do

- Don't lie there struggling for hours
- Don't check your phone
- Don't watch TV in bed
- Don't get frustrated with yourself
- Don't consume caffeine or alcohol to cope

## When to Get Help

See a healthcare provider if:
- Insomnia lasts more than a month
- It significantly impacts your daily functioning
- You suspect a sleep disorder
- Racing thoughts feel uncontrollable
- You're experiencing other mental health symptoms

**Remember:** Everyone has occasional sleepless nights. Be kind to yourself, use these tools, and know that sleep will come.`
  },
  {
    id: 'article-mindfulness-1',
    title: 'Mindfulness for Beginners',
    type: 'article',
    duration: 6,
    category: 'mindfulness',
    tags: ['meditation', 'awareness', 'basics'],
    description: 'Start your mindfulness journey with simple, practical techniques anyone can do',
    timeOfDay: 'anytime',
    intensity: 'gentle',
    content: `# Mindfulness for Beginners

Mindfulness isn't about emptying your mind or achieving perfect calm. It's about being present with whatever you're experiencing.

## What Is Mindfulness?

Mindfulness is paying attention to the present moment with:
- **Curiosity:** Being open to what you notice
- **Non-judgment:** Observing without labeling as good or bad
- **Acceptance:** Allowing things to be as they are

## Your First Mindfulness Practice: One Breath

Right now, take one conscious breath:
1. Notice the air entering your nose
2. Feel your chest and belly expand
3. Notice the pause
4. Feel the air leaving your body

That's it. You just practiced mindfulness.

## Simple Mindfulness Exercises

### Mindful Breathing (2 minutes)
- Sit comfortably
- Close your eyes or lower your gaze
- Notice your natural breath
- When your mind wanders (it will), gently return to the breath
- No judgment, just noticing

### Mindful Observation (3 minutes)
- Choose an object (a plant, your coffee mug, anything)
- Look at it as if you've never seen it before
- Notice colors, textures, shapes
- Explore it with genuine curiosity

### Mindful Walking (5 minutes)
- Walk slowly
- Notice each step: heel, ball, toe
- Feel your weight shifting
- Notice your surroundings
- When your mind wanders, return to the sensation of walking

### Mindful Eating (duration of one meal)
- Eat one meal without distractions
- Notice colors, smells, textures
- Chew slowly
- Taste each bite
- Notice hunger and fullness cues

## Common Myths Debunked

**Myth:** "I'm bad at meditation because I can't stop thinking."
**Truth:** Thinking is what minds do. Mindfulness is noticing you're thinking and returning to the present.

**Myth:** "I don't have time for mindfulness."
**Truth:** Mindfulness can happen in moments you already have—brushing teeth, waiting in line, drinking coffee.

**Myth:** "Mindfulness is about relaxation."
**Truth:** While often relaxing, mindfulness is about awareness, not achieving a certain feeling.

**Myth:** "I need to meditate for 30 minutes to benefit."
**Truth:** Even one mindful breath creates change. Consistency matters more than duration.

## Building a Practice

### Start Small
- 2 minutes daily is better than 30 minutes occasionally
- Choose a consistent time (morning, lunch break, before bed)
- Start with just one week commitment

### Make It Easy
- Don't add new requirements
- Practice during existing activities
- No special equipment needed
- No perfect posture required

### Track Your Practice
- Use your MentalSpace check-ins
- Notice how you feel before and after
- Celebrate small wins

## When Your Mind Wanders

Your mind will wander hundreds of times. This is normal and actually the practice:
1. Notice you're thinking (this is awareness!)
2. No judgment ("there's thinking")
3. Gently return to your anchor (breath, sound, sensation)
4. Repeat endlessly

Each time you notice and return is like a mental push-up—you're building the muscle of attention.

## Next Steps

- Try one exercise today
- Practice daily for one week
- Notice what changes
- Explore different techniques
- Be patient and kind with yourself

**Mindfulness is a skill, not a talent. Everyone can learn it, and it gets easier with practice.**`
  },
  {
    id: 'article-work-life-1',
    title: 'Setting Healthy Work Boundaries',
    type: 'article',
    duration: 8,
    category: 'stress',
    tags: ['work', 'boundaries', 'balance'],
    description: 'Protect your mental health by establishing clear boundaries between work and personal life',
    timeOfDay: 'anytime',
    intensity: 'moderate',
    content: `# Setting Healthy Work Boundaries

In our always-connected world, work can easily spill into every hour of the day. Here's how to protect your time and mental health.

## Why Boundaries Matter

Without boundaries:
- Burnout risk increases
- Relationships suffer
- Sleep quality decreases
- Resentment builds
- Productivity actually decreases

## Types of Work Boundaries

### Time Boundaries
- Clear start and end to your workday
- Defined lunch break
- No work emails after a certain hour
- Weekend protection

### Physical Boundaries
- Separate workspace if possible
- Physical distance from work materials
- Different locations for work and relaxation

### Communication Boundaries
- Response time expectations
- Which channels are for emergencies
- "Office hours" for availability
- Vacation auto-responders

### Emotional Boundaries
- Not taking work stress personally
- Separating self-worth from productivity
- Saying no to unreasonable requests
- Protecting energy for what matters

## How to Set Boundaries

### Step 1: Identify Your Needs
Ask yourself:
- What drains my energy?
- When do I feel resentful?
- What would make my life better?
- What are my non-negotiables?

### Step 2: Define Specific Boundaries
Examples:
- "I don't check email after 6 PM"
- "I take a full lunch break away from my desk"
- "I don't work on Sundays"
- "I communicate my availability clearly"

### Step 3: Communicate Clearly
- Be direct and polite
- Explain without over-explaining
- Offer alternatives when possible
- Stay consistent

### Step 4: Enforce Consistently
- Don't make exceptions for non-emergencies
- Redirect boundary violations calmly
- Use auto-responses and tools
- Remember: every boundary you hold makes the next easier

## Scripts for Common Situations

**After-hours email:**
"I've received your message. I'll respond during business hours tomorrow."

**Unrealistic deadline:**
"I want to deliver quality work. To do that, I'll need until [realistic date]. Is that workable?"

**Weekend work request:**
"I keep weekends clear for personal commitments. I can prioritize this first thing Monday."

**Taking on too much:**
"I want to give this the attention it deserves. Can we discuss my current workload to see what could shift?"

## Digital Boundaries

### Email Management
- Turn off notifications
- Check at designated times only
- Use filters and folders
- Set up auto-responses for off-hours

### Phone Boundaries
- Separate work and personal phones if possible
- Delete work apps from personal phone
- Use Do Not Disturb mode
- Keep work phone in another room after hours

### Calendar Protection
- Block off personal time
- Schedule breaks
- Add buffer time between meetings
- Make lunch break non-negotiable

## When Working From Home

### Create Physical Separation
- Designated workspace
- "Commute" ritual (walk before/after work)
- Change clothes to signal transitions
- Close the "office" at end of day

### Time Separation
- Strict start and end times
- Lunch away from workspace
- No work in bedroom
- Evening routine to transition

## Handling Pushback

When people resist your boundaries:
1. Stay calm and firm
2. Reiterate the boundary
3. Don't justify extensively
4. Offer alternative solutions
5. Involve HR or management if needed

Remember: Boundary violations say more about others' expectations than your worth.

## Building Boundary Confidence

### Start Small
- Pick one boundary to establish
- Practice in low-stakes situations
- Build from successes

### Get Support
- Share boundaries with family
- Find accountability partners
- Join communities with similar values
- Work with a therapist if needed

### Manage Guilt
- Guilt often comes with new boundaries
- It doesn't mean you're doing something wrong
- It means you're changing patterns
- It will decrease with time

## The Long-Term Benefits

With consistent boundaries:
- Better work quality (not just quantity)
- Increased energy and creativity
- Improved relationships
- Better physical and mental health
- More life satisfaction
- Paradoxically, better work performance

**Your time and energy are finite resources. Protecting them isn't selfish—it's essential for sustainable wellbeing and productivity.**`
  },
  {
    id: 'article-energy-1',
    title: 'Natural Energy Boosters',
    type: 'article',
    duration: 6,
    category: 'energy',
    tags: ['vitality', 'habits', 'natural'],
    description: 'Sustainable ways to increase your energy without relying on caffeine',
    timeOfDay: 'morning',
    intensity: 'energizing',
    content: `# Natural Energy Boosters

Sustainable energy comes from supporting your body's natural rhythms, not fighting them with stimulants.

## Understanding Energy Dips

Energy naturally fluctuates:
- **Morning:** Usually highest 2-3 hours after waking
- **Midday:** Natural dip after lunch (circadian rhythm)
- **Afternoon:** Second peak around 3-6 PM
- **Evening:** Energy decreases toward bedtime

Work with these rhythms, not against them.

## Immediate Energy Boosters

### Movement (2-5 minutes)
- 10 jumping jacks
- Brisk walk around the block
- Desk stretches
- Dance to one song
- Shake out your whole body

Why it works: Increases blood flow and oxygen to the brain.

### Cold Exposure (1 minute)
- Splash cold water on your face
- Hold ice cubes briefly
- Step outside in cool weather
- Cold shower (even 30 seconds helps)

Why it works: Activates your sympathetic nervous system.

### Deep Breathing (3 minutes)
- Breath of Fire: Quick, forceful exhales
- Or: 10 deep belly breaths
- Stand and breathe with arms overhead

Why it works: Increases oxygen and activates your system.

### Hydration (ongoing)
- Drink a full glass of water
- Dehydration causes fatigue
- Most people are chronically under-hydrated
- Aim for half your body weight in ounces daily

## Building Sustainable Energy

### Sleep Foundation
- 7-9 hours nightly
- Consistent sleep schedule
- Quality over quantity
- Address sleep issues

### Nutrition for Energy

**Energy-Sustaining Foods:**
- Whole grains (steady glucose)
- Lean proteins (sustained energy)
- Healthy fats (brain fuel)
- Colorful vegetables (nutrients)
- Fruits (natural sugars + fiber)

**Energy-Draining Foods:**
- Refined sugars (crash after spike)
- Processed foods (inflammation)
- Heavy, fatty meals (diversion of blood to digestion)
- Excessive alcohol

**Eating Patterns:**
- Eat breakfast within 1-2 hours of waking
- Smaller, frequent meals vs. large meals
- Balance protein, carbs, and fats
- Don't skip meals

### Movement Throughout Day
- Stand up every hour
- Walk during phone calls
- Take stairs when possible
- Park farther away
- Stretch regularly

### Light Exposure
- Get sunlight within 1 hour of waking
- Spend time outside during the day
- Bright light during work hours
- Dim lights in evening
- Avoid blue light before bed

## Strategic Caffeine Use

If you choose to use caffeine:
- Morning only (before noon)
- After breakfast, not instead of it
- Maximum 400mg daily (about 4 cups coffee)
- Take "caffeine fasts" periodically
- Stay hydrated (caffeine is a diuretic)
- Recognize if you're caffeine dependent

## Energy-Draining Habits to Avoid

- Sitting for long periods
- Skipping breakfast
- Dehydration
- Chronic stress
- Poor sleep hygiene
- Overcommitting
- Lack of sunlight
- Negative thought patterns

## Mental Energy Strategies

### Task Management
- Hardest tasks when energy peaks
- Batch similar tasks together
- Take breaks between tasks
- Use timers (Pomodoro technique)

### Cognitive Breaks
- 5 minutes every hour
- Change task types regularly
- Brief mindfulness practice
- Look at something distant (eye rest)

### Emotional Energy
- Say no to energy vampires
- Limit negative news
- Spend time with energizing people
- Engage in activities you enjoy

## When to Seek Help

Persistent fatigue might indicate:
- Sleep disorders
- Thyroid issues
- Depression
- Chronic fatigue syndrome
- Anemia
- Other medical conditions

See a healthcare provider if:
- Fatigue lasts more than 2 weeks
- It impacts daily functioning
- Sleep doesn't help
- You have other symptoms

## Creating Your Energy Plan

1. Track your energy for one week
2. Notice patterns and triggers
3. Identify 2-3 strategies to try
4. Implement gradually
5. Assess what helps
6. Adjust and continue

**Sustainable energy comes from respecting your body's needs, not overriding them with stimulants.**`
  },
  {
    id: 'article-focus-1',
    title: 'Deep Work: Finding Your Flow',
    type: 'article',
    duration: 7,
    category: 'focus',
    tags: ['productivity', 'concentration', 'flow'],
    description: 'Techniques to achieve deep focus and enter flow states for meaningful work',
    timeOfDay: 'morning',
    intensity: 'moderate',
    content: `# Deep Work: Finding Your Flow

In our distracted world, the ability to focus deeply is becoming both rarer and more valuable.

## What Is Deep Work?

Deep work is:
- Focused, uninterrupted concentration
- Working at the edge of your abilities
- Creating meaningful output
- Experiencing "flow" states

Benefits:
- Higher quality work
- Faster skill development
- Greater satisfaction
- Competitive advantage

## Creating Conditions for Deep Work

### Environmental Setup

**Eliminate Distractions:**
- Phone on airplane mode or in another room
- Close email and messaging apps
- Use website blockers
- Noise-cancelling headphones
- "Do Not Disturb" sign

**Optimize Your Space:**
- Clean, organized workspace
- Good lighting (natural light ideal)
- Comfortable temperature
- Everything you need within reach
- Remove visual clutter

### Time Architecture

**Morning Deep Work**
- Energy is typically highest
- Fewer interruptions
- Fresh mental capacity
- Protect these hours fiercely

**Time Blocking**
- Schedule deep work like meetings
- 90-minute blocks are ideal
- Maximum 4 hours deep work daily
- Build in recovery time

**The Shutdown Ritual**
- Review what you accomplished
- Plan tomorrow's deep work
- Clear your workspace
- Close all work tabs/apps
- Signals to your brain: work is done

## Entering Flow State

Flow happens when:
- Challenge matches skill level
- You have clear goals
- Immediate feedback exists
- Distractions are minimal

### Flow Triggers

**Before You Start:**
- Clearly define your goal
- Remove all distractions
- Have necessary resources ready
- Set a timer
- Close communication channels

**While Working:**
- Focus on one task only
- Work at the edge of your ability
- Notice when you lose focus
- Gently return to the task
- Embrace the struggle

## Deep Work Techniques

### Pomodoro Technique
- 25 minutes focused work
- 5 minute break
- After 4 rounds, take 15-30 minute break
- Good for building focus stamina

### 90-Minute Sprints
- Align with natural ultradian rhythms
- 90 minutes deep work
- 20-minute complete break
- Maximum 2-3 sprints per day

### Time Boxing
- Assign specific time to tasks
- Work expands to fill time given
- Creates urgency and focus
- Review and adjust

## Protecting Deep Work Time

### Communication Boundaries
- Set "office hours" for questions
- Batch-check email 2-3x daily
- Use auto-responses during deep work
- Train others about your availability

### Meeting Strategies
- Schedule meetings in the afternoon
- Batch meetings together
- Decline meetings without clear purpose
- Suggest asynchronous alternatives

### Saying No
- To meetings during deep work time
- To "quick questions" (batch them)
- To low-value tasks
- To good opportunities for great ones

## Building Deep Work Capacity

### Start Small
- Begin with 30-minute sessions
- Gradually increase duration
- Be patient with yourself
- Consistency matters more than perfection

### Track Your Practice
- Log deep work hours
- Note what helped/hindered
- Celebrate improvements
- Adjust your approach

### Progressive Overload
- Like physical exercise
- Gradually increase difficulty
- Push slightly beyond comfort
- Rest and recover

## Common Obstacles

### "I Can't Focus"
- Start with just 10 minutes
- Meditation builds focus muscle
- Reduce overall distractions
- Check sleep and nutrition

### "I Get Interrupted"
- Communicate boundaries clearly
- Find alternative workspace
- Schedule deep work when others are away
- Use visual signals (headphones, sign)

### "It Feels Uncomfortable"
- Deep work is supposed to feel challenging
- Discomfort means growth
- Your brain will adapt
- It gets easier with practice

### "I'm Afraid of Missing Something"
- FOMO is real but manageable
- Trust your systems
- Nothing is truly urgent
- What's truly important will wait

## Measuring Success

Look for:
- More work completed in less time
- Higher quality output
- Entering flow more easily
- Greater satisfaction
- Better work-life balance

## The Deep Life

Regular deep work leads to:
- Mastery of your craft
- Meaningful accomplishments
- Reduced stress and anxiety
- Greater autonomy
- Deeper satisfaction

**In a world of shallow work and constant distraction, your ability to do deep work is your competitive advantage and path to meaningful contribution.**`
  },
  {
    id: 'article-connection-1',
    title: 'Nurturing Meaningful Relationships',
    type: 'article',
    duration: 7,
    category: 'connection',
    tags: ['relationships', 'social', 'support'],
    description: 'Strengthen your connections and build a supportive social network',
    timeOfDay: 'anytime',
    intensity: 'gentle',
    content: `# Nurturing Meaningful Relationships

Quality relationships are one of the strongest predictors of mental health and life satisfaction.

## Why Relationships Matter

Strong social connections:
- Reduce risk of depression and anxiety
- Boost immune function
- Increase lifespan
- Provide emotional support
- Create sense of belonging
- Offer different perspectives

## Quality Over Quantity

You don't need many friends. You need:
- A few deep, trusted relationships
- People who know the real you
- Mutual support and respect
- Shared values or interests
- Genuine care for each other

## Building Deeper Connections

### Present-Moment Attention
- Put your phone away
- Make eye contact
- Listen more than you speak
- Be fully there

### Vulnerability
- Share what you're really thinking
- Admit when you're struggling
- Ask for help when needed
- Be authentic, not perfect

### Consistency
- Regular contact, even brief
- Show up when you say you will
- Remember important dates
- Check in during hard times

### Reciprocity
- Give and receive support
- Share responsibilities
- Both invest in the relationship
- Balance in effort

## Maintaining Long-Distance Relationships

- Schedule regular video calls
- Send thoughtful messages
- Share daily moments (photos, voice notes)
- Plan visits when possible
- Quality communication over quantity

## When Relationships Need Repair

### Address Issues Directly
- Speak up when something bothers you
- Use "I" statements: "I felt..." not "You always..."
- Listen to their perspective
- Seek to understand, not win

### Apologize Sincerely
- Take responsibility
- Acknowledge impact
- Don't make excuses
- Make amends
- Change behavior

### Know When to Let Go
Sometimes relationships end, and that's okay:
- Consistently one-sided effort
- Disrespect or mistreatment
- Values fundamentally misaligned
- Toxic patterns that won't change

## Making New Connections

### Where to Meet People
- Shared interest groups or classes
- Volunteer opportunities
- Workplace or professional networks
- Neighborhood events
- Online communities with offline meetups

### Starting Conversations
- Ask open-ended questions
- Show genuine curiosity
- Share something about yourself
- Follow up on what they share
- Suggest a specific next step

### Building New Friendships
- Consistent contact (weekly at first)
- Gradually increase depth
- Invite them to activities
- Introduce them to other friends
- Be patient—friendship takes time

## Different Types of Relationships

### Intimate Partner
- Deep emotional connection
- Physical and emotional intimacy
- Shared life goals
- Mutual growth

### Close Friends
- Emotional support
- Shared experiences
- Trust and vulnerability
- Fun and laughter

### Family
- May or may not be close
- Navigate complicated dynamics
- Set boundaries as needed
- Choose your level of engagement

### Acquaintances and Casual Friends
- Light, positive interactions
- Shared activities or interests
- Less emotional depth
- Still valuable

## Digital Age Challenges

### Social Media
- Can supplement but not replace real connection
- Compare your real life to others' highlights
- Use to facilitate offline connection
- Notice if it makes you feel worse

### Text vs. Call vs. In-Person
- Text: Logistics and light touch
- Call: More personal, hear tone
- Video: See expressions, more connected
- In-person: Deepest connection, full presence

### Setting Boundaries
- It's okay to not always be available
- Respond when you can genuinely engage
- Use Do Not Disturb
- Communicate your communication preferences

## Nurturing Yourself in Relationships

### Maintain Your Identity
- Keep your own interests
- Spend time alone
- Have individual friendships
- Pursue personal goals

### Set Healthy Boundaries
- Say no to what doesn't work for you
- Communicate your needs
- Respect others' boundaries
- Don't lose yourself in relationships

### Choose Quality Time
- Be selective about commitments
- Deep time with few beats shallow time with many
- Say no to draining social obligations
- Save energy for what matters

## When You Feel Lonely

Loneliness is common, even when surrounded by people:
- Quality matters more than quantity
- One deep connection beats many shallow ones
- Reach out even when it's hard
- Join groups aligned with your values
- Consider therapy for support

## Relationship Maintenance

### Regular Check-Ins
- "How are you really doing?"
- Share wins and struggles
- Express appreciation
- Address small issues before they grow

### Celebrate Together
- Acknowledge achievements
- Be genuinely happy for their success
- Create positive shared memories
- Mark important occasions

### Support During Hard Times
- Show up (even if you don't know what to say)
- Offer specific help
- Check in regularly
- Respect their process

**Meaningful relationships are built through consistent presence, genuine care, and mutual vulnerability. They're worth the effort.**`
  },
  {
    id: 'article-coping-1',
    title: 'Building Your Coping Toolkit',
    type: 'article',
    duration: 6,
    category: 'coping',
    tags: ['strategies', 'resilience', 'tools'],
    description: 'Develop a personalized set of coping strategies for life\'s challenges',
    timeOfDay: 'anytime',
    intensity: 'moderate',
    content: `# Building Your Coping Toolkit

Effective coping isn't about having one perfect strategy—it's about having a toolkit you can draw from based on the situation.

## Types of Coping Strategies

### Problem-Focused Coping
When you can change the situation:
- Break problems into steps
- Seek information or advice
- Take direct action
- Set boundaries
- Make a plan

### Emotion-Focused Coping
When you can't change the situation:
- Process your feelings
- Seek support
- Practice self-compassion
- Accept what you can't control
- Find meaning

### Both Are Valuable
- Use problem-focused when possible
- Use emotion-focused when necessary
- Often need both simultaneously
- Different situations need different approaches

## Your Personal Toolkit

### Physical Strategies

**Movement:**
- Walk or run
- Dance
- Yoga or stretching
- Weight lifting
- Sports

**Grounding:**
- Deep breathing
- Progressive muscle relaxation
- Cold water on face
- Hold ice
- 5-4-3-2-1 technique

**Rest:**
- Nap
- Lie down
- Sleep
- Take a break
- Do nothing

### Mental Strategies

**Cognitive:**
- Challenge negative thoughts
- Reframe the situation
- List what you can control
- Focus on facts vs. feelings
- Problem-solve step by step

**Distraction:**
- Read
- Watch comfort shows
- Puzzles or games
- Learn something new
- Creative projects

**Mindfulness:**
- Meditation
- Body scan
- Mindful breathing
- Present moment awareness
- Acceptance practice

### Emotional Strategies

**Expression:**
- Journal
- Talk to someone
- Cry
- Voice note to yourself
- Art or music

**Regulation:**
- Name your emotions
- Accept feelings without judgment
- Self-compassion practice
- Validation
- Emotional release

**Connection:**
- Call a friend
- Hug someone
- Pet an animal
- Join a support group
- Spend time with loved ones

### Sensory Strategies

**Sight:**
- Nature
- Art
- Photos of loved ones
- Favorite colors
- Organized spaces

**Sound:**
- Music
- Nature sounds
- White noise
- Silence
- Comforting voices

**Touch:**
- Soft blanket
- Warm bath
- Massage
- Comfortable clothes
- Fidget tools

**Smell:**
- Essential oils
- Fresh air
- Candles
- Comfort scents
- Nature

**Taste:**
- Tea
- Comfort food (in moderation)
- Cold water
- Mints
- Favorite flavors

## Building Your Personal List

### Identify What Works for You

Ask yourself:
- What has helped in the past?
- What makes me feel calmer?
- What gives me energy?
- What helps me think clearly?
- What brings me comfort?

### Categories to Cover

Aim for strategies that:
- Take 5 minutes or less
- Take 15-30 minutes
- Can be done anywhere
- Require privacy
- Are free
- Cost money but worth it

### Test and Refine
- Try different strategies
- Notice what actually helps
- Be honest about what doesn't work
- Keep what's effective
- Adjust for different situations

## Matching Strategy to Situation

### High Stress/Anxiety
- Breathing exercises
- Grounding techniques
- Movement
- Cold exposure
- Progressive muscle relaxation

### Sadness/Depression
- Gentle movement
- Connection with others
- Achievable tasks
- Comfort activities
- Nature

### Anger/Frustration
- Intense physical activity
- Express in journal
- Take space
- Problem-solve when calmer
- Channel into productive action

### Overwhelm
- Break tasks into steps
- Ask for help
- Simplify
- Say no
- Rest

## Advanced Coping Skills

### Radical Acceptance
- Some things can't be changed
- Fighting reality increases suffering
- Acceptance doesn't mean approval
- Opens door to moving forward

### Opposite Action
- When emotion doesn't fit the facts
- Act opposite to emotional urge
- Especially helpful for anxiety and depression
- Builds evidence against false beliefs

### Self-Soothing
- Treat yourself with kindness
- Use all five senses
- Create comfort
- Speak to yourself as you would a friend

## What Doesn't Work

### Unhelpful Coping (that might feel good temporarily)

- Substance use
- Overeating or restrictive eating
- Self-harm
- Lashing out at others
- Avoiding all discomfort
- Excessive screen time
- Retail therapy
- Risky behaviors

These might provide temporary relief but create more problems.

## When to Seek Professional Help

Consider therapy if:
- You're relying on unhealthy coping
- Your strategies aren't working
- Distress is overwhelming
- Functioning is impaired
- You're having thoughts of self-harm
- You want to develop better skills

## Maintenance and Growth

### Regular Practice
- Use coping skills proactively, not just in crisis
- Build stress resilience
- Practice when calm so skills are ready when needed

### Continuous Learning
- Try new strategies
- Take classes (yoga, meditation, etc.)
- Read about coping
- Learn from others
- Adjust as you grow

### Self-Compassion
- Coping isn't about perfection
- Some days are harder than others
- Be kind to yourself
- Every moment is a chance to begin again

**Your coping toolkit is personal and evolving. Build it thoughtfully, use it generously, and adjust it as you grow.**`
  },

  // ========== AUDIO GUIDES ==========
  {
    id: 'audio-breathing-1',
    title: 'Box Breathing for Calm',
    type: 'audio',
    duration: 5,
    category: 'stress',
    tags: ['breathing', 'anxiety', 'quick'],
    description: 'Guided 4-4-4-4 breathing pattern to activate your relaxation response',
    timeOfDay: 'anytime',
    intensity: 'gentle',
    url: '/audio/box-breathing.mp3',
    thumbnailUrl: '/images/audio-breathing.jpg',
    content: 'Guided audio for box breathing technique: inhale 4, hold 4, exhale 4, hold 4. Perfect for managing stress and anxiety in the moment.'
  },
  {
    id: 'audio-body-scan-1',
    title: 'Full Body Scan Meditation',
    type: 'audio',
    duration: 15,
    category: 'mindfulness',
    tags: ['meditation', 'relaxation', 'awareness'],
    description: 'Progressive body awareness meditation for deep relaxation and stress release',
    timeOfDay: 'evening',
    intensity: 'gentle',
    url: '/audio/body-scan.mp3',
    thumbnailUrl: '/images/audio-bodyscan.jpg',
    content: 'Guided body scan meditation from head to toe. Release tension, increase body awareness, and promote deep relaxation.'
  },
  {
    id: 'audio-sleep-1',
    title: 'Sleep Meditation Journey',
    type: 'audio',
    duration: 20,
    category: 'sleep',
    tags: ['sleep', 'insomnia', 'relaxation'],
    description: 'Gentle guided meditation designed to ease you into restful sleep',
    timeOfDay: 'evening',
    intensity: 'gentle',
    url: '/audio/sleep-meditation.mp3',
    thumbnailUrl: '/images/audio-sleep.jpg',
    content: 'Calming bedtime meditation with visualization and progressive relaxation. Perfect for insomnia or racing thoughts at night.'
  },
  {
    id: 'audio-morning-1',
    title: 'Energizing Morning Meditation',
    type: 'audio',
    duration: 10,
    category: 'energy',
    tags: ['morning', 'motivation', 'positivity'],
    description: 'Start your day with intention, energy, and positive mindset',
    timeOfDay: 'morning',
    intensity: 'energizing',
    url: '/audio/morning-meditation.mp3',
    thumbnailUrl: '/images/audio-morning.jpg',
    content: 'Uplifting morning meditation to set intentions, boost energy, and cultivate gratitude for the day ahead.'
  },
  {
    id: 'audio-anxiety-1',
    title: 'Anxiety Release Technique',
    type: 'audio',
    duration: 8,
    category: 'anxiety',
    tags: ['anxiety', 'panic', 'grounding'],
    description: 'Guided practice to interrupt anxiety spirals and find your center',
    timeOfDay: 'anytime',
    intensity: 'gentle',
    url: '/audio/anxiety-release.mp3',
    thumbnailUrl: '/images/audio-anxiety.jpg',
    content: 'Practical techniques for managing acute anxiety: grounding, breathing, and cognitive reframing. Use when anxiety spikes.'
  },
  {
    id: 'audio-focus-1',
    title: 'Focus & Concentration Primer',
    type: 'audio',
    duration: 7,
    category: 'focus',
    tags: ['productivity', 'concentration', 'clarity'],
    description: 'Prepare your mind for deep work and sustained attention',
    timeOfDay: 'morning',
    intensity: 'moderate',
    url: '/audio/focus-primer.mp3',
    thumbnailUrl: '/images/audio-focus.jpg',
    content: 'Brief meditation to clear mental clutter and prime your brain for focused work. Perfect before important tasks.'
  },
  {
    id: 'audio-gratitude-1',
    title: 'Gratitude Practice',
    type: 'audio',
    duration: 6,
    category: 'mindfulness',
    tags: ['gratitude', 'positivity', 'wellbeing'],
    description: 'Cultivate appreciation and shift your mindset toward abundance',
    timeOfDay: 'anytime',
    intensity: 'gentle',
    url: '/audio/gratitude.mp3',
    thumbnailUrl: '/images/audio-gratitude.jpg',
    content: 'Guided gratitude meditation to shift perspective, increase wellbeing, and cultivate positive emotions.'
  },

  // ========== VIDEO GUIDES ==========
  {
    id: 'video-stretches-1',
    title: 'Desk Stretches for Tension Relief',
    type: 'video',
    duration: 8,
    category: 'stress',
    tags: ['movement', 'workplace', 'tension'],
    description: 'Quick stretching routine to release physical tension from sitting',
    timeOfDay: 'afternoon',
    intensity: 'gentle',
    url: '/video/desk-stretches.mp4',
    thumbnailUrl: '/images/video-stretches.jpg',
    content: 'Follow-along stretching routine for neck, shoulders, back, and hips. Perfect for office workers and anyone sitting for long periods.'
  },
  {
    id: 'video-grounding-1',
    title: '5-4-3-2-1 Grounding Exercise',
    type: 'video',
    duration: 5,
    category: 'anxiety',
    tags: ['grounding', 'panic', 'present'],
    description: 'Visual guide to the powerful 5-4-3-2-1 grounding technique',
    timeOfDay: 'anytime',
    intensity: 'gentle',
    url: '/video/grounding.mp4',
    thumbnailUrl: '/images/video-grounding.jpg',
    content: 'Step-by-step visual guide through the 5-4-3-2-1 grounding technique. Perfect for managing anxiety and panic attacks.'
  },
  {
    id: 'video-yoga-1',
    title: 'Gentle Evening Yoga Flow',
    type: 'video',
    duration: 15,
    category: 'sleep',
    tags: ['yoga', 'relaxation', 'wind-down'],
    description: 'Calming yoga sequence to prepare your body and mind for sleep',
    timeOfDay: 'evening',
    intensity: 'gentle',
    url: '/video/evening-yoga.mp4',
    thumbnailUrl: '/images/video-yoga.jpg',
    content: 'Gentle, slow-paced yoga flow designed to release tension and prepare for restful sleep. No experience needed.'
  },
  {
    id: 'video-energize-1',
    title: 'Quick Energy Boost Workout',
    type: 'video',
    duration: 10,
    category: 'energy',
    tags: ['exercise', 'movement', 'vitality'],
    description: 'Short, energizing workout to combat fatigue and boost mood',
    timeOfDay: 'morning',
    intensity: 'energizing',
    url: '/video/energy-workout.mp4',
    thumbnailUrl: '/images/video-energy.jpg',
    content: 'High-energy, low-impact workout to wake up your body and mind. Perfect midday pick-me-up or morning energizer.'
  },
  {
    id: 'video-walking-meditation-1',
    title: 'Mindful Walking Practice',
    type: 'video',
    duration: 12,
    category: 'mindfulness',
    tags: ['walking', 'meditation', 'nature'],
    description: 'Learn to transform any walk into a meditative practice',
    timeOfDay: 'anytime',
    intensity: 'gentle',
    url: '/video/walking-meditation.mp4',
    thumbnailUrl: '/images/video-walking.jpg',
    content: 'Visual guide to mindful walking meditation. Bring awareness to each step and turn routine walks into contemplative practice.'
  },
];

// Helper functions for filtering content
export const getContentByCategory = (category: ContentCategory): ContentItem[] => {
  return contentLibrary.filter(item => item.category === category);
};

export const getContentByType = (type: ContentType): ContentItem[] => {
  return contentLibrary.filter(item => item.type === type);
};

export const getContentByTag = (tag: string): ContentItem[] => {
  return contentLibrary.filter(item => item.tags.includes(tag));
};

export const getContentByTimeOfDay = (timeOfDay: 'morning' | 'afternoon' | 'evening'): ContentItem[] => {
  return contentLibrary.filter(item =>
    item.timeOfDay === timeOfDay || item.timeOfDay === 'anytime'
  );
};

export const getContentByDuration = (maxDuration: number): ContentItem[] => {
  return contentLibrary.filter(item => item.duration <= maxDuration);
};

export const searchContent = (query: string): ContentItem[] => {
  const lowerQuery = query.toLowerCase();
  return contentLibrary.filter(item =>
    item.title.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
