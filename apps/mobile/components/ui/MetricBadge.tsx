/**
 * MetricBadge Component
 * Displays a metric value with label and color
 */

import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface MetricBadgeProps {
  label: string;
  value: number;
  color: string;
  inverted?: boolean; // For metrics where lower is better (stress, anxiety)
}

export function MetricBadge({ label, value, color, inverted = false }: MetricBadgeProps) {
  const normalizedValue = (value / 10) * 100;
  const displayColor = inverted
    ? value <= 3
      ? colors.success
      : value >= 7
        ? colors.error
        : color
    : value >= 7
      ? colors.success
      : value <= 3
        ? colors.error
        : color;

  return (
    <View style={[styles.container, { backgroundColor: displayColor + '15' }]}>
      <Text style={[styles.value, { color: displayColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 70,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  value: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
