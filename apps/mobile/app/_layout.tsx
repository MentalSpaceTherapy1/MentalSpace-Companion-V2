/**
 * Root Layout
 * Main layout for the entire app with auth state handling
 */

import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../constants/theme';
import { FloatingTelehealthButton } from '../components/FloatingTelehealthButton';
import {
  configureNotifications,
  requestNotificationPermissions,
  registerPushToken,
  scheduleDailyCheckinReminder,
  scheduleWeeklySummary,
  getNotificationPreferences,
  clearBadge,
  NOTIFICATION_CATEGORIES,
} from '../services/notifications';
import {
  initializeOfflineStorage,
  initializeNetworkMonitoring,
  syncPendingOperations,
} from '../services/offlineStorage';
import { trackScreen, setUserId, setUserProperties } from '../services/analytics';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Configure notifications at module load (wrapped for Expo Go compatibility)
try {
  configureNotifications();
} catch (e) {
  console.warn('Notifications not available in this environment');
}

// Initialize network monitoring for offline-first support
initializeNetworkMonitoring();

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

  // Track screen views when segments change
  useEffect(() => {
    if (!isInitialized) return;

    // Build screen name from segments
    const screenName = segments.length > 0
      ? segments.join('/')
      : 'root';

    // Track screen view
    trackScreen(screenName);
  }, [segments, isInitialized]);

  // Set analytics user properties when user changes
  useEffect(() => {
    if (!isInitialized) return;

    if (user) {
      // Set user ID
      setUserId(user.uid);

      // Set user properties
      if (profile) {
        setUserProperties({
          onboarding_completed: profile.onboardingCompleted,
          primary_concern: profile.carePreferences?.primaryGoals?.[0] || '',
          has_therapist: profile.carePreferences?.therapyStatus === 'currently_in_therapy',
        });
      }
    } else {
      // Clear user on logout
      setUserId(null);
    }
  }, [user, profile, isInitialized]);

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
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Initialize auth listener
    const unsubscribe = initialize();

    // Hide splash screen after initialization
    SplashScreen.hideAsync();

    return unsubscribe;
  }, [initialize]);

  // Setup notifications and offline storage when user logs in
  useEffect(() => {
    if (!user) return;

    const setupUserServices = async () => {
      // Initialize offline storage
      await initializeOfflineStorage(user.uid);

      // Sync any pending operations
      await syncPendingOperations();

      // Setup notifications (wrapped for Expo Go compatibility)
      try {
        // Request notification permissions
        const granted = await requestNotificationPermissions();
        if (granted) {
          // Register push token with server
          await registerPushToken(user.uid);

          // Schedule default notifications based on preferences
          const prefs = await getNotificationPreferences();
          if (prefs.dailyCheckin) {
            await scheduleDailyCheckinReminder(prefs.dailyCheckinTime);
          }
          if (prefs.weeklySummary) {
            await scheduleWeeklySummary();
          }

          // Clear badge on app open
          await clearBadge();
        }
      } catch (e) {
        console.warn('Notifications not available:', e);
      }
    };

    setupUserServices();

    // Listen for notifications received while app is foregrounded (native only)
    if (Platform.OS !== 'web') {
      try {
        notificationListener.current = Notifications.addNotificationReceivedListener(
          (notification) => {
            console.log('Notification received:', notification);
          }
        );

        // Listen for notification interactions
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            const data = response.notification.request.content.data;
            const actionId = response.actionIdentifier;

            // Handle notification taps and actions
            switch (data?.type) {
              case NOTIFICATION_CATEGORIES.DAILY_CHECKIN:
                if (actionId === 'start_checkin' || actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) {
                  router.push('/(tabs)');
                }
                break;
              case NOTIFICATION_CATEGORIES.WEEKLY_SUMMARY:
                router.push('/(tabs)/weekly');
                break;
              case NOTIFICATION_CATEGORIES.ACTION_REMINDER:
                router.push('/(tabs)');
                break;
              case NOTIFICATION_CATEGORIES.SESSION_REMINDER:
                // Could navigate to session prep or telehealth
                router.push('/(tabs)');
                break;
              default:
                router.push('/(tabs)');
            }
          }
        );
      } catch (e) {
        console.warn('Notification listeners not available:', e);
      }
    }

    return () => {
      try {
        if (notificationListener.current && Platform.OS !== 'web') {
          notificationListener.current.remove();
        }
        if (responseListener.current && Platform.OS !== 'web') {
          responseListener.current.remove();
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [user]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
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
      </SafeAreaProvider>
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
