# Predictive & Proactive Support - Integration Guide

This guide explains how to integrate the predictive support features into your existing screens.

## 1. Home Screen Integration (app/(tabs)/index.tsx)

Add these imports:
```typescript
import { usePredictiveStore } from '../../stores/predictiveStore';
import { usePlanStore } from '../../stores/planStore';
import { ProactiveAlertCard } from '../../components/ProactiveAlertCard';
import { getGentlerMessage } from '../../utils/badDayMode';
```

In the component:
```typescript
export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { todayCheckin, isLoading, refresh } = useCheckinStore();
  const { streak, fetchStreak, refreshStreak } = useStreakStore();

  // Add predictive store
  const {
    currentAlert,
    alertDismissed,
    dismissAlert,
    runPredictions,
    badDayModeActive,
    activateBadDayMode,
    deactivateBadDayMode,
  } = usePredictiveStore();

  const { currentPlan } = usePlanStore();

  const [refreshing, setRefreshing] = useState(false);

  // Run predictions on mount and after check-in
  useEffect(() => {
    fetchStreak();
    runPredictions();
  }, [fetchStreak, runPredictions]);

  // Re-run predictions when today's check-in changes
  useEffect(() => {
    if (todayCheckin) {
      runPredictions();
    }
  }, [todayCheckin, runPredictions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refresh(),
      refreshStreak(),
      runPredictions(),
    ]);
    setRefreshing(false);
  }, [refresh, refreshStreak, runPredictions]);

  // Handle proactive alert actions
  const handleAcceptLighterPlan = () => {
    activateBadDayMode([{
      type: 'manual',
      description: 'User accepted lighter plan',
      timestamp: new Date().toISOString(),
    }]);
    dismissAlert();
  };

  const handleKeepNormal = () => {
    dismissAlert();
  };

  const greeting = getGreeting();
  const firstName = profile?.displayName?.split(' ')[0] || 'there';

  // Adjust greeting for bad day mode
  const greetingMessage = badDayModeActive
    ? getGentlerMessage('welcome')
    : `${greeting}, ${firstName}!`;

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{firstName}!</Text>
        </View>

        {/* Proactive Alert - NEW */}
        {currentAlert && !alertDismissed && (
          <ProactiveAlertCard
            alert={currentAlert}
            onAcceptLighterPlan={handleAcceptLighterPlan}
            onKeepNormal={handleKeepNormal}
            onDismiss={dismissAlert}
          />
        )}

        {/* Bad Day Mode Indicator - NEW */}
        {badDayModeActive && (
          <Card style={styles.badDayBanner}>
            <View style={styles.badDayContent}>
              <Ionicons name="heart" size={24} color={colors.primary} />
              <View style={styles.badDayText}>
                <Text style={styles.badDayTitle}>Support Mode Active</Text>
                <Text style={styles.badDaySubtitle}>
                  We've simplified your plan for today
                </Text>
              </View>
              <Pressable onPress={deactivateBadDayMode}>
                <Text style={styles.badDayLink}>Restore</Text>
              </Pressable>
            </View>
          </Card>
        )}

        {/* Today's Status */}
        <Card style={styles.statusCard}>
          {/* ... existing status card content ... */}
        </Card>

        {/* Rest of your existing content ... */}
      </ScrollView>
    </View>
  );
}

// Add these styles:
const styles = StyleSheet.create({
  // ... existing styles ...

  badDayBanner: {
    backgroundColor: colors.primary + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: spacing.lg,
  },
  badDayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badDayText: {
    flex: 1,
  },
  badDayTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  badDaySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  badDayLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});
```

## 2. Settings Screen Integration

Add a navigation link to the trigger dates screen in your settings:

```typescript
// In app/(tabs)/settings.tsx or similar
<Pressable
  style={styles.settingItem}
  onPress={() => router.push('/(settings)/trigger-dates')}
>
  <View style={styles.settingLeft}>
    <Ionicons name="calendar-outline" size={24} color={colors.primary} />
    <View>
      <Text style={styles.settingTitle}>Difficult Dates</Text>
      <Text style={styles.settingSubtitle}>
        Mark dates when you might need extra support
      </Text>
    </View>
  </View>
  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
</Pressable>
```

## 3. Plan Generation Integration

When generating daily plans (wherever that happens in your app):

```typescript
import { applyBadDayModeIfNeeded } from '../../utils/planHelpers';
import { usePredictiveStore } from '../../stores/predictiveStore';

function generateDailyPlan() {
  const { badDayModeActive } = usePredictiveStore.getState();

  // Generate your normal plan
  let plan: DailyPlan = {
    id: generateId(),
    date: getTodayString(),
    actions: [
      // ... your normal 3-5 actions
    ],
    completedCount: 0,
    totalCount: actions.length,
  };

  // Apply bad day mode adjustments if needed
  plan = applyBadDayModeIfNeeded(plan, badDayModeActive);

  return plan;
}
```

## 4. Check-in Flow Integration

After a check-in is completed, trigger prediction updates:

```typescript
// In your check-in submission handler
const handleCheckInComplete = async (checkInData) => {
  // Submit check-in
  await createCheckin(checkInData);

  // Run predictions based on new data
  const { runPredictions, checkBadDayModeConditions } = usePredictiveStore.getState();
  await runPredictions();
  checkBadDayModeConditions();
};
```

## 5. App Initialization

Load trigger dates and run initial predictions when the app starts:

```typescript
// In your root _layout.tsx or App.tsx
useEffect(() => {
  const initPredictiveSupport = async () => {
    const { loadTriggerDates, runPredictions } = usePredictiveStore.getState();
    await loadTriggerDates();
    await runPredictions();
  };

  if (user) {
    initPredictiveSupport();
  }
}, [user]);
```

## 6. Periodic Prediction Updates

Run predictions periodically (e.g., once per day):

```typescript
// In your app's background task or daily refresh
useEffect(() => {
  const runDailyPredictions = async () => {
    const { runPredictions } = usePredictiveStore.getState();
    await runPredictions();
  };

  // Run on app open and once per day
  runDailyPredictions();

  const interval = setInterval(runDailyPredictions, 24 * 60 * 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

## Key Features Summary

### Pattern Prediction
- Analyzes day-of-week patterns from check-in history
- Predicts tomorrow's mood based on patterns and trends
- Detects recurring trigger patterns

### Trigger Dates
- User-defined difficult dates (anniversaries, etc.)
- Annual repeat option
- Proactive alerts 1-2 days before

### Bad Day Mode
- Automatically activates when:
  - Mood < 2
  - SOS used
  - 3+ missed actions
  - On a trigger date
- Reduces plan to 1 simplified action
- Uses gentler messaging
- Auto-deactivates next day or when mood >= 3

### Proactive Alerts
- Shows on home screen when predictions trigger
- Actionable options (accept lighter plan / keep normal)
- Different severity levels (info / warning / critical)

## Testing

1. Add some trigger dates via the settings screen
2. Create check-ins with varying moods over several days
3. Create check-ins with low mood (< 2) to trigger bad day mode
4. Check for proactive alerts on the home screen
5. Verify lighter plans are generated when bad day mode is active

## Notes

- All data is stored offline-first with Firebase sync
- Predictions require at least 3 check-ins for meaningful results
- Bad day mode automatically adjusts plans but can be manually overridden
- Trigger dates support annual repeating for recurring difficult dates
