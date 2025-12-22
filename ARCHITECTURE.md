# MentalSpace Daily Companion v2 - Architecture

## Overview

A cross-platform mental health companion app with ChatGPT integration.

### Target Platforms
- iOS (native via Expo)
- Android (native via Expo)
- Web (React Native Web via Expo)
- ChatGPT App Directory (MCP Server)

---

## Tech Stack

### Frontend (Cross-Platform)
| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React Native + Expo SDK 52 | Cross-platform UI |
| Navigation | Expo Router | File-based routing |
| State | Zustand + React Query | Client/server state |
| UI Library | Tamagui | Cross-platform components |
| Forms | React Hook Form + Zod | Validation |
| Charts | Victory Native | Cross-platform charts |

### Backend (Firebase)
| Service | Purpose |
|---------|---------|
| Firebase Auth | Authentication (Email, Google, Apple) |
| Cloud Firestore | NoSQL database |
| Cloud Functions | Serverless backend logic |
| Firebase Storage | File uploads (voice notes, avatars) |
| Firebase Analytics | Usage tracking |
| Firebase Crashlytics | Error monitoring |

### ChatGPT Integration
| Component | Technology |
|-----------|------------|
| MCP Server | Node.js + Express |
| Protocol | Model Context Protocol (MCP) |
| Deployment | Cloud Run / Railway |

---

## Project Structure

```
mentalspace-companion-v2/
├── apps/
│   ├── mobile/                 # Expo app (iOS, Android, Web)
│   │   ├── app/               # Expo Router pages
│   │   │   ├── (auth)/        # Auth screens (login, register)
│   │   │   ├── (onboarding)/  # Onboarding flow
│   │   │   ├── (tabs)/        # Main tab navigation
│   │   │   │   ├── index.tsx  # Home/Dashboard
│   │   │   │   ├── checkin.tsx
│   │   │   │   ├── plan.tsx
│   │   │   │   ├── summary.tsx
│   │   │   │   └── settings.tsx
│   │   │   └── _layout.tsx
│   │   ├── components/        # UI components
│   │   │   ├── ui/           # Base components
│   │   │   ├── forms/        # Form components
│   │   │   ├── charts/       # Chart components
│   │   │   └── crisis/       # Crisis intervention UI
│   │   ├── hooks/            # Custom hooks
│   │   ├── stores/           # Zustand stores
│   │   ├── services/         # API services
│   │   ├── utils/            # Utilities
│   │   ├── constants/        # App constants
│   │   └── types/            # TypeScript types
│   │
│   └── mcp-server/            # ChatGPT MCP Server
│       ├── src/
│       │   ├── tools/         # MCP tool definitions
│       │   ├── handlers/      # Tool handlers
│       │   └── index.ts       # Server entry
│       └── package.json
│
├── packages/
│   └── shared/                # Shared code
│       ├── types/            # Shared TypeScript types
│       ├── constants/        # Shared constants
│       ├── validation/       # Zod schemas
│       └── utils/            # Shared utilities
│
├── firebase/
│   ├── firestore.rules       # Security rules
│   ├── firestore.indexes.json
│   └── functions/            # Cloud Functions
│       ├── src/
│       │   ├── checkins/     # Check-in triggers
│       │   ├── plans/        # Plan generation
│       │   ├── crisis/       # Crisis detection
│       │   ├── analytics/    # Analytics aggregation
│       │   └── index.ts
│       └── package.json
│
├── docs/                      # Documentation
├── .github/workflows/         # CI/CD
├── package.json              # Root package.json (workspaces)
└── turbo.json                # Turborepo config
```

---

## Database Schema (Firestore)

### Collections

#### `users/{userId}`
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  preferences: UserPreferences;
  onboardingCompleted: boolean;
  timezone: string;
}

interface UserPreferences {
  reasons: string[];           // Why using the app
  focusAreas: string[];        // Selected focus modules
  notifications: {
    dailyReminder: boolean;
    reminderTime: string;      // "09:00"
    weeklyDigest: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}
```

#### `users/{userId}/checkins/{checkinId}`
```typescript
interface Checkin {
  id: string;
  date: string;                // "2025-12-21"
  createdAt: Timestamp;

  // Metrics (1-10 scale)
  mood: number;
  stress: number;
  sleep: number;
  energy: number;
  focus: number;
  anxiety: number;

  // Journal
  journalEntry?: string;
  voiceNoteUrl?: string;

  // Crisis detection
  crisisDetected: boolean;
  crisisHandled: boolean;
}
```

#### `users/{userId}/plans/{planId}`
```typescript
interface DailyPlan {
  id: string;
  date: string;
  createdAt: Timestamp;
  checkinId: string;           // Reference to triggering check-in

  actions: PlannedAction[];

  // Completion tracking
  completedCount: number;
  totalCount: number;
}

interface PlannedAction {
  id: string;
  actionId: string;            // Reference to actions_library
  title: string;
  description: string;
  category: 'coping' | 'lifestyle' | 'connection';
  duration: number;            // minutes
  completed: boolean;
  completedAt?: Timestamp;
  skipped: boolean;
  swappedFrom?: string;        // Original action if swapped
}
```

#### `actions_library/{actionId}` (Global collection)
```typescript
interface ActionTemplate {
  id: string;
  title: string;
  description: string;
  category: 'coping' | 'lifestyle' | 'connection';
  duration: number;

  // Targeting
  targetMetrics: {
    metric: 'mood' | 'stress' | 'sleep' | 'energy' | 'focus' | 'anxiety';
    condition: 'low' | 'high';
    threshold: number;
  }[];

  focusModules: string[];      // Which focus areas this belongs to
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
}
```

#### `users/{userId}/crisis_events/{eventId}`
```typescript
interface CrisisEvent {
  id: string;
  createdAt: Timestamp;
  checkinId: string;

  triggerType: 'keyword' | 'low_mood_pattern' | 'explicit_request';
  severity: 'low' | 'medium' | 'high';

  // Do NOT store actual crisis content - privacy
  detectionMethod: string;

  // Response tracking
  resourcesShown: string[];
  userAcknowledged: boolean;
  followUpScheduled: boolean;
}
```

#### `focus_modules/{moduleId}` (Global collection)
```typescript
interface FocusModule {
  id: string;
  title: string;
  description: string;
  category: 'mental' | 'physical' | 'social' | 'mindfulness';
  icon: string;
  isActive: boolean;
  sortOrder: number;
}
```

---

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Subcollections inherit user access
      match /checkins/{checkinId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /plans/{planId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /crisis_events/{eventId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow create: if request.auth != null && request.auth.uid == userId;
        // No update/delete - audit trail
      }
    }

    // Global collections - read only for authenticated users
    match /actions_library/{actionId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only via Functions
    }

    match /focus_modules/{moduleId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only via Functions
    }
  }
}
```

---

## Crisis Detection System

### Approach
Uses a multi-layer detection system instead of simple keyword matching:

1. **Keyword Detection with Context** - Checks for crisis keywords but excludes negations
2. **Pattern Detection** - Consecutive low mood scores (3+ days < 3)
3. **Sentiment Analysis** - Cloud Function using ML for journal analysis
4. **Explicit Requests** - User clicks "I need help now"

### Privacy-First Design
- Never store actual crisis content/keywords
- Only store detection metadata
- Encrypted at rest
- HIPAA-compliant data handling

---

## MCP Server Design (ChatGPT Integration)

### Available Tools

```typescript
// Tool: daily_checkin
{
  name: "daily_checkin",
  description: "Record user's daily mental health check-in",
  parameters: {
    mood: { type: "number", min: 1, max: 10 },
    stress: { type: "number", min: 1, max: 10 },
    // ... other metrics
    journalEntry: { type: "string", optional: true }
  }
}

// Tool: get_daily_plan
{
  name: "get_daily_plan",
  description: "Get personalized action plan based on today's check-in",
  parameters: {}
}

// Tool: complete_action
{
  name: "complete_action",
  description: "Mark an action as completed",
  parameters: {
    actionId: { type: "string" }
  }
}

// Tool: get_weekly_summary
{
  name: "get_weekly_summary",
  description: "Get summary of user's week including trends and insights",
  parameters: {}
}

// Tool: crisis_support
{
  name: "crisis_support",
  description: "Provide immediate crisis support resources",
  parameters: {}
}
```

### Conversational Flows

```
User: "I want to check in"
ChatGPT: Uses daily_checkin tool with guided questions
         → "How are you feeling today on a scale of 1-10?"
         → "How stressed are you feeling?"
         → ...
         → Returns personalized plan

User: "What should I do today?"
ChatGPT: Uses get_daily_plan tool
         → Returns 3 personalized actions with descriptions

User: "I finished the breathing exercise"
ChatGPT: Uses complete_action tool
         → Confirms completion, encourages user
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

1. **PR Checks** (`pr.yml`)
   - TypeScript type checking
   - ESLint
   - Unit tests
   - E2E tests (Detox for mobile, Playwright for web)

2. **Deploy Preview** (`preview.yml`)
   - Deploy to Expo preview channel
   - Deploy web to Vercel preview

3. **Production Deploy** (`deploy.yml`)
   - Build iOS/Android binaries
   - Submit to App Store / Play Store
   - Deploy web to production
   - Deploy Cloud Functions
   - Deploy MCP server

---

## Performance Targets

| Metric | Target |
|--------|--------|
| App Launch (cold) | < 2s |
| Check-in submission | < 500ms |
| Plan generation | < 1s |
| Offline support | Full check-in/plan viewing |
| Bundle size (web) | < 500KB gzipped |

---

## Testing Strategy

| Type | Tool | Coverage Target |
|------|------|-----------------|
| Unit | Jest | 80% |
| Component | React Native Testing Library | Key components |
| Integration | Jest + Firestore Emulator | API flows |
| E2E Mobile | Detox | Critical paths |
| E2E Web | Playwright | Critical paths |

---

## Monitoring & Analytics

| Tool | Purpose |
|------|---------|
| Firebase Analytics | User behavior |
| Firebase Crashlytics | Error tracking |
| Firebase Performance | App performance |
| Cloud Monitoring | Server health |
| PagerDuty | Alerting |

---

## Accessibility Requirements

- WCAG 2.1 AA compliance
- VoiceOver/TalkBack support
- Minimum touch targets (44x44)
- Color contrast ratios
- Keyboard navigation (web)
- Screen reader announcements

---

## Estimated Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Setup & Core | 2 weeks | Project structure, auth, navigation |
| Features | 3 weeks | Check-in, plans, summary, crisis |
| MCP Server | 1 week | ChatGPT integration |
| Testing | 1 week | Full test coverage |
| Polish | 1 week | Performance, accessibility, bugs |
| **Total** | **8 weeks** | Production-ready app |
