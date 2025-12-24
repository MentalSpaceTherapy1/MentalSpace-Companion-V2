/**
 * Settings Stack Layout
 */

import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="accessibility"
        options={{
          title: 'Accessibility',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="calendar-integration"
        options={{
          title: 'Calendar Integration',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="health-integration"
        options={{
          title: 'Health Integration',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
