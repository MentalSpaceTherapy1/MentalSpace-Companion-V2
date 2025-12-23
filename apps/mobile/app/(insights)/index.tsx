/**
 * Insights Dashboard Screen
 * Analytics, trends, patterns, and achievements
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
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import {
  useInsightsStore,
  Insight,
  MetricTrend,
  Achievement,
} from '../../stores/insightsStore';
import { triggerHaptic } from '../../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.md * 4;

const METRIC_COLORS: Record<string, string> = {
  mood: colors.primary,
  stress: colors.error,
  sleep: colors.coping,
  energy: colors.lifestyle,
  focus: colors.connection,
  anxiety: '#F59E0B',
};

const METRIC_LABELS: Record<string, string> = {
  mood: 'Mood',
  stress: 'Stress',
  sleep: 'Sleep',
  energy: 'Energy',
  focus: 'Focus',
  anxiety: 'Anxiety',
};

export default function InsightsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('mood');

  const {
    trends,
    correlations,
    insights,
    achievements,
    isLoading,
    lastUpdated,
    generateInsights,
    getBestDay,
    getWorstDay,
    getMostImprovedMetric,
  } = useInsightsStore();

  useEffect(() => {
    generateInsights();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    triggerHaptic('light');
    await generateInsights();
    setRefreshing(false);
  };

  const selectedTrend = trends.find((t) => t.metric === selectedMetric);
  const bestDay = getBestDay();
  const worstDay = getWorstDay();
  const mostImproved = getMostImprovedMetric();
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);
  const inProgressAchievements = achievements.filter((a) => !a.unlockedAt && a.progress > 0);

  const renderInsightCard = (insight: Insight) => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'trending-up': 'trending-up',
      'trending-down': 'trending-down',
      'alert-circle': 'alert-circle',
      'analytics': 'analytics',
      'moon': 'moon',
      'fitness': 'fitness',
      'bulb': 'bulb',
    };

    return (
      <Card
        key={insight.id}
        style={[styles.insightCard, { borderLeftColor: insight.color }]}
        onPress={
          insight.actionRoute
            ? () => router.push(insight.actionRoute as any)
            : undefined
        }
      >
        <View style={styles.insightHeader}>
          <View
            style={[styles.insightIcon, { backgroundColor: insight.color + '20' }]}
          >
            <Ionicons
              name={iconMap[insight.icon] || 'bulb'}
              size={20}
              color={insight.color}
            />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDescription}>{insight.description}</Text>
          </View>
        </View>
        {insight.actionLabel && (
          <Pressable style={styles.insightAction}>
            <Text style={[styles.insightActionText, { color: insight.color }]}>
              {insight.actionLabel}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={insight.color} />
          </Pressable>
        )}
      </Card>
    );
  };

  const renderAchievementBadge = (achievement: Achievement) => (
    <View key={achievement.id} style={styles.achievementBadge}>
      <View
        style={[
          styles.achievementIcon,
          achievement.unlockedAt
            ? styles.achievementIconUnlocked
            : styles.achievementIconLocked,
        ]}
      >
        <Ionicons
          name={achievement.icon as keyof typeof Ionicons.glyphMap}
          size={24}
          color={achievement.unlockedAt ? colors.connection : colors.textTertiary}
        />
      </View>
      <Text
        style={[
          styles.achievementTitle,
          !achievement.unlockedAt && styles.achievementTitleLocked,
        ]}
        numberOfLines={1}
      >
        {achievement.title}
      </Text>
      {!achievement.unlockedAt && (
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${achievement.progress}%` }]}
          />
        </View>
      )}
    </View>
  );

  const getTrendIcon = (trend: MetricTrend['trend']): keyof typeof Ionicons.glyphMap => {
    switch (trend) {
      case 'improving':
        return 'trending-up';
      case 'declining':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend: MetricTrend['trend'], metric: string): string => {
    const inverted = ['stress', 'anxiety'].includes(metric);
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
      showsVerticalScrollIndicator={false}
    >
      {/* Quick Stats */}
      <View style={styles.quickStats}>
        {bestDay && (
          <Card style={styles.quickStatCard}>
            <Ionicons name="sunny" size={24} color={colors.connection} />
            <Text style={styles.quickStatValue}>{bestDay}</Text>
            <Text style={styles.quickStatLabel}>Best Day</Text>
          </Card>
        )}
        {mostImproved && (
          <Card style={styles.quickStatCard}>
            <Ionicons name="trending-up" size={24} color={colors.success} />
            <Text style={styles.quickStatValue}>
              {METRIC_LABELS[mostImproved]}
            </Text>
            <Text style={styles.quickStatLabel}>Most Improved</Text>
          </Card>
        )}
      </View>

      {/* Metric Selector */}
      <Text style={styles.sectionTitle}>Metric Trends</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.metricSelector}
        contentContainerStyle={styles.metricSelectorContent}
      >
        {trends.map((trend) => (
          <Pressable
            key={trend.metric}
            style={[
              styles.metricChip,
              selectedMetric === trend.metric && styles.metricChipSelected,
            ]}
            onPress={() => {
              triggerHaptic('light');
              setSelectedMetric(trend.metric);
            }}
          >
            <Text
              style={[
                styles.metricChipText,
                selectedMetric === trend.metric && styles.metricChipTextSelected,
              ]}
            >
              {METRIC_LABELS[trend.metric]}
            </Text>
            <Ionicons
              name={getTrendIcon(trend.trend)}
              size={14}
              color={
                selectedMetric === trend.metric
                  ? colors.textInverse
                  : getTrendColor(trend.trend, trend.metric)
              }
            />
          </Pressable>
        ))}
      </ScrollView>

      {/* Trend Chart */}
      {selectedTrend && selectedTrend.dataPoints.length > 0 && (
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>
              {METRIC_LABELS[selectedMetric]} - Last 7 Days
            </Text>
            <View style={styles.trendBadge}>
              <Ionicons
                name={getTrendIcon(selectedTrend.trend)}
                size={16}
                color={getTrendColor(selectedTrend.trend, selectedMetric)}
              />
              <Text
                style={[
                  styles.trendText,
                  { color: getTrendColor(selectedTrend.trend, selectedMetric) },
                ]}
              >
                {selectedTrend.changePercent > 0 ? '+' : ''}
                {selectedTrend.changePercent}%
              </Text>
            </View>
          </View>

          <LineChart
            data={{
              labels: ['', '', '', '', '', '', ''],
              datasets: [{ data: selectedTrend.dataPoints }],
            }}
            width={CHART_WIDTH}
            height={160}
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: () => METRIC_COLORS[selectedMetric] || colors.primary,
              labelColor: () => colors.textSecondary,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: METRIC_COLORS[selectedMetric] || colors.primary,
              },
            }}
            bezier
            withInnerLines={false}
            withOuterLines={false}
            fromZero
            segments={3}
            style={styles.chart}
          />

          <View style={styles.chartStats}>
            <View style={styles.chartStat}>
              <Text style={styles.chartStatLabel}>Current Avg</Text>
              <Text style={styles.chartStatValue}>
                {selectedTrend.currentAverage}
              </Text>
            </View>
            <View style={styles.chartStat}>
              <Text style={styles.chartStatLabel}>Previous Avg</Text>
              <Text style={styles.chartStatValue}>
                {selectedTrend.previousAverage}
              </Text>
            </View>
            <View style={styles.chartStat}>
              <Text style={styles.chartStatLabel}>Change</Text>
              <Text
                style={[
                  styles.chartStatValue,
                  { color: getTrendColor(selectedTrend.trend, selectedMetric) },
                ]}
              >
                {selectedTrend.change > 0 ? '+' : ''}
                {selectedTrend.change}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Your Insights</Text>
          {insights.map(renderInsightCard)}
        </>
      )}

      {/* Correlations */}
      {correlations.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Patterns Discovered</Text>
          <Card style={styles.correlationsCard}>
            {correlations.slice(0, 3).map((correlation, index) => (
              <View
                key={`${correlation.metric1}-${correlation.metric2}`}
                style={[
                  styles.correlationRow,
                  index < Math.min(correlations.length, 3) - 1 &&
                    styles.correlationRowBorder,
                ]}
              >
                <View style={styles.correlationMetrics}>
                  <Text style={styles.correlationMetric}>
                    {METRIC_LABELS[correlation.metric1]}
                  </Text>
                  <Ionicons
                    name={correlation.correlation > 0 ? 'link' : 'git-compare'}
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.correlationMetric}>
                    {METRIC_LABELS[correlation.metric2]}
                  </Text>
                </View>
                <View
                  style={[
                    styles.strengthBadge,
                    {
                      backgroundColor:
                        correlation.strength === 'strong'
                          ? colors.success + '20'
                          : colors.connection + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.strengthText,
                      {
                        color:
                          correlation.strength === 'strong'
                            ? colors.success
                            : colors.connection,
                      },
                    ]}
                  >
                    {correlation.strength}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </>
      )}

      {/* Achievements */}
      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.achievementsGrid}>
        {achievements.slice(0, 8).map(renderAchievementBadge)}
      </View>

      {/* Empty State */}
      {trends.length === 0 && !isLoading && (
        <Card style={styles.emptyCard}>
          <Ionicons name="analytics-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>Not Enough Data Yet</Text>
          <Text style={styles.emptyText}>
            Complete a few more check-ins to see your personalized insights and
            trends.
          </Text>
        </Card>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <Text style={styles.lastUpdated}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Text>
      )}
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
  quickStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickStatCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  quickStatValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  quickStatLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  metricSelector: {
    marginBottom: spacing.md,
    marginHorizontal: -spacing.md,
  },
  metricSelectorContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  metricChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  metricChipTextSelected: {
    color: colors.textInverse,
    fontWeight: typography.fontWeight.medium,
  },
  chartCard: {
    marginBottom: spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
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
  chart: {
    marginLeft: -spacing.md,
    borderRadius: borderRadius.md,
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chartStat: {
    alignItems: 'center',
  },
  chartStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  chartStatValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  insightCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  insightActionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  correlationsCard: {
    marginBottom: spacing.lg,
  },
  correlationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  correlationRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  correlationMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  correlationMetric: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  strengthBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  strengthText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  achievementBadge: {
    width: (SCREEN_WIDTH - spacing.md * 2 - spacing.md * 3) / 4,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  achievementIconUnlocked: {
    backgroundColor: colors.connection + '20',
  },
  achievementIconLocked: {
    backgroundColor: colors.border,
  },
  achievementTitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: colors.textTertiary,
  },
  progressBar: {
    width: '100%',
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 1.5,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.connection,
    borderRadius: 1.5,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  lastUpdated: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
