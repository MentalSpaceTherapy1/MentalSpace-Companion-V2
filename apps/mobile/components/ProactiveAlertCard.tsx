/**
 * Proactive Alert Card Component
 * Displays predictive alerts on the home screen with actionable options
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import type { ProactiveAlert } from '../services/patternPrediction';

interface ProactiveAlertCardProps {
  alert: ProactiveAlert;
  onAcceptLighterPlan?: () => void;
  onKeepNormal?: () => void;
  onDismiss: () => void;
}

export function ProactiveAlertCard({
  alert,
  onAcceptLighterPlan,
  onKeepNormal,
  onDismiss,
}: ProactiveAlertCardProps) {
  const severityConfig = getSeverityConfig(alert.severity);

  return (
    <Card style={[styles.container, { borderLeftColor: severityConfig.color }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: severityConfig.bgColor }]}>
          <Ionicons name={severityConfig.icon} size={24} color={severityConfig.color} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>{alert.title}</Text>
          {alert.type === 'tomorrow_hard' && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Prediction</Text>
            </View>
          )}
        </View>

        <Pressable onPress={onDismiss} hitSlop={8} style={styles.dismissButton}>
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Message */}
      <Text style={styles.message}>{alert.message}</Text>

      {/* Action Buttons */}
      {alert.actionable && (
        <View style={styles.actions}>
          {alert.type === 'tomorrow_hard' || alert.type === 'trigger_approaching' ? (
            <>
              <Button
                title="Accept Lighter Plan"
                onPress={onAcceptLighterPlan ?? (() => {})}
                style={styles.primaryButton}
                variant="primary"
              />
              <Button
                title="Keep Normal"
                onPress={onKeepNormal ?? (() => {})}
                style={styles.actionButton}
                variant="outline"
              />
            </>
          ) : alert.type === 'recovery_mode' ? (
            <Button
              title="View Adjusted Plan"
              onPress={onAcceptLighterPlan ?? (() => {})}
              style={styles.fullWidth}
              variant="primary"
            />
          ) : null}
        </View>
      )}

      {/* Additional Info */}
      {alert.triggerDate && (
        <View style={styles.footer}>
          <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
          <Text style={styles.footerText}>
            {new Date(alert.triggerDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
      )}
    </Card>
  );
}

function getSeverityConfig(severity: 'info' | 'warning' | 'critical') {
  switch (severity) {
    case 'critical':
      return {
        icon: 'warning' as const,
        color: colors.error,
        bgColor: colors.error + '15',
      };
    case 'warning':
      return {
        icon: 'alert-circle' as const,
        color: colors.connection,
        bgColor: colors.connection + '15',
      };
    case 'info':
    default:
      return {
        icon: 'information-circle' as const,
        color: colors.primary,
        bgColor: colors.primary + '15',
      };
  }
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  badge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  dismissButton: {
    padding: spacing.xs,
  },
  message: {
    fontSize: typography.fontSize.base,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 1.2, // Slightly larger for primary action
  },
  fullWidth: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
});
