/**
 * SOS Layout
 * Crisis support navigation structure
 */

import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';

export default function SOSLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
        presentation: 'fullScreenModal',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="protocol" />
      <Stack.Screen name="resources" />
    </Stack>
  );
}
