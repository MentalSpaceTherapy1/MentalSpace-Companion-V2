/**
 * Support Screen
 * Step 3: Social support and coping strategies
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import {
  SOCIAL_SUPPORT_OPTIONS,
  COPING_STRATEGY_OPTIONS,
  EXERCISE_FREQUENCY_OPTIONS,
} from '@mentalspace/shared';
import type { SocialSupportLevel, ExerciseFrequency } from '@mentalspace/shared';

export default function SupportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [socialSupport, setSocialSupport] = useState<SocialSupportLevel | null>(null);
  const [exerciseFrequency, setExerciseFrequency] = useState<ExerciseFrequency | null>(null);
  const [selectedCoping, setSelectedCoping] = useState<string[]>([]);
  const [crisisContactName, setCrisisContactName] = useState('');
  const [crisisContactPhone, setCrisisContactPhone] = useState('');

  const canContinue = socialSupport !== null && exerciseFrequency !== null;

  const handleCopingToggle = (strategy: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCoping((prev) =>
      prev.includes(strategy)
        ? prev.filter((s) => s !== strategy)
        : [...prev, strategy]
    );
  };

  const handleContinue = async () => {
    if (!canContinue) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Navigate to completion with all preferences
    router.push({
      pathname: '/(care-preferences)/complete',
      params: {
        ...params,
        socialSupport,
        exerciseFrequency,
        copingStrategies: selectedCoping.join(','),
        crisisContactName,
        crisisContactPhone,
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.stepText}>Step 3 of 3</Text>
          <Text style={styles.title}>Your Support System</Text>
          <Text style={styles.subtitle}>
            Help us understand your current situation so we can provide better support.
          </Text>
        </View>

        {/* Social Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Support</Text>
          <Text style={styles.sectionSubtitle}>
            How would you describe your support network?
          </Text>
          <View style={styles.optionsList}>
            {SOCIAL_SUPPORT_OPTIONS.map((option) => {
              const isSelected = socialSupport === option.id;

              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSocialSupport(option.id);
                  }}
                >
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionTitle,
                        isSelected && styles.optionTitleSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {option.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Exercise Frequency Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical Activity</Text>
          <Text style={styles.sectionSubtitle}>
            How often do you exercise or move your body?
          </Text>
          <View style={styles.frequencyOptions}>
            {EXERCISE_FREQUENCY_OPTIONS.map((option) => {
              const isSelected = exerciseFrequency === option.id;

              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.frequencyChip,
                    isSelected && styles.frequencyChipSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExerciseFrequency(option.id);
                  }}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      isSelected && styles.frequencyTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Coping Strategies Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coping Strategies</Text>
          <Text style={styles.sectionSubtitle}>
            What helps you when you're feeling stressed? (Select all that apply)
          </Text>
          <View style={styles.copingGrid}>
            {COPING_STRATEGY_OPTIONS.map((strategy) => {
              const isSelected = selectedCoping.includes(strategy);

              return (
                <Pressable
                  key={strategy}
                  style={[
                    styles.copingChip,
                    isSelected && styles.copingChipSelected,
                  ]}
                  onPress={() => handleCopingToggle(strategy)}
                >
                  <Text
                    style={[
                      styles.copingText,
                      isSelected && styles.copingTextSelected,
                    ]}
                  >
                    {strategy}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Crisis Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Someone we can suggest you reach out to during difficult moments.
          </Text>
          <Card style={styles.contactCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name"
                placeholderTextColor={colors.textTertiary}
                value={crisisContactName}
                onChangeText={setCrisisContactName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textTertiary}
                value={crisisContactPhone}
                onChangeText={setCrisisContactPhone}
                keyboardType="phone-pad"
              />
            </View>
          </Card>
        </View>

        {/* Privacy Note */}
        <Card style={styles.privacyCard}>
          <Ionicons name="lock-closed" size={20} color={colors.primary} />
          <Text style={styles.privacyText}>
            Your information is private and secure. We'll never share it without your consent.
          </Text>
        </Card>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          title="Complete Setup"
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
  backButton: {
    marginBottom: spacing.md,
    marginLeft: -spacing.xs,
    padding: spacing.xs,
    alignSelf: 'flex-start',
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
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  optionsList: {
    gap: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: colors.primary,
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  frequencyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  frequencyChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  frequencyChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  frequencyTextSelected: {
    color: colors.textInverse,
  },
  copingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  copingChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  copingChipSelected: {
    backgroundColor: colors.secondary + '20',
    borderColor: colors.secondary,
  },
  copingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  copingTextSelected: {
    color: colors.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  contactCard: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary + '08',
    borderWidth: 0,
  },
  privacyText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
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
