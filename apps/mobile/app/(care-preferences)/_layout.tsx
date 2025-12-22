/**
 * Care Preferences Layout
 * Onboarding flow for personalized care settings
 */

import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';

export default function CarePreferencesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="mental-state" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="support" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
