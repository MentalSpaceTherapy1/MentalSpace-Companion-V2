/**
 * Home Screen
 * Dashboard with today's status and quick actions
 */

import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useCheckinStore } from '../../stores/checkinStore';
import { useStreakStore, getStreakMessage } from '../../stores/streakStore';
import { useCalendarStore } from '../../stores/calendarStore';
import { usePlanStore } from '../../stores/planStore';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MetricBadge } from '../../components/ui/MetricBadge';
import { BusyDayCard } from '../../components/BusyDayCard';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { todayCheckin, isLoading, refresh } = useCheckinStore();
  const { streak, fetchStreak, refreshStreak } = useStreakStore();
  const { isConnected, refreshEvents, checkAvailability } = useCalendarStore();
  const { checkCalendarBusyLevel } = usePlanStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showBusyCard, setShowBusyCard] = useState(true);

  // Fetch streak and check calendar on mount
  useEffect(() => {
    fetchStreak();
    checkAvailability();
    if (isConnected) {
      refreshEvents();
    }
  }, [fetchStreak, checkAvailability, isConnected]);

  // Update busy level when calendar events change
  useEffect(() => {
    if (isConnected) {
      checkCalendarBusyLevel();
    }
  }, [isConnected, checkCalendarBusyLevel]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const promises = [refresh(), refreshStreak()];
    if (isConnected) {
      promises.push(refreshEvents());
    }
    await Promise.all(promises);
    setRefreshing(false);
  }, [refresh, refreshStreak, isConnected, refreshEvents]);

  const greeting = getGreeting();
  const firstName = profile?.displayName?.split(' ')[0] || 'there';

  return (
    <View style={styles.screenContainer}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{greeting},</Text>
        <Text style={styles.name}>{firstName}!</Text>
      </View>

      {/* Busy Day Card - Shows when calendar detects busy day */}
      {showBusyCard && <BusyDayCard onDismiss={() => setShowBusyCard(false)} />}

      {/* Today's Status */}
      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.cardTitle}>Today's Check-in</Text>
          {todayCheckin && (
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.statusBadgeText}>Completed</Text>
            </View>
          )}
        </View>

        {todayCheckin ? (
          <View style={styles.metricsGrid}>
            <MetricBadge label="Mood" value={todayCheckin.mood} color={colors.primary} />
            <MetricBadge label="Energy" value={todayCheckin.energy} color={colors.lifestyle} />
            <MetricBadge label="Stress" value={todayCheckin.stress} color={colors.error} inverted />
            <MetricBadge label="Sleep" value={todayCheckin.sleep} color={colors.coping} />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="sunny-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>You haven't checked in today</Text>
            <Button
              title="Start Check-in"
              onPress={() => router.push('/(tabs)/checkin')}
              style={styles.ctaButton}
            />
          </View>
        )}
      </Card>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <QuickAction
          icon="add-circle"
          label="Check-in"
          color={colors.primary}
          onPress={() => router.push('/(tabs)/checkin')}
        />
        <QuickAction
          icon="images"
          label="Mood Board"
          color={colors.accent}
          onPress={() => router.push('/(mood-board)')}
        />
        <QuickAction
          icon="book"
          label="Journal"
          color={colors.connection}
          onPress={() => router.push('/(journal)')}
        />
        <QuickAction
          icon="moon"
          label="Sleep"
          color={colors.coping}
          onPress={() => router.push('/(sleep)')}
        />
      </View>

      {/* Telehealth Services - Prominent CTA */}
      <Pressable
        style={styles.telehealthCard}
        onPress={() => router.push('/(telehealth)')}
      >
        <View style={styles.telehealthGradient}>
          <View style={styles.telehealthContent}>
            <View style={styles.telehealthIcon}>
              <Ionicons name="videocam" size={28} color={colors.textInverse} />
            </View>
            <View style={styles.telehealthText}>
              <Text style={styles.telehealthTitle}>Talk to a Therapist</Text>
              <Text style={styles.telehealthSubtitle}>
                Schedule a telehealth session with a licensed professional
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textInverse} />
          </View>
          <View style={styles.telehealthBadge}>
            <Ionicons name="shield-checkmark" size={14} color={colors.success} />
            <Text style={styles.telehealthBadgeText}>Insurance accepted</Text>
          </View>
        </View>
      </Pressable>

      {/* Streak Card */}
      <Card style={[
        styles.streakCard,
        streak?.currentStreak === 0 && styles.streakCardInactive,
      ]}>
        <View style={styles.streakContent}>
          <View style={styles.streakIcon}>
            <Ionicons
              name={streak?.currentStreak ? "flame" : "flame-outline"}
              size={32}
              color={streak?.currentStreak ? colors.connection : 'rgba(255, 255, 255, 0.6)'}
            />
          </View>
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>
              {streak?.currentStreak ?? 0}
            </Text>
            <Text style={styles.streakLabel}>
              Day{streak?.currentStreak !== 1 ? 's' : ''} Streak
            </Text>
          </View>
          <Text style={styles.streakMessage}>
            {getStreakMessage(streak?.currentStreak ?? 0)}
          </Text>
        </View>
        {streak && streak.longestStreak > streak.currentStreak && (
          <Text style={styles.longestStreak}>
            Longest: {streak.longestStreak} days
          </Text>
        )}
      </Card>
    </ScrollView>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
      onPress={onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  name: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  statusCard: {
    marginBottom: spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusBadgeText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  ctaButton: {
    minWidth: 160,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  streakCard: {
    backgroundColor: colors.primary,
  },
  streakCardInactive: {
    backgroundColor: colors.textSecondary,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textInverse,
  },
  streakLabel: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  streakMessage: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textInverse,
  },
  longestStreak: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  // Telehealth Card Styles
  telehealthCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  telehealthGradient: {
    backgroundColor: colors.secondary,
    padding: spacing.lg,
  },
  telehealthContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  telehealthIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  telehealthText: {
    flex: 1,
  },
  telehealthTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textInverse,
    marginBottom: 2,
  },
  telehealthSubtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
  telehealthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  telehealthBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textInverse,
    fontWeight: typography.fontWeight.medium,
  },
});
