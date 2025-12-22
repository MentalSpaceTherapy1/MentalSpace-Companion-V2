/**
 * Goals Screen
 * Step 2: Care goals and support style preferences
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import {
  CARE_GOAL_OPTIONS,
  SUPPORT_STYLE_OPTIONS,
  MIN_CARE_GOALS,
  MAX_CARE_GOALS,
} from '@mentalspace/shared';
import type { CareGoal, SupportStyle } from '@mentalspace/shared';

export default function GoalsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedGoals, setSelectedGoals] = useState<CareGoal[]>([]);
  const [supportStyle, setSupportStyle] = useState<SupportStyle | null>(null);

  const canContinue =
    selectedGoals.length >= MIN_CARE_GOALS && supportStyle !== null;

  const handleGoalToggle = (goalId: CareGoal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setSelectedGoals((prev) => {
      if (prev.includes(goalId)) {
        return prev.filter((g) => g !== goalId);
      }
      if (prev.length >= MAX_CARE_GOALS) {
        // Replace last one
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return prev;
      }
      return [...prev, goalId];
    });
  };

  const handleSupportStyleSelect = (style: SupportStyle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSupportStyle(style);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    router.push({
      pathname: '/(care-preferences)/support',
      params: {
        ...params,
        goals: selectedGoals.join(','),
        supportStyle,
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
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.stepText}>Step 2 of 3</Text>
          <Text style={styles.title}>What are your goals?</Text>
          <Text style={styles.subtitle}>
            Select up to {MAX_CARE_GOALS} areas you'd like to focus on.
            We'll personalize your daily actions and insights.
          </Text>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Goals</Text>
            <Text style={styles.selectionCount}>
              {selectedGoals.length}/{MAX_CARE_GOALS} selected
            </Text>
          </View>
          <View style={styles.goalsGrid}>
            {CARE_GOAL_OPTIONS.map((goal) => {
              const isSelected = selectedGoals.includes(goal.id);

              return (
                <Pressable
                  key={goal.id}
                  style={[
                    styles.goalChip,
                    isSelected && styles.goalChipSelected,
                  ]}
                  onPress={() => handleGoalToggle(goal.id)}
                >
                  <Ionicons
                    name={goal.icon as any}
                    size={18}
                    color={isSelected ? colors.textInverse : colors.primary}
                  />
                  <Text
                    style={[
                      styles.goalChipText,
                      isSelected && styles.goalChipTextSelected,
                    ]}
                  >
                    {goal.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Support Style Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How should we support you?</Text>
          <Text style={styles.sectionSubtitle}>
            Choose the communication style that feels best for you.
          </Text>
          <View style={styles.styleOptions}>
            {SUPPORT_STYLE_OPTIONS.map((option) => {
              const isSelected = supportStyle === option.id;

              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.styleOption,
                    isSelected && styles.styleOptionSelected,
                  ]}
                  onPress={() => handleSupportStyleSelect(option.id)}
                >
                  <View style={styles.styleOptionContent}>
                    <Text
                      style={[
                        styles.styleOptionTitle,
                        isSelected && styles.styleOptionTitleSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.styleOptionDescription}>
                      {option.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.styleCheckmark}>
                      <Ionicons name="checkmark" size={18} color={colors.primary} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  selectionCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  goalChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  goalChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  goalChipTextSelected: {
    color: colors.textInverse,
  },
  styleOptions: {
    gap: spacing.sm,
  },
  styleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  styleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  styleOptionContent: {
    flex: 1,
  },
  styleOptionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: 2,
  },
  styleOptionTitleSelected: {
    color: colors.primary,
  },
  styleOptionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  styleCheckmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
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
