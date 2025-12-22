/**
 * Onboarding Layout
 * Layout for onboarding flow screens
 */

import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        gestureEnabled: false, // Prevent back swipe during onboarding
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="reasons" />
      <Stack.Screen name="focus" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
