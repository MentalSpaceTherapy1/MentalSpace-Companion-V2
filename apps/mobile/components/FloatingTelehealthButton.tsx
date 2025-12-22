/**
 * Floating Telehealth Button
 * A persistent, floating button that appears throughout the app
 * to encourage users to access telehealth services
 */

import { useRef, useEffect } from 'react';
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';
import * as Haptics from '../utils/haptics';

export function FloatingTelehealthButton() {
  const router = useRouter();
  const segments = useSegments();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Determine if we should show the button based on current route
  const shouldShow = () => {
    // Don't show on auth or onboarding screens
    if (segments[0] === '(auth)' || segments[0] === '(onboarding)') {
      return false;
    }
    // Don't show on telehealth screens (already there)
    if (segments[0] === '(telehealth)') {
      return false;
    }
    // Don't show on the telehealth tab specifically
    if (segments[0] === '(tabs)' && segments[1] === 'telehealth') {
      return false;
    }
    return true;
  };

  // Gentle pulse animation to draw attention
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push('/(telehealth)');
    });
  };

  if (!shouldShow()) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable onPress={handlePress} style={styles.buttonWrapper}>
        <Animated.View
          style={[
            styles.button,
            {
              transform: [
                { scale: Animated.multiply(scaleAnim, pulseAnim) },
              ],
            },
          ]}
        >
          <Ionicons name="videocam" size={24} color={colors.textInverse} />
        </Animated.View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Talk</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    bottom: Platform.OS === 'ios' ? 100 : 80,
    zIndex: 999,
  },
  buttonWrapper: {
    alignItems: 'center',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    shadowColor: colors.secondary,
    shadowOpacity: 0.4,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: colors.textInverse,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    ...shadows.sm,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary,
  },
});
