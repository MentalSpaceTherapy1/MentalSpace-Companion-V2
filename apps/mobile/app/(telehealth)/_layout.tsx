/**
 * Telehealth Layout
 * Stack navigation for telehealth appointment request flow
 */

import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';

export default function TelehealthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
