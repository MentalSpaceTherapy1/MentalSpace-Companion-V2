/**
 * Insights Layout
 * Stack navigator for insights screens
 */

import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';

export default function InsightsLayout() {
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
          title: 'Insights',
          headerLargeTitle: true,
        }}
      />
    </Stack>
  );
}
