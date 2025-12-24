/**
 * Mood Board Screen
 * Gallery view of all check-in photos with filtering
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCheckinStore } from '../../stores/checkinStore';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { PhotoGrid } from '../../components/mood-board/PhotoGrid';
import { PhotoViewer } from '../../components/mood-board/PhotoViewer';
import type { Checkin } from '@mentalspace/shared';

type DateRange = 'week' | 'month' | 'all';

export default function MoodBoardScreen() {
  const router = useRouter();
  const { recentCheckins, fetchRecentCheckins, isLoading } = useCheckinStore();
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null);

  // Fetch check-ins based on date range
  useEffect(() => {
    const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 365;
    fetchRecentCheckins(days);
  }, [dateRange, fetchRecentCheckins]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 365;
    await fetchRecentCheckins(days);
    setRefreshing(false);
  }, [dateRange, fetchRecentCheckins]);

  // Filter check-ins that have photos
  const checkinsWithPhotos = recentCheckins.filter(checkin => checkin.photoUri);

  const handlePhotoPress = (checkin: Checkin) => {
    setSelectedCheckin(checkin);
  };

  const handleCloseViewer = () => {
    setSelectedCheckin(null);
  };

  const handleNavigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedCheckin) return;

    const currentIndex = checkinsWithPhotos.findIndex(c => c.id === selectedCheckin.id);
    let newIndex: number;

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : checkinsWithPhotos.length - 1;
    } else {
      newIndex = currentIndex < checkinsWithPhotos.length - 1 ? currentIndex + 1 : 0;
    }

    setSelectedCheckin(checkinsWithPhotos[newIndex]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Visual Journey</Text>
          <Text style={styles.subtitle}>
            {checkinsWithPhotos.length} {checkinsWithPhotos.length === 1 ? 'photo' : 'photos'} captured
          </Text>
        </View>

        {/* Date Range Filter */}
        <View style={styles.filterContainer}>
          <DateRangeButton
            label="Week"
            isSelected={dateRange === 'week'}
            onPress={() => setDateRange('week')}
          />
          <DateRangeButton
            label="Month"
            isSelected={dateRange === 'month'}
            onPress={() => setDateRange('month')}
          />
          <DateRangeButton
            label="All Time"
            isSelected={dateRange === 'all'}
            onPress={() => setDateRange('all')}
          />
        </View>

        {/* Photo Grid */}
        {checkinsWithPhotos.length > 0 ? (
          <PhotoGrid
            checkins={checkinsWithPhotos}
            onPhotoPress={handlePhotoPress}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Photos Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add photos during your daily check-ins to build your visual mood board
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/checkin')}
            >
              <Ionicons name="add-circle" size={20} color={colors.primary} />
              <Text style={styles.emptyButtonText}>Start Check-in</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Photo Viewer Modal */}
      {selectedCheckin && (
        <PhotoViewer
          checkin={selectedCheckin}
          onClose={handleCloseViewer}
          onNavigate={handleNavigatePhoto}
          hasNext={checkinsWithPhotos.length > 1}
          hasPrev={checkinsWithPhotos.length > 1}
        />
      )}
    </View>
  );
}

function DateRangeButton({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextSelected]}>
        {label}
      </Text>
    </Pressable>
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
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
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
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  filterButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  filterButtonTextSelected: {
    color: colors.textInverse,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.lg,
  },
  emptyButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});
