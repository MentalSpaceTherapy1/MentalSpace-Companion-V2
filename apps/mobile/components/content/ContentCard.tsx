/**
 * Content Card Component
 * Reusable card for displaying content items
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { ContentItem } from '../../data/contentLibrary';
import {
  formatDuration,
  getContentTypeIcon,
  getCategoryColor,
  useContentStore,
} from '../../stores/contentStore';

interface ContentCardProps {
  content: ContentItem;
  onPress: (content: ContentItem) => void;
  reason?: string;
  featured?: boolean;
  style?: ViewStyle;
}

export function ContentCard({
  content,
  onPress,
  reason,
  featured = false,
  style,
}: ContentCardProps) {
  const { toggleFavorite, isFavorite } = useContentStore();
  const isFav = isFavorite(content.id);
  const categoryColor = getCategoryColor(content.category);

  return (
    <Pressable
      onPress={() => onPress(content)}
      style={[
        featured ? styles.featuredCard : styles.card,
        style,
      ]}
    >
      {/* Header with type, category, and favorite */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.typeIcon, { backgroundColor: `${categoryColor}20` }]}>
            <Ionicons
              name={getContentTypeIcon(content.type) as any}
              size={20}
              color={categoryColor}
            />
          </View>
          <View style={styles.meta}>
            <Text style={[styles.category, { color: categoryColor }]}>
              {content.category.toUpperCase()}
            </Text>
            <Text style={styles.duration}>
              <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
              {' '}{formatDuration(content.duration)}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(content.id);
          }}
          style={styles.favoriteButton}
          hitSlop={8}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={20}
            color={isFav ? colors.error : colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* Title and Description */}
      <Text style={featured ? styles.featuredTitle : styles.title} numberOfLines={2}>
        {content.title}
      </Text>

      <Text
        style={styles.description}
        numberOfLines={featured ? 3 : 2}
      >
        {content.description}
      </Text>

      {/* Why This Badge */}
      {reason && (
        <View style={styles.reasonBadge}>
          <Ionicons name="bulb" size={12} color={colors.primary} />
          <Text style={styles.reasonText} numberOfLines={1}>
            {reason}
          </Text>
        </View>
      )}

      {/* Tags (for featured cards) */}
      {featured && content.tags.length > 0 && (
        <View style={styles.tags}>
          {content.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  featuredCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
    minWidth: 280,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
  },
  category: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  duration: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  favoriteButton: {
    padding: spacing.xs,
    marginRight: -spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: typography.lineHeight.tight * typography.fontSize.base,
  },
  featuredTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.tight * typography.fontSize.lg,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  reasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: `${colors.primary}15`,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  reasonText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
});
