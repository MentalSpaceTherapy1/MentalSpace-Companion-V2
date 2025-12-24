# Post-Session Reflection Feature - Usage Guide

This guide explains how to use the new Post-Session Reflection feature in the MentalSpace Companion telehealth flow.

## Overview

The Post-Session Reflection feature allows users to:
- Rate their therapy sessions
- Record key takeaways and insights
- Track homework assignments from therapists
- View session history with reflections
- Integrate therapist homework into their daily action plan

## File Structure

```
apps/mobile/
├── stores/
│   ├── sessionStore.ts              # Session and reflection state management
│   └── planStoreExtension.ts        # Therapist homework integration
├── app/(telehealth)/
│   ├── reflection.tsx               # Post-session reflection form
│   ├── history.tsx                  # Session history with reflections
│   └── success.tsx                  # Updated to prompt reflection
└── components/telehealth/
    └── SessionCard.tsx              # Reusable session card component
```

## Core Components

### 1. Session Store (`stores/sessionStore.ts`)

The session store manages all therapy sessions and their reflections using Zustand.

**Key Features:**
- Persistent storage with AsyncStorage
- Session CRUD operations
- Reflection management
- Homework tracking with completion status
- Filtering for upcoming and past sessions

**Interface:**
```typescript
interface TherapistSession {
  id: string;
  therapistName: string;
  therapistId?: string;
  date: string;
  sessionDate: Date;
  type: 'video' | 'audio' | 'chat';
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  reflection?: SessionReflection;
  homeworkCompleted?: boolean[];
}

interface SessionReflection {
  rating: number; // 1-5 stars
  keyTakeaways: string[];
  homework: string[];
  notes: string;
}
```

**Usage Example:**
```typescript
import { useSessionStore } from '../../stores/sessionStore';

function MyComponent() {
  const {
    addSession,
    updateReflection,
    getPastSessions,
    updateHomeworkStatus
  } = useSessionStore();

  // Add a new session
  const createSession = () => {
    addSession({
      therapistName: 'Dr. Smith',
      date: '2025-01-15',
      sessionDate: new Date('2025-01-15T14:00:00'),
      type: 'video',
      duration: 50,
      status: 'scheduled',
    });
  };

  // Add reflection after session
  const addReflection = (sessionId: string) => {
    updateReflection(sessionId, {
      rating: 5,
      keyTakeaways: [
        'Practice mindfulness daily',
        'Identify negative thought patterns',
      ],
      homework: [
        'Keep a thought journal for one week',
        'Practice 5-minute breathing exercise before bed',
      ],
      notes: 'Great discussion about cognitive distortions',
    });
  };

  // Mark homework as complete
  const completeHomework = (sessionId: string, index: number) => {
    updateHomeworkStatus(sessionId, index, true);
  };

  // Get sessions with reflections
  const pastSessions = getPastSessions();

  return (
    <View>
      {/* Render sessions */}
    </View>
  );
}
```

### 2. Reflection Screen (`app/(telehealth)/reflection.tsx`)

The reflection screen provides a comprehensive form for post-session reflection.

**Features:**
- Emoji-based 1-5 rating scale
- Multiple key takeaway inputs (add/remove)
- Multiple homework item inputs (add/remove)
- Additional notes section
- Form validation
- Auto-save with confirmation

**Navigation:**
```typescript
// Navigate to reflection screen with sessionId
router.push(`/(telehealth)/reflection?sessionId=${sessionId}`);
```

**User Flow:**
1. Rate the session (required)
2. Add key takeaways (at least one required)
3. Add homework items (optional)
4. Add notes (optional)
5. Save and navigate to history or home

### 3. Session History (`app/(telehealth)/history.tsx`)

Displays all past sessions with their reflections in a scrollable list.

**Features:**
- Statistics card showing total sessions and reflections
- Session cards with rating and homework status
- Detail modal with full reflection view
- Interactive homework checklist
- Empty state with call-to-action

**Navigation:**
```typescript
// Navigate to history screen
router.push('/(telehealth)/history');
```

**Modal View:**
- Full session details
- Therapist information
- Rating display
- Key takeaways list
- Interactive homework checklist
- Additional notes

### 4. Session Card Component (`components/telehealth/SessionCard.tsx`)

Reusable card component for displaying session information.

**Props:**
```typescript
interface SessionCardProps {
  session: TherapistSession;
  onPress?: () => void;
  showReflection?: boolean;
}
```

**Features:**
- Therapist avatar and name
- Session date, time, and duration
- Session type icon (video/audio/chat)
- Status badge
- Rating display with emoji
- Homework progress indicator
- Key takeaway preview
- Tap-to-view indicator

**Usage:**
```typescript
import { SessionCard } from '../../components/telehealth/SessionCard';

<SessionCard
  session={session}
  onPress={() => handleSessionPress(session)}
  showReflection={true}
/>
```

### 5. Success Screen Integration (`app/(telehealth)/success.tsx`)

The success screen now detects when a session has ended and prompts for reflection.

**Features:**
- Timer-based reflection prompt
- Automatic detection of session completion
- Conditional button display
- Navigation to reflection or history

**URL Parameters:**
```typescript
// Navigate to success with sessionId
router.replace(`/(telehealth)/success?sessionId=${sessionId}`);
```

### 6. Therapist Homework Integration (`stores/planStoreExtension.ts`)

Extension module to integrate therapist homework into the daily action plan.

**Functions:**

```typescript
// Convert session homework to planned actions
const homeworkActions = convertHomeworkToActions(sessionId);

// Get all active homework from all sessions
const allHomework = getAllTherapistHomework();

// Sync completion status between stores
syncHomeworkCompletion(sessionId, homeworkIndex, completed);

// Check if action is therapist homework
if (isTherapistHomework(action)) {
  // Handle therapist homework specifically
}
```

**Integration with Plan View:**
```typescript
import { getAllTherapistHomework, isTherapistHomework } from '../../stores/planStoreExtension';

function PlanView() {
  const { currentPlan } = usePlanStore();
  const therapistHomework = getAllTherapistHomework();

  return (
    <View>
      {/* Regular actions */}
      {currentPlan?.actions.map(action => (
        <ActionCard key={action.id} action={action} />
      ))}

      {/* Therapist Homework Section */}
      {therapistHomework.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>
            Therapist Homework
          </Text>
          {therapistHomework.map(homework => (
            <ActionCard
              key={homework.id}
              action={homework}
              badge="Therapist Assigned"
            />
          ))}
        </View>
      )}
    </View>
  );
}
```

## User Workflows

### Workflow 1: Complete Session and Add Reflection

1. User completes telehealth session
2. Navigate to success screen with `sessionId`
3. Timer triggers reflection prompt when session duration passes
4. User clicks "Add Session Reflection"
5. Fill out reflection form:
   - Rate session (1-5)
   - Add key takeaways
   - Add homework items
   - Add notes
6. Click "Save Reflection"
7. Choose to view history or go home

### Workflow 2: View Past Sessions

1. Navigate to history screen
2. View statistics (total sessions, reflections)
3. Scroll through session cards
4. Tap on session card to view details
5. Modal opens with full reflection
6. Toggle homework items as complete/incomplete
7. Close modal or navigate home

### Workflow 3: Track Homework in Daily Plan

1. Add reflection with homework items
2. Homework automatically syncs to plan store
3. View daily plan
4. See "Therapist Homework" section
5. Complete homework items
6. Completion syncs back to session store
7. View updated progress in session history

## Customization

### Rating Scale

Modify the rating emojis and labels in `reflection.tsx`:

```typescript
const RATING_EMOJIS = ['😞', '😕', '😐', '🙂', '😊'];
const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
```

### Session Card Styling

Customize the SessionCard appearance in `SessionCard.tsx`:

```typescript
const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    // Add custom styles
  },
  // ... other styles
});
```

### Homework Duration

Set default homework duration in `planStoreExtension.ts`:

```typescript
duration: 15, // Default 15 minutes - change as needed
```

## Best Practices

1. **Always provide sessionId**: When navigating to reflection or success screens after a session, include the sessionId parameter.

2. **Sync homework completion**: Use `syncHomeworkCompletion()` when marking homework as complete in the plan view.

3. **Handle edge cases**: Check for session existence before accessing reflection data:
   ```typescript
   const session = getSessionById(sessionId);
   if (!session?.reflection) {
     // Handle missing reflection
   }
   ```

4. **Validate user input**: Ensure at least one key takeaway before saving reflection.

5. **Provide feedback**: Use haptic feedback for user interactions and show loading states during saves.

## Future Enhancements

Potential improvements to consider:

- [ ] Photo/voice note attachments for reflections
- [ ] Shared notes with therapist (HIPAA-compliant)
- [ ] Homework reminder notifications
- [ ] Progress charts for homework completion
- [ ] Export reflections as PDF
- [ ] Search/filter session history
- [ ] Tags for categorizing sessions
- [ ] Integration with calendar for scheduling
- [ ] Mood tracking correlation with sessions

## Testing

Test scenarios to verify functionality:

1. Create a new session
2. Add reflection with all fields
3. View reflection in history
4. Toggle homework completion
5. Navigate between screens
6. Test with empty states
7. Test form validation
8. Test timer-based reflection prompt
9. Test persistence (close and reopen app)
10. Test homework sync with plan store

## Support

For issues or questions about the Post-Session Reflection feature, please refer to:
- Session store implementation: `stores/sessionStore.ts`
- Component documentation: Individual component files
- Zustand documentation: https://zustand-demo.pmnd.rs/
