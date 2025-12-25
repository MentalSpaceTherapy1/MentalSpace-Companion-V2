/**
 * App Entry Point
 * Handles auth-based routing
 */

import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../constants/theme';

export default function Index() {
  const { user, profile, isLoading, isInitialized } = useAuthStore();

  // Show loading while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If user is logged in, redirect based on onboarding status
  if (user) {
    if (profile?.onboardingCompleted) {
      return <Redirect href="/(tabs)" />;
    } else {
      return <Redirect href="/(onboarding)/welcome" />;
    }
  }

  // Not logged in, go to login
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
