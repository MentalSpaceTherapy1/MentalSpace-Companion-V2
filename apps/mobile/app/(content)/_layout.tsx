/**
 * Content Layout
 * Stack navigation for content browsing and reading
 */

import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';

export default function ContentLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Content Library',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="article"
        options={{
          title: 'Article',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="audio"
        options={{
          title: 'Audio Guide',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="video"
        options={{
          title: 'Video Guide',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
