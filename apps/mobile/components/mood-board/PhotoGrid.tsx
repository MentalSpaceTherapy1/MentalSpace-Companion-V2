/**
 * PhotoGrid Component
 * Lazy loading image grid with date overlays
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import type { Checkin } from '@mentalspace/shared';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = spacing.sm;
const GRID_PADDING = spacing.md;
const NUM_COLUMNS = 2;
const IMAGE_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

interface PhotoGridProps {
  checkins: Checkin[];
  onPhotoPress: (checkin: Checkin) => void;
}

export function PhotoGrid({ checkins, onPhotoPress }: PhotoGridProps) {
  return (
    <View style={styles.grid}>
      {checkins.map((checkin) => (
        <PhotoGridItem
          key={checkin.id}
          checkin={checkin}
          onPress={() => onPhotoPress(checkin)}
        />
      ))}
    </View>
  );
}

interface PhotoGridItemProps {
  checkin: Checkin;
  onPress: () => void;
}

function PhotoGridItem({ checkin, onPress }: PhotoGridItemProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return { month, day };
  };

  const { month, day } = formatDate(checkin.date);

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return colors.success;
    if (mood >= 6) return colors.connection;
    if (mood >= 4) return colors.warning;
    return colors.error;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.gridItem,
        pressed && styles.gridItemPressed,
      ]}
      onPress={onPress}
    >
      {/* Photo */}
      {checkin.photoUri && !hasError ? (
        <>
          <Image
            source={{ uri: checkin.photoUri }}
            style={styles.gridImage}
            resizeMode="cover"
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </>
      ) : (
        <View style={[styles.gridImage, styles.placeholderImage]}>
          <Ionicons name="image-outline" size={32} color={colors.textTertiary} />
        </View>
      )}

      {/* Date Overlay */}
      <View style={styles.dateOverlay}>
        <Text style={styles.dateMonth}>{month}</Text>
        <Text style={styles.dateDay}>{day}</Text>
      </View>

      {/* Mood Indicator */}
      <View style={[styles.moodIndicator, { backgroundColor: getMoodColor(checkin.mood) }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  gridItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  gridItemPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface + 'AA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 48,
    alignItems: 'center',
  },
  dateMonth: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateDay: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textInverse,
    lineHeight: typography.fontSize.lg,
  },
  moodIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
});
