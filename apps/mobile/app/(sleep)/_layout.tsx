/**
 * Sleep Support Suite Layout
 * Stack navigator for sleep tracking screens
 */

import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';

export default function SleepLayout() {
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
          title: 'Sleep Tracker',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="log"
        options={{
          title: 'Log Sleep',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="tips"
        options={{
          title: 'Sleep Tips',
        }}
      />
      <Stack.Screen
        name="goals"
        options={{
          title: 'Sleep Goals',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Sleep History',
        }}
      />
    </Stack>
  );
}
