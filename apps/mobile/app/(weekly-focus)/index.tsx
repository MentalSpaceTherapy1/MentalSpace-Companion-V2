/**
 * Weekly Focus Selection Screen
 * Choose your focus area for the week
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { WEEKLY_FOCUS_OPTIONS, WEEKLY_MICRO_GOALS } from '@mentalspace/shared';
import type { WeeklyFocusArea } from '@mentalspace/shared';

export default function WeeklyFocusScreen() {
  const router = useRouter();
  const [selectedFocus, setSelectedFocus] = useState<WeeklyFocusArea | null>(null);
  const [intention, setIntention] = useState('');

  const handleSelectFocus = (focusId: WeeklyFocusArea) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFocus(focusId);

    // Auto-generate intention suggestion
    const focus = WEEKLY_FOCUS_OPTIONS.find((f) => f.id === focusId);
    if (focus) {
      setIntention(`This week I will focus on ${focus.title.toLowerCase()}`);
    }
  };

  const handleContinue = () => {
    if (!selectedFocus) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(weekly-focus)/daily-goals',
      params: {
        focusArea: selectedFocus,
        intention,
      },
    });
  };

  const handleClose = () => {
    router.back();
  };

  // Get current week date range
  const getWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (date: Date) =>
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return `${formatDate(monday)} - ${formatDate(sunday)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Weekly Focus</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Week Info */}
        <View style={styles.weekInfo}>
          <Ionicons name="calendar" size={20} color={colors.primary} />
          <Text style={styles.weekText}>{getWeekRange()}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Choose Your Focus</Text>
        <Text style={styles.subtitle}>
          Select one area to concentrate on this week. We'll create daily
          micro-goals to help you make progress.
        </Text>

        {/* Focus Options */}
        <View style={styles.focusGrid}>
          {WEEKLY_FOCUS_OPTIONS.map((focus) => {
            const isSelected = selectedFocus === focus.id;
            return (
              <Pressable
                key={focus.id}
                style={[
                  styles.focusCard,
                  isSelected && [
                    styles.focusCardSelected,
                    { borderColor: focus.color },
                  ],
                ]}
                onPress={() => handleSelectFocus(focus.id)}
              >
                <View
                  style={[
                    styles.focusIcon,
                    { backgroundColor: focus.color + '20' },
                    isSelected && { backgroundColor: focus.color + '30' },
                  ]}
                >
                  <Ionicons
                    name={focus.icon as keyof typeof Ionicons.glyphMap}
                    size={28}
                    color={focus.color}
                  />
                </View>
                <Text
                  style={[
                    styles.focusTitle,
                    isSelected && { color: focus.color },
                  ]}
                >
                  {focus.title}
                </Text>
                <Text style={styles.focusDescription}>{focus.description}</Text>
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: focus.color }]}>
                    <Ionicons name="checkmark" size={16} color={colors.textInverse} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Intention Input */}
        {selectedFocus && (
          <Card style={styles.intentionCard}>
            <Text style={styles.intentionLabel}>Your Weekly Intention</Text>
            <Text style={styles.intentionHint}>
              Write a personal intention for the week
            </Text>
            <TextInput
              style={styles.intentionInput}
              value={intention}
              onChangeText={setIntention}
              placeholder="This week I will..."
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={200}
            />
            <Text style={styles.charCount}>{intention.length}/200</Text>
          </Card>
        )}

        {/* Preview of Daily Goals */}
        {selectedFocus && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Daily Micro-Goals Preview</Text>
            <View style={styles.previewList}>
              {WEEKLY_MICRO_GOALS[selectedFocus]?.slice(0, 3).map((goal, index) => (
                <View key={index} style={styles.previewItem}>
                  <View style={styles.previewDot} />
                  <Text style={styles.previewText}>{goal}</Text>
                </View>
              ))}
              <Text style={styles.previewMore}>
                + {(WEEKLY_MICRO_GOALS[selectedFocus]?.length || 0) - 3} more goals
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Set Weekly Focus"
          onPress={handleContinue}
          disabled={!selectedFocus}
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
  weekInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  weekText: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
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
    marginBottom: spacing.xl,
  },
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  focusCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  focusCardSelected: {
    backgroundColor: colors.surface,
  },
  focusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  focusTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  focusDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  checkBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intentionCard: {
    marginBottom: spacing.xl,
  },
  intentionLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  intentionHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  intentionInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  previewSection: {
    marginBottom: spacing.lg,
  },
  previewTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  previewList: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  previewText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  previewMore: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
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
