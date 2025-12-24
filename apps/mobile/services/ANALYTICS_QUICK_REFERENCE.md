# Analytics Quick Reference

A quick reference guide for common analytics tasks in the MentalSpace Companion app.

## Import Statements

```typescript
// Main analytics functions
import {
  trackScreen,
  trackEvent,
  setUserId,
  setUserProperties,
  logError,
  startTrace,
  stopTrace,
  resetAnalytics,
} from '../services/analytics';

// Specialized event tracking
import {
  trackCheckInCompleted,
  trackActionCompleted,
  trackSOSTriggered,
  trackTherapistBooked,
  trackStreakMilestone,
  trackWeeklyFocusSet,
  trackJournalEntryCreated,
} from '../services/analytics';
```

## Common Tasks

### Track Screen View

```typescript
trackScreen('ScreenName');
trackScreen('ScreenName', 'ScreenClass');
```

### Track Event

```typescript
trackEvent('event_name', {
  parameter_name: value,
});
```

### Track Check-in

```typescript
trackCheckInCompleted({
  mood_score: 7,
  stress_level: 4,
  sleep_hours: 7.5,
  energy_level: 6,
  crisis_detected: false,
});
```

### Track Action Completion

```typescript
trackActionCompleted({
  action_id: 'action-123',
  action_title: 'Morning meditation',
  action_category: 'coping',
  duration_minutes: 10,
  is_simplified: false,
});
```

### Track SOS Trigger

```typescript
trackSOSTriggered({
  protocol_type: 'panic',
});
```

### Track Therapist Booking

```typescript
trackTherapistBooked({
  session_type: 'initial',
});
```

### Track Streak Milestone

```typescript
trackStreakMilestone({
  streak_days: 7,
  is_longest_streak: true,
  total_checkins: 10,
});
```

### Track Weekly Focus

```typescript
trackWeeklyFocusSet({
  focus_area: 'sleep',
  num_goals: 7,
});
```

### Track Journal Entry

```typescript
trackJournalEntryCreated({
  word_count: 250,
  has_voice_note: true,
  mood_score: 8,
  tags: ['gratitude', 'reflection'],
});
```

### Set User ID

```typescript
// On login
setUserId(user.uid);

// On logout
setUserId(null);
```

### Set User Properties

```typescript
setUserProperties({
  onboarding_completed: true,
  has_therapist: false,
  primary_concern: 'anxiety',
});
```

### Log Error

```typescript
// With Error object
try {
  // code
} catch (error) {
  logError(error, { component: 'ComponentName', action: 'actionName' });
}

// With string
logError('Custom error message', {
  component: 'ComponentName',
  context: 'additional info',
});
```

### Performance Tracing

```typescript
// Start trace
startTrace('trace_name');

// Stop trace (success)
stopTrace('trace_name', true);

// Stop trace (failure)
stopTrace('trace_name', false, 'Error message');

// Complete example
startTrace('api_call');
try {
  const data = await fetchData();
  stopTrace('api_call', true);
} catch (error) {
  stopTrace('api_call', false, error.message);
}
```

### Reset Analytics

```typescript
// On logout
resetAnalytics();
```

## Event Parameters Reference

### Check-in Parameters

```typescript
{
  mood_score: number;        // 1-10
  stress_level: number;      // 1-10
  sleep_hours: number;       // 0-24
  energy_level: number;      // 1-10
  crisis_detected?: boolean; // optional
}
```

### Action Parameters

```typescript
{
  action_id: string;
  action_title: string;
  action_category: 'coping' | 'lifestyle' | 'connection';
  duration_minutes?: number;  // optional
  is_simplified?: boolean;    // optional
}
```

### SOS Parameters

```typescript
{
  protocol_type: 'overwhelm' | 'panic' | 'anger' | 'cant_sleep' | 'struggling';
  crisis_level?: 'low' | 'medium' | 'high';  // optional
  resource_accessed?: string;                 // optional
}
```

### Therapist Booking Parameters

```typescript
{
  provider?: string;                  // optional
  session_type?: 'initial' | 'follow_up';  // optional
  scheduled_date?: string;            // optional (ISO date)
}
```

### Streak Milestone Parameters

```typescript
{
  streak_days: number;
  is_longest_streak: boolean;
  total_checkins: number;
}
```

### Weekly Focus Parameters

```typescript
{
  focus_area: string;  // e.g., 'sleep', 'anxiety', 'connection'
  num_goals: number;   // typically 7 for daily goals
}
```

### Journal Entry Parameters

```typescript
{
  word_count: number;
  has_voice_note: boolean;
  mood_score?: number;   // optional (1-10)
  tags?: string[];       // optional array of tags
}
```

## User Properties

Available user properties:

```typescript
{
  user_id?: string;
  user_type?: 'free' | 'premium';
  onboarding_completed?: boolean;
  has_therapist?: boolean;
  crisis_protocol_enabled?: boolean;
  primary_concern?: string;
  checkin_frequency?: 'daily' | 'weekly' | 'occasional';
}
```

## Common Patterns

### Track Screen in Component

```typescript
useEffect(() => {
  trackScreen('ScreenName');
}, []);
```

### Track Action with Haptics

```typescript
const handleAction = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  trackEvent('button_pressed', { button_id: 'submit' });
  // Continue with action...
};
```

### Track Navigation

```typescript
const handleNavigate = (destination: string) => {
  trackEvent('navigation', { destination });
  router.push(destination);
};
```

### Track Form Submission

```typescript
const handleSubmit = async (formData) => {
  startTrace('form_submission');
  try {
    await submitForm(formData);
    stopTrace('form_submission', true);
    trackEvent('form_submitted', { form_type: 'contact' });
  } catch (error) {
    stopTrace('form_submission', false, error.message);
    logError(error, { component: 'ContactForm' });
  }
};
```

### Track Conditional Events

```typescript
const trackIfMilestone = (count: number) => {
  const milestones = [5, 10, 25, 50, 100];
  if (milestones.includes(count)) {
    trackEvent('milestone_reached', { count });
  }
};
```

## Error Handling

### Safe Event Tracking

```typescript
const safeTrackEvent = (eventName, params) => {
  try {
    trackEvent(eventName, params);
  } catch (error) {
    console.warn('Analytics error:', error);
    // Never let analytics break the app
  }
};
```

### Async Error Handling

```typescript
const handleAsyncOperation = async () => {
  try {
    const result = await operation();
    trackEvent('operation_success', { result_type: typeof result });
  } catch (error) {
    logError(error, { operation: 'handleAsyncOperation' });
    trackEvent('operation_failed', { error_type: error.name });
  }
};
```

## Testing

### Development Console Output

```typescript
// Screen tracking
[Analytics] Screen View: (tabs)/checkin

// Event tracking
[Analytics] Event: check_in_completed {
  mood_score: 7,
  stress_level: 4,
  sleep_hours: 7.5,
  energy_level: 6,
  crisis_detected: false
}

// User ID
[Analytics] User ID: abc123xyz

// User properties
[Analytics] User Properties: {
  onboarding_completed: true,
  has_therapist: false
}

// Performance trace
[Analytics] Performance: api_fetch_data took 234ms
```

### Test Event Function

```typescript
if (__DEV__) {
  const testAnalytics = () => {
    console.log('Testing analytics...');

    trackScreen('TestScreen');

    trackEvent('test_event', {
      test_param: 'test_value',
    });

    trackCheckInCompleted({
      mood_score: 7,
      stress_level: 4,
      sleep_hours: 7.5,
      energy_level: 6,
    });

    console.log('Analytics test complete');
  };
}
```

## Debugging

### Check Analytics Initialization

```typescript
// Should see in console:
[Analytics] Firebase Analytics initialized
// OR
[Analytics] Running in development mode - events will be logged to console
```

### Verify Events

1. Check console for event logs in development
2. Use Firebase DebugView in production
3. Check Firebase Analytics dashboard (24-hour delay)

### Common Issues

```typescript
// Issue: Events not showing
// Solution: Check if analytics is initialized
// Look for: [Analytics] Firebase Analytics initialized

// Issue: Type errors
// Solution: Use correct parameter types from interfaces

// Issue: PII in events
// Solution: Never include email, phone, name, etc.

// Issue: Events blocking UI
// Solution: All tracking is async, don't await
```

## Best Practices Checklist

- ✅ Use typed event functions
- ✅ Track on action completion, not initiation
- ✅ Include relevant context in parameters
- ✅ Never block UI waiting for analytics
- ✅ Never track PII
- ✅ Use consistent naming (snake_case)
- ✅ Set user properties on login/profile change
- ✅ Clear analytics on logout
- ✅ Test in development before deploying
- ✅ Handle analytics errors gracefully

## Need More Help?

- 📖 Full documentation: `ANALYTICS_README.md`
- 💡 Examples: `ANALYTICS_EXAMPLES.md`
- 📋 Implementation details: `ANALYTICS_IMPLEMENTATION_SUMMARY.md`
- 🔧 Source code: `services/analytics.ts`
