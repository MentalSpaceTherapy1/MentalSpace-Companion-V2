/**
 * Mood Board Layout
 * Stack navigator for mood board screens
 */

import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';

export default function MoodBoardLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Mood Board',
          headerLargeTitle: true,
        }}
      />
    </Stack>
  );
}
