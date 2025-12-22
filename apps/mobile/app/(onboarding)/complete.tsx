/**
 * Onboarding Complete Screen
 * Final step - save preferences and redirect to app
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import type { UserPreferences, OnboardingReason } from '@mentalspace/shared';

export default function CompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    reasons: string;
    focusAreas: string;
    dailyReminder: string;
    reminderTime: string;
    weeklyDigest: string;
  }>();

  const { completeOnboarding, isLoading } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const scaleAnim = useState(new Animated.Value(0))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleComplete = async () => {
    setSaving(true);
    setError(null);

    try {
      // Build preferences object
      const preferences: UserPreferences = {
        reasons: (params.reasons?.split(',') || []) as OnboardingReason[],
        focusAreas: params.focusAreas?.split(',').filter(Boolean) || [],
        notifications: {
          dailyReminder: params.dailyReminder === 'true',
          reminderTime: params.reminderTime || '09:00',
          weeklyDigest: params.weeklyDigest === 'true',
        },
        theme: 'system',
      };

      await completeOnboarding(preferences);

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'Failed to save preferences');
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Celebration Animation */}
        <Animated.View
          style={[
            styles.celebrationContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={64} color={colors.success} />
          </View>
          <View style={styles.confetti1}>
            <Ionicons name="star" size={20} color={colors.accent} />
          </View>
          <View style={styles.confetti2}>
            <Ionicons name="heart" size={18} color={colors.primary} />
          </View>
          <View style={styles.confetti3}>
            <Ionicons name="sparkles" size={22} color={colors.secondary} />
          </View>
        </Animated.View>

        {/* Text Content */}
        <Animated.View style={[styles.textContent, { opacity: fadeAnim }]}>
          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>
            Your personalized wellness journey is ready to begin.
            Let's start with your first check-in!
          </Text>

          {/* Quick Summary */}
          <View style={styles.summary}>
            <SummaryItem
              icon="flag-outline"
              label="Goals"
              value={`${(params.reasons?.split(',') || []).length} selected`}
            />
            <SummaryItem
              icon="apps-outline"
              label="Focus Areas"
              value={params.focusAreas ? `${params.focusAreas.split(',').filter(Boolean).length} selected` : 'Skipped'}
            />
            <SummaryItem
              icon="notifications-outline"
              label="Reminders"
              value={params.dailyReminder === 'true' ? `Daily at ${formatTime(params.reminderTime || '09:00')}` : 'Off'}
            />
          </View>
        </Animated.View>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Start My Journey"
          onPress={handleComplete}
          loading={saving || isLoading}
          style={styles.button}
        />
      </View>
    </View>
  );
}

function SummaryItem({
  icon,
  label,
  value
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryItem}>
      <View style={styles.summaryIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.summaryText}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
    </View>
  );
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  celebrationContainer: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti1: {
    position: 'absolute',
    top: -10,
    right: -20,
  },
  confetti2: {
    position: 'absolute',
    top: 20,
    left: -25,
  },
  confetti3: {
    position: 'absolute',
    bottom: 10,
    right: -30,
  },
  textContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  summary: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.error + '15',
    borderRadius: borderRadius.md,
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.error,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  button: {},
});
