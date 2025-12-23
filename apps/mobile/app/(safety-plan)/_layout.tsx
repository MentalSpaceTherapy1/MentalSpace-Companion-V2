/**
 * Safety Plan Layout
 * Stack navigator for safety plan screens
 */

import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';

export default function SafetyPlanLayout() {
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
          title: 'Safety Plan',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="warning-signs"
        options={{
          title: 'Warning Signs',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="coping-strategies"
        options={{
          title: 'Coping Strategies',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="support-contacts"
        options={{
          title: 'Support Contacts',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="professional-contacts"
        options={{
          title: 'Professional Contacts',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="safe-places"
        options={{
          title: 'Safe Places',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="reasons-to-live"
        options={{
          title: 'Reasons to Live',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
