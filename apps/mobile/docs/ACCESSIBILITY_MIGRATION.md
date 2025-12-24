# Accessibility Migration Guide

## Migrating Existing Components to Accessibility

This guide shows how to update existing components to support the new accessibility features.

## Step-by-Step Migration

### Step 1: Update Text Components

#### Before:
```tsx
import { Text, StyleSheet } from 'react-native';
import { typography, colors } from '../constants/theme';

function MyComponent() {
  return (
    <View>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.body}>This is some body text</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  body: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
});
```

#### After:
```tsx
import { View } from 'react-native';
import { AccessibleText } from '../components/AccessibleText';
import { useAccessibilitySettings } from '../utils/accessibility';

function MyComponent() {
  const { theme } = useAccessibilitySettings();

  return (
    <View>
      <AccessibleText variant="title" weight="bold">
        Welcome
      </AccessibleText>
      <AccessibleText
        variant="body"
        style={{ color: theme.colors.textSecondary }}
      >
        This is some body text
      </AccessibleText>
    </View>
  );
}
```

### Step 2: Update Interactive Elements

#### Before:
```tsx
import { Pressable, Text } from 'react-native';

function DeleteButton({ onDelete }) {
  return (
    <Pressable
      style={styles.button}
      onPress={onDelete}
    >
      <Icon name="trash" size={20} color={colors.error} />
      <Text style={styles.buttonText}>Delete</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    color: colors.text,
  },
});
```

#### After:
```tsx
import { Pressable } from 'react-native';
import { AccessibleText } from '../components/AccessibleText';
import { useAccessibilitySettings, getAccessibleButtonProps } from '../utils/accessibility';

function DeleteButton({ onDelete }) {
  const { theme } = useAccessibilitySettings();
  const a11yProps = getAccessibleButtonProps(
    'Delete item',
    'Double tap to permanently delete this item'
  );

  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.surface,
          minHeight: theme.minimumTouchTarget,
        },
      ]}
      onPress={onDelete}
      {...a11yProps}
    >
      <Icon name="trash" size={20} color={theme.colors.error} />
      <AccessibleText style={{ color: theme.colors.text }}>
        Delete
      </AccessibleText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
});
```

### Step 3: Update Forms

#### Before:
```tsx
import { TextInput, Switch, View } from 'react-native';

function SettingsForm() {
  const [email, setEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
    <View>
      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholder="Enter email"
      />

      <View style={styles.row}>
        <Text>Enable Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
      </View>
    </View>
  );
}
```

#### After:
```tsx
import { Switch, View } from 'react-native';
import { AccessibleTextInput } from '../components/ui/AccessibleTextInput';
import { AccessibleText } from '../components/AccessibleText';
import { getAccessibleToggleProps } from '../utils/accessibility';

function SettingsForm() {
  const [email, setEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { theme } = useAccessibilitySettings();

  return (
    <View>
      <AccessibleTextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
        hint="We'll never share your email"
        keyboardType="email-address"
      />

      <View style={[styles.row, { minHeight: theme.minimumTouchTarget }]}>
        <AccessibleText variant="body">
          Enable Notifications
        </AccessibleText>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          {...getAccessibleToggleProps(
            'Enable notifications',
            notificationsEnabled,
            'Turns push notifications on or off'
          )}
        />
      </View>
    </View>
  );
}
```

### Step 4: Update Animations

#### Before:
```tsx
import { Animated, Easing } from 'react-native';

function AnimatedComponent() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Text>Animated content</Text>
    </Animated.View>
  );
}
```

#### After:
```tsx
import { Animated, Easing } from 'react-native';
import { useAccessibilitySettings } from '../utils/accessibility';
import { AccessibleText } from '../components/AccessibleText';

function AnimatedComponent() {
  const { reduceMotion } = useAccessibilitySettings();
  const fadeAnim = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      fadeAnim.setValue(1);
      return;
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [reduceMotion]);

  return (
    <Animated.View style={{ opacity: reduceMotion ? 1 : fadeAnim }}>
      <AccessibleText>Animated content</AccessibleText>
    </Animated.View>
  );
}
```

### Step 5: Update Colors

#### Before:
```tsx
import { View } from 'react-native';
import { colors } from '../constants/theme';

function Card({ children }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
      }}
    >
      {children}
    </View>
  );
}
```

#### After:
```tsx
import { View } from 'react-native';
import { useAccessibilitySettings } from '../utils/accessibility';

function Card({ children }) {
  const { theme } = useAccessibilitySettings();

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
      }}
    >
      {children}
    </View>
  );
}
```

### Step 6: Update Lists

#### Before:
```tsx
import { FlatList, Pressable, Text } from 'react-native';

function ItemList({ items, onItemPress }) {
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onItemPress(item)}
          style={styles.item}
        >
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
        </Pressable>
      )}
      keyExtractor={(item) => item.id}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  itemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
```

#### After:
```tsx
import { FlatList, Pressable } from 'react-native';
import { AccessibleText } from '../components/AccessibleText';
import { useAccessibilitySettings } from '../utils/accessibility';

function ItemList({ items, onItemPress }) {
  const { theme } = useAccessibilitySettings();

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onItemPress(item)}
          style={[
            styles.item,
            {
              borderBottomColor: theme.colors.border,
              minHeight: theme.minimumTouchTarget,
            },
          ]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={item.title}
          accessibilityHint={`${item.description}. Double tap to view details.`}
        >
          <AccessibleText variant="heading" weight="semibold">
            {item.title}
          </AccessibleText>
          <AccessibleText
            variant="body"
            style={{ color: theme.colors.textSecondary }}
          >
            {item.description}
          </AccessibleText>
        </Pressable>
      )}
      keyExtractor={(item) => item.id}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
});
```

## Component-Specific Patterns

### Modal Dialogs

#### Before:
```tsx
import { Modal, View, Text, Pressable } from 'react-native';

function ConfirmDialog({ visible, onConfirm, onCancel }) {
  return (
    <Modal visible={visible} transparent>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Confirm Action</Text>
          <Text style={styles.message}>Are you sure?</Text>
          <View style={styles.buttons}>
            <Pressable onPress={onCancel}>
              <Text>Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm}>
              <Text>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
```

#### After:
```tsx
import { Modal, View, Pressable } from 'react-native';
import { AccessibleText } from '../components/AccessibleText';
import { Button } from '../components/ui/Button';
import { useAccessibilitySettings } from '../utils/accessibility';

function ConfirmDialog({ visible, onConfirm, onCancel }) {
  const { theme } = useAccessibilitySettings();

  return (
    <Modal
      visible={visible}
      transparent
      accessible={true}
      accessibilityViewIsModal={true}
      accessibilityLabel="Confirmation dialog"
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.dialog,
            { backgroundColor: theme.colors.surface },
          ]}
          accessible={true}
          accessibilityRole="alert"
        >
          <AccessibleText variant="heading" weight="bold">
            Confirm Action
          </AccessibleText>
          <AccessibleText variant="body">
            Are you sure you want to proceed?
          </AccessibleText>
          <View style={styles.buttons}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onCancel}
              accessibilityLabel="Cancel action"
            />
            <Button
              title="Confirm"
              onPress={onConfirm}
              accessibilityLabel="Confirm action"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
```

### Tabs

#### Before:
```tsx
import { Pressable, Text, View } from 'react-native';

function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          style={[
            styles.tab,
            activeTab === tab.id && styles.activeTab,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
```

#### After:
```tsx
import { Pressable, View } from 'react-native';
import { AccessibleText } from '../components/AccessibleText';
import { useAccessibilitySettings } from '../utils/accessibility';

function TabBar({ tabs, activeTab, onTabChange }) {
  const { theme } = useAccessibilitySettings();

  return (
    <View
      style={styles.tabBar}
      accessible={false}
      accessibilityRole="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={[
              styles.tab,
              {
                backgroundColor: isActive
                  ? theme.colors.primary
                  : 'transparent',
                minHeight: theme.minimumTouchTarget,
              },
            ]}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            accessibilityHint={
              isActive
                ? 'Currently selected tab'
                : `Double tap to switch to ${tab.label} tab`
            }
          >
            <AccessibleText
              variant="body"
              weight={isActive ? 'semibold' : 'normal'}
              style={{
                color: isActive
                  ? theme.colors.textInverse
                  : theme.colors.text,
              }}
            >
              {tab.label}
            </AccessibleText>
          </Pressable>
        );
      })}
    </View>
  );
}
```

## Migration Checklist

For each component you update:

- [ ] Replace `Text` with `AccessibleText`
- [ ] Replace hard-coded colors with `theme.colors`
- [ ] Replace hard-coded font sizes with `theme.fontSize`
- [ ] Add accessibility labels to interactive elements
- [ ] Add accessibility hints for complex actions
- [ ] Set appropriate accessibility roles
- [ ] Add accessibility states (selected, checked, disabled)
- [ ] Ensure minimum touch target size
- [ ] Check and respect `reduceMotion` setting
- [ ] Test with VoiceOver/TalkBack
- [ ] Test with different text sizes
- [ ] Test with high contrast mode

## Testing Your Changes

After migrating a component:

1. **Visual Test**: Run the app and verify it looks correct
2. **Text Size Test**: Change text size in Settings > Accessibility
3. **High Contrast Test**: Enable high contrast and verify colors
4. **Reduce Motion Test**: Enable reduce motion and verify no animations
5. **Screen Reader Test**: Enable VoiceOver/TalkBack and navigate through component
6. **Touch Target Test**: Verify all interactive elements are easily tappable

## Common Issues and Solutions

### Issue: Text not scaling
**Solution**: Make sure you're using `AccessibleText` component, not `Text`

### Issue: Colors not changing with high contrast
**Solution**: Use `theme.colors` instead of importing from `constants/theme`

### Issue: Animations still playing with reduce motion
**Solution**: Check `reduceMotion` before starting animations

### Issue: Touch targets too small
**Solution**: Set `minHeight: theme.minimumTouchTarget` on interactive elements

### Issue: Screen reader not announcing changes
**Solution**: Add proper `accessibilityLabel` and `accessibilityState` props

## Best Practices

1. **Always use the hook**: Import `useAccessibilitySettings()` at the component level
2. **Use semantic components**: Use `AccessibleText`, `Button`, `Card` instead of raw components
3. **Test early and often**: Don't wait until migration is complete to test
4. **Prioritize high-traffic screens**: Migrate most-used screens first
5. **Document changes**: Update component documentation with accessibility info

## Need Help?

- Check `docs/ACCESSIBILITY.md` for full documentation
- Check `docs/ACCESSIBILITY_IMPLEMENTATION.md` for implementation patterns
- Look at updated components in `components/ui/` for examples
- Run tests with `npm test -- accessibility.test.tsx`
