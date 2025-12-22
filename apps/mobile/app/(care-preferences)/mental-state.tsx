/**
 * Mental State Screen
 * Step 1: Current mental state and therapy status
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import {
  MENTAL_STATE_OPTIONS,
  THERAPY_STATUS_OPTIONS,
} from '@mentalspace/shared';
import type { MentalStateLevel, TherapyStatus } from '@mentalspace/shared';

export default function MentalStateScreen() {
  const router = useRouter();
  const [mentalState, setMentalState] = useState<MentalStateLevel | null>(null);
  const [therapyStatus, setTherapyStatus] = useState<TherapyStatus | null>(null);

  const canContinue = mentalState !== null && therapyStatus !== null;

  const handleMentalStateSelect = (state: MentalStateLevel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMentalState(state);
  };

  const handleTherapyStatusSelect = (status: TherapyStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTherapyStatus(status);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    // Store selections and navigate
    router.push({
      pathname: '/(care-preferences)/goals',
      params: { mentalState, therapyStatus },
    });
  };

  const getStateColor = (stateId: MentalStateLevel) => {
    const colorMap: Record<MentalStateLevel, string> = {
      thriving: colors.success,
      managing: colors.primary,
      struggling: colors.warning,
      crisis: colors.error,
    };
    return colorMap[stateId];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.stepText}>Step 1 of 3</Text>
          <Text style={styles.title}>How are you doing?</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your experience and provide the right level of support.
          </Text>
        </View>

        {/* Mental State Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Mental State</Text>
          <View style={styles.optionsGrid}>
            {MENTAL_STATE_OPTIONS.map((option) => {
              const isSelected = mentalState === option.id;
              const stateColor = getStateColor(option.id);

              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.stateCard,
                    isSelected && { borderColor: stateColor, borderWidth: 2 },
                  ]}
                  onPress={() => handleMentalStateSelect(option.id)}
                >
                  <View
                    style={[
                      styles.stateIconContainer,
                      { backgroundColor: stateColor + '20' },
                    ]}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={28}
                      color={stateColor}
                    />
                  </View>
                  <Text style={styles.stateLabel}>{option.label}</Text>
                  <Text style={styles.stateDescription}>{option.description}</Text>
                  {isSelected && (
                    <View style={[styles.checkmark, { backgroundColor: stateColor }]}>
                      <Ionicons name="checkmark" size={14} color={colors.white} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Therapy Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Therapy Status</Text>
          <Text style={styles.sectionSubtitle}>
            Are you currently working with a therapist?
          </Text>
          <View style={styles.therapyOptions}>
            {THERAPY_STATUS_OPTIONS.map((option) => {
              const isSelected = therapyStatus === option.id;

              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.therapyOption,
                    isSelected && styles.therapyOptionSelected,
                  ]}
                  onPress={() => handleTherapyStatusSelect(option.id)}
                >
                  <Text
                    style={[
                      styles.therapyOptionText,
                      isSelected && styles.therapyOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Crisis Note */}
        {mentalState === 'crisis' && (
          <Card style={styles.crisisCard}>
            <View style={styles.crisisContent}>
              <Ionicons name="heart" size={24} color={colors.error} />
              <View style={styles.crisisText}>
                <Text style={styles.crisisTitle}>We're here for you</Text>
                <Text style={styles.crisisDescription}>
                  If you're in immediate crisis, please call 988 or text HOME to 741741.
                  We'll also provide extra support throughout the app.
                </Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!canContinue}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  stepText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  stateCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  stateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stateLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stateDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  therapyOptions: {
    gap: spacing.sm,
  },
  therapyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  therapyOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  therapyOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  therapyOptionTextSelected: {
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  crisisCard: {
    backgroundColor: colors.error + '10',
    borderColor: colors.error + '30',
    borderWidth: 1,
  },
  crisisContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  crisisText: {
    flex: 1,
  },
  crisisTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  crisisDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueButton: {},
});
