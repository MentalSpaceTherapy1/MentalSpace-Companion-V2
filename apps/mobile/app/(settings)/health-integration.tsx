/**
 * Health Integration Settings Screen
 * Manages Apple Health / Google Fit integration
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../utils/haptics';
import { useHealthStore } from '../../stores/healthStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { formatDuration } from '../../stores/sleepStore';

export default function HealthIntegrationScreen() {
  const router = useRouter();
  const {
    isConnected,
    isAvailable,
    platform,
    permissions,
    lastSyncDate,
    isSyncing,
    sleepData,
    stepsData,
    checkAvailability,
    connectHealth,
    disconnectHealth,
    syncHealthData,
  } = useHealthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    initializeHealthCheck();
  }, []);

  const initializeHealthCheck = async () => {
    setIsLoading(true);
    await checkAvailability();
    setIsLoading(false);
  };

  const handleToggleConnection = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isConnected) {
      // Disconnect
      const confirmDisconnect = () => {
        disconnectHealth();
      };

      if (Platform.OS === 'web') {
        if (window.confirm('Are you sure you want to disconnect health integration?')) {
          confirmDisconnect();
        }
      } else {
        Alert.alert(
          'Disconnect Health Integration',
          'This will remove access to your health data. You can reconnect anytime.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disconnect',
              style: 'destructive',
              onPress: confirmDisconnect,
            },
          ]
        );
      }
    } else {
      // Connect
      setIsConnecting(true);
      const result = await connectHealth();
      setIsConnecting(false);

      if (!result.success) {
        if (Platform.OS === 'web') {
          window.alert(result.error || 'Failed to connect health integration');
        } else {
          Alert.alert('Connection Failed', result.error || 'Failed to connect health integration');
        }
      }
    }
  };

  const handleSync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await syncHealthData(7);

    if (!result.success) {
      if (Platform.OS === 'web') {
        window.alert(result.error || 'Failed to sync health data');
      } else {
        Alert.alert('Sync Failed', result.error || 'Failed to sync health data');
      }
    }
  };

  const formatLastSync = (dateString: string | null): string => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  };

  const getPlatformName = (): string => {
    switch (platform) {
      case 'ios':
        return 'Apple Health';
      case 'android':
        return 'Google Health Connect';
      case 'web':
        return 'Web (Not Supported)';
      default:
        return 'Not Supported';
    }
  };

  const getPlatformIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (platform) {
      case 'ios':
        return 'heart-circle';
      case 'android':
        return 'fitness';
      default:
        return 'close-circle';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Checking health integration...</Text>
      </View>
    );
  }

  // Not available on this platform
  if (!isAvailable) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.unavailableCard}>
          <Ionicons name="information-circle" size={64} color={colors.textTertiary} />
          <Text style={styles.unavailableTitle}>Health Integration Unavailable</Text>
          <Text style={styles.unavailableMessage}>
            {platform === 'web'
              ? 'Health data integration is not available on web browsers. Please use the mobile app on iOS or Android.'
              : platform === 'ios'
              ? 'Apple Health integration is coming soon. Stay tuned for updates!'
              : 'Health integration is not supported on this device.'}
          </Text>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>What is Health Integration?</Text>
          <Text style={styles.infoText}>
            Connect your health data to automatically track sleep patterns and daily activity. This helps us provide
            better insights and pre-fill your check-ins.
          </Text>

          <View style={styles.featureList}>
            <FeatureItem icon="moon" text="Automatic sleep tracking" />
            <FeatureItem icon="walk" text="Daily step count" />
            <FeatureItem icon="heart" text="Heart rate monitoring" />
            <FeatureItem icon="analytics" text="Health insights and trends" />
          </View>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Connection Toggle */}
      <Card style={styles.connectionCard}>
        <View style={styles.connectionHeader}>
          <View style={styles.platformInfo}>
            <Ionicons name={getPlatformIcon()} size={32} color={colors.primary} />
            <View style={styles.platformText}>
              <Text style={styles.platformName}>{getPlatformName()}</Text>
              <Text style={styles.platformStatus}>
                {isConnected ? 'Connected' : 'Not Connected'}
              </Text>
            </View>
          </View>
          <Switch
            value={isConnected}
            onValueChange={handleToggleConnection}
            trackColor={{ true: colors.primary, false: colors.border }}
            disabled={isConnecting}
          />
        </View>

        {isConnected && (
          <>
            <View style={styles.divider} />
            <View style={styles.syncSection}>
              <View style={styles.syncInfo}>
                <Ionicons name="sync" size={20} color={colors.textSecondary} />
                <Text style={styles.syncText}>Last sync: {formatLastSync(lastSyncDate)}</Text>
              </View>
              <Button
                title={isSyncing ? 'Syncing...' : 'Sync Now'}
                variant="outline"
                size="sm"
                onPress={handleSync}
                disabled={isSyncing}
                loading={isSyncing}
              />
            </View>
          </>
        )}
      </Card>

      {isConnected && (
        <>
          {/* Permissions */}
          <Text style={styles.sectionTitle}>Data Access</Text>
          <Card style={styles.permissionsCard}>
            <PermissionRow
              icon="moon"
              title="Sleep Data"
              granted={permissions.sleep}
              description="Sleep duration, quality, and stages"
            />
            <View style={styles.permissionDivider} />
            <PermissionRow
              icon="walk"
              title="Steps & Activity"
              granted={permissions.steps}
              description="Daily step count and movement"
            />
            <View style={styles.permissionDivider} />
            <PermissionRow
              icon="heart"
              title="Heart Rate"
              granted={permissions.heartRate}
              description="Resting and active heart rate"
            />
          </Card>

          {/* Recent Data Summary */}
          <Text style={styles.sectionTitle}>Recent Data</Text>
          <Card style={styles.summaryCard}>
            <DataSummaryRow
              icon="moon"
              label="Sleep Sessions"
              value={sleepData.length.toString()}
              subtitle={
                sleepData.length > 0
                  ? `Last: ${formatDuration(sleepData[0].duration)}`
                  : 'No data yet'
              }
            />
            <View style={styles.permissionDivider} />
            <DataSummaryRow
              icon="walk"
              label="Daily Steps"
              value={stepsData.length > 0 ? stepsData[stepsData.length - 1].steps.toLocaleString() : '0'}
              subtitle={stepsData.length > 0 ? 'Today' : 'No data yet'}
            />
          </Card>
        </>
      )}

      {/* Privacy Information */}
      <Text style={styles.sectionTitle}>Privacy & Security</Text>
      <Card style={styles.privacyCard}>
        <Ionicons name="shield-checkmark" size={48} color={colors.success} style={styles.privacyIcon} />
        <Text style={styles.privacyTitle}>Your Data is Private</Text>
        <Text style={styles.privacyText}>
          Health data is stored securely on your device and synced only when you use the app. We never share your
          health information with third parties.
        </Text>

        <View style={styles.privacyList}>
          <PrivacyItem icon="lock-closed" text="End-to-end encrypted" />
          <PrivacyItem icon="eye-off" text="Never sold or shared" />
          <PrivacyItem icon="trash" text="Delete anytime" />
        </View>
      </Card>

      {/* What We Track */}
      <Text style={styles.sectionTitle}>How We Use Your Health Data</Text>
      <Card style={styles.usageCard}>
        <UsageItem
          icon="moon"
          title="Sleep Quality"
          description="Pre-fill your daily check-in with sleep duration and quality"
        />
        <View style={styles.permissionDivider} />
        <UsageItem
          icon="analytics"
          title="Insights & Trends"
          description="Identify patterns between sleep, activity, and mental wellness"
        />
        <View style={styles.permissionDivider} />
        <UsageItem
          icon="bulb"
          title="Personalized Recommendations"
          description="Get tailored suggestions based on your health data"
        />
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          You can disconnect health integration at any time from this screen.
        </Text>
      </View>
    </ScrollView>
  );
}

// Sub-components

function FeatureItem({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function PermissionRow({
  icon,
  title,
  granted,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  granted: boolean;
  description: string;
}) {
  return (
    <View style={styles.permissionRow}>
      <View style={[styles.permissionIcon, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.permissionContent}>
        <Text style={styles.permissionTitle}>{title}</Text>
        <Text style={styles.permissionDescription}>{description}</Text>
      </View>
      <Ionicons
        name={granted ? 'checkmark-circle' : 'close-circle'}
        size={24}
        color={granted ? colors.success : colors.textTertiary}
      />
    </View>
  );
}

function DataSummaryRow({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <View style={[styles.summaryIcon, { backgroundColor: colors.secondary + '15' }]}>
        <Ionicons name={icon} size={24} color={colors.secondary} />
      </View>
      <View style={styles.summaryContent}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summarySubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function PrivacyItem({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.privacyItem}>
      <Ionicons name={icon} size={18} color={colors.success} />
      <Text style={styles.privacyItemText}>{text}</Text>
    </View>
  );
}

function UsageItem({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.usageRow}>
      <View style={[styles.usageIcon, { backgroundColor: colors.connection + '15' }]}>
        <Ionicons name={icon} size={24} color={colors.connection} />
      </View>
      <View style={styles.usageContent}>
        <Text style={styles.usageTitle}>{title}</Text>
        <Text style={styles.usageDescription}>{description}</Text>
      </View>
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Unavailable state
  unavailableCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  unavailableTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  unavailableMessage: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },

  // Info card
  infoCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  infoTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  featureList: {
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },

  // Connection card
  connectionCard: {
    padding: spacing.md,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  platformText: {
    flex: 1,
  },
  platformName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  platformStatus: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  syncSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  syncText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },

  // Permissions
  permissionsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  permissionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  permissionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  permissionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 44 + spacing.md,
  },

  // Summary
  summaryCard: {
    padding: 0,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  summarySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },

  // Privacy
  privacyCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  privacyIcon: {
    marginBottom: spacing.sm,
  },
  privacyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  privacyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  privacyList: {
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  privacyItemText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },

  // Usage
  usageCard: {
    padding: 0,
    overflow: 'hidden',
  },
  usageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  usageIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  usageContent: {
    flex: 1,
  },
  usageTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  usageDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 20,
  },

  // Footer
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.md,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
