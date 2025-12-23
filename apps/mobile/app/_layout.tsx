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

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Configure notifications at module load
configureNotifications();

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
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

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

      // Request notification permissions
      const granted = await requestNotificationPermissions();
      if (!granted) return;

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
    };

    setupUserServices();

    // Listen for notifications received while app is foregrounded (native only)
    if (Platform.OS !== 'web') {
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
    }

    return () => {
      if (notificationListener.current && Platform.OS !== 'web') {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current && Platform.OS !== 'web') {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);

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
