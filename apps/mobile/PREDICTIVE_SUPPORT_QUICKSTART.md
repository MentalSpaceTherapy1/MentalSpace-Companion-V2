# Predictive & Proactive Support - Quick Start Guide

## Installation Checklist

All files have been created. Follow these steps to integrate:

### 1. Files Created

Core functionality:
- [x] `services/patternPrediction.ts` - Pattern analysis algorithms
- [x] `stores/predictiveStore.ts` - State management
- [x] `utils/badDayMode.ts` - Bad day mode logic
- [x] `utils/planHelpers.ts` - Plan adjustment utilities
- [x] `components/ProactiveAlertCard.tsx` - Alert UI component
- [x] `app/(settings)/trigger-dates.tsx` - Trigger dates screen

Documentation:
- [x] `PREDICTIVE_SUPPORT_README.md` - Full documentation
- [x] `PREDICTIVE_SUPPORT_INTEGRATION.md` - Integration guide
- [x] `examples/HomeScreenWithPredictive.tsx` - Example home screen
- [x] `examples/PredictionExamples.ts` - Algorithm examples

### 2. Required Dependencies

These should already be installed in your project:
- `zustand` - State management
- `@react-native-async-storage/async-storage` - Local storage
- `@react-native-community/datetimepicker` - Date picker for trigger dates
- Firebase (already configured)

If missing, install:
```bash
npm install @react-native-community/datetimepicker
```

### 3. Integration Steps

#### Step 1: Add to Home Screen (5 minutes)

In `app/(tabs)/index.tsx`:

1. Add imports:
```typescript
import { usePredictiveStore } from '../../stores/predictiveStore';
import { ProactiveAlertCard } from '../../components/ProactiveAlertCard';
import { getGentlerMessage } from '../../utils/badDayMode';
```

2. Add to component:
```typescript
const {
  currentAlert,
  alertDismissed,
  dismissAlert,
  runPredictions,
  badDayModeActive,
  activateBadDayMode,
  deactivateBadDayMode,
} = usePredictiveStore();

useEffect(() => {
  runPredictions();
}, [runPredictions]);
```

3. Add UI (after header, before status card):
```typescript
{currentAlert && !alertDismissed && (
  <ProactiveAlertCard
    alert={currentAlert}
    onAcceptLighterPlan={() => {
      activateBadDayMode([{
        type: 'manual',
        description: 'User accepted lighter plan',
        timestamp: new Date().toISOString(),
      }]);
      dismissAlert();
    }}
    onKeepNormal={dismissAlert}
    onDismiss={dismissAlert}
  />
)}

{badDayModeActive && (
  <Card style={{ backgroundColor: colors.primary + '10', marginBottom: spacing.lg }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <Ionicons name="heart" size={24} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: 'bold' }}>Support Mode Active</Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          {getGentlerMessage('plan')}
        </Text>
      </View>
      <Pressable onPress={deactivateBadDayMode}>
        <Text style={{ color: colors.primary }}>Restore</Text>
      </Pressable>
    </View>
  </Card>
)}
```

#### Step 2: Add Settings Link (2 minutes)

In `app/(tabs)/settings.tsx`:

```typescript
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

#### Step 3: Initialize on App Start (2 minutes)

In your root layout or App.tsx:

```typescript
import { usePredictiveStore } from './stores/predictiveStore';

useEffect(() => {
  const { loadTriggerDates, runPredictions } = usePredictiveStore.getState();

  if (user) {
    loadTriggerDates();
    runPredictions();
  }
}, [user]);
```

#### Step 4: Integrate with Check-in (3 minutes)

In your check-in completion handler:

```typescript
const handleCheckInComplete = async (checkInData) => {
  await createCheckin(checkInData);

  // Run predictions after check-in
  const { runPredictions, checkBadDayModeConditions } = usePredictiveStore.getState();
  await runPredictions();
  checkBadDayModeConditions();
};
```

#### Step 5: Adjust Plan Generation (Optional, 5 minutes)

If you have plan generation logic:

```typescript
import { applyBadDayModeIfNeeded } from '../utils/planHelpers';

function generateDailyPlan() {
  let plan = createNormalPlan();

  const { badDayModeActive } = usePredictiveStore.getState();
  plan = applyBadDayModeIfNeeded(plan, badDayModeActive);

  return plan;
}
```

### 4. Testing (10 minutes)

#### Test Pattern Detection
1. Create 7+ check-ins with varying moods
2. Make Mondays consistently lower mood
3. Run predictions
4. Check if pattern is detected

#### Test Bad Day Mode
1. Create check-in with mood = 1
2. Verify "Support Mode Active" banner appears
3. Check that next day or mood >= 3 deactivates it

#### Test Trigger Dates
1. Go to Settings > Difficult Dates
2. Add a date for tomorrow
3. Return to home screen
4. Verify proactive alert appears

#### Test Proactive Alerts
1. Create pattern of low Mondays
2. On Sunday, check for "Tomorrow might be challenging" alert
3. Verify accept/dismiss options work

### 5. Customization

#### Change Bad Day Mode Settings

Edit `utils/badDayMode.ts`:
```typescript
const DEFAULT_BAD_DAY_CONFIG: BadDayModeConfig = {
  maxActions: 1,              // Change to 2 for two actions
  gentlerMessaging: true,
  extraSupportPrompts: true,
  simplifiedActionsOnly: true,
};
```

#### Adjust Messaging

Edit messages in `utils/badDayMode.ts`:
```typescript
export function getGentlerMessage(messageType) {
  const messages = {
    welcome: "Your custom message here",
    // ...
  };
  return messages[messageType];
}
```

#### Modify Prediction Logic

Edit thresholds in `services/patternPrediction.ts`:
```typescript
// Change "harder day" threshold
const isHarder = averageMood < 3 || averageStress > 3;

// Change confidence calculation
confidence = Math.min(tomorrowPattern.checkinsCount / 10, 0.85);
```

## Common Issues

### Predictions not showing
- Need at least 3 check-ins for predictions
- Call `runPredictions()` after check-ins
- Check `currentAlert` state in debugger

### Bad day mode not activating
- Verify mood < 2 in check-in
- Check `checkBadDayModeConditions()` is called
- Review `badDayTriggers` in state for debug info

### Trigger dates not syncing
- Ensure user is authenticated
- Check Firebase permissions
- Verify network connectivity

## Next Steps

1. Review full documentation in `PREDICTIVE_SUPPORT_README.md`
2. See integration examples in `PREDICTIVE_SUPPORT_INTEGRATION.md`
3. Run example code in `examples/PredictionExamples.ts`
4. Customize messaging and thresholds
5. Add analytics tracking for insights

## Quick Commands

```typescript
// Run predictions manually
usePredictiveStore.getState().runPredictions();

// Activate bad day mode
usePredictiveStore.getState().activateBadDayMode([{
  type: 'manual',
  description: 'Testing',
  timestamp: new Date().toISOString(),
}]);

// Deactivate bad day mode
usePredictiveStore.getState().deactivateBadDayMode();

// Add trigger date
usePredictiveStore.getState().addTriggerDate(
  '2024-12-25',
  'Test date',
  true
);

// Get current state
console.log(usePredictiveStore.getState());
```

## Support

- Full docs: `PREDICTIVE_SUPPORT_README.md`
- Integration guide: `PREDICTIVE_SUPPORT_INTEGRATION.md`
- Example implementation: `examples/HomeScreenWithPredictive.tsx`
- Algorithm examples: `examples/PredictionExamples.ts`

Total integration time: ~20-30 minutes
