/**
 * Weekly Focus Layout
 * Stack navigator for weekly focus flow
 */

import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';

export default function WeeklyFocusLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="daily-goals" />
      <Stack.Screen name="reflection" />
    </Stack>
  );
}
