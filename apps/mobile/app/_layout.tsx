/**
 * Root Layout
 * Simplified layout for stable app startup
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '../constants/theme';
import { useAuthStore } from '../stores/authStore';
import { FloatingTherapistButton } from '../components/FloatingTherapistButton';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

/**
 * Root Layout Component
 */
export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize auth listener
    const unsubscribe = initialize();

    // Hide splash screen after a short delay
    const timeout = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [initialize]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <View style={styles.container}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(care-preferences)" options={{ headerShown: false }} />
            <Stack.Screen name="(content)" options={{ headerShown: false }} />
            <Stack.Screen name="(insights)" options={{ headerShown: false }} />
            <Stack.Screen name="(journal)" options={{ headerShown: false }} />
            <Stack.Screen name="(mood-board)" options={{ headerShown: false }} />
            <Stack.Screen name="(safety-plan)" options={{ headerShown: false }} />
            <Stack.Screen name="(settings)" options={{ headerShown: false }} />
            <Stack.Screen name="(sleep)" options={{ headerShown: false }} />
            <Stack.Screen name="(sos)" options={{ headerShown: false }} />
            <Stack.Screen name="(telehealth)" options={{ headerShown: false }} />
            <Stack.Screen name="(weekly-focus)" options={{ headerShown: false }} />
          </Stack>
          {/* Persistent Talk to Therapist button - appears on all authenticated screens */}
          <FloatingTherapistButton />
          <StatusBar style="auto" />
        </View>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
