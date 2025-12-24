/**
 * Session Card Component
 * Displays session information, rating, and homework status
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import type { TherapistSession } from '../../stores/sessionStore';

interface SessionCardProps {
  session: TherapistSession;
  onPress?: () => void;
  showReflection?: boolean;
}

const RATING_EMOJIS = ['😞', '😕', '😐', '🙂', '😊'];

export function SessionCard({ session, onPress, showReflection = true }: SessionCardProps) {
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getSessionTypeIcon = (): string => {
    switch (session.type) {
      case 'video':
        return 'videocam';
      case 'audio':
        return 'call';
      case 'chat':
        return 'chatbubble';
      default:
        return 'calendar';
    }
  };

  const getStatusColor = (): string => {
    switch (session.status) {
      case 'scheduled':
        return colors.primary;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getHomeworkProgress = (): { completed: number; total: number } => {
    if (!session.reflection?.homework || session.reflection.homework.length === 0) {
      return { completed: 0, total: 0 };
    }

    const total = session.reflection.homework.length;
    const completed = session.homeworkCompleted?.filter(Boolean).length || 0;

    return { completed, total };
  };

  const homeworkProgress = getHomeworkProgress();
  const hasHomework = homeworkProgress.total > 0;
  const allHomeworkCompleted = hasHomework && homeworkProgress.completed === homeworkProgress.total;

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        {/* Therapist Info */}
        <View style={styles.therapistSection}>
          <View style={styles.therapistAvatar}>
            <Ionicons name="person" size={20} color={colors.primary} />
          </View>
          <View style={styles.therapistInfo}>
            <Text style={styles.therapistName}>{session.therapistName}</Text>
            <View style={styles.sessionMeta}>
              <Ionicons
                name={getSessionTypeIcon() as any}
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.sessionMetaText}>
                {session.duration} min
              </Text>
            </View>
          </View>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {session.status === 'scheduled' ? 'Upcoming' : session.status}
          </Text>
        </View>
      </View>

      {/* Date & Time */}
      <View style={styles.dateTimeRow}>
        <View style={styles.dateTimeItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.dateTimeText}>{formatDate(session.sessionDate)}</Text>
        </View>
        <View style={styles.dateTimeItem}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.dateTimeText}>{formatTime(session.sessionDate)}</Text>
        </View>
      </View>

      {/* Reflection Info */}
      {showReflection && session.reflection && (
        <>
          <View style={styles.divider} />

          <View style={styles.reflectionSection}>
            {/* Rating */}
            <View style={styles.ratingRow}>
              <Text style={styles.reflectionLabel}>Session Rating:</Text>
              <View style={styles.ratingDisplay}>
                <Text style={styles.ratingEmoji}>
                  {RATING_EMOJIS[session.reflection.rating - 1]}
                </Text>
                <Text style={styles.ratingText}>
                  {session.reflection.rating}/5
                </Text>
              </View>
            </View>

            {/* Homework Status */}
            {hasHomework && (
              <View style={styles.homeworkRow}>
                <View style={styles.homeworkHeader}>
                  <Ionicons
                    name={allHomeworkCompleted ? 'checkmark-circle' : 'list'}
                    size={16}
                    color={allHomeworkCompleted ? colors.success : colors.textSecondary}
                  />
                  <Text style={styles.reflectionLabel}>Homework:</Text>
                </View>
                <View style={styles.homeworkProgress}>
                  <Text
                    style={[
                      styles.homeworkText,
                      allHomeworkCompleted && styles.homeworkTextCompleted,
                    ]}
                  >
                    {homeworkProgress.completed}/{homeworkProgress.total} completed
                  </Text>
                </View>
              </View>
            )}

            {/* Takeaways Preview */}
            {session.reflection.keyTakeaways.length > 0 && (
              <View style={styles.takeawaysPreview}>
                <Ionicons name="bulb-outline" size={16} color={colors.primary} />
                <Text style={styles.takeawayText} numberOfLines={2}>
                  {session.reflection.keyTakeaways[0]}
                </Text>
              </View>
            )}
          </View>
        </>
      )}

      {/* No Reflection Prompt */}
      {showReflection && !session.reflection && session.status === 'completed' && (
        <>
          <View style={styles.divider} />
          <View style={styles.noReflectionPrompt}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
            <Text style={styles.noReflectionText}>Add reflection</Text>
          </View>
        </>
      )}

      {/* Tap to view indicator */}
      {onPress && (
        <View style={styles.tapIndicator}>
          <Text style={styles.tapIndicatorText}>Tap to view details</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  therapistSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  therapistAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  therapistInfo: {
    flex: 1,
  },
  therapistName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sessionMetaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateTimeText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  reflectionSection: {
    gap: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reflectionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingEmoji: {
    fontSize: 20,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  homeworkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homeworkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  homeworkProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeworkText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  homeworkTextCompleted: {
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
  },
  takeawaysPreview: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.primary + '08',
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
  takeawayText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontStyle: 'italic',
  },
  noReflectionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  noReflectionText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  tapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tapIndicatorText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
});
