/**
 * Log Sleep Screen
 * Modal for logging sleep data
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import {
  useSleepStore,
  SLEEP_FACTORS,
  SLEEP_QUALITY_LABELS,
  SleepFactor,
  formatDuration,
} from '../../stores/sleepStore';
import { triggerHaptic } from '../../utils/haptics';

export default function LogSleepScreen() {
  const router = useRouter();
  const { addSleepRecord, getRecordForDate } = useSleepStore();

  // Default to last night
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const defaultDate = yesterday.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDate);
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [quality, setQuality] = useState(7);
  const [factors, setFactors] = useState<SleepFactor[]>([]);
  const [notes, setNotes] = useState('');

  // Calculate duration
  const calculateDuration = (): number => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);

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

  const duration = calculateDuration();

  const toggleFactor = (factor: SleepFactor) => {
    setFactors((prev) =>
      prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor]
    );
    triggerHaptic('light');
  };

  const handleSave = async () => {
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(bedtime) || !timeRegex.test(wakeTime)) {
      Alert.alert('Invalid Time', 'Please enter times in HH:MM format (e.g., 22:30)');
      return;
    }

    // Check if record already exists
    const existing = getRecordForDate(date);
    if (existing) {
      Alert.alert(
        'Record Exists',
        'You already have a sleep record for this date. Do you want to replace it?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace',
            onPress: async () => {
              await saveRecord();
            },
          },
        ]
      );
      return;
    }

    await saveRecord();
  };

  const saveRecord = async () => {
    try {
      await addSleepRecord({
        date,
        bedtime,
        wakeTime,
        quality,
        factors,
        notes: notes.trim() || undefined,
      });
      triggerHaptic('success');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save sleep record. Please try again.');
    }
  };

  const formatDateDisplay = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Quick date presets
  const datePresets = [
    { label: 'Last Night', days: -1 },
    { label: '2 Days Ago', days: -2 },
    { label: '3 Days Ago', days: -3 },
  ];

  const applyDatePreset = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAgo);
    setDate(d.toISOString().split('T')[0]);
    triggerHaptic('light');
  };

  // Time presets
  const bedtimePresets = ['21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00'];
  const wakeTimePresets = ['05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30'];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Date Selector */}
      <Text style={styles.sectionTitle}>When did you sleep?</Text>
      <View style={styles.datePresets}>
        {datePresets.map((preset) => {
          const presetDate = new Date();
          presetDate.setDate(presetDate.getDate() + preset.days);
          const presetDateStr = presetDate.toISOString().split('T')[0];
          const isSelected = date === presetDateStr;
          return (
            <Pressable
              key={preset.label}
              style={[styles.presetChip, isSelected && styles.presetChipSelected]}
              onPress={() => applyDatePreset(preset.days)}
            >
              <Text style={[styles.presetText, isSelected && styles.presetTextSelected]}>
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.selectedDate}>{formatDateDisplay(date)}</Text>

      {/* Time Inputs */}
      <Text style={styles.sectionTitle}>Sleep Schedule</Text>
      <View style={styles.timeRow}>
        <View style={styles.timeInput}>
          <View style={styles.timeLabelRow}>
            <Ionicons name="bed" size={18} color={colors.primary} />
            <Text style={styles.timeLabel}>Bedtime</Text>
          </View>
          <TextInput
            style={styles.timeTextInput}
            value={bedtime}
            onChangeText={setBedtime}
            placeholder="22:30"
            placeholderTextColor={colors.textSecondary}
            maxLength={5}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timePresets}>
            {bedtimePresets.map((time) => (
              <Pressable
                key={time}
                style={[styles.timePresetChip, bedtime === time && styles.timePresetChipSelected]}
                onPress={() => {
                  setBedtime(time);
                  triggerHaptic('light');
                }}
              >
                <Text style={[styles.timePresetText, bedtime === time && styles.timePresetTextSelected]}>
                  {time}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <Ionicons name="arrow-forward" size={24} color={colors.textTertiary} style={styles.arrow} />

        <View style={styles.timeInput}>
          <View style={styles.timeLabelRow}>
            <Ionicons name="sunny" size={18} color={colors.connection} />
            <Text style={styles.timeLabel}>Wake Time</Text>
          </View>
          <TextInput
            style={styles.timeTextInput}
            value={wakeTime}
            onChangeText={setWakeTime}
            placeholder="06:30"
            placeholderTextColor={colors.textSecondary}
            maxLength={5}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timePresets}>
            {wakeTimePresets.map((time) => (
              <Pressable
                key={time}
                style={[styles.timePresetChip, wakeTime === time && styles.timePresetChipSelected]}
                onPress={() => {
                  setWakeTime(time);
                  triggerHaptic('light');
                }}
              >
                <Text style={[styles.timePresetText, wakeTime === time && styles.timePresetTextSelected]}>
                  {time}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Duration Display */}
      <Card style={styles.durationCard}>
        <Ionicons name="time" size={24} color={colors.lifestyle} />
        <View style={styles.durationContent}>
          <Text style={styles.durationValue}>{formatDuration(duration)}</Text>
          <Text style={styles.durationLabel}>Total Sleep</Text>
        </View>
      </Card>

      {/* Quality Slider */}
      <Text style={styles.sectionTitle}>How did you sleep?</Text>
      <Card style={styles.qualityCard}>
        <View style={styles.qualityHeader}>
          <Text style={styles.qualityEmoji}>
            {SLEEP_QUALITY_LABELS[quality]?.emoji}
          </Text>
          <Text style={styles.qualityLabel}>
            {SLEEP_QUALITY_LABELS[quality]?.label}
          </Text>
          <Text style={styles.qualityValue}>{quality}/10</Text>
        </View>
        <View style={styles.qualitySlider}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <Pressable
              key={value}
              style={[
                styles.qualityDot,
                value <= quality && styles.qualityDotActive,
                value === quality && styles.qualityDotCurrent,
              ]}
              onPress={() => {
                setQuality(value);
                triggerHaptic('light');
              }}
            />
          ))}
        </View>
      </Card>

      {/* Factors */}
      <Text style={styles.sectionTitle}>Factors that may have affected your sleep</Text>
      <View style={styles.factorsGrid}>
        {SLEEP_FACTORS.map((factor) => {
          const isSelected = factors.includes(factor.key);
          return (
            <Pressable
              key={factor.key}
              style={[
                styles.factorChip,
                isSelected && styles.factorChipSelected,
                isSelected && !factor.positive && styles.factorChipNegative,
              ]}
              onPress={() => toggleFactor(factor.key)}
            >
              <Ionicons
                name={factor.icon as any}
                size={18}
                color={
                  isSelected
                    ? colors.textInverse
                    : factor.positive
                    ? colors.success
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.factorText,
                  isSelected && styles.factorTextSelected,
                ]}
              >
                {factor.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Notes */}
      <Text style={styles.sectionTitle}>Notes (optional)</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="How did you feel when you woke up? Any dreams?"
        placeholderTextColor={colors.textSecondary}
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={500}
        textAlignVertical="top"
      />

      {/* Save Button */}
      <Button
        title="Save Sleep Log"
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
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  datePresets: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  presetChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  presetTextSelected: {
    color: colors.textInverse,
  },
  selectedDate: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  timeInput: {
    flex: 1,
  },
  timeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  timeLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  timeTextInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timePresets: {
    marginTop: spacing.xs,
  },
  timePresetChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  timePresetChipSelected: {
    backgroundColor: colors.primary + '20',
  },
  timePresetText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  timePresetTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  arrow: {
    marginTop: 40,
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.lifestyle + '10',
  },
  durationContent: {
    flex: 1,
  },
  durationValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.lifestyle,
  },
  durationLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  qualityCard: {
    padding: spacing.lg,
  },
  qualityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  qualityEmoji: {
    fontSize: 32,
  },
  qualityLabel: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  qualityValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  qualitySlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  qualityDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  qualityDotActive: {
    backgroundColor: colors.primary + '40',
  },
  qualityDotCurrent: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.2 }],
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  factorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  factorChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  factorChipNegative: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  factorText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  factorTextSelected: {
    color: colors.textInverse,
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
  },
  saveButton: {
    marginTop: spacing.xl,
  },
});
