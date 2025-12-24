/**
 * Video Player Screen
 * Video guide player
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { getContentById, useContentStore, getCategoryColor } from '../../stores/contentStore';

export default function VideoPlayerScreen() {
  const { id } = useLocalSearchParams();
  const content = getContentById(id as string);
  const { markAsViewed, updateProgress, toggleFavorite, isFavorite } = useContentStore();

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (content) {
      markAsViewed(content.id, false);
    }
  }, [content?.id]);

  if (!content || content.type !== 'video') {
    router.back();
    return null;
  }

  const isFav = isFavorite(content.id);
  const categoryColor = getCategoryColor(content.category);

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

      {/* Video Player Placeholder */}
      <View style={styles.videoContainer}>
        <View style={[styles.videoPlaceholder, { backgroundColor: `${categoryColor}20` }]}>
          <Ionicons name="videocam" size={80} color={categoryColor} />
          <Text style={styles.placeholderText}>Video Player</Text>
        </View>

        <Pressable
          style={styles.playOverlay}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <View style={styles.playButton}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={40}
              color={colors.white}
            />
          </View>
        </Pressable>
      </View>

      {/* Content Info */}
      <View style={styles.content}>
        <Text style={[styles.category, { color: categoryColor }]}>
          {content.category.toUpperCase()}
        </Text>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.duration}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          {' '}{content.duration} minutes
        </Text>
        <Text style={styles.description}>{content.description}</Text>
      </View>

      {/* Note */}
      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.noteText}>
          Video playback will be implemented in a future update. This is a preview of the player interface.
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
  videoContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.black,
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  category: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  duration: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
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
