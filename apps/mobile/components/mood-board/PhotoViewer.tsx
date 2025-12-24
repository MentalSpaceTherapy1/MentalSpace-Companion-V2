/**
 * PhotoViewer Component
 * Full screen photo view with check-in metrics overlay
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { METRICS } from '@mentalspace/shared';
import type { Checkin } from '@mentalspace/shared';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface PhotoViewerProps {
  checkin: Checkin;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function PhotoViewer({ checkin, onClose, onNavigate, hasNext, hasPrev }: PhotoViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😊';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    return '😔';
  };

  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Photo */}
        {checkin.photoUri && (
          <>
            <Image
              source={{ uri: checkin.photoUri }}
              style={styles.photo}
              resizeMode="contain"
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
            />
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          </>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.textInverse} />
          </Pressable>
          <Pressable
            style={styles.headerButton}
            onPress={() => setShowMetrics(!showMetrics)}
          >
            <Ionicons
              name={showMetrics ? 'eye-off' : 'eye'}
              size={24}
              color={colors.textInverse}
            />
          </Pressable>
        </View>

        {/* Navigation Arrows */}
        {hasPrev && (
          <Pressable
            style={[styles.navButton, styles.navButtonLeft]}
            onPress={() => onNavigate('prev')}
          >
            <Ionicons name="chevron-back" size={32} color={colors.textInverse} />
          </Pressable>
        )}
        {hasNext && (
          <Pressable
            style={[styles.navButton, styles.navButtonRight]}
            onPress={() => onNavigate('next')}
          >
            <Ionicons name="chevron-forward" size={32} color={colors.textInverse} />
          </Pressable>
        )}

        {/* Metrics Overlay */}
        {showMetrics && (
          <View style={styles.metricsOverlay}>
            {/* Date */}
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(checkin.date)}</Text>
            </View>

            {/* Mood Summary */}
            <View style={styles.moodSummary}>
              <Text style={styles.moodEmoji}>{getMoodEmoji(checkin.mood)}</Text>
              <View style={styles.moodInfo}>
                <Text style={styles.moodLabel}>Overall Mood</Text>
                <Text style={styles.moodValue}>{checkin.mood}/10</Text>
              </View>
            </View>

            {/* Metrics Grid */}
            <View style={styles.metricsGrid}>
              <MetricItem label="Stress" value={checkin.stress} inverted />
              <MetricItem label="Energy" value={checkin.energy} />
              <MetricItem label="Sleep" value={checkin.sleep} />
              <MetricItem label="Focus" value={checkin.focus} />
              <MetricItem label="Anxiety" value={checkin.anxiety} inverted />
            </View>

            {/* Journal Entry */}
            {checkin.journalEntry && (
              <View style={styles.journalContainer}>
                <Text style={styles.journalLabel}>Journal Entry</Text>
                <Text style={styles.journalText} numberOfLines={3}>
                  {checkin.journalEntry}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}

function MetricItem({
  label,
  value,
  inverted = false,
}: {
  label: string;
  value: number;
  inverted?: boolean;
}) {
  const getColor = () => {
    const effectiveValue = inverted ? 10 - value : value;
    if (effectiveValue >= 7) return colors.success;
    if (effectiveValue >= 5) return colors.connection;
    return colors.error;
  };

  return (
    <View style={styles.metricItem}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueContainer}>
        <View style={[styles.metricBar, { width: `${value * 10}%`, backgroundColor: getColor() }]} />
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -22 }],
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  navButtonLeft: {
    left: spacing.md,
  },
  navButtonRight: {
    right: spacing.md,
  },
  metricsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
  },
  dateContainer: {
    marginBottom: spacing.md,
  },
  dateText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textInverse,
    opacity: 0.7,
  },
  moodSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  moodEmoji: {
    fontSize: 48,
    marginRight: spacing.md,
  },
  moodInfo: {
    flex: 1,
  },
  moodLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textInverse,
    opacity: 0.7,
    marginBottom: spacing.xs,
  },
  moodValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textInverse,
  },
  metricsGrid: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metricItem: {
    gap: spacing.xs,
  },
  metricLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textInverse,
    opacity: 0.9,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metricBar: {
    height: 6,
    borderRadius: 3,
    flex: 1,
  },
  metricValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
    minWidth: 24,
  },
  journalContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  journalLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
    marginBottom: spacing.sm,
  },
  journalText: {
    fontSize: typography.fontSize.sm,
    color: colors.textInverse,
    opacity: 0.8,
    lineHeight: 20,
  },
});
