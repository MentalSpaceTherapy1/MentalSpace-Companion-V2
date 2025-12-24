/**
 * Content Library Index
 * Personalized content recommendations and browsing
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { useContentStore, formatDuration, getContentTypeIcon, getCategoryColor } from '../../stores/contentStore';
import { ContentItem, ContentCategory } from '../../data/contentLibrary';
import { ArticleReader } from '../../components/content/ArticleReader';

type CategoryFilter = ContentCategory | 'all';

const CATEGORIES: { id: CategoryFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'stress', label: 'Stress', icon: 'fitness' },
  { id: 'sleep', label: 'Sleep', icon: 'moon' },
  { id: 'anxiety', label: 'Anxiety', icon: 'heart-half' },
  { id: 'energy', label: 'Energy', icon: 'flash' },
  { id: 'focus', label: 'Focus', icon: 'eye' },
  { id: 'mindfulness', label: 'Mindfulness', icon: 'leaf' },
  { id: 'connection', label: 'Connection', icon: 'people' },
  { id: 'coping', label: 'Coping', icon: 'shield-checkmark' },
];

export default function ContentLibraryScreen() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [showArticleReader, setShowArticleReader] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ContentItem | null>(null);

  const {
    getForYouToday,
    content,
    isFavorite,
    toggleFavorite,
    markAsViewed,
  } = useContentStore();

  // Get personalized recommendations
  const forYouToday = useMemo(() => getForYouToday(), []);

  // Filter content by category
  const filteredContent = useMemo(() => {
    if (selectedCategory === 'all') {
      return content;
    }
    return content.filter((item) => item.category === selectedCategory);
  }, [content, selectedCategory]);

  // Handle content card press
  const handleContentPress = (item: ContentItem) => {
    markAsViewed(item.id, false);

    if (item.type === 'article') {
      setSelectedArticle(item);
      setShowArticleReader(true);
    } else if (item.type === 'audio') {
      router.push({
        pathname: '/(content)/audio',
        params: { id: item.id },
      });
    } else if (item.type === 'video') {
      router.push({
        pathname: '/(content)/video',
        params: { id: item.id },
      });
    }
  };

  // Render content card
  const renderContentCard = (item: ContentItem, reason?: string, featured?: boolean) => {
    const isFav = isFavorite(item.id);
    const categoryColor = getCategoryColor(item.category);

    return (
      <Pressable
        key={item.id}
        onPress={() => handleContentPress(item)}
        style={featured ? styles.featuredCard : styles.contentCard}
      >
        <View style={[styles.cardHeader, featured && styles.featuredCardHeader]}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.typeIcon, { backgroundColor: `${categoryColor}20` }]}>
              <Ionicons
                name={getContentTypeIcon(item.type) as any}
                size={20}
                color={categoryColor}
              />
            </View>
            <View style={styles.cardMeta}>
              <Text style={[styles.cardCategory, { color: categoryColor }]}>
                {item.category.toUpperCase()}
              </Text>
              <Text style={styles.cardDuration}>
                <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                {' '}{formatDuration(item.duration)}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={20}
              color={isFav ? colors.error : colors.textSecondary}
            />
          </Pressable>
        </View>

        <Text style={featured ? styles.featuredCardTitle : styles.cardTitle}>
          {item.title}
        </Text>
        <Text
          style={styles.cardDescription}
          numberOfLines={featured ? 3 : 2}
        >
          {item.description}
        </Text>

        {reason && (
          <View style={styles.reasonBadge}>
            <Ionicons name="bulb" size={12} color={colors.primary} />
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  if (showArticleReader && selectedArticle) {
    return (
      <ArticleReader
        content={selectedArticle}
        onClose={() => {
          setShowArticleReader(false);
          setSelectedArticle(null);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* For You Today Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="sparkles" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>For You Today</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Personalized recommendations based on your current state
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredContainer}
          >
            {forYouToday.map((rec) =>
              renderContentCard(rec.item, rec.reason, true)
            )}
          </ScrollView>
        </View>

        {/* Category Filter */}
        <View style={styles.section}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={16}
                    color={isSelected ? colors.white : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Browse Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Content' : `${CATEGORIES.find(c => c.id === selectedCategory)?.label} Resources`}
          </Text>
          <Text style={styles.contentCount}>
            {filteredContent.length} {filteredContent.length === 1 ? 'item' : 'items'}
          </Text>

          <View style={styles.contentGrid}>
            {filteredContent.map((item) => renderContentCard(item))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  contentCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  featuredContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  featuredCard: {
    width: screenWidth * 0.75,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  featuredCardHeader: {
    marginBottom: spacing.sm,
  },
  featuredCardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.tight * typography.fontSize.lg,
  },
  categoryContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: colors.white,
  },
  contentGrid: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  contentCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardHeaderLeft: {
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
  cardMeta: {
    flex: 1,
  },
  cardCategory: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardDuration: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: typography.lineHeight.tight * typography.fontSize.base,
  },
  cardDescription: {
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
  },
});
