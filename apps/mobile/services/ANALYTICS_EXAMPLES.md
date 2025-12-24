# Analytics Implementation Examples

This guide provides practical examples of how to use the analytics service throughout the MentalSpace Companion app.

## Table of Contents

1. [Screen Tracking](#screen-tracking)
2. [Event Tracking](#event-tracking)
3. [User Properties](#user-properties)
4. [Error Logging](#error-logging)
5. [Performance Tracing](#performance-tracing)
6. [Advanced Patterns](#advanced-patterns)

## Screen Tracking

### Automatic Screen Tracking (Already Implemented)

Screen tracking is automatically handled in `app/_layout.tsx` via Expo Router:

```typescript
import { useSegments } from 'expo-router';
import { trackScreen } from '../services/analytics';

function AuthHandler({ children }: { children: React.ReactNode }) {
  const segments = useSegments();

  useEffect(() => {
    const screenName = segments.length > 0 ? segments.join('/') : 'root';
    trackScreen(screenName);
  }, [segments]);

  return <>{children}</>;
}
```

### Manual Screen Tracking

For modal screens or custom navigation:

```typescript
import { trackScreen } from '../services/analytics';

export default function CustomModal() {
  useEffect(() => {
    trackScreen('CustomModal', 'ModalScreen');
  }, []);

  return (
    <View>
      {/* Modal content */}
    </View>
  );
}
```

## Event Tracking

### 1. Check-in Completion (Implemented)

```typescript
// In stores/checkinStore.ts
import { trackCheckInCompleted, trackEvent } from '../services/analytics';

// After successful check-in
trackCheckInCompleted({
  mood_score: data.mood,
  stress_level: data.stress,
  sleep_hours: data.sleep,
  energy_level: data.energy,
  crisis_detected: data.crisisDetected,
});

// Track crisis separately if detected
if (data.crisisDetected) {
  trackEvent('crisis_detected', {
    handled: data.crisisHandled,
  });
}
```

### 2. Action Completion (Implemented)

```typescript
// In stores/planStore.ts
import { trackActionCompleted } from '../services/analytics';

completeAction: (actionId) => {
  const action = findAction(actionId);

  // Update state...

  // Track completion
  if (!action.completed) {
    trackActionCompleted({
      action_id: action.id,
      action_title: action.title,
      action_category: action.category,
      duration_minutes: action.duration,
      is_simplified: action.simplified,
    });
  }
}
```

### 3. SOS Trigger (Implemented)

```typescript
// In app/(tabs)/sos.tsx
import { trackSOSTriggered } from '../services/analytics';

const handleProtocolSelect = (protocolId: SOSProtocolType) => {
  trackSOSTriggered({
    protocol_type: protocolId,
  });

  router.push({
    pathname: '/(sos)/protocol',
    params: { type: protocolId },
  });
};
```

### 4. Custom Event Tracking

For any other events:

```typescript
import { trackEvent } from '../services/analytics';

// Safety plan access
trackEvent('safety_plan_accessed', {
  section: 'warning_signs',
});

// Sleep log
trackEvent('sleep_logged', {
  hours: 7.5,
  quality_score: 8,
  had_interruptions: false,
});

// Insights viewed
trackEvent('insights_viewed', {
  insight_type: 'mood_trends',
  time_range: '7_days',
});
```

## User Properties

### Set User ID on Login

```typescript
// In stores/authStore.ts
import { setUserId, setUserProperties } from '../services/analytics';

const login = async (email: string, password: string) => {
  const userCredential = await auth.signInWithEmailAndPassword(email, password);
  const user = userCredential.user;

  // Set analytics user ID
  setUserId(user.uid);

  // Set initial user properties
  if (profile) {
    setUserProperties({
      onboarding_completed: profile.onboardingCompleted,
      has_therapist: profile.hasTherapist,
      primary_concern: profile.primaryConcern,
    });
  }
};
```

### Update User Properties

```typescript
// When user completes onboarding
import { setUserProperties } from '../services/analytics';

const completeOnboarding = async (data) => {
  // Save to Firestore...

  // Update analytics
  setUserProperties({
    onboarding_completed: true,
    primary_concern: data.primaryConcern,
  });
};
```

### Clear User Properties on Logout

```typescript
import { resetAnalytics } from '../services/analytics';

const logout = async () => {
  await auth.signOut();

  // Clear analytics data
  resetAnalytics();
};
```

## Error Logging

### Non-Fatal Error Logging

```typescript
import { logError } from '../services/analytics';

// In a try-catch block
const fetchUserData = async (userId: string) => {
  try {
    const response = await db.collection('users').doc(userId).get();
    return response.data();
  } catch (error) {
    // Log error to analytics
    logError(error, {
      component: 'UserService',
      action: 'fetchUserData',
      userId: userId,
    });

    // Show user-friendly error
    Alert.alert('Error', 'Failed to load user data');
  }
};
```

### Custom Error Logging

```typescript
import { logError } from '../services/analytics';

// Log validation errors
if (!isValid) {
  logError('Validation failed', {
    component: 'CheckinForm',
    field: 'mood_score',
    value: moodScore,
  });
}

// Log business logic errors
if (streak.broken) {
  logError('Streak broken unexpectedly', {
    component: 'StreakService',
    lastCheckin: streak.lastCheckinDate,
    currentStreak: streak.currentStreak,
  });
}
```

## Performance Tracing

### API Call Performance

```typescript
import { startTrace, stopTrace } from '../services/analytics';

const fetchCheckins = async (userId: string, days: number) => {
  // Start performance trace
  startTrace('api_fetch_checkins');

  try {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('checkins')
      .orderBy('date', 'desc')
      .limit(days)
      .get();

    const checkins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Success - stop trace
    stopTrace('api_fetch_checkins', true);

    return checkins;
  } catch (error) {
    // Error - stop trace with error
    stopTrace('api_fetch_checkins', false, error.message);
    throw error;
  }
};
```

### Component Render Performance

```typescript
import { startTrace, stopTrace } from '../services/analytics';

const HeavyComponent = () => {
  useEffect(() => {
    startTrace('render_insights_chart');

    return () => {
      stopTrace('render_insights_chart', true);
    };
  }, []);

  return (
    <View>
      {/* Complex chart rendering */}
    </View>
  );
};
```

### Operation Performance

```typescript
import { startTrace, stopTrace } from '../services/analytics';

const processJournalEntry = async (entry: string) => {
  startTrace('process_journal_entry');

  try {
    // Word count
    const wordCount = entry.split(/\s+/).length;

    // Sentiment analysis (if implemented)
    const sentiment = await analyzeSentiment(entry);

    // Tag extraction
    const tags = extractTags(entry);

    stopTrace('process_journal_entry', true);

    return { wordCount, sentiment, tags };
  } catch (error) {
    stopTrace('process_journal_entry', false, error.message);
    throw error;
  }
};
```

## Advanced Patterns

### Conditional Event Tracking

```typescript
import { trackEvent } from '../services/analytics';

// Only track milestones
const trackStreakIfMilestone = (streak: number) => {
  const milestones = [3, 7, 14, 30, 60, 90, 180, 365];

  if (milestones.includes(streak)) {
    trackStreakMilestone({
      streak_days: streak,
      is_longest_streak: streak === longestStreak,
      total_checkins: totalCheckins,
    });
  }
};
```

### Debounced Event Tracking

```typescript
import { trackEvent } from '../services/analytics';
import { debounce } from 'lodash';

// Debounce search events
const trackSearch = debounce((query: string) => {
  trackEvent('search', {
    query_length: query.length,
    has_results: results.length > 0,
  });
}, 1000);

const handleSearchChange = (text: string) => {
  setSearchQuery(text);
  trackSearch(text);
};
```

### Batched Event Tracking

```typescript
import { trackEvent } from '../services/analytics';

// Track multiple actions in a session
const trackSessionEnd = (sessionData: SessionData) => {
  trackEvent('session_completed', {
    duration_minutes: sessionData.durationMinutes,
    actions_completed: sessionData.actionsCompleted,
    screens_visited: sessionData.screensVisited.join(','),
    features_used: sessionData.featuresUsed.join(','),
  });
};
```

### User Engagement Tracking

```typescript
import { trackEvent } from '../services/analytics';

// Track when user engages deeply with a feature
const trackDeepEngagement = (feature: string, duration: number) => {
  if (duration > 60) { // More than 1 minute
    trackEvent('deep_engagement', {
      feature: feature,
      duration_seconds: duration,
    });
  }
};

// Usage
useEffect(() => {
  const startTime = Date.now();

  return () => {
    const duration = (Date.now() - startTime) / 1000;
    trackDeepEngagement('journal_entry', duration);
  };
}, []);
```

### Conversion Funnel Tracking

```typescript
import { trackEvent } from '../services/analytics';

// Track onboarding funnel
const trackOnboardingStep = (step: string, completed: boolean) => {
  trackEvent('onboarding_step', {
    step_name: step,
    step_index: ONBOARDING_STEPS.indexOf(step),
    completed: completed,
  });
};

// Usage
trackOnboardingStep('welcome', true);
trackOnboardingStep('reasons', true);
trackOnboardingStep('focus', false); // User dropped off
```

### Feature Discovery Tracking

```typescript
import { trackEvent } from '../services/analytics';

// Track when user discovers a feature for the first time
const trackFeatureDiscovery = async (featureName: string) => {
  const discovered = await AsyncStorage.getItem(`discovered_${featureName}`);

  if (!discovered) {
    trackEvent('feature_discovered', {
      feature_name: featureName,
    });

    await AsyncStorage.setItem(`discovered_${featureName}`, 'true');
  }
};

// Usage
useEffect(() => {
  trackFeatureDiscovery('voice_notes');
}, []);
```

## Testing Analytics

### Development Mode

All analytics are logged to console in development:

```typescript
// Console output
[Analytics] Event: check_in_completed {
  mood_score: 7,
  stress_level: 4,
  sleep_hours: 7.5,
  energy_level: 6,
  crisis_detected: false
}

[Analytics] Screen View: (tabs)/plan
[Analytics] User ID: user_123
[Analytics] User Properties: { onboarding_completed: true, has_therapist: false }
```

### Test Event Tracking

```typescript
import { trackEvent } from '../services/analytics';

// Add test button in development
if (__DEV__) {
  const testAnalytics = () => {
    trackEvent('test_event', {
      test_parameter: 'test_value',
    });
  };

  return (
    <Button title="Test Analytics" onPress={testAnalytics} />
  );
}
```

## Best Practices Checklist

- [ ] Use typed event functions instead of generic `trackEvent`
- [ ] Never track PII (names, emails, phone numbers)
- [ ] Track meaningful events that drive insights
- [ ] Include relevant context in event parameters
- [ ] Use consistent naming conventions (snake_case)
- [ ] Track both successes and failures
- [ ] Set user properties on login/profile updates
- [ ] Clear analytics on logout
- [ ] Test events in development before deploying
- [ ] Document custom events in ANALYTICS_README.md

## Common Mistakes to Avoid

### Don't Track Too Much

```typescript
// Bad - tracking every button press
trackEvent('button_pressed', { button_id: 'submit' });
trackEvent('button_pressed', { button_id: 'cancel' });

// Good - track meaningful actions
trackCheckInCompleted({ ... });
trackActionCompleted({ ... });
```

### Don't Include PII

```typescript
// Bad
trackEvent('user_registered', {
  email: user.email, // PII!
  phone: user.phone, // PII!
});

// Good
trackEvent('user_registered', {
  has_email: !!user.email,
  has_phone: !!user.phone,
  registration_method: 'email',
});
```

### Don't Block UI on Analytics

```typescript
// Bad - blocks UI
await trackEvent('button_clicked', { ... });
navigateToNextScreen();

// Good - fire and forget
trackEvent('button_clicked', { ... });
navigateToNextScreen();
```

### Don't Forget Error Handling

```typescript
// Bad - can crash the app
trackEvent('user_action', someObject.property);

// Good - safely handle errors
try {
  trackEvent('user_action', {
    property: someObject?.property ?? 'unknown',
  });
} catch (error) {
  console.warn('Analytics error:', error);
}
```
