/**
 * Sleep Tips Screen
 * Personalized sleep improvement tips
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useSleepStore, SLEEP_TIPS, SLEEP_FACTORS } from '../../stores/sleepStore';

export default function SleepTipsScreen() {
  const { records, calculateStats } = useSleepStore();

  const stats = calculateStats(14); // Last 2 weeks
  const recentRecords = records.slice(0, 7);

  // Analyze recent factors
  const factorCounts: Record<string, number> = {};
  recentRecords.forEach((record) => {
    record.factors.forEach((factor) => {
      factorCounts[factor] = (factorCounts[factor] || 0) + 1;
    });
  });

  // Get most common negative factors
  const commonNegativeFactors = Object.entries(factorCounts)
    .filter(([factor]) => {
      const factorInfo = SLEEP_FACTORS.find((f) => f.key === factor);
      return factorInfo && !factorInfo.positive;
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([factor]) => factor);

  // Personalized tips based on data
  const getPersonalizedTips = () => {
    const tips: typeof SLEEP_TIPS = [];

    // Low quality sleep
    if (stats.averageQuality < 6) {
      tips.push(
        SLEEP_TIPS.find((t) => t.id === 'bedroom_environment')!,
        SLEEP_TIPS.find((t) => t.id === 'wind_down')!
      );
    }

    // Low consistency
    if (stats.consistencyScore < 70) {
      tips.push(SLEEP_TIPS.find((t) => t.id === 'consistent_schedule')!);
    }

    // Short sleep duration
    if (stats.averageDuration < 420) {
      // Less than 7 hours
      tips.push(SLEEP_TIPS.find((t) => t.id === 'dont_force_sleep')!);
    }

    // Based on factors
    if (commonNegativeFactors.includes('caffeine')) {
      tips.push(SLEEP_TIPS.find((t) => t.id === 'limit_caffeine')!);
    }
    if (commonNegativeFactors.includes('screen_time')) {
      tips.push(SLEEP_TIPS.find((t) => t.id === 'limit_screens')!);
    }
    if (commonNegativeFactors.includes('alcohol')) {
      tips.push(SLEEP_TIPS.find((t) => t.id === 'avoid_alcohol')!);
    }
    if (commonNegativeFactors.includes('nap')) {
      tips.push(SLEEP_TIPS.find((t) => t.id === 'nap_wisely')!);
    }
    if (commonNegativeFactors.includes('exercise')) {
      tips.push(SLEEP_TIPS.find((t) => t.id === 'exercise_timing')!);
    }

    // Remove duplicates and undefined
    return [...new Set(tips.filter(Boolean))];
  };

  const personalizedTips = getPersonalizedTips();
  const otherTips = SLEEP_TIPS.filter(
    (tip) => !personalizedTips.find((p) => p.id === tip.id)
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="bulb" size={32} color={colors.connection} />
        </View>
        <Text style={styles.headerTitle}>Sleep Better Tonight</Text>
        <Text style={styles.headerSubtitle}>
          Personalized tips to improve your sleep quality
        </Text>
      </View>

      {/* Personalized Tips */}
      {personalizedTips.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={20} color={colors.connection} />
            <Text style={styles.sectionTitle}>Recommended for You</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Based on your recent sleep patterns
          </Text>
          {personalizedTips.map((tip) => (
            <TipCard key={tip.id} tip={tip} highlighted />
          ))}
        </View>
      )}

      {/* Common Factors Warning */}
      {commonNegativeFactors.length > 0 && (
        <Card style={styles.warningCard}>
          <Ionicons name="analytics" size={24} color={colors.warning} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Patterns Noticed</Text>
            <Text style={styles.warningText}>
              You've frequently logged these factors that may affect sleep:{' '}
              {commonNegativeFactors
                .map((f) => SLEEP_FACTORS.find((sf) => sf.key === f)?.label)
                .join(', ')}
            </Text>
          </View>
        </Card>
      )}

      {/* All Tips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="list" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>All Sleep Tips</Text>
        </View>
        {(personalizedTips.length > 0 ? otherTips : SLEEP_TIPS).map((tip) => (
          <TipCard key={tip.id} tip={tip} />
        ))}
      </View>

      {/* Sleep Hygiene Summary */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Sleep Hygiene Checklist</Text>
        <View style={styles.checklistItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.checklistText}>Keep bedroom cool and dark</Text>
        </View>
        <View style={styles.checklistItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.checklistText}>Consistent sleep schedule</Text>
        </View>
        <View style={styles.checklistItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.checklistText}>Limit caffeine after 2pm</Text>
        </View>
        <View style={styles.checklistItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.checklistText}>No screens 30-60 min before bed</Text>
        </View>
        <View style={styles.checklistItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.checklistText}>Wind-down routine</Text>
        </View>
        <View style={styles.checklistItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.checklistText}>Exercise regularly (not late)</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

function TipCard({
  tip,
  highlighted = false,
}: {
  tip: (typeof SLEEP_TIPS)[0];
  highlighted?: boolean;
}) {
  return (
    <Card
      style={[
        styles.tipCard,
        highlighted && styles.tipCardHighlighted,
      ]}
    >
      <View
        style={[
          styles.tipIcon,
          highlighted && styles.tipIconHighlighted,
        ]}
      >
        <Ionicons
          name={tip.icon as any}
          size={24}
          color={highlighted ? colors.connection : colors.primary}
        />
      </View>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{tip.title}</Text>
        <Text style={styles.tipDescription}>{tip.description}</Text>
        <View style={styles.tipCategory}>
          <Text style={styles.tipCategoryText}>{tip.category}</Text>
        </View>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.connection + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    marginLeft: 28,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.xl,
    backgroundColor: colors.warning + '10',
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning,
    marginBottom: 4,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  tipCard: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  tipCardHighlighted: {
    backgroundColor: colors.connection + '10',
    borderWidth: 1,
    borderColor: colors.connection + '30',
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  tipIconHighlighted: {
    backgroundColor: colors.connection + '20',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  tipCategory: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tipCategoryText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  summaryCard: {
    backgroundColor: colors.success + '10',
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  checklistText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
});
