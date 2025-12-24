/**
 * Audio Player Screen
 * Audio guide player with controls
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { getContentById, useContentStore, getCategoryColor } from '../../stores/contentStore';

export default function AudioPlayerScreen() {
  const { id } = useLocalSearchParams();
  const content = getContentById(id as string);
  const { markAsViewed, updateProgress, toggleFavorite, isFavorite } = useContentStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (content) {
      markAsViewed(content.id, false);
    }
  }, [content?.id]);

  if (!content || content.type !== 'audio') {
    router.back();
    return null;
  }

  const isFav = isFavorite(content.id);
  const categoryColor = getCategoryColor(content.category);

  const handlePlayPause = () => {
    // TODO: Implement actual audio playback
    setIsPlaying(!isPlaying);
  };

  const handleComplete = () => {
    updateProgress(content.id, 100);
    markAsViewed(content.id, true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => toggleFavorite(content.id)} style={styles.favoriteButton}>
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={24}
            color={isFav ? colors.error : colors.text}
          />
        </Pressable>
      </View>

      {/* Content Info */}
      <View style={styles.content}>
        <View style={[styles.artwork, { backgroundColor: `${categoryColor}20` }]}>
          <Ionicons name="headset" size={80} color={categoryColor} />
        </View>

        <Text style={[styles.category, { color: categoryColor }]}>
          {content.category.toUpperCase()}
        </Text>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.description}>{content.description}</Text>
        <Text style={styles.duration}>{content.duration} minutes</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {Math.floor((progress / 100) * content.duration)}:00
          </Text>
          <Text style={styles.timeText}>{content.duration}:00</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable style={styles.controlButton}>
          <Ionicons name="play-skip-back" size={32} color={colors.text} />
        </Pressable>

        <Pressable style={styles.playButton} onPress={handlePlayPause}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={40}
            color={colors.white}
          />
        </Pressable>

        <Pressable style={styles.controlButton}>
          <Ionicons name="play-skip-forward" size={32} color={colors.text} />
        </Pressable>
      </View>

      {/* Note */}
      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.noteText}>
          Audio playback will be implemented in a future update. This is a preview of the player interface.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  favoriteButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  artwork: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  category: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  duration: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  progressContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  controlButton: {
    padding: spacing.md,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
  },
  noteText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
});
