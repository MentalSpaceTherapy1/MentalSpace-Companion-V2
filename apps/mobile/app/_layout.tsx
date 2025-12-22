/**
 * Root Layout
 * Main layout for the entire app with auth state handling
 */

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../constants/theme';
import { FloatingTelehealthButton } from '../components/FloatingTelehealthButton';

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
 * Auth state handler - redirects based on auth state
 */
function AuthHandler({ children }: { children: React.ReactNode }) {
  const { user, profile, isInitialized, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!user) {
      // Not logged in - redirect to auth
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (!profile?.onboardingCompleted) {
      // Logged in but not onboarded
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)/welcome');
      }
    } else {
      // Logged in and onboarded - go to main app
      if (inAuthGroup || inOnboardingGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [user, profile, isInitialized, segments]);

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

/**
 * Root Layout Component
 */
export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize auth listener
    const unsubscribe = initialize();

    // Hide splash screen after initialization
    SplashScreen.hideAsync();

    return unsubscribe;
  }, [initialize]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <AuthHandler>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <FloatingTelehealthButton />
        </AuthHandler>
        <StatusBar style="auto" />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
