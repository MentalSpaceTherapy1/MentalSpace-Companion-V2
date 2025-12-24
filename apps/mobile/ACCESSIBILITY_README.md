# Accessibility Features - Quick Reference

## Overview

MentalSpace Companion includes comprehensive accessibility features following WCAG 2.1 AA standards and platform-specific guidelines.

## Features

### User Settings (Available in Settings > Accessibility)

1. **Text Size**
   - Default (100%)
   - Large (115%)
   - Extra Large (130%)

2. **High Contrast Mode**
   - Enhanced color contrast (4.5:1 minimum)
   - Darker borders and text
   - Better visual hierarchy

3. **Reduce Motion**
   - Disables animations
   - Instant transitions
   - Better for motion sensitivity

4. **Dyslexia-Friendly Font**
   - OpenDyslexic font option
   - Improved readability

5. **Larger Touch Targets**
   - Default: 44pt minimum
   - Enabled: 52pt minimum

6. **Screen Reader Support**
   - VoiceOver (iOS)
   - TalkBack (Android)
   - Descriptive labels and hints

## Quick Implementation

### 1. Use AccessibleText

```tsx
import { AccessibleText } from '../components/AccessibleText';

<AccessibleText variant="title" weight="bold">
  Heading Text
</AccessibleText>
<AccessibleText variant="body">
  Body text that respects text size and dyslexia settings
</AccessibleText>
```

### 2. Use Accessibility Hook

```tsx
import { useAccessibilitySettings } from '../utils/accessibility';

const { theme, reduceMotion, highContrast } = useAccessibilitySettings();

// Use theme colors
<View style={{ backgroundColor: theme.colors.surface }}>

// Use theme font sizes
<Text style={{ fontSize: theme.fontSize.base }}>

// Respect reduce motion
const duration = reduceMotion ? 0 : 300;
```

### 3. Add Accessibility Props to Interactive Elements

```tsx
import { getAccessibleButtonProps } from '../utils/accessibility';

const a11yProps = getAccessibleButtonProps(
  'Submit form',
  'Double tap to submit your responses'
);

<Pressable onPress={handleSubmit} {...a11yProps}>
  <AccessibleText>Submit</AccessibleText>
</Pressable>
```

### 4. Use Updated UI Components

```tsx
import { Button, Card } from '../components/ui';

<Button
  title="Save"
  onPress={handleSave}
  accessibilityLabel="Save changes"
  accessibilityHint="Double tap to save your changes"
/>

<Card
  onPress={handlePress}
  accessibilityLabel="View journal entry"
  accessibilityHint="Double tap to open"
>
  <AccessibleText>Card content</AccessibleText>
</Card>
```

## File Structure

```
stores/
  ✅ accessibilityStore.ts          - Settings store

constants/
  ✅ accessibleTheme.ts             - Theme helpers

utils/
  ✅ accessibility.ts               - Hooks and utilities

components/
  ✅ AccessibleText.tsx             - Text component
  ui/
    ✅ Button.tsx                   - Updated button
    ✅ Card.tsx                     - Updated card
    ✅ AccessibleSlider.tsx         - Slider component
    ✅ AccessibleTextInput.tsx      - Input component

app/(settings)/
  ✅ accessibility.tsx              - Settings screen

docs/
  ✅ ACCESSIBILITY.md               - Full documentation
  ✅ ACCESSIBILITY_IMPLEMENTATION.md - Implementation guide

__tests__/
  ✅ accessibility.test.tsx         - Test suite
```

## Testing

### Manual Testing

1. Navigate to Settings > Accessibility
2. Test each setting:
   - Text Size: Verify all text scales
   - High Contrast: Check color contrast
   - Reduce Motion: Verify no animations
   - Dyslexia Font: Verify font changes
   - Larger Touch Targets: Verify increased sizes

3. Test with screen readers:
   - iOS: Settings > Accessibility > VoiceOver
   - Android: Settings > Accessibility > TalkBack

### Automated Testing

```bash
npm test -- accessibility.test.tsx
```

## Common Patterns

### Button
```tsx
<Button
  title="Submit"
  onPress={handleSubmit}
  accessibilityLabel="Submit form"
  accessibilityHint="Double tap to submit"
/>
```

### Toggle
```tsx
import { getAccessibleToggleProps } from '../utils/accessibility';

<Switch
  value={enabled}
  onValueChange={setEnabled}
  {...getAccessibleToggleProps('Enable notifications', enabled)}
/>
```

### Text Input
```tsx
<AccessibleTextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  hint="Enter your email address"
  error={emailError}
/>
```

### Card
```tsx
<Card
  onPress={handlePress}
  accessibilityLabel="Journal entry"
  accessibilityHint="Double tap to view"
>
  <AccessibleText variant="heading">Title</AccessibleText>
  <AccessibleText variant="body">Content</AccessibleText>
</Card>
```

## Integration Checklist

When creating new components:

- [ ] Use `AccessibleText` instead of `Text`
- [ ] Use `theme.colors` instead of hard-coded colors
- [ ] Use `theme.fontSize` instead of hard-coded sizes
- [ ] Add `accessibilityLabel` to interactive elements
- [ ] Add `accessibilityHint` for complex actions
- [ ] Set appropriate `accessibilityRole`
- [ ] Ensure minimum touch target size
- [ ] Check `reduceMotion` before animating
- [ ] Test with screen reader
- [ ] Test with all text sizes

## Support

- Full documentation: `docs/ACCESSIBILITY.md`
- Implementation guide: `docs/ACCESSIBILITY_IMPLEMENTATION.md`
- Test examples: `__tests__/accessibility.test.tsx`

## WCAG 2.1 AA Compliance

- ✅ Perceivable: Text alternatives, adaptable layouts, distinguishable colors
- ✅ Operable: Keyboard accessible, sufficient time, no seizures
- ✅ Understandable: Readable text, predictable navigation
- ✅ Robust: Compatible with assistive technologies

## Notes

- OpenDyslexic font needs to be loaded via `expo-font` (not included in base implementation)
- Some features require testing on physical devices with actual screen readers
- High contrast colors are calibrated for WCAG AA standards (4.5:1 ratio)

## Next Steps

1. Load OpenDyslexic font in `app/_layout.tsx`
2. Add accessibility settings link to main settings screen
3. Test on physical devices with screen readers
4. Gather user feedback
5. Iterate on improvements
