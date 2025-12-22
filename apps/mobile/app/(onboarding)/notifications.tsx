/**
 * Onboarding Notifications Screen
 * Set up notification preferences
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reasons: string; focusAreas: string }>();

  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [reminderTime, setReminderTime] = useState(new Date(2024, 0, 1, 9, 0)); // 9:00 AM
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      setReminderTime(selectedDate);
    }
  };

  const timeString = `${reminderTime.getHours().toString().padStart(2, '0')}:${reminderTime.getMinutes().toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
        <Text style={styles.progressText}>3 of 4</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="notifications-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>Stay on Track</Text>
          <Text style={styles.subtitle}>
            Gentle reminders can help you build a consistent wellness routine.
          </Text>
        </View>

        {/* Settings */}
        <View style={styles.settings}>
          {/* Daily Reminder */}
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <View style={styles.settingIcon}>
                <Ionicons name="sunny-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Daily Check-in Reminder</Text>
                <Text style={styles.settingDescription}>
                  Get a gentle nudge to complete your daily check-in
                </Text>
              </View>
              <Switch
                value={dailyReminder}
                onValueChange={setDailyReminder}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={dailyReminder ? colors.primary : colors.textTertiary}
              />
            </View>

            {/* Time Picker */}
            {dailyReminder && (
              <Pressable
                style={styles.timePicker}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.timeLabel}>Remind me at</Text>
                <Text style={styles.timeValue}>{formatTime(reminderTime)}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </Pressable>
            )}
          </View>

          {/* Weekly Digest */}
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <View style={styles.settingIcon}>
                <Ionicons name="analytics-outline" size={24} color={colors.secondary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Weekly Progress Summary</Text>
                <Text style={styles.settingDescription}>
                  Receive a weekly summary of your wellness journey
                </Text>
              </View>
              <Switch
                value={weeklyDigest}
                onValueChange={setWeeklyDigest}
                trackColor={{ false: colors.border, true: colors.secondary + '50' }}
                thumbColor={weeklyDigest ? colors.secondary : colors.textTertiary}
              />
            </View>
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textTertiary} />
          <Text style={styles.infoText}>
            You can change these settings anytime from your profile.
          </Text>
        </View>
      </ScrollView>

      {/* Time Picker Modal (iOS) */}
      {showTimePicker && Platform.OS === 'ios' && (
        <View style={styles.timePickerModal}>
          <View style={styles.timePickerHeader}>
            <Pressable onPress={() => setShowTimePicker(false)}>
              <Text style={styles.timePickerDone}>Done</Text>
            </Pressable>
          </View>
          <DateTimePicker
            value={reminderTime}
            mode="time"
            display="spinner"
            onChange={handleTimeChange}
          />
        </View>
      )}

      {/* Time Picker (Android) */}
      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={() => router.push({
            pathname: '/(onboarding)/complete',
            params: {
              reasons: params.reasons,
              focusAreas: params.focusAreas,
              dailyReminder: dailyReminder.toString(),
              reminderTime: timeString,
              weeklyDigest: weeklyDigest.toString(),
            },
          })}
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
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
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
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
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
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  settings: {
    gap: spacing.md,
  },
  settingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  timeLabel: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  timeValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    lineHeight: 18,
  },
  timePickerModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.xl,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timePickerDone: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {},
});
