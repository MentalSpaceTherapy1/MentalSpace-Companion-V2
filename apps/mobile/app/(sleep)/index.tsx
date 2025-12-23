/**
 * Sleep Tracker Main Screen
 * Overview of sleep data with quick stats and recent history
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import {
  useSleepStore,
  formatDuration,
  SLEEP_QUALITY_LABELS,
  SleepRecord,
} from '../../stores/sleepStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.md * 4;

export default function SleepTrackerScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const {
    records,
    goal,
    isLoading,
    loadSleepData,
    getWeekRecords,
    calculateStats,
    getSleepDebt,
  } = useSleepStore();

  useEffect(() => {
    loadSleepData();
  }, [loadSleepData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSleepData();
    setRefreshing(false);
  };

  const weekRecords = getWeekRecords();
  const stats = calculateStats(7);
  const sleepDebt = getSleepDebt();
  const todayRecord = records.find(
    (r) => r.date === new Date().toISOString().split('T')[0]
  );
  const lastNightRecord = records.find((r) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return r.date === yesterday.toISOString().split('T')[0];
  });

  // Prepare chart data
  const chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const chartData: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const record = records.find((r) => r.date === dateStr);
    chartData.push(record ? record.duration / 60 : 0); // Convert to hours
  }

  const hasData = chartData.some((d) => d > 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Last Night Summary */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryIcon}>
            <Ionicons name="moon" size={28} color={colors.primary} />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryLabel}>Last Night</Text>
            {lastNightRecord ? (
              <>
                <Text style={styles.summaryValue}>
                  {formatDuration(lastNightRecord.duration)}
                </Text>
                <View style={styles.qualityBadge}>
                  <Text style={styles.qualityEmoji}>
                    {SLEEP_QUALITY_LABELS[lastNightRecord.quality]?.emoji}
                  </Text>
                  <Text style={styles.qualityText}>
                    {SLEEP_QUALITY_LABELS[lastNightRecord.quality]?.label}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.noDataText}>No data logged</Text>
            )}
          </View>
          <Pressable
            style={styles.logButton}
            onPress={() => router.push('/(sleep)/log')}
          >
            <Ionicons name="add" size={24} color={colors.textInverse} />
          </Pressable>
        </View>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Ionicons name="time" size={24} color={colors.lifestyle} />
          <Text style={styles.statValue}>
            {stats.totalRecords > 0 ? formatDuration(stats.averageDuration) : '--'}
          </Text>
          <Text style={styles.statLabel}>Avg. Sleep</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="star" size={24} color={colors.connection} />
          <Text style={styles.statValue}>
            {stats.totalRecords > 0 ? stats.averageQuality.toFixed(1) : '--'}
          </Text>
          <Text style={styles.statLabel}>Avg. Quality</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color={colors.coping} />
          <Text style={styles.statValue}>
            {stats.consistencyScore > 0 ? `${stats.consistencyScore}%` : '--'}
          </Text>
          <Text style={styles.statLabel}>Consistency</Text>
        </Card>
      </View>

      {/* Sleep Debt Warning */}
      {sleepDebt > 60 && (
        <Card style={styles.debtCard}>
          <Ionicons name="warning" size={24} color={colors.warning} />
          <View style={styles.debtContent}>
            <Text style={styles.debtTitle}>Sleep Debt</Text>
            <Text style={styles.debtText}>
              You're about {formatDuration(sleepDebt)} behind your sleep goal this week.
              Consider going to bed earlier tonight.
            </Text>
          </View>
        </Card>
      )}

      {/* Weekly Chart */}
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>This Week</Text>
          <Pressable onPress={() => router.push('/(sleep)/history')}>
            <Text style={styles.viewAllLink}>View All</Text>
          </Pressable>
        </View>

        {hasData ? (
          <>
            <LineChart
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    data: chartData.map((d) => (d > 0 ? d : 0)),
                  },
                ],
              }}
              width={CHART_WIDTH}
              height={180}
              yAxisSuffix="h"
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: colors.surface,
                backgroundGradientFrom: colors.surface,
                backgroundGradientTo: colors.surface,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                labelColor: () => colors.textSecondary,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: colors.primary,
                },
              }}
              bezier
              style={styles.chart}
              fromZero
            />
            {goal.enabled && (
              <View style={styles.goalLine}>
                <View style={styles.goalLineDashed} />
                <Text style={styles.goalLineLabel}>
                  Goal: {formatDuration(goal.targetDuration)}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyChart}>
            <Ionicons name="bar-chart-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyChartText}>
              Start logging your sleep to see trends
            </Text>
          </View>
        )}
      </Card>

      {/* Goals Section */}
      <Pressable
        style={styles.goalsCard}
        onPress={() => router.push('/(sleep)/goals')}
      >
        <View style={styles.goalsContent}>
          <Ionicons name="flag" size={24} color={colors.primary} />
          <View style={styles.goalsText}>
            <Text style={styles.goalsTitle}>Sleep Goals</Text>
            {goal.enabled ? (
              <Text style={styles.goalsSubtitle}>
                {goal.targetBedtime} - {goal.targetWakeTime} ({formatDuration(goal.targetDuration)})
              </Text>
            ) : (
              <Text style={styles.goalsSubtitle}>Set up your sleep schedule</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </Pressable>

      {/* Recent History */}
      {records.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Nights</Text>
          {records.slice(0, 5).map((record) => (
            <SleepRecordItem key={record.id} record={record} />
          ))}
        </View>
      )}

      {/* Sleep Tips CTA */}
      <Card style={styles.tipsCard}>
        <Ionicons name="bulb" size={32} color={colors.connection} />
        <View style={styles.tipsContent}>
          <Text style={styles.tipsTitle}>Sleep Better</Text>
          <Text style={styles.tipsSubtitle}>
            Get personalized tips to improve your sleep quality
          </Text>
        </View>
        <Button
          title="View Tips"
          variant="outline"
          size="small"
          onPress={() => router.push('/(sleep)/tips')}
        />
      </Card>
    </ScrollView>
  );
}

function SleepRecordItem({ record }: { record: SleepRecord }) {
  const date = new Date(record.date);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <Card style={styles.recordItem}>
      <View style={styles.recordDate}>
        <Text style={styles.recordDayName}>{dayName}</Text>
        <Text style={styles.recordDateStr}>{dateStr}</Text>
      </View>
      <View style={styles.recordDetails}>
        <View style={styles.recordTime}>
          <Ionicons name="bed" size={16} color={colors.textSecondary} />
          <Text style={styles.recordTimeText}>{record.bedtime}</Text>
        </View>
        <Ionicons name="arrow-forward" size={12} color={colors.textTertiary} />
        <View style={styles.recordTime}>
          <Ionicons name="sunny" size={16} color={colors.textSecondary} />
          <Text style={styles.recordTimeText}>{record.wakeTime}</Text>
        </View>
      </View>
      <View style={styles.recordStats}>
        <Text style={styles.recordDuration}>{formatDuration(record.duration)}</Text>
        <Text style={styles.recordQualityEmoji}>
          {SLEEP_QUALITY_LABELS[record.quality]?.emoji}
        </Text>
      </View>
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
  summaryCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.primary + '10',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },
  qualityEmoji: {
    fontSize: 16,
  },
  qualityText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  noDataText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  logButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  debtCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.warning + '10',
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  debtContent: {
    flex: 1,
  },
  debtTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning,
    marginBottom: 4,
  },
  debtText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  chartCard: {
    marginBottom: spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  viewAllLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  chart: {
    marginLeft: -spacing.md,
    borderRadius: 16,
  },
  goalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  goalLineDashed: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.success,
  },
  goalLineLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  emptyChart: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  goalsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  goalsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  goalsText: {
    flex: 1,
  },
  goalsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  goalsSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
  },
  recordDate: {
    width: 50,
  },
  recordDayName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  recordDateStr: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  recordDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
  },
  recordTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordTimeText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  recordStats: {
    alignItems: 'flex-end',
  },
  recordDuration: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  recordQualityEmoji: {
    fontSize: 16,
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.connection + '10',
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  tipsSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
