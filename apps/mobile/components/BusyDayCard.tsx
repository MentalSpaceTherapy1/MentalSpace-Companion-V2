/**
 * Busy Day Card Component
 * Shows when calendar detects a busy day and offers lighter plan
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { useCalendarStore } from '../stores/calendarStore';
import { getBusyLevelInfo } from '../services/calendarIntegration';
import * as Haptics from '../utils/haptics';

interface BusyDayCardProps {
  onRequestLighterPlan?: () => void;
  onDismiss?: () => void;
}

export function BusyDayCard({ onRequestLighterPlan, onDismiss }: BusyDayCardProps) {
  const { todayEvents, busyLevel } = useCalendarStore();

  // Only show for busy or packed days
  if (busyLevel !== 'busy' && busyLevel !== 'packed') {
    return null;
  }

  const timedEvents = todayEvents.filter(e => !e.allDay);
  const busyLevelInfo = getBusyLevelInfo(busyLevel);

  const handleLighterPlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRequestLighterPlan?.();
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss?.();
  };

  return (
    <Card style={[styles.container, { backgroundColor: busyLevelInfo.color + '15' }]}>
      {onDismiss && (
        <Pressable style={styles.dismissButton} onPress={handleDismiss}>
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>
      )}

      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: busyLevelInfo.color + '20' }]}>
          <Text style={styles.emoji}>{busyLevelInfo.emoji}</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: busyLevelInfo.color }]}>
            Busy Day Detected
          </Text>
          <Text style={styles.subtitle}>
            You have {timedEvents.length} meeting{timedEvents.length !== 1 ? 's' : ''} today
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        {busyLevel === 'packed'
          ? "Your schedule is packed today. We've prepared a lighter plan with shorter, easier actions."
          : "You've got a busy day ahead. Want a plan with lighter, more manageable actions?"}
      </Text>

      {onRequestLighterPlan && busyLevel === 'busy' && (
        <Button
          title="Get Lighter Plan"
          onPress={handleLighterPlan}
          variant="primary"
          style={styles.button}
        />
      )}

      {busyLevel === 'packed' && (
        <View style={styles.autoAppliedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.autoAppliedText}>Lighter plan auto-applied</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  dismissButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  emoji: {
    fontSize: 24,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
  autoAppliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  autoAppliedText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.success,
  },
});
