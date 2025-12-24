# Analytics & Crashlytics Implementation

## Overview

This analytics service provides production-ready Firebase Analytics and error tracking for the MentalSpace Companion mobile app. It's built to work seamlessly with Expo and gracefully degrades when Firebase Analytics is not available (e.g., in Expo Go or web environments).

## Features

- **Screen Tracking**: Automatic screen view tracking integrated with Expo Router
- **Event Tracking**: Type-safe event tracking for key user actions
- **User Properties**: Track user attributes and preferences
- **Error Logging**: Non-fatal error tracking for debugging
- **Performance Tracing**: API call performance monitoring
- **Offline Support**: Works offline and syncs when online
- **Graceful Degradation**: Falls back to console logging in development environments

## Architecture

### Core Service

**Location**: `services/analytics.ts`

The analytics service is implemented as a singleton class that:
1. Initializes Firebase Analytics on app startup
2. Provides type-safe methods for tracking events
3. Sanitizes parameters to meet Firebase requirements
4. Falls back to console logging when analytics is unavailable

### Integration Points

Analytics has been integrated into the following locations:

1. **App Layout** (`app/_layout.tsx`)
   - Automatic screen tracking via Expo Router segments
   - User ID and property tracking on authentication
   - User property updates when profile changes

2. **Check-in Store** (`stores/checkinStore.ts`)
   - Tracks check-in completion with metrics
   - Tracks crisis detection and handling

3. **Plan Store** (`stores/planStore.ts`)
   - Tracks action completion
   - Includes action category, duration, and simplified status

4. **SOS Screen** (`app/(tabs)/sos.tsx`)
   - Tracks SOS protocol triggers
   - Tracks crisis resource access

5. **Streak Store** (`stores/streakStore.ts`)
   - Tracks streak milestones (3, 7, 14, 30, 60, 90, 180, 365 days)
   - Includes longest streak tracking

6. **Journal Store** (`stores/journalStore.ts`)
   - Tracks journal entry creation
   - Includes word count, voice notes, and mood

7. **Weekly Focus** (`app/(weekly-focus)/daily-goals.tsx`)
   - Tracks when users set weekly focus goals

8. **Telehealth** (`app/(telehealth)/index.tsx`)
   - Tracks therapist booking requests

## Tracked Events

### Primary Events

| Event Name | Triggered When | Parameters |
|------------|----------------|------------|
| `check_in_completed` | User completes daily check-in | mood_score, stress_level, sleep_hours, energy_level, crisis_detected |
| `action_completed` | User completes a planned action | action_id, action_title, action_category, duration_minutes, is_simplified |
| `sos_triggered` | User accesses SOS protocol | protocol_type |
| `therapist_booked` | User requests therapist appointment | session_type |
| `streak_milestone` | User reaches streak milestone | streak_days, is_longest_streak, total_checkins |
| `weekly_focus_set` | User sets weekly focus goals | focus_area, num_goals |
| `journal_entry_created` | User creates journal entry | word_count, has_voice_note, mood_score, tags |

### Secondary Events

| Event Name | Triggered When | Parameters |
|------------|----------------|------------|
| `screen_view` | User navigates to a screen | screen_name, screen_class |
| `crisis_detected` | Check-in detects crisis signals | handled |
| `crisis_resource_accessed` | User accesses crisis resource | resource_type, phone_number |

## Usage

### Tracking Events

```typescript
import { trackEvent } from '../services/analytics';

// Track a simple event
trackEvent('screen_view', {
  screen_name: 'Home',
  screen_class: 'HomeScreen',
});

// Track check-in completion
import { trackCheckInCompleted } from '../services/analytics';

trackCheckInCompleted({
  mood_score: 7,
  stress_level: 4,
  sleep_hours: 7.5,
  energy_level: 6,
  crisis_detected: false,
});
```

### Tracking Screens

```typescript
import { trackScreen } from '../services/analytics';

// In a component or screen
useEffect(() => {
  trackScreen('SettingsScreen');
}, []);
```

### Setting User Properties

```typescript
import { setUserProperties, setUserId } from '../services/analytics';

// Set user ID on login
setUserId(user.uid);

// Set user properties
setUserProperties({
  onboarding_completed: true,
  has_therapist: false,
  primary_concern: 'anxiety',
});
```

### Error Logging

```typescript
import { logError } from '../services/analytics';

try {
  // Some operation
} catch (error) {
  logError(error, {
    component: 'CheckinScreen',
    action: 'submitCheckin',
  });
}
```

### Performance Tracing

```typescript
import { startTrace, stopTrace } from '../services/analytics';

// Start timing
startTrace('api_fetch_checkins');

try {
  const response = await fetchCheckins();
  stopTrace('api_fetch_checkins', true);
} catch (error) {
  stopTrace('api_fetch_checkins', false, error.message);
}
```

## Event Parameters

All event parameters are automatically sanitized to meet Firebase Analytics requirements:

- Arrays are converted to comma-separated strings
- Objects are converted to JSON strings
- Undefined/null values are removed
- All values are converted to primitives (string, number, boolean)

## User Properties

The following user properties are tracked:

| Property | Type | Description |
|----------|------|-------------|
| `user_id` | string | Firebase user ID |
| `user_type` | string | Account type (free/premium) |
| `onboarding_completed` | boolean | Onboarding status |
| `has_therapist` | boolean | Whether user has a therapist |
| `crisis_protocol_enabled` | boolean | Crisis detection enabled |
| `primary_concern` | string | User's primary mental health concern |
| `checkin_frequency` | string | How often user checks in |

## Environment Support

### Native Builds (iOS/Android)

Firebase Analytics works fully with all features:
- Events are sent to Firebase
- User properties are synced
- Performance traces are recorded
- Offline events are queued and synced

### Expo Go

Analytics gracefully degrades:
- Events are logged to console
- All tracking methods work without errors
- No Firebase connectivity required

### Web

Similar to Expo Go:
- Console logging only
- Full API compatibility
- No Firebase dependency

## Configuration

### Firebase Setup

1. Ensure `google-services.json` (Android) is in the project root
2. Ensure `GoogleService-Info.plist` (iOS) is configured
3. Firebase config is loaded from environment variables in `services/firebase.ts`

### Environment Variables

Required in `.env`:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Best Practices

### 1. Track Meaningful Events

Only track events that provide actionable insights:
- User engagement (check-ins, journal entries)
- Feature usage (SOS, telehealth)
- Milestones (streaks, goal completion)

### 2. Respect User Privacy

- Never track personally identifiable information (PII)
- Use anonymized user IDs
- Don't track sensitive health data in event parameters

### 3. Use Type-Safe Event Tracking

Always use the typed event functions instead of generic `trackEvent`:

```typescript
// Good
trackCheckInCompleted({ mood_score: 7, stress_level: 4, ... });

// Avoid
trackEvent('check_in_completed', { mood: 7, stress: 4 });
```

### 4. Error Handling

Always wrap analytics calls in try-catch to prevent blocking user flows:

```typescript
try {
  trackEvent('user_action', { ... });
} catch (error) {
  // Analytics should never break the app
  console.warn('Analytics error:', error);
}
```

## Testing

### Development Testing

Analytics automatically logs to console in development:

```javascript
// Console output example
[Analytics] Event: check_in_completed {
  mood_score: 7,
  stress_level: 4,
  sleep_hours: 7.5,
  energy_level: 6
}
```

### Production Testing

Use Firebase Analytics DebugView to verify events in real-time:

1. Enable debug mode on device
2. Open Firebase Console > Analytics > DebugView
3. Trigger events in the app
4. Verify events appear in DebugView

## Future Enhancements

Potential additions:

1. **Crashlytics Integration**: Add Firebase Crashlytics for crash reporting
2. **A/B Testing**: Integrate Firebase Remote Config for feature flags
3. **Custom Dimensions**: Add more user segments for analysis
4. **Conversion Funnels**: Track multi-step user flows
5. **Retention Analysis**: Track DAU/MAU metrics

## Troubleshooting

### Events Not Appearing

1. Check if Firebase Analytics is initialized:
   ```typescript
   // Should log: [Analytics] Firebase Analytics initialized
   ```

2. Verify Firebase configuration is correct

3. Check network connectivity

4. Events may take up to 24 hours to appear in Firebase Console (use DebugView for real-time)

### Type Errors

Ensure you're using the correct parameter types as defined in `analytics.ts`:

```typescript
// Correct
trackCheckInCompleted({
  mood_score: 7,  // number
  stress_level: 4, // number
  // ...
});

// Will cause type error
trackCheckInCompleted({
  mood: '7', // string - wrong type
});
```

## Support

For questions or issues:
1. Check Firebase Analytics documentation
2. Review implementation in `services/analytics.ts`
3. Check integration examples in stores and screens
