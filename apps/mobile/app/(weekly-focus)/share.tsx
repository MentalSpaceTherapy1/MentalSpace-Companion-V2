/**
 * Share Weekly Card Screen
 * Create and share a weekly wellness summary with privacy controls
 */

import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

type PrivacyMode = 'full' | 'partial' | 'minimal';

interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  checkinsCompleted: number;
  totalDays: number;
  actionsCompleted: number;
  totalActions: number;
  averageMood: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  topAction: string;
  streakDays: number;
  focusArea: string;
  reflection?: string;
}

// Mock data - would come from store in real implementation
const mockStats: WeeklyStats = {
  weekStart: '2024-12-16',
  weekEnd: '2024-12-22',
  checkinsCompleted: 6,
  totalDays: 7,
  actionsCompleted: 15,
  totalActions: 21,
  averageMood: 7.2,
  moodTrend: 'improving',
  topAction: 'Morning Meditation',
  streakDays: 12,
  focusArea: 'Mindfulness',
  reflection: 'This week I focused on being more present. Daily meditation helped me feel more grounded.',
};

const PRIVACY_MODES: { id: PrivacyMode; label: string; description: string; icon: string }[] = [
  {
    id: 'full',
    label: 'Full Details',
    description: 'Share all stats including mood scores and reflection',
    icon: 'eye',
  },
  {
    id: 'partial',
    label: 'Highlights Only',
    description: 'Share achievements without specific mood numbers',
    icon: 'eye-off',
  },
  {
    id: 'minimal',
    label: 'Just Progress',
    description: 'Only show completion rates and streak',
    icon: 'shield-checkmark',
  },
];

export default function ShareWeeklyCardScreen() {
  const router = useRouter();
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>('partial');
  const [stats] = useState<WeeklyStats>(mockStats);
  const [isSharing, setIsSharing] = useState(false);

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  const getCompletionPercentage = () => {
    return Math.round((stats.actionsCompleted / stats.totalActions) * 100);
  };

  const getTrendIcon = () => {
    switch (stats.moodTrend) {
      case 'improving':
        return 'trending-up';
      case 'declining':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = () => {
    switch (stats.moodTrend) {
      case 'improving':
        return colors.success;
      case 'declining':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const generateShareText = () => {
    let text = `My MentalSpace Weekly Summary\n${formatDateRange(stats.weekStart, stats.weekEnd)}\n\n`;

    if (privacyMode === 'full') {
      text += `Check-ins: ${stats.checkinsCompleted}/${stats.totalDays} days\n`;
      text += `Actions: ${stats.actionsCompleted}/${stats.totalActions} completed (${getCompletionPercentage()}%)\n`;
      text += `Average Mood: ${stats.averageMood.toFixed(1)}/10 (${stats.moodTrend})\n`;
      text += `Focus: ${stats.focusArea}\n`;
      text += `Top Action: ${stats.topAction}\n`;
      text += `Current Streak: ${stats.streakDays} days\n`;
      if (stats.reflection) {
        text += `\nReflection: "${stats.reflection}"`;
      }
    } else if (privacyMode === 'partial') {
      text += `Check-ins: ${stats.checkinsCompleted}/${stats.totalDays} days\n`;
      text += `Actions: ${getCompletionPercentage()}% completed\n`;
      text += `Mood Trend: ${stats.moodTrend === 'improving' ? 'Getting better!' : stats.moodTrend === 'stable' ? 'Steady' : 'Working through challenges'}\n`;
      text += `Focus: ${stats.focusArea}\n`;
      text += `Current Streak: ${stats.streakDays} days\n`;
    } else {
      text += `Weekly Progress: ${getCompletionPercentage()}% complete\n`;
      text += `Current Streak: ${stats.streakDays} days\n`;
      text += `Status: Making progress!\n`;
    }

    text += `\n---\nTracking my wellness with MentalSpace`;
    return text;
  };

  const handleShare = async () => {
    setIsSharing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const shareText = generateShareText();

    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: 'My MentalSpace Weekly Summary',
            text: shareText,
          });
        } else {
          await navigator.clipboard.writeText(shareText);
          window.alert('Weekly summary copied to clipboard!');
        }
      } else {
        await Share.share({
          message: shareText,
          title: 'My MentalSpace Weekly Summary',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyToClipboard = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const shareText = generateShareText();

    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(shareText);
        window.alert('Copied to clipboard!');
      } else {
        await Share.share({
          message: shareText,
        });
      }
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const handleSendToContact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS === 'web') {
      window.alert('This would open the trusted contacts list to select recipients.');
    } else {
      Alert.alert(
        'Send to Trusted Contact',
        'This would open the trusted contacts list to select recipients.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Share Weekly Card</Text>
          <Text style={styles.subtitle}>
            Share your progress with friends, family, or your therapist
          </Text>
        </View>

        {/* Privacy Mode Selection */}
        <Text style={styles.sectionTitle}>Privacy Level</Text>
        <View style={styles.privacyOptions}>
          {PRIVACY_MODES.map((mode) => (
            <Pressable
              key={mode.id}
              style={[
                styles.privacyOption,
                privacyMode === mode.id && styles.privacyOptionSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPrivacyMode(mode.id);
              }}
            >
              <View style={styles.privacyHeader}>
                <Ionicons
                  name={mode.icon as any}
                  size={20}
                  color={privacyMode === mode.id ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.privacyLabel,
                    privacyMode === mode.id && styles.privacyLabelSelected,
                  ]}
                >
                  {mode.label}
                </Text>
                {privacyMode === mode.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </View>
              <Text style={styles.privacyDescription}>{mode.description}</Text>
            </Pressable>
          ))}
        </View>

        {/* Preview Card */}
        <Text style={styles.sectionTitle}>Preview</Text>
        <Card style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandText}>MentalSpace</Text>
            </View>
            <Text style={styles.previewDate}>
              {formatDateRange(stats.weekStart, stats.weekEnd)}
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {/* Check-ins */}
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={styles.statValue}>
                {stats.checkinsCompleted}/{stats.totalDays}
              </Text>
              <Text style={styles.statLabel}>Check-ins</Text>
            </View>

            {/* Actions */}
            <View style={styles.statItem}>
              <Ionicons name="checkmark-done" size={20} color={colors.secondary} />
              <Text style={styles.statValue}>{getCompletionPercentage()}%</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>

            {/* Streak */}
            <View style={styles.statItem}>
              <Ionicons name="flame" size={20} color={colors.warning} />
              <Text style={styles.statValue}>{stats.streakDays}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>

          {/* Mood (only in full mode) */}
          {privacyMode === 'full' && (
            <View style={styles.moodSection}>
              <View style={styles.moodRow}>
                <Text style={styles.moodLabel}>Average Mood</Text>
                <View style={styles.moodValue}>
                  <Text style={styles.moodNumber}>{stats.averageMood.toFixed(1)}</Text>
                  <Text style={styles.moodMax}>/10</Text>
                  <Ionicons
                    name={getTrendIcon() as any}
                    size={18}
                    color={getTrendColor()}
                    style={styles.trendIcon}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Focus Area (full and partial) */}
          {privacyMode !== 'minimal' && (
            <View style={styles.focusSection}>
              <Text style={styles.focusLabel}>Focus Area</Text>
              <View style={styles.focusBadge}>
                <Ionicons name="compass" size={16} color={colors.primary} />
                <Text style={styles.focusText}>{stats.focusArea}</Text>
              </View>
            </View>
          )}

          {/* Reflection (only in full mode) */}
          {privacyMode === 'full' && stats.reflection && (
            <View style={styles.reflectionSection}>
              <Text style={styles.reflectionLabel}>Reflection</Text>
              <Text style={styles.reflectionText}>"{stats.reflection}"</Text>
            </View>
          )}

          {/* Minimal mode message */}
          {privacyMode === 'minimal' && (
            <View style={styles.minimalMessage}>
              <Ionicons name="shield-checkmark" size={24} color={colors.success} />
              <Text style={styles.minimalText}>Making progress!</Text>
            </View>
          )}
        </Card>

        {/* Share Actions */}
        <View style={styles.shareActions}>
          <Button
            title="Share"
            onPress={handleShare}
            loading={isSharing}
            style={styles.shareButton}
          />
          <View style={styles.secondaryActions}>
            <Pressable style={styles.secondaryButton} onPress={handleCopyToClipboard}>
              <Ionicons name="copy-outline" size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Copy</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={handleSendToContact}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Send to Contact</Text>
            </Pressable>
          </View>
        </View>

        {/* Privacy Note */}
        <Card style={styles.privacyNote}>
          <Ionicons name="lock-closed" size={20} color={colors.primary} />
          <Text style={styles.privacyNoteText}>
            You control what you share. Your full data always stays private unless you choose to share it.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.md,
    marginLeft: -spacing.xs,
    padding: spacing.xs,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  privacyOptions: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  privacyOption: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  privacyOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  privacyLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  privacyLabelSelected: {
    color: colors.primary,
  },
  privacyDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.lg + spacing.sm,
  },
  previewCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  brandBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  brandText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textInverse,
  },
  previewDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  moodSection: {
    paddingTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  moodValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  moodNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  moodMax: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  trendIcon: {
    marginLeft: spacing.sm,
  },
  focusSection: {
    paddingTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  focusLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  focusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  reflectionSection: {
    paddingTop: spacing.md,
  },
  reflectionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  reflectionText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  minimalMessage: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  minimalText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
  shareActions: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  shareButton: {},
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primary + '08',
  },
  privacyNoteText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
