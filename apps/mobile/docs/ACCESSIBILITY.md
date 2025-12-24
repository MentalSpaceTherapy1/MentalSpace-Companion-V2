# Accessibility Implementation Guide

## Overview

MentalSpace Companion implements comprehensive accessibility features following WCAG 2.1 AA standards and platform-specific guidelines (iOS Human Interface Guidelines and Android Material Design).

## Features Implemented

### 1. Text Scaling
- **Default**: Base font sizes
- **Large**: 115% scale
- **Extra Large**: 130% scale
- All text components automatically scale
- Preview available in settings

### 2. High Contrast Mode
- Enhanced color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Darker text colors
- Stronger borders
- Improved visual hierarchy

### 3. Reduce Motion
- Removes animations and transitions
- Disables transform effects
- Improves experience for users with motion sensitivity
- Respects system reduce motion settings

### 4. Dyslexia-Friendly Font
- OpenDyslexic font option
- Improves readability for users with dyslexia
- Applies globally across all text components

### 5. Larger Touch Targets
- Minimum 44pt touch targets (iOS HIG standard)
- Option to increase to 52pt for users who need it
- Applied to all interactive elements

### 6. Screen Reader Support
- Descriptive accessibility labels
- Contextual hints for complex interactions
- Proper semantic roles (button, link, switch, etc.)
- State announcements
- Heading hierarchy

## File Structure

```
stores/
  accessibilityStore.ts          # Zustand store with AsyncStorage persistence

constants/
  accessibleTheme.ts             # Accessible color, spacing, and font helpers

utils/
  accessibility.ts               # Hooks and utility functions

components/
  AccessibleText.tsx             # Text component respecting settings
  ui/
    Button.tsx                   # Updated with accessibility support
    Card.tsx                     # Updated with accessibility support
    AccessibleSlider.tsx         # Accessible slider component
    AccessibleTextInput.tsx      # Accessible text input component

app/(settings)/
  accessibility.tsx              # Accessibility settings screen
```

## Usage

### Using the Accessibility Hook

```tsx
import { useAccessibilitySettings } from '../utils/accessibility';

function MyComponent() {
  const { theme, reduceMotion, highContrast, dyslexiaFont } = useAccessibilitySettings();

  return (
    <View style={{ backgroundColor: theme.colors.surface }}>
      <Text style={{ fontSize: theme.fontSize.base }}>
        Accessible text
      </Text>
    </View>
  );
}
```

### Using AccessibleText Component

```tsx
import { AccessibleText } from '../components/AccessibleText';

function MyComponent() {
  return (
    <>
      <AccessibleText variant="title" weight="bold">
        Main Heading
      </AccessibleText>
      <AccessibleText variant="body">
        Body text that respects text size and dyslexia font settings
      </AccessibleText>
      <AccessibleText variant="caption">
        Small caption text
      </AccessibleText>
    </>
  );
}
```

### Adding Accessibility to Buttons

```tsx
import { Button } from '../components/ui/Button';

function MyComponent() {
  return (
    <Button
      title="Submit"
      onPress={handleSubmit}
      accessibilityLabel="Submit form"
      accessibilityHint="Double tap to submit your responses"
    />
  );
}
```

### Adding Accessibility to Interactive Elements

```tsx
import { getAccessibleButtonProps } from '../utils/accessibility';

function CustomButton() {
  const a11yProps = getAccessibleButtonProps(
    'Delete item',
    'Double tap to delete this item permanently'
  );

  return (
    <Pressable
      onPress={handleDelete}
      {...a11yProps}
      accessibilityState={{ disabled: false }}
    >
      <Text>Delete</Text>
    </Pressable>
  );
}
```

### Using Accessible Colors

```tsx
import { useAccessibilitySettings } from '../utils/accessibility';

function MyComponent() {
  const { theme } = useAccessibilitySettings();

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }}
    >
      <Text style={{ color: theme.colors.text }}>
        High contrast aware text
      </Text>
    </View>
  );
}
```

## Testing Guidelines

### Manual Testing

1. **Text Size**
   - Navigate to Settings > Accessibility
   - Test each text size option (Default, Large, Extra Large)
   - Verify all text scales appropriately
   - Check for text overflow or truncation issues

2. **High Contrast**
   - Enable High Contrast Mode
   - Verify all text is readable against backgrounds
   - Check button states are clearly visible
   - Ensure borders are prominent

3. **Reduce Motion**
   - Enable Reduce Motion
   - Navigate through the app
   - Verify no animations play
   - Check transitions are instant

4. **Dyslexia Font**
   - Enable Dyslexia-Friendly Font
   - Verify OpenDyslexic font loads
   - Check all text uses the font
   - Ensure font is readable

5. **Larger Touch Targets**
   - Enable Larger Touch Targets
   - Verify buttons are easier to tap
   - Check spacing increases appropriately
   - Test on smaller devices

### Screen Reader Testing

#### iOS (VoiceOver)

1. Enable VoiceOver: Settings > Accessibility > VoiceOver
2. Navigate through the app using swipe gestures
3. Verify all elements are announced correctly
4. Check labels are descriptive
5. Ensure hints provide context
6. Test button activation with double-tap

#### Android (TalkBack)

1. Enable TalkBack: Settings > Accessibility > TalkBack
2. Navigate using swipe gestures
3. Verify announcements are clear
4. Check state changes are announced
5. Test interactive elements
6. Verify focus order is logical

### Automated Testing

```tsx
import { render, screen } from '@testing-library/react-native';
import { Button } from '../components/ui/Button';

describe('Button Accessibility', () => {
  it('has correct accessibility label', () => {
    render(
      <Button
        title="Submit"
        onPress={() => {}}
        accessibilityLabel="Submit form"
      />
    );

    expect(screen.getByLabelText('Submit form')).toBeTruthy();
  });

  it('has correct accessibility role', () => {
    const { getByRole } = render(
      <Button title="Submit" onPress={() => {}} />
    );

    expect(getByRole('button')).toBeTruthy();
  });

  it('announces disabled state', () => {
    const { getByRole } = render(
      <Button title="Submit" onPress={() => {}} disabled />
    );

    const button = getByRole('button');
    expect(button).toHaveAccessibilityState({ disabled: true });
  });
});
```

## Best Practices

### 1. Always Provide Labels

```tsx
// Good
<Pressable
  accessibilityLabel="Close dialog"
  accessibilityHint="Double tap to close this dialog"
>
  <Icon name="close" />
</Pressable>

// Bad
<Pressable>
  <Icon name="close" />
</Pressable>
```

### 2. Use Semantic Roles

```tsx
// Good
<Pressable accessibilityRole="button">
  <Text>Submit</Text>
</Pressable>

// Bad
<Pressable>
  <Text>Submit</Text>
</Pressable>
```

### 3. Announce State Changes

```tsx
// Good
<Switch
  value={enabled}
  accessibilityState={{ checked: enabled }}
  accessibilityLabel="Enable notifications"
/>

// Bad
<Switch value={enabled} />
```

### 4. Provide Context with Hints

```tsx
// Good
<Button
  title="Delete"
  accessibilityLabel="Delete journal entry"
  accessibilityHint="This action cannot be undone"
/>

// Bad
<Button title="Delete" />
```

### 5. Respect User Settings

```tsx
// Good
const { reduceMotion } = useAccessibilitySettings();
const animationDuration = reduceMotion ? 0 : 300;

// Bad
const animationDuration = 300; // Always animates
```

## WCAG 2.1 AA Compliance

### Perceivable
- ✅ Text alternatives for non-text content
- ✅ Adaptable layouts
- ✅ Distinguishable colors with sufficient contrast
- ✅ Resizable text up to 200%

### Operable
- ✅ Keyboard accessible (via screen reader)
- ✅ Sufficient time for interactions
- ✅ No seizure-inducing animations
- ✅ Navigable with clear headings

### Understandable
- ✅ Readable text
- ✅ Predictable navigation
- ✅ Input assistance with labels and hints
- ✅ Error identification and suggestions

### Robust
- ✅ Compatible with assistive technologies
- ✅ Valid accessibility properties
- ✅ Proper semantic structure

## Future Enhancements

1. **Voice Control**: Integration with system voice commands
2. **Haptic Feedback**: Enhanced tactile feedback for interactions
3. **Custom Color Themes**: User-defined color schemes
4. **Font Choices**: Multiple font options beyond OpenDyslexic
5. **Reading Mode**: Simplified layouts for focused reading
6. **Audio Descriptions**: Narration for complex interactions
7. **Gesture Customization**: Configurable gesture controls

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS Accessibility](https://developer.apple.com/accessibility/)
- [Android Accessibility](https://developer.android.com/guide/topics/ui/accessibility)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [Expo Accessibility](https://docs.expo.dev/guides/accessibility/)

## Support

For accessibility-related questions or issues, please contact the development team or file an issue in the repository.
