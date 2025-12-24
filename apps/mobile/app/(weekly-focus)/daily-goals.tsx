/**
 * Daily Goals Screen
 * View and track daily micro-goals for the week
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { WEEKLY_FOCUS_OPTIONS, WEEKLY_MICRO_GOALS } from '@mentalspace/shared';
import type { WeeklyFocusArea } from '@mentalspace/shared';
import { trackWeeklyFocusSet } from '../../services/analytics';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DailyGoal {
  day: number;
  goal: string;
  completed: boolean;
}

export default function DailyGoalsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const focusArea = params.focusArea as WeeklyFocusArea;
  const intention = params.intention as string;

  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());

  useEffect(() => {
    // Generate daily goals from the focus area
    const goals = WEEKLY_MICRO_GOALS[focusArea] || [];
    setDailyGoals(
      goals.map((goal, index) => ({
        day: index,
        goal,
        completed: false,
      }))
    );
  }, [focusArea]);

  function getCurrentDay(): number {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, shift others
  }

  const focusConfig = WEEKLY_FOCUS_OPTIONS.find((f) => f.id === focusArea);

  const handleToggleGoal = (dayIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDailyGoals((prev) =>
      prev.map((g) =>
        g.day === dayIndex ? { ...g, completed: !g.completed } : g
      )
    );
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Track weekly focus set event
    trackWeeklyFocusSet({
      focus_area: focusArea,
      num_goals: dailyGoals.length,
    });

    Alert.alert(
      'Weekly Focus Set!',
      'Your weekly focus and daily goals have been saved. Check back each day for your micro-goal.',
      [
        {
          text: 'Great!',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  const handleClose = () => {
    router.back();
  };

  const completedCount = dailyGoals.filter((g) => g.completed).length;
  const completionRate = dailyGoals.length > 0
    ? Math.round((completedCount / dailyGoals.length) * 100)
    : 0;

  const todayGoal = dailyGoals[selectedDay];
  const isToday = selectedDay === getCurrentDay();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Daily Goals</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Focus Summary */}
        <Card
          style={[
            styles.focusSummary,
            { borderLeftColor: focusConfig?.color || colors.primary },
          ]}
        >
          <View style={styles.focusSummaryHeader}>
            <View
              style={[
                styles.focusIcon,
                { backgroundColor: (focusConfig?.color || colors.primary) + '20' },
              ]}
            >
              <Ionicons
                name={(focusConfig?.icon || 'star') as keyof typeof Ionicons.glyphMap}
                size={24}
                color={focusConfig?.color || colors.primary}
              />
            </View>
            <View style={styles.focusSummaryText}>
              <Text style={styles.focusLabel}>This Week's Focus</Text>
              <Text style={styles.focusTitle}>{focusConfig?.title}</Text>
            </View>
          </View>
          {intention && (
            <Text style={styles.intentionText}>"{intention}"</Text>
          )}
        </Card>

        {/* Progress Overview */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
            <Text style={styles.progressText}>{completionRate}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${completionRate}%`,
                  backgroundColor: focusConfig?.color || colors.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.progressSubtext}>
            {completedCount} of {dailyGoals.length} goals completed
          </Text>
        </View>

        {/* Day Selector */}
        <View style={styles.daySelectorContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daySelector}
          >
            {DAYS.map((day, index) => {
              const goal = dailyGoals[index];
              const isCurrent = index === getCurrentDay();
              const isSelected = index === selectedDay;

              return (
                <Pressable
                  key={day}
                  style={[
                    styles.dayButton,
                    isSelected && styles.dayButtonSelected,
                    isSelected && { borderColor: focusConfig?.color || colors.primary },
                  ]}
                  onPress={() => setSelectedDay(index)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && { color: focusConfig?.color || colors.primary },
                    ]}
                  >
                    {day}
                  </Text>
                  {goal?.completed && (
                    <View
                      style={[
                        styles.dayCheck,
                        { backgroundColor: focusConfig?.color || colors.primary },
                      ]}
                    >
                      <Ionicons name="checkmark" size={12} color={colors.textInverse} />
                    </View>
                  )}
                  {isCurrent && !isSelected && (
                    <View style={styles.todayDot} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Selected Day's Goal */}
        {todayGoal && (
          <Card style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalDay}>
                {FULL_DAYS[selectedDay]}'s Goal
              </Text>
              {isToday && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>Today</Text>
                </View>
              )}
            </View>

            <Text style={styles.goalText}>{todayGoal.goal}</Text>

            <Pressable
              style={[
                styles.completeButton,
                todayGoal.completed && styles.completeButtonDone,
                todayGoal.completed && { backgroundColor: (focusConfig?.color || colors.primary) + '20' },
              ]}
              onPress={() => handleToggleGoal(selectedDay)}
            >
              <Ionicons
                name={todayGoal.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={
                  todayGoal.completed
                    ? focusConfig?.color || colors.primary
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.completeButtonText,
                  todayGoal.completed && { color: focusConfig?.color || colors.primary },
                ]}
              >
                {todayGoal.completed ? 'Completed!' : 'Mark as Complete'}
              </Text>
            </Pressable>
          </Card>
        )}

        {/* All Goals List */}
        <View style={styles.allGoalsSection}>
          <Text style={styles.sectionTitle}>All Daily Goals</Text>
          {dailyGoals.map((goal, index) => (
            <Pressable
              key={index}
              style={styles.goalListItem}
              onPress={() => handleToggleGoal(index)}
            >
              <Ionicons
                name={goal.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={
                  goal.completed
                    ? focusConfig?.color || colors.success
                    : colors.textTertiary
                }
              />
              <View style={styles.goalListContent}>
                <Text style={styles.goalListDay}>{FULL_DAYS[index]}</Text>
                <Text
                  style={[
                    styles.goalListText,
                    goal.completed && styles.goalListTextCompleted,
                  ]}
                >
                  {goal.goal}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Save Weekly Focus"
          onPress={handleSave}
          style={styles.button}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  placeholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  focusSummary: {
    borderLeftWidth: 4,
    marginBottom: spacing.lg,
  },
  focusSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  focusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusSummaryText: {
    flex: 1,
  },
  focusLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  focusTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  intentionText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  progressSection: {
    marginBottom: spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  progressText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  daySelectorContainer: {
    marginBottom: spacing.lg,
  },
  daySelector: {
    gap: spacing.sm,
  },
  dayButton: {
    width: 48,
    height: 64,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  dayButtonSelected: {
    backgroundColor: colors.surfaceSecondary,
  },
  dayText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  dayCheck: {
    position: 'absolute',
    bottom: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayDot: {
    position: 'absolute',
    bottom: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  goalCard: {
    marginBottom: spacing.xl,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalDay: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  todayBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  todayBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  goalText: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
    lineHeight: 28,
    marginBottom: spacing.lg,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  completeButtonDone: {
    backgroundColor: colors.primary + '20',
  },
  completeButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  allGoalsSection: {
    marginTop: spacing.md,
  },
  goalListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  goalListContent: {
    flex: 1,
  },
  goalListDay: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  goalListText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: 22,
  },
  goalListTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  button: {},
});
