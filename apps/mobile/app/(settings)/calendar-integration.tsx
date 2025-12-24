/**
 * Calendar Integration Settings Screen
 * Configure calendar access and privacy settings
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCalendarStore } from '../../stores/calendarStore';
import { getUserCalendars, getBusyLevelInfo } from '../../services/calendarIntegration';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import * as Haptics from '../../utils/haptics';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import type { Calendar } from 'expo-calendar';

export default function CalendarIntegrationScreen() {
  const router = useRouter();
  const {
    isConnected,
    isAvailable,
    selectedCalendarIds,
    todayEvents,
    busyLevel,
    isLoading,
    error,
    checkAvailability,
    connectCalendar,
    disconnectCalendar,
    refreshEvents,
    setSelectedCalendars,
  } = useCalendarStore();

  const [availableCalendars, setAvailableCalendars] = useState<Calendar[]>([]);
  const [loadingCalendars, setLoadingCalendars] = useState(false);

  // Check availability on mount
  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  // Load calendars if connected
  useEffect(() => {
    if (isConnected) {
      loadCalendars();
      refreshEvents();
    }
  }, [isConnected]);

  const loadCalendars = async () => {
    setLoadingCalendars(true);
    try {
      const calendars = await getUserCalendars();
      setAvailableCalendars(calendars);
    } catch (error) {
      console.error('Failed to load calendars:', error);
    } finally {
      setLoadingCalendars(false);
    }
  };

  const handleToggleCalendar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isConnected) {
      // Confirm disconnect
      if (Platform.OS === 'web') {
        if (window.confirm('Disconnect calendar integration?')) {
          disconnectCalendar();
        }
      } else {
        Alert.alert(
          'Disconnect Calendar',
          'Are you sure you want to disconnect your calendar?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disconnect',
              style: 'destructive',
              onPress: () => disconnectCalendar(),
            },
          ]
        );
      }
    } else {
      // Connect calendar
      const success = await connectCalendar();
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleToggleCalendarSelection = async (calendarId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const isSelected = selectedCalendarIds.includes(calendarId);
    let newSelection: string[];

    if (isSelected) {
      // Deselect - but keep at least one selected
      newSelection = selectedCalendarIds.filter(id => id !== calendarId);
      if (newSelection.length === 0) {
        if (Platform.OS === 'web') {
          window.alert('At least one calendar must be selected');
        } else {
          Alert.alert('Selection Required', 'At least one calendar must be selected');
        }
        return;
      }
    } else {
      // Select
      newSelection = [...selectedCalendarIds, calendarId];
    }

    await setSelectedCalendars(newSelection);
  };

  const busyLevelInfo = getBusyLevelInfo(busyLevel);
  const timedEvents = todayEvents.filter(e => !e.allDay);

  // Calendar not available on this device
  if (!isAvailable) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.unavailableCard}>
          <View style={styles.unavailableIcon}>
            <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
          </View>
          <Text style={styles.unavailableTitle}>Calendar Not Available</Text>
          <Text style={styles.unavailableText}>
            Calendar integration is not supported on this platform.
          </Text>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Main Toggle */}
      <Card style={styles.mainCard}>
        <View style={styles.mainToggle}>
          <View style={styles.toggleLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
            </View>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Calendar Integration</Text>
              <Text style={styles.toggleSubtitle}>
                {isConnected ? 'Connected' : 'Adapt plans to your schedule'}
              </Text>
            </View>
          </View>
          <Switch
            value={isConnected}
            onValueChange={handleToggleCalendar}
            trackColor={{ true: colors.primary, false: colors.border }}
            disabled={isLoading}
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </Card>

      {/* Privacy Explanation */}
      <Card style={styles.privacyCard}>
        <View style={styles.privacyHeader}>
          <Ionicons name="shield-checkmark" size={20} color={colors.success} />
          <Text style={styles.privacyTitle}>Your Privacy</Text>
        </View>
        <Text style={styles.privacyText}>
          We only read your calendar event times to understand when you're busy. We never access
          event titles, locations, or other details. All data stays on your device.
        </Text>
      </Card>

      {isConnected && (
        <>
          {/* Today's Busy Level Preview */}
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <Card style={[styles.busyLevelCard, { backgroundColor: busyLevelInfo.color + '15' }]}>
            <View style={styles.busyLevelHeader}>
              <Text style={styles.busyLevelEmoji}>{busyLevelInfo.emoji}</Text>
              <View style={styles.busyLevelInfo}>
                <Text style={[styles.busyLevelLabel, { color: busyLevelInfo.color }]}>
                  {busyLevelInfo.label}
                </Text>
                <Text style={styles.busyLevelDescription}>{busyLevelInfo.description}</Text>
              </View>
            </View>

            {timedEvents.length > 0 ? (
              <View style={styles.eventsSummary}>
                <View style={styles.eventStat}>
                  <Text style={styles.eventStatNumber}>{timedEvents.length}</Text>
                  <Text style={styles.eventStatLabel}>
                    Meeting{timedEvents.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                {isLoading && (
                  <ActivityIndicator size="small" color={busyLevelInfo.color} />
                )}
              </View>
            ) : (
              <Text style={styles.noEventsText}>No meetings scheduled today</Text>
            )}
          </Card>

          {/* Calendar Selection */}
          <Text style={styles.sectionTitle}>Selected Calendars</Text>
          <Card style={styles.calendarsCard}>
            {loadingCalendars ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Loading calendars...</Text>
              </View>
            ) : availableCalendars.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No calendars found</Text>
              </View>
            ) : (
              availableCalendars.map((calendar, index) => (
                <View key={calendar.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <Pressable
                    style={styles.calendarRow}
                    onPress={() => handleToggleCalendarSelection(calendar.id)}
                  >
                    <View style={styles.calendarInfo}>
                      <View
                        style={[
                          styles.calendarColorDot,
                          { backgroundColor: calendar.color || colors.primary },
                        ]}
                      />
                      <Text style={styles.calendarTitle}>{calendar.title}</Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        selectedCalendarIds.includes(calendar.id) && styles.checkboxSelected,
                      ]}
                    >
                      {selectedCalendarIds.includes(calendar.id) && (
                        <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                      )}
                    </View>
                  </Pressable>
                </View>
              ))
            )}
          </Card>

          {/* How It Works */}
          <Text style={styles.sectionTitle}>How It Works</Text>
          <Card style={styles.infoCard}>
            <InfoRow
              icon="time-outline"
              title="Busy Day Detection"
              description="We analyze your calendar to detect busy days"
            />
            <View style={styles.divider} />
            <InfoRow
              icon="fitness-outline"
              title="Lighter Plans"
              description="On busy days, we suggest shorter, easier actions"
            />
            <View style={styles.divider} />
            <InfoRow
              icon="notifications-outline"
              title="Heads-Up Alerts"
              description="Get notified the night before a busy day"
            />
          </Card>

          {/* Refresh Button */}
          <Button
            title="Refresh Events"
            variant="outline"
            onPress={refreshEvents}
            loading={isLoading}
            style={styles.refreshButton}
          />
        </>
      )}
    </ScrollView>
  );
}

function InfoRow({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoDescription}>{description}</Text>
      </View>
    </View>
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
  mainCard: {
    marginBottom: spacing.md,
  },
  mainToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.error + '15',
    borderRadius: borderRadius.md,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    flex: 1,
  },
  privacyCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.success + '10',
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  privacyTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  privacyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  busyLevelCard: {
    marginBottom: spacing.md,
  },
  busyLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  busyLevelEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  busyLevelInfo: {
    flex: 1,
  },
  busyLevelLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  busyLevelDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  eventsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  eventStatNumber: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  eventStatLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  noEventsText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  calendarsCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  emptyState: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  calendarInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  calendarColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  calendarTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  infoCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  infoDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  refreshButton: {
    marginTop: spacing.md,
  },
  unavailableCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  unavailableIcon: {
    marginBottom: spacing.md,
  },
  unavailableTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  unavailableText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
