/**
 * EXAMPLE: Home Screen with Predictive Support Integration
 * This shows how to integrate the predictive support features into the home screen
 * Copy relevant sections into your actual app/(tabs)/index.tsx
 */

import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { useCheckinStore } from '../stores/checkinStore';
import { useStreakStore, getStreakMessage } from '../stores/streakStore';
import { usePredictiveStore } from '../stores/predictiveStore';
import { usePlanStore } from '../stores/planStore';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MetricBadge } from '../components/ui/MetricBadge';
import { ProactiveAlertCard } from '../components/ProactiveAlertCard';
import { getGentlerMessage } from '../utils/badDayMode';

export default function HomeScreenWithPredictive() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { todayCheckin, isLoading, refresh } = useCheckinStore();
  const { streak, fetchStreak, refreshStreak } = useStreakStore();

  // Predictive support integration
  const {
    currentAlert,
    alertDismissed,
    dismissAlert,
    runPredictions,
    badDayModeActive,
    badDayTriggers,
    activateBadDayMode,
    deactivateBadDayMode,
  } = usePredictiveStore();

  const { currentPlan } = usePlanStore();
  const [refreshing, setRefreshing] = useState(false);

  // Run predictions on mount
  useEffect(() => {
    fetchStreak();
    runPredictions();
  }, [fetchStreak, runPredictions]);

  // Re-run predictions when check-in changes
  useEffect(() => {
    if (todayCheckin) {
      runPredictions();
    }
  }, [todayCheckin, runPredictions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refresh(),
      refreshStreak(),
      runPredictions(),
    ]);
    setRefreshing(false);
  }, [refresh, refreshStreak, runPredictions]);

  // Handle proactive alert actions
  const handleAcceptLighterPlan = () => {
    activateBadDayMode([{
      type: 'manual',
      description: 'User accepted lighter plan',
      timestamp: new Date().toISOString(),
    }]);
    dismissAlert();
  };

  const handleKeepNormal = () => {
    dismissAlert();
  };

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
          <Text style={styles.greeting}>
            {badDayModeActive ? 'Taking it easy today' : greeting}
          </Text>
          <Text style={styles.name}>{firstName}</Text>
        </View>

        {/* Proactive Alert - Shows predictions */}
        {currentAlert && !alertDismissed && (
          <ProactiveAlertCard
            alert={currentAlert}
            onAcceptLighterPlan={handleAcceptLighterPlan}
            onKeepNormal={handleKeepNormal}
            onDismiss={dismissAlert}
          />
        )}

        {/* Bad Day Mode Indicator */}
        {badDayModeActive && (
          <Card style={styles.badDayBanner}>
            <View style={styles.badDayContent}>
              <Ionicons name="heart" size={24} color={colors.primary} />
              <View style={styles.badDayText}>
                <Text style={styles.badDayTitle}>Support Mode Active</Text>
                <Text style={styles.badDaySubtitle}>
                  {getGentlerMessage('plan')}
                </Text>
              </View>
              <Pressable onPress={deactivateBadDayMode} hitSlop={8}>
                <Text style={styles.badDayLink}>Restore</Text>
              </Pressable>
            </View>
          </Card>
        )}

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
              <Text style={styles.emptyText}>
                {badDayModeActive
                  ? "When you're ready, check in with how you're feeling"
                  : "You haven't checked in today"}
              </Text>
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
            icon="book"
            label="Journal"
            color={colors.connection}
            onPress={() => router.push('/(journal)')}
          />
          <QuickAction
            icon="calendar-outline"
            label="Trigger Dates"
            color={colors.lifestyle}
            onPress={() => router.push('/(settings)/trigger-dates')}
          />
          <QuickAction
            icon="heart"
            label="Get Help"
            color={colors.sos}
            onPress={() => router.push('/(tabs)/sos')}
          />
        </View>

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
  badDayBanner: {
    backgroundColor: colors.primary + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: spacing.lg,
  },
  badDayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badDayText: {
    flex: 1,
  },
  badDayTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  badDaySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  badDayLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
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
    textAlign: 'center',
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
});
