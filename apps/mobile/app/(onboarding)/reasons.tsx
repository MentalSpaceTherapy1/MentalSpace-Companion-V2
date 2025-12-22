/**
 * Onboarding Reasons Screen
 * Select reasons for using the app
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { ONBOARDING_REASONS, MIN_ONBOARDING_REASONS, MAX_ONBOARDING_REASONS } from '@mentalspace/shared';
import type { OnboardingReason } from '@mentalspace/shared';

// Map feather-style icon names to Ionicons
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  zap: 'flash-outline',
  activity: 'pulse-outline',
  smile: 'happy-outline',
  moon: 'moon-outline',
  eye: 'eye-outline',
  heart: 'heart-outline',
  compass: 'compass-outline',
  shield: 'shield-checkmark-outline',
};

export default function ReasonsScreen() {
  const router = useRouter();
  const [selectedReasons, setSelectedReasons] = useState<OnboardingReason[]>([]);

  const toggleReason = (reason: OnboardingReason) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else if (selectedReasons.length < MAX_ONBOARDING_REASONS) {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const isValid = selectedReasons.length >= MIN_ONBOARDING_REASONS;

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '25%' }]} />
        </View>
        <Text style={styles.progressText}>1 of 4</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What brings you here?</Text>
          <Text style={styles.subtitle}>
            Select up to {MAX_ONBOARDING_REASONS} reasons. This helps us personalize your experience.
          </Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {ONBOARDING_REASONS.map((reason) => {
            const isSelected = selectedReasons.includes(reason.id);
            const ionIcon = ICON_MAP[reason.icon] || 'help-outline';

            return (
              <Pressable
                key={reason.id}
                style={[
                  styles.option,
                  isSelected && styles.optionSelected,
                ]}
                onPress={() => toggleReason(reason.id)}
              >
                <View style={[
                  styles.optionIcon,
                  isSelected && styles.optionIconSelected,
                ]}>
                  <Ionicons
                    name={ionIcon}
                    size={24}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                </View>
                <Text style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}>
                  {reason.label}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.selectionCount}>
          {selectedReasons.length} of {MAX_ONBOARDING_REASONS} selected
        </Text>
        <Button
          title="Continue"
          onPress={() => router.push({
            pathname: '/(onboarding)/focus',
            params: { reasons: selectedReasons.join(',') },
          })}
          disabled={!isValid}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIconSelected: {
    backgroundColor: colors.primary + '20',
  },
  optionLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  selectionCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  button: {},
});
