/**
 * Floating Therapist Button
 * Persistent button that appears on all screens to easily connect with a therapist
 * This is the PRIMARY call-to-action for the app
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';
import { useAuthStore } from '../stores/authStore';

interface FloatingTherapistButtonProps {
  // Optional: Hide on specific screens
  hideOnPaths?: string[];
}

export function FloatingTherapistButton({ hideOnPaths = [] }: FloatingTherapistButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  // Only show when user is authenticated
  if (!user) return null;

  // Hide on auth screens, onboarding, and specified paths
  const hiddenPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/(auth)',
    '/(onboarding)',
    '/(telehealth)',  // Already on telehealth page
    '/(sos)',  // Don't distract from SOS screen
    '/checkin',  // Prevent overlap with Continue button during check-in
    ...hideOnPaths,
  ];

  const shouldHide = hiddenPaths.some(path => pathname.includes(path));
  if (shouldHide) return null;

  const handlePress = () => {
    // Animate press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    router.push('/(telehealth)');
  };

  const handleLongPress = () => {
    setIsExpanded(!isExpanded);
  };

  // Position above tab bar with safe area
  const bottomOffset = Platform.select({
    ios: 90 + insets.bottom,
    android: 85,
    web: 90,
    default: 90,
  });

  return (
    <View style={[styles.container, { bottom: bottomOffset }]} pointerEvents="box-none">
      {/* Expanded Options */}
      {isExpanded && (
        <View style={styles.expandedMenu}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setIsExpanded(false);
              router.push('/(telehealth)');
            }}
          >
            <Ionicons name="calendar" size={20} color={colors.secondary} />
            <Text style={styles.menuItemText}>Schedule Session</Text>
          </Pressable>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setIsExpanded(false);
              router.push('/(telehealth)/history');
            }}
          >
            <Ionicons name="time" size={20} color={colors.secondary} />
            <Text style={styles.menuItemText}>View History</Text>
          </Pressable>
          <View style={styles.menuDivider} />
          <Text style={styles.menuHint}>Tap button to connect</Text>
        </View>
      )}

      {/* Main Floating Button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={500}
        >
          <View style={styles.buttonContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="videocam" size={24} color={colors.textInverse} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.buttonTitle}>Talk to Therapist</Text>
              <Text style={styles.buttonSubtitle}>Available 24/7</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textInverse} />
          </View>
        </Pressable>
      </Animated.View>

      {/* Pulse animation indicator */}
      <View style={styles.pulseRing} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: spacing.md,
    left: spacing.md,
    alignItems: 'center',
    zIndex: 1000,
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.lg,
    shadowColor: colors.secondary,
    shadowOpacity: 0.4,
    elevation: 8,
    minWidth: 280,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textInverse,
  },
  buttonSubtitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  pulseRing: {
    position: 'absolute',
    width: 280, // Match button minWidth instead of full container width
    height: '100%',
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.secondary,
    opacity: 0.3,
    pointerEvents: 'none', // CRITICAL: Allow clicks to pass through to elements below
    // Animation would be added here for pulse effect
  },
  expandedMenu: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.md,
    width: '100%',
    maxWidth: 280,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  menuItemText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  menuHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
