/**
 * Summary Screen
 * Weekly analytics and insights
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Card } from '../../components/ui/Card';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { METRICS, METRIC_ORDER } from '@mentalspace/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.md * 2 - spacing.md * 2;

// Mock data
const mockWeeklySummary = {
  weekStart: '2025-12-15',
  weekEnd: '2025-12-21',
  metrics: {
    mood: { average: 6.8, trend: 'improving', values: [5, 6, 6, 7, 7, 8, 7] },
    stress: { average: 5.2, trend: 'improving', values: [7, 6, 6, 5, 5, 4, 4] },
    sleep: { average: 6.5, trend: 'stable', values: [6, 7, 6, 7, 6, 7, 7] },
    energy: { average: 6.0, trend: 'stable', values: [5, 6, 6, 6, 6, 7, 6] },
    focus: { average: 5.8, trend: 'declining', values: [7, 6, 6, 5, 5, 6, 5] },
    anxiety: { average: 4.5, trend: 'improving', values: [6, 5, 5, 4, 4, 4, 3] },
  },
  completionRate: 78,
  streaks: {
    currentCheckinStreak: 7,
    longestCheckinStreak: 14,
  },
  insights: [
    'Your mood has been improving this week!',
    'Great job completing your action plans!',
    'Your stress and anxiety levels are trending down.',
  ],
  topActions: [
    { title: 'Breathing Exercise', completedCount: 5 },
    { title: 'Morning Walk', completedCount: 4 },
    { title: 'Journaling', completedCount: 3 },
  ],
};

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SummaryScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('mood');

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const selectedData = mockWeeklySummary.metrics[selectedMetric as keyof typeof mockWeeklySummary.metrics];
  const metricConfig = METRICS[selectedMetric];

  const getTrendIcon = (trend: string): keyof typeof Ionicons.glyphMap => {
    switch (trend) {
      case 'improving':
        return 'trending-up';
      case 'declining':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend: string, inverted: boolean): string => {
    if (trend === 'stable') return colors.textSecondary;
    const isGood = inverted
      ? trend === 'declining'
      : trend === 'improving';
    return isGood ? colors.success : colors.error;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Week Header */}
      <View style={styles.weekHeader}>
        <View style={styles.weekHeaderLeft}>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.weekText}>
            Dec 15 - Dec 21, 2025
          </Text>
        </View>
        <Pressable
          style={styles.shareButton}
          onPress={() => router.push('/(weekly-focus)/share')}
        >
          <Ionicons name="share-outline" size={20} color={colors.primary} />
          <Text style={styles.shareButtonText}>Share</Text>
        </Pressable>
      </View>

      {/* Streak & Completion */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Ionicons name="flame" size={32} color={colors.connection} />
          <Text style={styles.statValue}>
            {mockWeeklySummary.streaks.currentCheckinStreak}
          </Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={32} color={colors.success} />
          <Text style={styles.statValue}>{mockWeeklySummary.completionRate}%</Text>
          <Text style={styles.statLabel}>Completion</Text>
        </Card>
      </View>

      {/* Metric Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.metricSelector}
        contentContainerStyle={styles.metricSelectorContent}
      >
        {METRIC_ORDER.map((key) => {
          const metric = METRICS[key];
          const data = mockWeeklySummary.metrics[key as keyof typeof mockWeeklySummary.metrics];
          const isSelected = selectedMetric === key;

          return (
            <Card
              key={key}
              style={[
                styles.metricChip,
                isSelected && styles.metricChipSelected,
              ]}
              onPress={() => setSelectedMetric(key)}
            >
              <Text
                style={[
                  styles.metricChipLabel,
                  isSelected && styles.metricChipLabelSelected,
                ]}
              >
                {metric.label}
              </Text>
              <View style={styles.metricChipValue}>
                <Text
                  style={[
                    styles.metricChipAvg,
                    isSelected && styles.metricChipAvgSelected,
                  ]}
                >
                  {data.average.toFixed(1)}
                </Text>
                <Ionicons
                  name={getTrendIcon(data.trend)}
                  size={16}
                  color={
                    isSelected
                      ? colors.textInverse
                      : getTrendColor(data.trend, metric.invertedScale)
                  }
                />
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>{metricConfig?.label} Trend</Text>
        <LineChart
          data={{
            labels: dayLabels,
            datasets: [{ data: selectedData.values }],
          }}
          width={CHART_WIDTH}
          height={200}
          yAxisSuffix=""
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: colors.surface,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            labelColor: () => colors.textSecondary,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: colors.primary,
            },
          }}
          bezier
          style={styles.chart}
          fromZero
          segments={5}
        />
        <View style={styles.chartLegend}>
          <Text style={styles.chartLegendText}>
            Average: {selectedData.average.toFixed(1)}
          </Text>
          <View style={styles.trendBadge}>
            <Ionicons
              name={getTrendIcon(selectedData.trend)}
              size={16}
              color={getTrendColor(selectedData.trend, metricConfig?.invertedScale || false)}
            />
            <Text
              style={[
                styles.trendText,
                { color: getTrendColor(selectedData.trend, metricConfig?.invertedScale || false) },
              ]}
            >
              {selectedData.trend.charAt(0).toUpperCase() + selectedData.trend.slice(1)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Insights */}
      <Text style={styles.sectionTitle}>Insights</Text>
      <Card style={styles.insightsCard}>
        {mockWeeklySummary.insights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <Ionicons name="bulb" size={20} color={colors.connection} />
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
      </Card>

      {/* Top Actions */}
      <Text style={styles.sectionTitle}>Top Actions This Week</Text>
      <Card style={styles.topActionsCard}>
        {mockWeeklySummary.topActions.map((action, index) => (
          <View key={index} style={styles.topActionItem}>
            <View style={styles.topActionRank}>
              <Text style={styles.topActionRankText}>{index + 1}</Text>
            </View>
            <Text style={styles.topActionTitle}>{action.title}</Text>
            <View style={styles.topActionCount}>
              <Ionicons name="checkmark" size={16} color={colors.success} />
              <Text style={styles.topActionCountText}>{action.completedCount}x</Text>
            </View>
          </View>
        ))}
      </Card>
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
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  weekHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  weekText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.full,
  },
  shareButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  metricSelector: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.md,
  },
  metricSelectorContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  metricChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 100,
  },
  metricChipSelected: {
    backgroundColor: colors.primary,
  },
  metricChipLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  metricChipLabelSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  metricChipValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metricChipAvg: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  metricChipAvgSelected: {
    color: colors.textInverse,
  },
  chartCard: {
    marginBottom: spacing.lg,
  },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  chart: {
    marginLeft: -spacing.md,
    borderRadius: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chartLegendText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  trendText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  insightsCard: {
    marginBottom: spacing.lg,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  insightText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: 22,
  },
  topActionsCard: {},
  topActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topActionRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  topActionRankText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  topActionTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  topActionCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topActionCountText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
});
