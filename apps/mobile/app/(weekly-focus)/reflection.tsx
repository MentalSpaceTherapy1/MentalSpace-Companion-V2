/**
 * Weekly Reflection Screen
 * End of week reflection and next week planning
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { WEEKLY_FOCUS_OPTIONS } from '@mentalspace/shared';
import type { WeeklyFocusArea } from '@mentalspace/shared';

export default function ReflectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const focusArea = params.focusArea as WeeklyFocusArea;
  const completedGoals = parseInt(params.completedGoals as string || '0');
  const totalGoals = parseInt(params.totalGoals as string || '7');

  const [overallRating, setOverallRating] = useState(0);
  const [whatWorked, setWhatWorked] = useState('');
  const [whatToImprove, setWhatToImprove] = useState('');
  const [nextWeekIntention, setNextWeekIntention] = useState('');

  const focusConfig = WEEKLY_FOCUS_OPTIONS.find((f) => f.id === focusArea);
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const handleRating = (rating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOverallRating(rating);
  };

  const handleSubmit = () => {
    if (overallRating === 0) {
      Alert.alert('Please Rate Your Week', 'How would you rate your overall week?');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Reflection Saved!',
      'Great job reflecting on your week. Ready to set your next weekly focus?',
      [
        {
          text: 'Later',
          style: 'cancel',
          onPress: () => router.replace('/(tabs)'),
        },
        {
          text: 'Set Next Focus',
          onPress: () => router.replace('/(weekly-focus)'),
        },
      ]
    );
  };

  const handleClose = () => {
    router.back();
  };

  const getRatingEmoji = (rating: number): string => {
    const emojis = ['', '😔', '😕', '😐', '🙂', '😊'];
    return emojis[rating] || '';
  };

  const getRatingLabel = (rating: number): string => {
    const labels = ['', 'Tough Week', 'Challenging', 'Okay', 'Good', 'Great!'];
    return labels[rating] || '';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Weekly Reflection</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Week Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View
              style={[
                styles.focusIcon,
                { backgroundColor: (focusConfig?.color || colors.primary) + '20' },
              ]}
            >
              <Ionicons
                name={(focusConfig?.icon || 'star') as keyof typeof Ionicons.glyphMap}
                size={28}
                color={focusConfig?.color || colors.primary}
              />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>This Week's Focus</Text>
              <Text style={styles.summaryTitle}>{focusConfig?.title || 'Weekly Focus'}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedGoals}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalGoals}</Text>
              <Text style={styles.statLabel}>Total Goals</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: focusConfig?.color || colors.primary }]}>
                {completionRate}%
              </Text>
              <Text style={styles.statLabel}>Rate</Text>
            </View>
          </View>
        </Card>

        {/* Overall Rating */}
        <Text style={styles.sectionTitle}>How was your week overall?</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <Pressable
              key={rating}
              style={[
                styles.ratingButton,
                overallRating === rating && styles.ratingButtonSelected,
                overallRating === rating && { borderColor: focusConfig?.color || colors.primary },
              ]}
              onPress={() => handleRating(rating)}
            >
              <Text style={styles.ratingEmoji}>{getRatingEmoji(rating)}</Text>
              <Text
                style={[
                  styles.ratingLabel,
                  overallRating === rating && { color: focusConfig?.color || colors.primary },
                ]}
              >
                {getRatingLabel(rating)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* What Worked */}
        <Card style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.inputTitle}>What worked well?</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={whatWorked}
            onChangeText={setWhatWorked}
            placeholder="What strategies or habits helped you this week?"
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={500}
          />
        </Card>

        {/* What to Improve */}
        <Card style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Ionicons name="arrow-up-circle" size={20} color={colors.connection} />
            <Text style={styles.inputTitle}>What could be better?</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={whatToImprove}
            onChangeText={setWhatToImprove}
            placeholder="What challenges did you face? What would you do differently?"
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={500}
          />
        </Card>

        {/* Next Week Intention */}
        <Card style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Ionicons name="rocket" size={20} color={colors.primary} />
            <Text style={styles.inputTitle}>Next week's intention</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={nextWeekIntention}
            onChangeText={setNextWeekIntention}
            placeholder="What do you want to focus on next week?"
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={300}
          />
        </Card>

        {/* Encouragement */}
        <View style={styles.encouragementCard}>
          <Ionicons name="heart" size={32} color={colors.error} />
          <Text style={styles.encouragementText}>
            Remember: Progress isn't always linear. Every week teaches us something
            valuable, regardless of the outcome.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Save Reflection"
          onPress={handleSubmit}
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
  summaryCard: {
    marginBottom: spacing.xl,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  focusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  summaryTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  ratingButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    marginHorizontal: 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ratingButtonSelected: {
    backgroundColor: colors.surfaceSecondary,
  },
  ratingEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  inputCard: {
    marginBottom: spacing.md,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  inputTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  textInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  encouragementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.error + '10',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  encouragementText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: 24,
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
