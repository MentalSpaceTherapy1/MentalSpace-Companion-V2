# Accessibility Implementation Guide

## Quick Start

### 1. Import Required Dependencies

```tsx
import { useAccessibilitySettings } from '../utils/accessibility';
import { AccessibleText } from '../components/AccessibleText';
import { Button } from '../components/ui/Button';
```

### 2. Use Accessibility Hook

```tsx
function MyScreen() {
  const { theme, reduceMotion, highContrast } = useAccessibilitySettings();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      {/* Your content */}
    </View>
  );
}
```

### 3. Update Existing Components

#### Before:
```tsx
<Pressable onPress={handlePress}>
  <Text style={{ fontSize: 16 }}>Click me</Text>
</Pressable>
```

#### After:
```tsx
import { getAccessibleButtonProps } from '../utils/accessibility';
import { AccessibleText } from '../components/AccessibleText';

const a11yProps = getAccessibleButtonProps(
  'Click button',
  'Double tap to perform action'
);

<Pressable onPress={handlePress} {...a11yProps}>
  <AccessibleText variant="body">Click me</AccessibleText>
</Pressable>
```

## Component Checklist

### All Interactive Elements

- [ ] Add `accessibilityLabel`
- [ ] Add `accessibilityHint` for complex actions
- [ ] Set appropriate `accessibilityRole`
- [ ] Include `accessibilityState` for toggles, disabled states
- [ ] Ensure minimum 44pt touch target (52pt with larger touch targets)

### Text Elements

- [ ] Use `AccessibleText` component instead of `Text`
- [ ] Choose appropriate variant (body, heading, title, caption)
- [ ] Respect text size scaling
- [ ] Support dyslexia font

### Animations

- [ ] Check `reduceMotion` setting before animating
- [ ] Provide instant state changes when reduce motion is enabled
- [ ] Announce state changes for screen readers

### Colors

- [ ] Use `theme.colors` instead of hard-coded colors
- [ ] Ensure WCAG AA contrast ratios (4.5:1 for text)
- [ ] Test with high contrast mode enabled

## Common Patterns

### Toggle/Switch

```tsx
import { getAccessibleToggleProps } from '../utils/accessibility';

const a11yProps = getAccessibleToggleProps(
  'Enable notifications',
  isEnabled,
  'Turns push notifications on or off'
);

<Switch
  value={isEnabled}
  onValueChange={setIsEnabled}
  {...a11yProps}
/>
```

### Text Input

```tsx
import { AccessibleTextInput } from '../components/ui/AccessibleTextInput';

<AccessibleTextInput
  label="Email Address"
  value={email}
  onChangeText={setEmail}
  hint="Enter your email to receive updates"
  error={emailError}
  keyboardType="email-address"
/>
```

### Slider

```tsx
import { AccessibleSlider } from '../components/ui/AccessibleSlider';

<AccessibleSlider
  label="Mood Level"
  value={mood}
  minimumValue={1}
  maximumValue={10}
  onValueChange={setMood}
  formatValue={(v) => `${v}/10`}
  hint="Slide to adjust your current mood level"
/>
```

### Card with Action

```tsx
import { Card } from '../components/ui/Card';
import { AccessibleText } from '../components/AccessibleText';

<Card
  onPress={handleCardPress}
  accessibilityLabel="Journal entry from today"
  accessibilityHint="Double tap to view full entry"
  accessibilityRole="button"
>
  <AccessibleText variant="heading" weight="semibold">
    Morning Reflection
  </AccessibleText>
  <AccessibleText variant="body">
    Entry content...
  </AccessibleText>
</Card>
```

### List Items

```tsx
<FlatList
  data={items}
  renderItem={({ item }) => (
    <Pressable
      onPress={() => handleItemPress(item)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}`}
      accessibilityHint="Double tap to view details"
      style={{ minHeight: theme.minimumTouchTarget }}
    >
      <AccessibleText variant="body">{item.title}</AccessibleText>
    </Pressable>
  )}
  keyExtractor={(item) => item.id}
/>
```

### Dynamic Announcements

```tsx
import { AccessibilityInfo } from 'react-native';

useEffect(() => {
  if (isSuccess) {
    AccessibilityInfo.announceForAccessibility(
      'Form submitted successfully'
    );
  }
}, [isSuccess]);
```

## Screen-Specific Patterns

### Form Screens

```tsx
import { AccessibleTextInput } from '../components/ui/AccessibleTextInput';
import { Button } from '../components/ui/Button';

function RegistrationScreen() {
  const { theme } = useAccessibilitySettings();

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <AccessibleText variant="title" weight="bold">
        Create Account
      </AccessibleText>

      <AccessibleTextInput
        label="Full Name"
        value={name}
        onChangeText={setName}
        hint="Enter your first and last name"
        error={nameError}
      />

      <AccessibleTextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        hint="We'll never share your email"
        error={emailError}
      />

      <Button
        title="Create Account"
        onPress={handleSubmit}
        loading={isSubmitting}
        accessibilityLabel="Create account"
        accessibilityHint="Double tap to create your account"
      />
    </ScrollView>
  );
}
```

### Dashboard Screens

```tsx
import { useAccessibilitySettings } from '../utils/accessibility';
import { AccessibleText } from '../components/AccessibleText';
import { Card } from '../components/ui/Card';

function DashboardScreen() {
  const { theme } = useAccessibilitySettings();

  return (
    <ScrollView>
      <AccessibleText variant="title" weight="bold">
        Dashboard
      </AccessibleText>

      <Card
        onPress={() => router.push('/checkin')}
        accessibilityLabel="Daily check-in"
        accessibilityHint="Double tap to complete your daily check-in"
      >
        <AccessibleText variant="heading" weight="semibold">
          Daily Check-in
        </AccessibleText>
        <AccessibleText variant="caption">
          Complete your check-in for today
        </AccessibleText>
      </Card>

      <Card
        onPress={() => router.push('/journal')}
        accessibilityLabel="Journal entries"
        accessibilityHint="Double tap to view your journal"
      >
        <AccessibleText variant="heading" weight="semibold">
          Journal
        </AccessibleText>
        <AccessibleText variant="caption">
          View and create entries
        </AccessibleText>
      </Card>
    </ScrollView>
  );
}
```

### Settings Screens

```tsx
import { Switch } from 'react-native';
import { useAccessibilitySettings, getAccessibleToggleProps } from '../utils/accessibility';
import { AccessibleText } from '../components/AccessibleText';

function SettingsScreen() {
  const { theme } = useAccessibilitySettings();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <ScrollView>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: theme.spacing.md,
          backgroundColor: theme.colors.surface,
        }}
      >
        <View style={{ flex: 1 }}>
          <AccessibleText variant="body" weight="medium">
            Push Notifications
          </AccessibleText>
          <AccessibleText variant="caption">
            Receive daily reminders
          </AccessibleText>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          {...getAccessibleToggleProps(
            'Push notifications',
            notificationsEnabled,
            'Enables or disables daily reminder notifications'
          )}
        />
      </View>
    </ScrollView>
  );
}
```

## Testing Checklist

### Manual Testing

- [ ] Test with VoiceOver (iOS) enabled
- [ ] Test with TalkBack (Android) enabled
- [ ] Test all text size options (Default, Large, Extra Large)
- [ ] Test with high contrast mode enabled
- [ ] Test with reduce motion enabled
- [ ] Test with dyslexia font enabled
- [ ] Test with larger touch targets enabled
- [ ] Test on small screens (iPhone SE, smaller Android devices)
- [ ] Test on large screens (iPad, Android tablets)

### Automated Testing

```tsx
import { render, screen } from '@testing-library/react-native';

describe('MyComponent', () => {
  it('has correct accessibility labels', () => {
    render(<MyComponent />);
    expect(screen.getByLabelText('Submit form')).toBeTruthy();
  });

  it('announces state changes', () => {
    const { getByRole } = render(<MyComponent />);
    const button = getByRole('button');
    expect(button.props.accessibilityState).toBeDefined();
  });
});
```

## Common Mistakes to Avoid

### Don't

```tsx
// ❌ Hard-coded font sizes
<Text style={{ fontSize: 16 }}>Text</Text>

// ❌ No accessibility labels
<Pressable onPress={handlePress}>
  <Icon name="close" />
</Pressable>

// ❌ Hard-coded colors
<View style={{ backgroundColor: '#FFFFFF' }}>

// ❌ Ignoring reduce motion
<Animated.View style={{ transform: [{ scale: scaleAnim }] }} />

// ❌ Small touch targets
<Pressable style={{ width: 20, height: 20 }}>
```

### Do

```tsx
// ✅ Use theme font sizes
const { theme } = useAccessibilitySettings();
<AccessibleText variant="body">Text</AccessibleText>

// ✅ Add accessibility labels
<Pressable
  onPress={handlePress}
  accessibilityLabel="Close dialog"
  accessibilityRole="button"
>
  <Icon name="close" />
</Pressable>

// ✅ Use theme colors
const { theme } = useAccessibilitySettings();
<View style={{ backgroundColor: theme.colors.surface }}>

// ✅ Respect reduce motion
const { reduceMotion } = useAccessibilitySettings();
<Animated.View
  style={{
    transform: reduceMotion ? [] : [{ scale: scaleAnim }]
  }}
/>

// ✅ Minimum 44pt touch targets
<Pressable style={{ minHeight: theme.minimumTouchTarget }}>
```

## Resources

- [React Native Accessibility Docs](https://reactnative.dev/docs/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS Human Interface Guidelines - Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Android Material Design - Accessibility](https://m3.material.io/foundations/accessible-design)

## Support

For questions about accessibility implementation, refer to:
- `docs/ACCESSIBILITY.md` - Complete accessibility documentation
- `utils/accessibility.ts` - Utility functions and hooks
- `__tests__/accessibility.test.tsx` - Test examples
