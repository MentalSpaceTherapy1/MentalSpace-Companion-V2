# MentalSpace Therapy Mobile App — Complete Native Application Specification

## Project Overview

**App Name:** MentalSpace
**Tagline:** "Daily check-ins → a plan that actually fits your life → real therapist when needed."
**Platform:** iOS (Swift/SwiftUI) & Android (Kotlin/Jetpack Compose) — Native builds recommended
**Alternative:** React Native with native modules for performance-critical features
**Design Philosophy:** Ultra-modern, vibrant, calming yet energizing — wellness meets tech-forward
**Version:** 3.0 (Production-Ready Native Application)
**Regulatory Position:** Wellness companion app — NOT an EHR, NOT a medical device

---

## Critical Regulatory Boundaries

### THIS APP IS:
- A wellness companion and self-help tool
- A bridge to professional care
- A habit-building support system
- A crisis resource navigator

### THIS APP IS NOT:
- An Electronic Health Record (EHR)
- A diagnostic tool
- A treatment platform
- A medical device under FDA regulation

### Explicit Exclusions (DO NOT BUILD):
- Progress notes / SOAP notes / clinical documentation
- Diagnosis codes (ICD-10, DSM-5)
- Medication tracking or management
- Insurance/billing information
- Provider charting capabilities
- Claims like "treats," "cures," or "clinically proven"

### Safe Language:
- "Supports your mental wellness"
- "Helps you manage stress"
- "Wellness companion"
- "Connects you to professional care"

---

## Brand Identity & Design System

### Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | Sky Blue | `#38B6E0` | Headers, primary buttons, progress indicators |
| Secondary | Fresh Green | `#22A267` | Success states, positive metrics, CTAs |
| Accent Gradient | Blue → Green | `#38B6E0 → #22A267` | Hero sections, achievements |
| Background Light | Off-White | `#F8FAFB` | Main app background |
| Background Card | Pure White | `#FFFFFF` | Card surfaces, modals |
| Text Primary | Charcoal | `#1A2B3C` | Headlines, body text |
| Text Secondary | Slate | `#6B7A8C` | Captions, helper text |
| Warning | Amber | `#F5A623` | Attention states |
| Alert | Soft Red | `#E85A5A` | Crisis detection, SOS |
| Success | Mint | `#4ECDC4` | Completed tasks, positive trends |
| SOS Gradient | Coral → Rose | `#FF6B6B → #E85A5A` | Emergency states |
| Dark Mode BG | Deep Navy | `#0D1B2A` | Dark mode background |
| Dark Mode Surface | Slate Blue | `#1B2838` | Dark mode cards |

### Typography

| Element | iOS | Android | Weight | Size |
|---------|-----|---------|--------|------|
| Display | SF Pro Display | Google Sans | Bold | 32-40px |
| Headlines | SF Pro Display | Google Sans | Semibold | 24-28px |
| Body | SF Pro Text | Roboto | Regular | 16-17px |
| Caption | SF Pro Text | Roboto | Medium | 13-14px |

### Design Principles

1. **Native-First** — Platform-specific components, gestures, and patterns
2. **Glassmorphism Elements** — Frosted glass with subtle blur (60-70% opacity)
3. **Generous White Space** — Breathable, calming layouts
4. **Micro-interactions** — Haptic feedback, spring animations on all interactions
5. **Organic Shapes** — Rounded corners (16-24px), flowing curves
6. **Dynamic Gradients** — Shift based on mood/time of day
7. **Dark Mode** — True dark with muted accents, OLED-friendly
8. **Accessible by Default** — Large touch targets, high contrast options

---

## PART 1: NATIVE MOBILE INFRASTRUCTURE (Must-Have)

### 1.1 Native Authentication & Session Management

**Purpose:** Personal, secure, persistent identity that meets App Store requirements.

**Authentication Methods:**
```
┌─────────────────────────────────────────────┐
│  WELCOME TO MENTALSPACE                     │
├─────────────────────────────────────────────┤
│                                             │
│  [    Continue with Apple    ]              │
│  [    Continue with Google   ]              │
│                                             │
│  ──────────── or ────────────               │
│                                             │
│  [    Sign up with Email     ]              │
│  [    Log in                 ]              │
│                                             │
│  By continuing, you agree to our            │
│  Terms of Service and Privacy Policy        │
│                                             │
└─────────────────────────────────────────────┘
```

**Implementation Requirements:**

| Feature | iOS | Android |
|---------|-----|---------|
| Social Auth | Sign in with Apple (required), Google | Google Sign-In, Apple (optional) |
| Email Auth | Firebase Auth or custom | Firebase Auth or custom |
| Biometric | Face ID, Touch ID | Fingerprint, Face Unlock |
| Session | Keychain storage | EncryptedSharedPreferences |
| Token Refresh | Silent refresh, 30-day expiry | Silent refresh, 30-day expiry |

**Session Management:**
- Persistent login (user stays logged in until explicit logout)
- Biometric unlock option (prompted after first login)
- Automatic session refresh in background
- Secure token storage (never in plain UserDefaults/SharedPrefs)
- "Remember this device" for trusted devices
- Remote session revocation capability

**Biometric Unlock Flow:**
```
App Launch (authenticated user)
    ↓
Check biometric preference
    ↓
If enabled: Prompt Face ID/Fingerprint
    ↓
Success: Load home screen
Fail (3x): Fall back to password
```

**Account Recovery:**
- Email-based password reset
- "Forgot password" flow with magic link option
- Account recovery without losing data

---

### 1.2 Push Notifications (Behavioral, Ethical)

**Purpose:** Drive engagement and habit formation without being intrusive or clinical.

**Notification Categories:**

| Category | Example | Timing | User Control |
|----------|---------|--------|--------------|
| Daily Check-in | "Ready for your 60-second check-in?" | User-selected time | On/Off |
| Gentle Nudge | "You haven't checked in today. How are you?" | 4 hours after missed time | On/Off |
| Action Reminder | "Your 5-minute breathing exercise — ready when you are" | At scheduled action time | On/Off |
| Weekly Summary | "Your week in review is ready" | Sunday 7pm | On/Off |
| Streak Celebration | "5 days in a row! You're building something" | After check-in | On/Off |
| Therapist Booking | "Your session with [Name] is tomorrow at 4pm" | 24hr + 1hr before | Always on |
| Re-engagement | "We miss you. One check-in to restart your streak?" | After 3 days inactive | On/Off |

**Notification Rules (CRITICAL):**
- NO clinical language in notification text
- NO crisis content visible on lock screen
- NO specific mood/health data in preview
- Privacy mode hides all content: "MentalSpace" only
- Respect Do Not Disturb / Focus modes
- User controls ALL notification types individually
- Smart frequency: reduce if user ignores 3+ in a row

**Privacy Mode Notifications:**
```
Standard: "Ready for your 60-second check-in?"
Privacy:  "MentalSpace" (tap to open)
```

**Implementation:**
- iOS: APNs with UserNotifications framework
- Android: FCM with NotificationCompat
- Rich notifications with quick actions (iOS 15+, Android 12+)
- Notification scheduling (local) for reminders
- Server-triggered for time-sensitive (session reminders)

**Quick Actions from Notification:**
```
[Start Check-in]  [Snooze 1hr]  [Skip Today]
```

---

### 1.3 Offline-First Architecture

**Purpose:** Mental health support must never disappear due to connectivity issues.

**Offline Capabilities:**

| Feature | Offline Behavior |
|---------|------------------|
| Daily Check-in | Full functionality, queued for sync |
| Journal Entry | Full functionality, queued for sync |
| SOS Protocols | 100% cached, works completely offline |
| Crisis Resources | Cached phone numbers, text lines |
| Today's Plan | Cached at last sync |
| Past Check-ins | Last 30 days cached |
| Weekly Summary | Last summary cached |
| Therapist Booking | Shows cached availability, confirms when online |
| Content Library | Core exercises cached (breathing, grounding) |

**Sync Strategy:**
```
On App Launch:
  1. Load from local cache immediately
  2. Background sync with server
  3. Merge changes (last-write-wins for check-ins)
  4. Update UI silently

On Check-in Submit:
  1. Save to local database immediately
  2. Show success animation
  3. Queue for server sync
  4. Sync when connectivity restored
  5. Resolve conflicts if any

Conflict Resolution:
  - Check-ins: Keep most recent
  - Preferences: Server wins (user may have changed on web)
  - Journal: Keep both, merge with timestamps
```

**Offline Indicator:**
```
┌─────────────────────────────────────────────┐
│ ○ Offline — your data will sync when       │
│   you're back online                        │
└─────────────────────────────────────────────┘
```

**Technical Implementation:**
- iOS: Core Data with CloudKit sync or Realm
- Android: Room database with WorkManager for sync
- Shared: SQLite with sync adapter pattern

**Cache Priorities (Storage Management):**
1. Critical: SOS protocols, crisis numbers, auth tokens
2. High: Last 7 days check-ins, today's plan, core exercises
3. Medium: Last 30 days check-ins, content library
4. Low: Historical summaries, extended content

---

### 1.4 Native SOS Access (Global, Persistent)

**Purpose:** Immediate emergency access from anywhere in the app.

**Access Points:**
1. **Persistent Bottom Nav Icon** — Always visible SOS tab
2. **Floating Action Button** — On home screen (configurable)
3. **Shake Gesture** — Shake device to trigger SOS (opt-in)
4. **Lock Screen Widget** — iOS 16+ / Android 12+ (opt-in)
5. **Siri/Google Assistant** — "Hey Siri, open MentalSpace SOS"

**Native Integrations:**

| Action | iOS Implementation | Android Implementation |
|--------|-------------------|----------------------|
| Call 988 | `tel://988` via UIApplication | `Intent.ACTION_DIAL` |
| Call 911 | `tel://911` via UIApplication | `Intent.ACTION_DIAL` |
| Text Crisis Line | Native Messages with pre-filled | SMS Intent with body |
| Text Trusted Contact | Native Messages with pre-filled | SMS Intent with body |
| Share Location | Core Location + Messages | Location + Share Intent |

**SOS Quick Panel (replaces full protocol for urgent needs):**
```
┌─────────────────────────────────────────────┐
│  NEED HELP NOW?                             │
├─────────────────────────────────────────────┤
│                                             │
│  [CALL 988]        [CALL 911]               │
│  Crisis Line        Emergency               │
│                                             │
│  [TEXT 741741]     [TEXT MY PERSON]         │
│  Crisis Text Line   [Contact Name]          │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Or get guided support:                     │
│  [Overwhelmed]     [Panic]                  │
│  [Angry]           [Can't Sleep]            │
│                                             │
└─────────────────────────────────────────────┘
```

**Offline SOS:**
- All phone numbers cached locally
- Protocols cached and functional offline
- Pre-composed text messages stored locally
- Location sharing attempts even offline (may queue)

---

### 1.5 Account Settings & Data Control

**Purpose:** Build trust through transparency and user control.

**Settings Screen Structure:**
```
┌─────────────────────────────────────────────┐
│  SETTINGS                                   │
├─────────────────────────────────────────────┤
│                                             │
│  ACCOUNT                                    │
│  ├─ Profile & Email                         │
│  ├─ Change Password                         │
│  ├─ Biometric Unlock (Face ID)      [ON]    │
│  └─ Connected Accounts (Google)             │
│                                             │
│  NOTIFICATIONS                              │
│  ├─ Daily Check-in Reminder         [ON]    │
│  │   └─ Time: 8:00 AM                       │
│  ├─ Action Reminders                [ON]    │
│  ├─ Weekly Summary                  [ON]    │
│  ├─ Gentle Nudges                   [ON]    │
│  ├─ Streak Celebrations             [ON]    │
│  └─ Privacy Mode (hide content)     [OFF]   │
│                                             │
│  PREFERENCES                                │
│  ├─ Care Preferences                        │
│  ├─ Tone & Communication Style              │
│  ├─ Daily Time Budget                       │
│  ├─ Things That Don't Work for Me           │
│  └─ Weekly Focus Settings                   │
│                                             │
│  APPEARANCE                                 │
│  ├─ Dark Mode                    [System]   │
│  ├─ Text Size                    [Default]  │
│  └─ Reduce Motion                   [OFF]   │
│                                             │
│  LOCALIZATION                               │
│  ├─ Timezone              [America/New_York]│
│  └─ Language                     [English]  │
│                                             │
│  INTEGRATIONS                               │
│  ├─ Apple Health                    [OFF]   │
│  ├─ Google Fit                      [OFF]   │
│  └─ Calendar                        [OFF]   │
│                                             │
│  SAFETY                                     │
│  ├─ Trusted Contacts                        │
│  ├─ Safety Plan                             │
│  └─ Emergency Resources                     │
│                                             │
│  MY DATA                                    │
│  ├─ Export My Data                          │
│  ├─ Delete My Account                       │
│  └─ Data & Privacy Info                     │
│                                             │
│  ABOUT                                      │
│  ├─ AI Disclosure                           │
│  ├─ Privacy Policy                          │
│  ├─ Terms of Service                        │
│  ├─ Crisis Disclaimer                       │
│  ├─ App Version: 1.0.0 (build 42)           │
│  └─ Licenses                                │
│                                             │
│  [Log Out]                                  │
│                                             │
└─────────────────────────────────────────────┘
```

**Data Export:**
```
Export Your Data
────────────────
Download everything MentalSpace knows about you.

Includes:
• All check-in history
• Journal entries
• Care preferences
• Weekly summaries
• Action completion history

Format: JSON + PDF summary
Delivery: Email within 24 hours

[Request Export]
```

**Account Deletion:**
```
Delete Your Account
───────────────────
This will permanently delete:
• Your account and profile
• All check-in history
• All journal entries
• All preferences and settings
• All data associated with your account

This action cannot be undone.

To confirm, type "DELETE" below:
[________________]

[Cancel]  [Delete Everything]
```

**AI Disclosure Screen (Required):**
```
┌─────────────────────────────────────────────┐
│  HOW AI WORKS IN MENTALSPACE                │
├─────────────────────────────────────────────┤
│                                             │
│  MentalSpace uses artificial intelligence   │
│  to personalize your experience:            │
│                                             │
│  ✓ Your daily plan is generated by AI      │
│    based on your check-ins and preferences  │
│                                             │
│  ✓ Insights and patterns are identified    │
│    using machine learning                   │
│                                             │
│  ✓ Content recommendations are             │
│    personalized to your needs              │
│                                             │
│  IMPORTANT                                  │
│                                             │
│  AI suggestions are wellness tools only.    │
│  They are NOT:                              │
│  • Medical advice                           │
│  • Mental health diagnosis                  │
│  • A substitute for professional care       │
│                                             │
│  If you're struggling, please talk to a     │
│  licensed therapist or counselor.           │
│                                             │
│  [I Understand]                             │
│                                             │
└─────────────────────────────────────────────┘
```

---

## PART 2: EXPERIENCE UPGRADES (Strongly Recommended)

### 2.1 "Today" Home Screen (Single Focus)

**Purpose:** Answer "What should I do right now?" in one glance.

**Home Screen Layout:**
```
┌─────────────────────────────────────────────┐
│  Good morning, Sarah                        │
│  Tuesday, December 24                       │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  5-DAY STREAK                       │    │
│  │  You're showing up for yourself     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  TODAY'S CHECK-IN                   │    │
│  │                                     │    │
│  │  [  Start Check-in (60 sec)  ]      │    │
│  │                                     │    │
│  │  Yesterday: Mood 4 • Stress 3       │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  THIS WEEK: SLEEP RECOVERY          │    │
│  │  [████████░░] Day 4 of 7            │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  UP NEXT                            │    │
│  │                                     │    │
│  │  5-min breathing • 10:00 AM         │    │
│  │  [Start Now]  [Reschedule]          │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  TODAY'S PLAN                       │    │
│  │  4 actions • ~15 min total          │    │
│  │  [View Full Plan →]                 │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  TALK TO SOMEONE                    │    │
│  │  Next available: Today 4pm          │    │
│  │  [Book Therapist]                   │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│  [Home]  [Plan]  [SOS]  [Insights] [More]   │
└─────────────────────────────────────────────┘
```

**Adaptive States:**

*If check-in not done:*
```
┌─────────────────────────────────────────────┐
│  HOW ARE YOU TODAY?                         │
│                                             │
│  Take 60 seconds to check in.               │
│  Your plan will be ready right after.       │
│                                             │
│  [  Start Check-in  ]                       │
└─────────────────────────────────────────────┘
```

*If all actions completed:*
```
┌─────────────────────────────────────────────┐
│  YOU'RE DONE FOR TODAY!                     │
│                                             │
│  All 4 actions completed                    │
│  You showed up for yourself today.          │
│                                             │
│  [Bonus: Gratitude Journal]                 │
└─────────────────────────────────────────────┘
```

*If struggling (low mood detected):*
```
┌─────────────────────────────────────────────┐
│  WE SEE YOU'RE HAVING A HARD DAY            │
│                                             │
│  That's okay. Here's a lighter plan.        │
│  Just one thing today:                      │
│                                             │
│  [5-min grounding exercise]                 │
│                                             │
│  [Or talk to someone →]                     │
└─────────────────────────────────────────────┘
```

**Time-Aware Greetings:**
- 5-11am: "Good morning, [Name]"
- 11am-5pm: "Good afternoon, [Name]"
- 5-9pm: "Good evening, [Name]"
- 9pm-5am: "Hey [Name], winding down?"

---

### 2.2 Streaks, Badges & Progress Visualization

**Purpose:** Affirmation, not gamification. No competition, no pressure.

**Streak System:**
```
┌─────────────────────────────────────────────┐
│  YOUR STREAK                                │
├─────────────────────────────────────────────┤
│                                             │
│           5 DAYS                            │
│                                             │
│    M    T    W    T    F    S    S          │
│   [✓]  [✓]  [✓]  [✓]  [✓]  [ ]  [ ]        │
│                                             │
│  You've checked in 5 days in a row.         │
│  That's real commitment to yourself.        │
│                                             │
└─────────────────────────────────────────────┘
```

**Streak Grace Period:**
- Miss 1 day: "Your streak is safe until midnight tomorrow"
- Miss 2 days: Streak resets, but no shame
- Message: "Streaks end sometimes. What matters is that you're here now."

**Milestone Celebrations (Non-Intrusive):**

| Milestone | Celebration |
|-----------|-------------|
| 3 days | "You're building a habit" |
| 7 days | "One week! You're showing up for yourself" |
| 14 days | "Two weeks strong" |
| 30 days | "One month. This is becoming part of who you are." |
| 60 days | Badge unlock: "Consistent" |
| 90 days | Badge unlock: "Dedicated" |
| 180 days | Badge unlock: "Transformed" |
| 365 days | Special celebration + option to share |

**Badges (Achievements):**
```
┌─────────────────────────────────────────────┐
│  YOUR ACHIEVEMENTS                          │
├─────────────────────────────────────────────┤
│                                             │
│  [🌱] First Check-in                        │
│  [📅] 7-Day Streak                          │
│  [🧘] 10 Breathing Exercises                │
│  [💪] Completed a Weekly Focus              │
│  [🌙] 5 Sleep Actions                       │
│  [💬] First Therapist Session               │
│  [🔒] (Locked) 30-Day Streak                │
│  [🔒] (Locked) 50 Actions Completed         │
│                                             │
│  These are private. Only you can see them.  │
│                                             │
└─────────────────────────────────────────────┘
```

**Progress Visualization:**
```
┌─────────────────────────────────────────────┐
│  YOUR PROGRESS                              │
├─────────────────────────────────────────────┤
│                                             │
│  LAST 30 DAYS                               │
│                                             │
│  Check-ins: 24 of 30 (80%)                  │
│  [████████████████░░░░]                     │
│                                             │
│  Actions Completed: 67 of 96 (70%)          │
│  [██████████████░░░░░░]                     │
│                                             │
│  Weekly Focuses: 3 completed                │
│  [Sleep ✓] [Stress ✓] [Anxiety ✓]          │
│                                             │
│  Therapist Sessions: 2                      │
│                                             │
│  [View Detailed Insights →]                 │
│                                             │
└─────────────────────────────────────────────┘
```

**Philosophy:**
- Celebrate showing up, not perfection
- Private by default (user chooses to share)
- No comparison to others
- No leaderboards
- Gentle language for missed days
- Focus on "you vs. yesterday you"

---

### 2.3 Native Animations & Haptics

**Purpose:** Make the app feel alive, responsive, and calming.

**Haptic Feedback Map:**

| Interaction | iOS Haptic | Android Haptic |
|-------------|-----------|----------------|
| Check-in slider move | Light impact | Light click |
| Check-in selection confirm | Medium impact | Medium click |
| Action completed | Success notification | Tick |
| Streak milestone | Success + fanfare | Double tick |
| SOS button tap | Heavy impact | Strong click |
| Breathing inhale peak | Soft impact | Gentle tick |
| Breathing exhale complete | Soft impact | Gentle tick |
| Error/Invalid | Error notification | Error vibrate |
| Pull to refresh | Light impact | Light click |

**Animation Standards:**

| Animation | Duration | Easing | Notes |
|-----------|----------|--------|-------|
| Screen transitions | 300ms | ease-out | Match platform defaults |
| Card expand/collapse | 250ms | spring | Bouncy, natural feel |
| Check-in slide | Continuous | linear | Smooth, no jank |
| Completion confetti | 2000ms | — | Subtle, optional |
| Progress bar fill | 400ms | ease-in-out | Satisfying fill |
| Breathing circle | 4/7/8 sec | sine | Smooth, hypnotic |
| Modal present | 350ms | spring | iOS: slide up, Android: fade |
| Button press | 100ms | ease-out | Subtle scale (0.98) |

**Breathing Exercise Animation:**
```
      ┌─────────┐
     /           \
    /             \
   │   INHALE     │  ← Circle expands over 4 seconds
    \             /     Haptic pulse at start
     \           /
      └─────────┘

      ┌─────────┐
     /           \
    /             \
   │    HOLD      │  ← Circle pauses for 7 seconds
    \             /     No haptic
     \           /
      └─────────┘

      ┌───────┐
       \     /
        \   /
         \ /         ← Circle contracts over 8 seconds
         │ │            Haptic pulse at end
         └─┘
```

**Reduce Motion Support:**
- All animations respect `prefers-reduced-motion`
- Fallback: instant transitions, no parallax
- Haptics still work (separate preference)

---

### 2.4 Widgets & Quick Actions

**Purpose:** Surface key functionality without opening the app.

**iOS Widgets:**

*Small Widget (2x2):*
```
┌─────────────────┐
│ Yesterday       │
│                 │
│ [Check in]      │
└─────────────────┘
```

*Medium Widget (4x2):*
```
┌─────────────────────────────────┐
│ MentalSpace              5 days │
│                                 │
│ Mood: Good       Stress: 3     │
│                                 │
│     [Start Today's Check-in]    │
└─────────────────────────────────┘
```

*Large Widget (4x4):*
```
┌─────────────────────────────────┐
│ Good morning, Sarah        5    │
├─────────────────────────────────┤
│                                 │
│ Yesterday: 4  3  Good          │
│                                 │
│ Up Next:                        │
│ 5-min breathing • 10:00 AM     │
│                                 │
│ [Check-in]  [Start Exercise]    │
│                                 │
│ Sleep Recovery: Day 4          │
└─────────────────────────────────┘
```

**Android Widgets:**
- Similar layouts using Glance or RemoteViews
- Home screen widget + lock screen (Android 12+)
- Tap anywhere to open app

**iOS Lock Screen Widgets (iOS 16+):**
```
Circular: 5  (streak count)
Rectangular: "Check-in" [Tap to start]
```

**Quick Actions (3D Touch / Long Press on App Icon):**
- "Start Check-in"
- "SOS"
- "Today's Plan"
- "Book Therapist"

**Siri Shortcuts:**
- "Hey Siri, start my MentalSpace check-in"
- "Hey Siri, open MentalSpace SOS"
- "Hey Siri, how's my mood this week?"

**Android App Shortcuts:**
- Long-press menu with same options
- Google Assistant integration

---

## PART 3: CORE FEATURES (Full Specification)

### 3.1 Care Preferences Setup

**Purpose:** Capture how the user likes to be helped. Eliminates "generic plan fatigue."

**Preference Categories:**

```
┌─────────────────────────────────────────────┐
│  HOW CAN WE HELP YOU BEST?                  │
│  (You can change these anytime)             │
├─────────────────────────────────────────────┤
│                                             │
│  WHEN I'M STRESSED, I PREFER...             │
│  (select up to 3)                           │
│  □ Breathing exercises                      │
│  □ Grounding techniques                     │
│  □ Journaling / writing it out              │
│  □ Physical movement                        │
│  □ Connecting with someone                  │
│  □ Practical planning / problem-solving     │
│                                             │
│  GUIDANCE TONE                              │
│  ○ Gentle & nurturing                       │
│  ○ Direct & clear                           │
│  ○ Structured & step-by-step                │
│  ○ Motivating & energizing                  │
│                                             │
│  DAILY TIME BUDGET                          │
│  ○ 5 minutes (micro-moments)                │
│  ○ 10 minutes (quick reset)                 │
│  ○ 20 minutes (solid practice)              │
│  ○ 30+ minutes (deep work)                  │
│                                             │
│  PRIVACY MODE                               │
│  □ Hide sensitive prompts in notifications  │
│  □ Use discreet widget display              │
│                                             │
│  THINGS THAT DON'T WORK FOR ME              │
│  □ Meditation / stillness practices         │
│  □ Deep breathing (causes dizziness)        │
│  □ Body scans (uncomfortable)               │
│  □ Visualization exercises                  │
│  □ Social / connection activities           │
│  □ Physical exercise                        │
│  [+ Add your own]                           │
│                                             │
└─────────────────────────────────────────────┘
```

**AI Application:**
- Coping preferences: Prioritize these action types
- Tone: Adapt all app copy dynamically
- Time budget: Hard cap on total plan duration
- Exclusions: NEVER suggest these (hard filter)

---

### 3.2 Daily Check-In (60 Seconds)

**Metrics:**

| Metric | Input Type | Scale | Visual |
|--------|------------|-------|--------|
| Mood | Emoji slider | 1-5 | Face morphing animation |
| Stress | Arc slider | Low → High (1-10) | Pressure gauge |
| Sleep Quality | Tap selection | Poor/Fair/Good/Great | Moon phases |
| Energy | Battery fill | Empty → Full (1-5) | Animated battery |
| Focus | Target rings | Scattered → Locked (1-5) | Concentric circles |
| Anxiety | Wave visualization | Calm → Turbulent (1-10) | Animated waves |

**Flow:**
1. Personalized greeting (time + name + streak)
2. 6 metric cards (swipe navigation)
3. Optional journal prompt (contextual)
4. Weekly focus pulse (if active)
5. Plan generation → Today view

**Haptic Rhythm:**
- Light tap on each slider movement
- Medium confirmation on selection
- Success pattern on completion

---

### 3.3 Weekly Focus

**Focus Options:**
- Sleep Recovery
- Stress Management
- Anxiety Reduction
- Connection & Relationships
- Energy & Motivation
- Focus & Productivity
- General Wellness

**How It Works:**
- Selected weekly (Sunday or first use)
- 2+ daily actions orbit the focus
- Progress tracked and surfaced
- Weekly summary ties back to focus
- End of week: Continue / Change / AI Suggest

---

### 3.4 AI-Generated Daily Plan with Adherence Engine

**Plan Structure:**
- 2 Coping Actions
- 1 Lifestyle Action
- 1 Connection Action
- Total time ≤ user's budget

**Adherence Engine:**

*Auto-Simplify:*
- Miss 2 actions → Tomorrow's plan is lighter
- 3 days <50% completion → Offer "Reset Week"

*Auto-Anchor:*
- Learn best completion time
- Consolidate reminders to anchor time
- Display: "Anchor time: 8pm"

*Difficulty Calibration:*
- Start easy, increase with >70% completion
- Decrease with <40% completion
- Never repeat skipped action type 2 days in a row

---

### 3.5 SOS Button & Protocols

**5 Protocols:**
1. **Overwhelm** (3-4 min): Breathing → Brain dump → Triage → Micro-action
2. **Panic** (2-3 min): 5-4-3-2-1 grounding → Body check → Reality anchor
3. **Anger** (2-3 min): Pause → Physical release → Perspective → Response planning
4. **Can't Sleep** (4-5 min): Thought capture → Relaxation → Wind-down
5. **Struggling** (bridge): Validation → Check-in → Support options

**All protocols end with:** "Do you want to talk to someone?" → Booking

---

### 3.6 Therapist Booking with Handoff Summary

**Therapy Handoff Summary:**
- 7-day metric snapshot with trends
- Top concerns from journal (NLP extracted)
- What's helped vs. what hasn't
- Current weekly focus + progress
- User-written: "What I want help with this session"
- User can edit/redact before sharing

**Integration:**
- Push to MentalSpace EHR if available
- Secure link for external therapists
- HIPAA-compliant throughout

---

### 3.7 Weekly Summary & Insights

**Components:**
- Weekly Focus progress (prominent)
- Metrics improved / needs attention
- Action completion stats
- AI-generated insight
- Next week focus selection
- Therapist recommendation (if appropriate)

**Share Modes:**
- Private: Full details
- Safe: Streak, completion %, generic insight only

---

## PART 4: ADDITIONAL USER-SERVING FEATURES

### 4.1 Contextual Intelligence

**Purpose:** The app should understand context beyond just check-in data.

**Time-of-Day Awareness:**
```
Morning (5-11am):
  - Emphasize: energizing actions, day planning
  - Tone: Fresh, forward-looking
  - Suggestions: "Start your day with..."

Afternoon (11am-5pm):
  - Emphasize: reset actions, stress management
  - Tone: Supportive, practical
  - Suggestions: "Mid-day reset..."

Evening (5-9pm):
  - Emphasize: wind-down, reflection
  - Tone: Calming, reflective
  - Suggestions: "As your day winds down..."

Night (9pm-5am):
  - Emphasize: sleep prep, gentle activities
  - Tone: Soft, soothing
  - Suggestions: "Time to rest..."
  - Auto-activate: Sleep protocol suggestions
```

**Day-of-Week Patterns:**
```
Monday: "Starting fresh this week"
  - Offer: Weekly focus selection
  - Acknowledge: Monday blues are real

Friday: "You made it through the week"
  - Celebrate: Weekly wins
  - Prep: Weekend self-care

Sunday: "Your week in review"
  - Deliver: Weekly summary
  - Set: Next week's focus
```

**Calendar Integration (Opt-in):**
```
┌─────────────────────────────────────────────┐
│  HEADS UP                                   │
│                                             │
│  You have a busy day tomorrow:              │
│  • 3 meetings                               │
│  • 1 deadline                               │
│                                             │
│  Want a lighter plan for tomorrow?          │
│  [Yes, reduce actions] [Keep normal plan]   │
│                                             │
└─────────────────────────────────────────────┘
```

**Location Awareness (Optional):**
- At work: Suggest discreet exercises
- At home: Full range of options
- Commuting: Audio-only options
- New location: "Traveling? Here's an adjusted plan"

---

### 4.2 Smart Journaling

**Purpose:** Make journaling effortless and insightful.

**Voice-to-Text Journaling:**
```
┌─────────────────────────────────────────────┐
│  VOICE JOURNAL                              │
│                                             │
│  Tap and talk. We'll transcribe.            │
│                                             │
│       [Hold to Record]                      │
│                                             │
│  Or type below:                             │
│  [________________________________]         │
│                                             │
└─────────────────────────────────────────────┘
```

**AI-Prompted Reflection:**
Based on check-in data, offer contextual prompts:
- Low energy: "What drained you today?"
- High anxiety: "What's creating uncertainty?"
- Good mood: "What contributed to today's good feeling?"
- Improving trend: "What's different about this week?"

**Gratitude Capture:**
```
┌─────────────────────────────────────────────┐
│  DAILY GRATITUDE                            │
│                                             │
│  3 things you're grateful for today:        │
│                                             │
│  1. [____________________________]          │
│  2. [____________________________]          │
│  3. [____________________________]          │
│                                             │
│  [Save] [Skip Today]                        │
│                                             │
└─────────────────────────────────────────────┘
```

**Photo Mood Board (Optional):**
- Attach a photo to any check-in
- "What does today look like?"
- Build visual journey over time

---

### 4.3 Predictive & Proactive Support

**Purpose:** Help users before they struggle, not just after.

**Pattern-Based Predictions:**
```
┌─────────────────────────────────────────────┐
│  HEADS UP FOR TOMORROW                      │
│                                             │
│  Based on your patterns:                    │
│  • Mondays tend to be harder for you        │
│  • Your anxiety is usually higher           │
│                                             │
│  We've prepared a preventive plan:          │
│  • Extra grounding exercise in morning      │
│  • Lighter workload expectation             │
│                                             │
│  [Accept Plan] [Modify] [Dismiss]           │
│                                             │
└─────────────────────────────────────────────┘
```

**Trigger Date Awareness:**
```
User can optionally add:
• Anniversary dates (loss, trauma)
• Seasonal triggers
• Known difficult periods

App proactively offers support as dates approach.

"This week includes a date you marked as difficult.
 We're here with extra support if you need it."
```

**Weather-Mood Correlation (Opt-in):**
- Track local weather
- Identify patterns: "Cloudy days seem to affect your mood"
- Proactive on forecast: "Rainy day ahead — here's some light"

**Adaptive "Bad Day" Mode:**
```
Triggered by:
• 1-2 mood rating
• SOS usage earlier in day
• Multiple missed actions
• User selects "Having a hard day"

Bad Day Mode:
• Simplifies plan to 1 action
• Gentler tone throughout
• Extra "talk to someone" prompts
• No streak pressure
• "Just getting through today is enough"
```

---

### 4.4 Safety Plan Builder

**Purpose:** Proactive crisis preparation, not just reactive response.

**Safety Plan Components:**
```
┌─────────────────────────────────────────────┐
│  MY SAFETY PLAN                             │
│  (Private and optional)                     │
├─────────────────────────────────────────────┤
│                                             │
│  WARNING SIGNS                              │
│  What tells me I'm struggling?              │
│  [__________________________________]       │
│  [+ Add another]                            │
│                                             │
│  COPING STRATEGIES                          │
│  Things I can do on my own:                 │
│  [__________________________________]       │
│  [+ Add another]                            │
│                                             │
│  PEOPLE I CAN CONTACT                       │
│  [Contact 1: _____________]                 │
│  [Contact 2: _____________]                 │
│  [+ Add another]                            │
│                                             │
│  PROFESSIONALS                              │
│  [Therapist: _____________]                 │
│  [Doctor: _____________]                    │
│                                             │
│  SAFE PLACES                                │
│  Places I can go if I need to:              │
│  [__________________________________]       │
│                                             │
│  REASONS TO LIVE                            │
│  What matters most to me:                   │
│  [__________________________________]       │
│                                             │
│  [Save Safety Plan]                         │
│                                             │
│  Your safety plan is encrypted and private. │
│  Access it anytime from SOS or Settings.    │
│                                             │
└─────────────────────────────────────────────┘
```

**Integration:**
- Accessible from SOS screen
- Quick-dial contacts from plan
- Shareable with therapist (opt-in)
- Editable anytime

---

### 4.5 Support Circle (Trusted Contacts)

**Purpose:** Bridge to real-world support with user control.

**Setup:**
```
┌─────────────────────────────────────────────┐
│  MY SUPPORT CIRCLE                          │
│                                             │
│  Add people you trust to reach out to       │
│  when you're struggling.                    │
│                                             │
│  [+ Add Trusted Contact]                    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ Mom                                 │    │
│  │ "Check on me" message ready         │    │
│  │ [Edit Message] [Remove]             │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ Best Friend                         │    │
│  │ "Having a hard time" message ready  │    │
│  │ [Edit Message] [Remove]             │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

**Pre-Composed Messages:**
```
Default templates (editable):

"Check on me":
"Hey, I'm using an app for my mental health and it
suggested I reach out. Can you check on me when
you get a chance? No emergency, just could use
some support."

"Having a hard time":
"Hey, I'm having a really hard time right now.
Could we talk?"

"Just wanted to connect":
"Hey, thinking of you. Hope you're doing well."
```

**One-Tap Send:**
- From SOS flow
- From "struggling" protocol
- From Safety Plan
- Uses native SMS/messaging

---

### 4.6 Insights Dashboard

**Purpose:** Help users see patterns and understand themselves better.

```
┌─────────────────────────────────────────────┐
│  YOUR INSIGHTS                              │
├─────────────────────────────────────────────┤
│                                             │
│  PATTERNS OVER TIME                         │
│  [Weekly] [Monthly] [All Time]              │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  [Mood chart - 30 days]             │    │
│  │  Trending up (+12%)                 │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  WHAT WE'VE NOTICED                         │
│                                             │
│  "Your mood tends to dip on Mondays.        │
│  Consider starting Mondays with an          │
│  energizing activity."                      │
│                                             │
│  "Sleep below 6 hours correlates with       │
│  higher next-day stress for you."           │
│                                             │
│  WHAT WORKS FOR YOU                         │
│                                             │
│  • Breathing exercises: 85% helpful         │
│  • Morning walks: 78% helpful               │
│  • Journaling: 72% helpful                  │
│                                             │
│  WHAT DOESN'T WORK                          │
│                                             │
│  • Body scans: Often skipped                │
│  • Evening meditation: Low completion       │
│                                             │
│  BY THE NUMBERS                             │
│                                             │
│  Total check-ins: 67                        │
│  Actions completed: 203                     │
│  Weekly focuses finished: 4                 │
│  Therapist sessions: 3                      │
│  Longest streak: 12 days                    │
│                                             │
└─────────────────────────────────────────────┘
```

**Exportable Report:**
- Generate PDF summary for therapist or self
- Include: trends, patterns, what's worked
- Privacy-safe version available

---

### 4.7 Sleep Support Suite

**Purpose:** Sleep is foundational to mental health. Deep integration, not just a focus area.

**Bedtime Routine Builder:**
```
┌─────────────────────────────────────────────┐
│  MY BEDTIME ROUTINE                         │
│  Target bedtime: 10:30 PM                   │
├─────────────────────────────────────────────┤
│                                             │
│  10:00 PM — Screen-free reminder            │
│  10:10 PM — Gratitude journal               │
│  10:20 PM — 5-min wind-down breathing       │
│  10:30 PM — Lights out                      │
│                                             │
│  [Edit Routine] [Start Tonight]             │
│                                             │
└─────────────────────────────────────────────┘
```

**Sleep Sounds:**
- Built-in ambient sounds (rain, ocean, forest, white noise)
- Sleep timer (15/30/60 min / until morning)
- Fade out gradually

**Morning Check-In:**
```
First thing in the morning (before full check-in):

"How'd you sleep?"
[Terrible] [Okay] [Great]

"What time did you wake up?"
[Time picker]

Quick capture, detailed in full check-in.
```

**Apple Health / Google Fit Integration:**
- Import sleep data automatically
- Pre-fill sleep quality from wearables
- Correlate with other metrics

---

### 4.8 Content Personalization Engine

**Purpose:** Right content, right time, based on actual needs.

**Curated Content Feed:**
```
┌─────────────────────────────────────────────┐
│  FOR YOU TODAY                              │
├─────────────────────────────────────────────┤
│                                             │
│  Based on your recent check-ins:            │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ ARTICLE • 5 min read                │    │
│  │ "Managing Work Stress Without       │    │
│  │  Burning Out"                       │    │
│  │                                     │    │
│  │ Why this: You've mentioned work     │    │
│  │ stress in 4 journal entries         │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ AUDIO • 10 min                      │    │
│  │ "Progressive Muscle Relaxation      │    │
│  │  for Better Sleep"                  │    │
│  │                                     │    │
│  │ Why this: Sleep is your focus       │    │
│  │ this week                           │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ VIDEO • 3 min                       │    │
│  │ "Quick Desk Stretches"              │    │
│  │                                     │    │
│  │ Why this: It's 3pm and your         │    │
│  │ energy usually dips now             │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

**Content Types:**
- Articles (in-app reader)
- Audio guides (native player)
- Video (embedded, short-form)
- Podcast episode recommendations
- Book suggestions

**"Why This" Transparency:**
Always explain why content is suggested. Builds trust.

---

### 4.9 Accessibility Excellence

**Purpose:** Mental health support for everyone.

**Vision:**
- Dynamic Type support (all text scales)
- VoiceOver / TalkBack full support
- High contrast mode
- Color blind modes (protanopia, deuteranopia, tritanopia)
- Increased touch targets (minimum 44pt)

**Motor:**
- Reduce precision requirements
- Alternative to swipe gestures (tap navigation)
- Switch control compatibility
- Voice control support

**Cognitive:**
- Dyslexia-friendly font option (OpenDyslexic)
- Reduce motion option
- Simplified mode (fewer options displayed)
- Clear, plain language

**Hearing:**
- All audio has text alternatives
- Visual breathing guide (not just audio)
- Vibration/haptic alternatives

**Accessibility Settings:**
```
┌─────────────────────────────────────────────┐
│  ACCESSIBILITY                              │
├─────────────────────────────────────────────┤
│                                             │
│  TEXT                                       │
│  Size: [─────●─────] Large                  │
│  □ Dyslexia-friendly font                   │
│  □ Bold text                                │
│                                             │
│  DISPLAY                                    │
│  □ High contrast mode                       │
│  □ Reduce transparency                      │
│  Color blind: [None ▼]                      │
│                                             │
│  MOTION                                     │
│  □ Reduce motion                            │
│  □ Reduce auto-play                         │
│                                             │
│  INTERACTION                                │
│  □ Tap to navigate (instead of swipe)       │
│  □ Larger touch targets                     │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 4.10 Therapist Session Integration

**Purpose:** Close the loop between app self-care and professional care.

**Pre-Session:**
- Therapy Handoff Summary (detailed earlier)
- "What I want help with" prompt
- Review recent patterns
- Prepare questions

**Post-Session Reflection:**
```
┌─────────────────────────────────────────────┐
│  SESSION REFLECTION                         │
│  With [Therapist Name] • Today 4pm          │
├─────────────────────────────────────────────┤
│                                             │
│  How was your session?                      │
│  [Not helpful] [Somewhat] [Very helpful]    │
│                                             │
│  Key takeaways:                             │
│  [________________________________]         │
│  [+ Add another]                            │
│                                             │
│  Homework / things to try:                  │
│  [________________________________]         │
│  [+ Add another]                            │
│                                             │
│  Anything you want to remember?             │
│  [________________________________]         │
│                                             │
│  [Save Reflection]                          │
│                                             │
└─────────────────────────────────────────────┘
```

**Homework Integration:**
- Add therapist homework as special actions
- Track completion separately
- Report back to therapist (opt-in)

---

## IMPLEMENTATION STATUS

### ✅ FULLY IMPLEMENTED (100% Complete)

All features from the PRD have been implemented. The app is production-ready.

#### Core Infrastructure
| Feature | Status | Location |
|---------|--------|----------|
| Sign in with Apple | ✅ | `services/socialAuth.ts` |
| Sign in with Google | ✅ | `services/socialAuth.ts` |
| Email Auth | ✅ | `services/firebase.ts` |
| Biometric Unlock | ✅ | `services/biometricAuth.ts` |
| Push Notifications | ✅ | `services/notifications.ts` |
| Offline-First Architecture | ✅ | `services/offlineStorage.ts` |
| Native SOS Access | ✅ | `app/(sos)/*` |
| Account Settings | ✅ | `app/(settings)/*` |

#### User Experience
| Feature | Status | Location |
|---------|--------|----------|
| "Today" Home Screen | ✅ | `app/(tabs)/index.tsx` |
| Streaks & Progress | ✅ | `services/streakService.ts`, `stores/streakStore.ts` |
| Care Preferences Setup | ✅ | `app/(care-preferences)/*` |
| Daily Check-In | ✅ | `app/(tabs)/checkin.tsx` |
| Weekly Focus | ✅ | `app/(weekly-focus)/*` |
| AI-Generated Daily Plan | ✅ | `app/(tabs)/plan.tsx`, `stores/planStore.ts` |
| SOS Protocols | ✅ | `app/(sos)/protocol.tsx` |
| Crisis Resources | ✅ | `app/(sos)/resources.tsx` |
| Therapist Booking | ✅ | `app/(telehealth)/*` |
| Weekly Summary | ✅ | `app/(tabs)/summary.tsx` |
| Trusted Contacts | ✅ | `app/(care-preferences)/trusted-contacts.tsx` |
| Charts & Visualizations | ✅ | `app/(tabs)/summary.tsx` |

#### HIGH PRIORITY Features (All Complete)
| Feature | Status | Location |
|---------|--------|----------|
| Smart Journaling / Voice Notes | ✅ | `app/(journal)/*`, `components/VoiceNoteRecorder.tsx` |
| Safety Plan Builder | ✅ | `app/(safety-plan)/*`, `stores/safetyPlanStore.ts` |
| Widgets & Quick Actions | ✅ | `services/widgetBridge.ts`, `services/quickActions.ts`, `hooks/useQuickActions.ts`, `hooks/useWidgetSync.ts` |
| Insights Dashboard | ✅ | `app/(insights)/*`, `stores/insightsStore.ts` |
| Sleep Support Suite | ✅ | `app/(sleep)/*`, `stores/sleepStore.ts` |

#### MEDIUM PRIORITY Features (All Complete)
| Feature | Status | Location |
|---------|--------|----------|
| Firebase Analytics & Crashlytics | ✅ | `services/analytics.ts` |
| Apple Health / Google Fit Integration | ✅ | `services/healthIntegration.ts`, `stores/healthStore.ts`, `app/(settings)/health-integration.tsx` |
| Content Personalization Engine | ✅ | `utils/contentRecommendation.ts`, `stores/contentStore.ts`, `data/contentLibrary.ts`, `app/(content)/*` |
| Predictive & Proactive Support | ✅ | `services/patternPrediction.ts`, `stores/predictiveStore.ts`, `utils/badDayMode.ts`, `app/(settings)/trigger-dates.tsx` |
| Post-Session Reflection | ✅ | `stores/sessionStore.ts`, `app/(telehealth)/reflection.tsx`, `app/(telehealth)/history.tsx` |

#### LOWER PRIORITY Features (All Complete)
| Feature | Status | Location |
|---------|--------|----------|
| Calendar Integration | ✅ | `services/calendarIntegration.ts`, `stores/calendarStore.ts`, `app/(settings)/calendar-integration.tsx` |
| Photo Mood Board | ✅ | `services/photoService.ts`, `app/(mood-board)/*` |
| Accessibility Excellence | ✅ | `stores/accessibilityStore.ts`, `constants/accessibleTheme.ts`, `utils/accessibility.ts`, `app/(settings)/accessibility.tsx` |
| Deep Linking | ✅ | `hooks/useDeepLinking.ts` |
| Crisis Detection | ✅ | `utils/crisisDetection.ts`, `components/crisis/CrisisModal.tsx` |

#### Backend & Infrastructure
| Feature | Status | Location |
|---------|--------|----------|
| Firebase Functions | ✅ | `firebase/functions/src/*` |
| MCP Server | ✅ | `apps/mcp-server/src/*` |
| Firestore Rules | ✅ | `firebase/firestore.rules` |
| App Icons & Splash | ✅ | `scripts/generate-assets.js` |

### Summary

**Total Features Implemented:** 100%
**Production Ready:** Yes
**Last Updated:** December 24, 2024

---

## Technical Notes

### Tech Stack
- **Framework:** React Native + Expo SDK 54
- **Navigation:** Expo Router (file-based)
- **State:** Zustand with AsyncStorage persistence
- **Forms:** React Hook Form + Zod
- **Charts:** react-native-chart-kit
- **Backend:** Firebase (Auth, Firestore, Functions)
- **ChatGPT:** MCP Server on Fly.io
- **Audio:** expo-av (voice notes, sleep sounds)
- **Calendar:** expo-calendar (calendar integration)
- **Media:** expo-image-picker (photo mood board)
- **Health:** expo-health-connect (Apple Health / Google Fit)
- **Notifications:** expo-notifications (push and local)

### Performance Targets
- App Launch (cold): < 2s
- Check-in submission: < 500ms
- Plan generation: < 1s
- Offline support: Full check-in/plan viewing
- Bundle size (web): < 500KB gzipped

### Key Implementation Files

#### Services
- `analytics.ts` - Firebase Analytics tracking
- `calendarIntegration.ts` - Calendar event fetching and busy level
- `healthIntegration.ts` - Apple Health/Google Fit integration
- `patternPrediction.ts` - Mood pattern prediction and alerts
- `photoService.ts` - Photo capture for mood board
- `notifications.ts` - Push notification management
- `offlineStorage.ts` - Offline data persistence
- `streakService.ts` - Streak calculation and storage

#### Stores (Zustand)
- `accessibilityStore.ts` - Accessibility settings
- `calendarStore.ts` - Calendar integration state
- `checkinStore.ts` - Daily check-ins with photo support
- `contentStore.ts` - Content recommendations
- `healthStore.ts` - Health data from wearables
- `insightsStore.ts` - Insights and analytics
- `journalStore.ts` - Journal entries
- `planStore.ts` - Daily action plans
- `predictiveStore.ts` - Predictions and bad day mode
- `safetyPlanStore.ts` - Safety plan data
- `sessionStore.ts` - Telehealth sessions
- `sleepStore.ts` - Sleep tracking and routines

#### Utils
- `badDayMode.ts` - Bad day mode detection
- `contentRecommendation.ts` - Intelligent content scoring
- `crisisDetection.ts` - Crisis keyword detection
- `accessibility.ts` - Accessibility helpers

#### Data
- `contentLibrary.ts` - Complete content library (articles, audio, video)
