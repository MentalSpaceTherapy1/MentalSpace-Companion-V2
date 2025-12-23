/**
 * Journal Layout
 * Stack navigator for journal screens
 */

import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';

export default function JournalLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Journal',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="entry"
        options={{
          title: 'New Entry',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Entry',
        }}
      />
    </Stack>
  );
}
