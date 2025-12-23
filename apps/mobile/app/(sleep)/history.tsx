/**
 * Sleep History Screen
 * View all sleep records with filtering and stats
 */

import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import {
  useSleepStore,
  formatDuration,
  SLEEP_QUALITY_LABELS,
  SLEEP_FACTORS,
  SleepRecord,
} from '../../stores/sleepStore';

type FilterPeriod = '7days' | '30days' | 'all';

export default function SleepHistoryScreen() {
  const { records, calculateStats, deleteSleepRecord } = useSleepStore();
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('30days');

  const filteredRecords = useMemo(() => {
    if (filterPeriod === 'all') return records;

    const days = filterPeriod === '7days' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return records.filter((r) => new Date(r.date) >= cutoff);
  }, [records, filterPeriod]);

  const stats = useMemo(() => {
    const days = filterPeriod === '7days' ? 7 : filterPeriod === '30days' ? 30 : 365;
    return calculateStats(days);
  }, [calculateStats, filterPeriod]);

  const handleDelete = (record: SleepRecord) => {
    Alert.alert(
      'Delete Record',
      `Delete sleep record for ${formatRecordDate(record.date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSleepRecord(record.id),
        },
      ]
    );
  };

  const formatRecordDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Period Filter */}
      <View style={styles.filterRow}>
        {(['7days', '30days', 'all'] as FilterPeriod[]).map((period) => (
          <Pressable
            key={period}
            style={[
              styles.filterButton,
              filterPeriod === period && styles.filterButtonActive,
            ]}
            onPress={() => setFilterPeriod(period)}
          >
            <Text
              style={[
                styles.filterText,
                filterPeriod === period && styles.filterTextActive,
              ]}
            >
              {period === '7days' ? '7 Days' : period === '30days' ? '30 Days' : 'All'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Stats Summary */}
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.totalRecords > 0 ? formatDuration(stats.averageDuration) : '--'}
            </Text>
            <Text style={styles.statLabel}>Avg. Duration</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.totalRecords > 0 ? stats.averageQuality.toFixed(1) : '--'}
            </Text>
            <Text style={styles.statLabel}>Avg. Quality</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.averageBedtime !== '--:--' ? stats.averageBedtime : '--'}
            </Text>
            <Text style={styles.statLabel}>Avg. Bedtime</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.averageWakeTime !== '--:--' ? stats.averageWakeTime : '--'}
            </Text>
            <Text style={styles.statLabel}>Avg. Wake</Text>
          </View>
        </View>
        <View style={styles.statsFooter}>
          <Text style={styles.statsFooterText}>
            {stats.totalRecords} night{stats.totalRecords !== 1 ? 's' : ''} tracked
          </Text>
          {stats.consistencyScore > 0 && (
            <View style={styles.consistencyBadge}>
              <Ionicons name="trending-up" size={14} color={colors.success} />
              <Text style={styles.consistencyText}>
                {stats.consistencyScore}% consistent
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="moon-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Sleep Records</Text>
          <Text style={styles.emptyText}>
            Start tracking your sleep to see history here
          </Text>
        </View>
      ) : (
        <View style={styles.recordsList}>
          {filteredRecords.map((record) => (
            <SleepHistoryItem
              key={record.id}
              record={record}
              onDelete={() => handleDelete(record)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function SleepHistoryItem({
  record,
  onDelete,
}: {
  record: SleepRecord;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(record.date);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const factorLabels = record.factors
    .map((f) => SLEEP_FACTORS.find((sf) => sf.key === f)?.label)
    .filter(Boolean);

  return (
    <Card style={styles.recordCard}>
      <Pressable
        style={styles.recordHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.recordDateSection}>
          <Text style={styles.recordDayName}>{dayName}</Text>
          <Text style={styles.recordDate}>{dateStr}</Text>
        </View>

        <View style={styles.recordSummary}>
          <Text style={styles.recordDuration}>{formatDuration(record.duration)}</Text>
          <View style={styles.recordQuality}>
            <Text style={styles.recordQualityEmoji}>
              {SLEEP_QUALITY_LABELS[record.quality]?.emoji}
            </Text>
            <Text style={styles.recordQualityText}>
              {SLEEP_QUALITY_LABELS[record.quality]?.label}
            </Text>
          </View>
        </View>

        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>

      {expanded && (
        <View style={styles.recordDetails}>
          <View style={styles.recordTimesRow}>
            <View style={styles.recordTimeItem}>
              <Ionicons name="bed" size={18} color={colors.primary} />
              <Text style={styles.recordTimeLabel}>Bedtime</Text>
              <Text style={styles.recordTimeValue}>{record.bedtime}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={colors.textTertiary} />
            <View style={styles.recordTimeItem}>
              <Ionicons name="sunny" size={18} color={colors.connection} />
              <Text style={styles.recordTimeLabel}>Wake</Text>
              <Text style={styles.recordTimeValue}>{record.wakeTime}</Text>
            </View>
          </View>

          {factorLabels.length > 0 && (
            <View style={styles.recordFactors}>
              <Text style={styles.recordFactorsLabel}>Factors:</Text>
              <View style={styles.recordFactorsList}>
                {factorLabels.map((label, i) => (
                  <View key={i} style={styles.factorChip}>
                    <Text style={styles.factorChipText}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {record.notes && (
            <View style={styles.recordNotes}>
              <Text style={styles.recordNotesLabel}>Notes:</Text>
              <Text style={styles.recordNotesText}>{record.notes}</Text>
            </View>
          )}

          <Pressable style={styles.deleteButton} onPress={onDelete}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={styles.deleteButtonText}>Delete Record</Text>
          </Pressable>
        </View>
      )}
    </Card>
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
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  filterTextActive: {
    color: colors.textInverse,
  },
  statsCard: {
    marginBottom: spacing.lg,
  },
  statsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    paddingVertical: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statsFooterText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  consistencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  consistencyText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  recordsList: {
    gap: spacing.sm,
  },
  recordCard: {
    padding: 0,
    overflow: 'hidden',
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  recordDateSection: {
    flex: 1,
  },
  recordDayName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  recordDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recordSummary: {
    alignItems: 'flex-end',
    marginRight: spacing.md,
  },
  recordDuration: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  recordQuality: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recordQualityEmoji: {
    fontSize: 14,
  },
  recordQualityText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  recordDetails: {
    padding: spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  recordTimesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
  },
  recordTimeItem: {
    alignItems: 'center',
    gap: 4,
  },
  recordTimeLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  recordTimeValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  recordFactors: {
    marginTop: spacing.md,
  },
  recordFactorsLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  recordFactorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  factorChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  factorChipText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  recordNotes: {
    marginTop: spacing.md,
  },
  recordNotesLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  recordNotesText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deleteButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
  },
});
