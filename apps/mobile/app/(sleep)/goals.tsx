/**
 * Sleep Goals Screen
 * Configure target sleep schedule and goals
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useSleepStore, formatDuration } from '../../stores/sleepStore';
import { triggerHaptic } from '../../utils/haptics';

const RECOMMENDED_SLEEP = {
  adults: { min: 420, max: 540, label: '7-9 hours' }, // 7-9 hours
  teens: { min: 480, max: 600, label: '8-10 hours' }, // 8-10 hours
};

export default function SleepGoalsScreen() {
  const router = useRouter();
  const { goal, updateGoal } = useSleepStore();

  const [enabled, setEnabled] = useState(goal.enabled);
  const [targetBedtime, setTargetBedtime] = useState(goal.targetBedtime);
  const [targetWakeTime, setTargetWakeTime] = useState(goal.targetWakeTime);

  // Calculate target duration
  const calculateDuration = (bed: string, wake: string): number => {
    const [bedHour, bedMin] = bed.split(':').map(Number);
    const [wakeHour, wakeMin] = wake.split(':').map(Number);

    if (isNaN(bedHour) || isNaN(bedMin) || isNaN(wakeHour) || isNaN(wakeMin)) {
      return 0;
    }

    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;

    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60;
    }

    return wakeMinutes - bedMinutes;
  };

  const targetDuration = calculateDuration(targetBedtime, targetWakeTime);

  const isInRecommendedRange =
    targetDuration >= RECOMMENDED_SLEEP.adults.min &&
    targetDuration <= RECOMMENDED_SLEEP.adults.max;

  const handleSave = async () => {
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(targetBedtime) || !timeRegex.test(targetWakeTime)) {
      Alert.alert('Invalid Time', 'Please enter times in HH:MM format (e.g., 22:30)');
      return;
    }

    try {
      await updateGoal({
        enabled,
        targetBedtime,
        targetWakeTime,
        targetDuration,
      });
      triggerHaptic('success');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save goals. Please try again.');
    }
  };

  const quickPresets = [
    { label: 'Early Bird', bedtime: '21:30', wakeTime: '05:30' },
    { label: 'Standard', bedtime: '22:30', wakeTime: '06:30' },
    { label: 'Night Owl', bedtime: '00:00', wakeTime: '08:00' },
  ];

  const applyPreset = (bedtime: string, wakeTime: string) => {
    setTargetBedtime(bedtime);
    setTargetWakeTime(wakeTime);
    triggerHaptic('light');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Enable Toggle */}
      <Card style={styles.toggleCard}>
        <View style={styles.toggleContent}>
          <View style={styles.toggleIcon}>
            <Ionicons name="flag" size={24} color={colors.primary} />
          </View>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Sleep Goal Tracking</Text>
            <Text style={styles.toggleSubtitle}>
              Track progress towards your target sleep schedule
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={(value) => {
              setEnabled(value);
              triggerHaptic('light');
            }}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={enabled ? colors.primary : colors.textSecondary}
          />
        </View>
      </Card>

      {/* Quick Presets */}
      <Text style={styles.sectionTitle}>Quick Presets</Text>
      <View style={styles.presetsRow}>
        {quickPresets.map((preset) => (
          <Pressable
            key={preset.label}
            style={[
              styles.presetButton,
              targetBedtime === preset.bedtime &&
                targetWakeTime === preset.wakeTime &&
                styles.presetButtonActive,
            ]}
            onPress={() => applyPreset(preset.bedtime, preset.wakeTime)}
          >
            <Text
              style={[
                styles.presetLabel,
                targetBedtime === preset.bedtime &&
                  targetWakeTime === preset.wakeTime &&
                  styles.presetLabelActive,
              ]}
            >
              {preset.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Time Inputs */}
      <Text style={styles.sectionTitle}>Target Schedule</Text>
      <View style={styles.timeRow}>
        <View style={styles.timeInput}>
          <View style={styles.timeLabelRow}>
            <Ionicons name="bed" size={18} color={colors.primary} />
            <Text style={styles.timeLabel}>Bedtime</Text>
          </View>
          <TextInput
            style={styles.timeTextInput}
            value={targetBedtime}
            onChangeText={setTargetBedtime}
            placeholder="22:30"
            placeholderTextColor={colors.textSecondary}
            maxLength={5}
          />
        </View>

        <Ionicons name="arrow-forward" size={24} color={colors.textTertiary} style={styles.arrow} />

        <View style={styles.timeInput}>
          <View style={styles.timeLabelRow}>
            <Ionicons name="sunny" size={18} color={colors.connection} />
            <Text style={styles.timeLabel}>Wake Time</Text>
          </View>
          <TextInput
            style={styles.timeTextInput}
            value={targetWakeTime}
            onChangeText={setTargetWakeTime}
            placeholder="06:30"
            placeholderTextColor={colors.textSecondary}
            maxLength={5}
          />
        </View>
      </View>

      {/* Duration Display */}
      <Card
        style={[
          styles.durationCard,
          !isInRecommendedRange && styles.durationCardWarning,
        ]}
      >
        <View style={styles.durationHeader}>
          <Ionicons
            name="time"
            size={24}
            color={isInRecommendedRange ? colors.success : colors.warning}
          />
          <Text style={styles.durationValue}>{formatDuration(targetDuration)}</Text>
          <Text style={styles.durationLabel}>target sleep</Text>
        </View>

        {!isInRecommendedRange && (
          <View style={styles.durationWarning}>
            <Ionicons name="information-circle" size={16} color={colors.warning} />
            <Text style={styles.durationWarningText}>
              {targetDuration < RECOMMENDED_SLEEP.adults.min
                ? 'This is less than the recommended 7-9 hours for adults.'
                : 'This is more than the recommended 7-9 hours for adults.'}
            </Text>
          </View>
        )}

        {isInRecommendedRange && (
          <View style={styles.durationSuccess}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.durationSuccessText}>
              Within the recommended range for adults
            </Text>
          </View>
        )}
      </Card>

      {/* Recommendations */}
      <Card style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle" size={20} color={colors.coping} />
          <Text style={styles.infoTitle}>Sleep Recommendations</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Adults (18-64):</Text>
          <Text style={styles.infoValue}>{RECOMMENDED_SLEEP.adults.label}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Teens (14-17):</Text>
          <Text style={styles.infoValue}>{RECOMMENDED_SLEEP.teens.label}</Text>
        </View>
        <Text style={styles.infoNote}>
          Individual needs may vary. Focus on how you feel after different amounts
          of sleep.
        </Text>
      </Card>

      {/* Tips */}
      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Tips for Success</Text>
        <View style={styles.tipItem}>
          <Ionicons name="alarm" size={18} color={colors.primary} />
          <Text style={styles.tipText}>
            Set a bedtime alarm 30 minutes before your target bedtime
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="repeat" size={18} color={colors.primary} />
          <Text style={styles.tipText}>
            Keep the same schedule on weekends to maintain your rhythm
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="trending-up" size={18} color={colors.primary} />
          <Text style={styles.tipText}>
            Adjust gradually - shift by 15-30 minutes every few days
          </Text>
        </View>
      </Card>

      {/* Save Button */}
      <Button
        title="Save Sleep Goals"
        onPress={handleSave}
        style={styles.saveButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  toggleCard: {
    marginBottom: spacing.lg,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  toggleSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  presetButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  presetLabelActive: {
    color: colors.textInverse,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  timeInput: {
    flex: 1,
  },
  timeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    justifyContent: 'center',
  },
  timeLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  timeTextInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  arrow: {
    marginTop: 36,
  },
  durationCard: {
    backgroundColor: colors.success + '10',
    marginBottom: spacing.lg,
  },
  durationCardWarning: {
    backgroundColor: colors.warning + '10',
  },
  durationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  durationValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  durationLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  durationWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  durationWarningText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.warning,
  },
  durationSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  durationSuccessText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
  },
  infoCard: {
    backgroundColor: colors.coping + '10',
    marginBottom: spacing.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  infoNote: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  tipsCard: {
    marginBottom: spacing.lg,
  },
  tipsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tipText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});
