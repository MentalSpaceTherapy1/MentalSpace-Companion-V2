/**
 * Article Reader Component
 * In-app markdown reader with reading progress tracking
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { ContentItem } from '../../data/contentLibrary';
import { useContentStore } from '../../stores/contentStore';

interface ArticleReaderProps {
  content: ContentItem;
  onClose: () => void;
}

export function ArticleReader({ content, onClose }: ArticleReaderProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const { updateProgress, markAsViewed, toggleFavorite, isFavorite } = useContentStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const contentHeight = useRef(0);
  const scrollViewHeight = useRef(0);

  const isFav = isFavorite(content.id);

  // Mark as viewed when component mounts
  useEffect(() => {
    markAsViewed(content.id, false);
  }, [content.id]);

  // Update progress as user scrolls
  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    contentHeight.current = contentSize.height;
    scrollViewHeight.current = layoutMeasurement.height;

    const scrollPosition = contentOffset.y;
    const maxScroll = contentSize.height - layoutMeasurement.height;

    if (maxScroll > 0) {
      const progress = Math.min(100, (scrollPosition / maxScroll) * 100);
      setScrollProgress(progress);

      // Throttle progress updates to store
      if (progress % 10 < 1 || progress >= 90) {
        updateProgress(content.id, progress);
      }
    }
  };

  // Simple markdown renderer
  const renderMarkdown = (markdown: string) => {
    const lines = markdown.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // H1
      if (line.startsWith('# ')) {
        elements.push(
          <Text key={key++} style={styles.h1}>
            {line.substring(2)}
          </Text>
        );
      }
      // H2
      else if (line.startsWith('## ')) {
        elements.push(
          <Text key={key++} style={styles.h2}>
            {line.substring(3)}
          </Text>
        );
      }
      // H3
      else if (line.startsWith('### ')) {
        elements.push(
          <Text key={key++} style={styles.h3}>
            {line.substring(4)}
          </Text>
        );
      }
      // Bold
      else if (line.startsWith('**') || line.includes('**')) {
        const parts = line.split('**');
        elements.push(
          <Text key={key++} style={styles.paragraph}>
            {parts.map((part, idx) =>
              idx % 2 === 1 ? (
                <Text key={idx} style={styles.bold}>
                  {part}
                </Text>
              ) : (
                part
              )
            )}
          </Text>
        );
      }
      // List item
      else if (line.startsWith('- ')) {
        elements.push(
          <View key={key++} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{line.substring(2)}</Text>
          </View>
        );
      }
      // Numbered list
      else if (/^\d+\./.test(line)) {
        const match = line.match(/^(\d+)\.\s(.+)/);
        if (match) {
          elements.push(
            <View key={key++} style={styles.listItem}>
              <Text style={styles.number}>{match[1]}.</Text>
              <Text style={styles.listText}>{match[2]}</Text>
            </View>
          );
        }
      }
      // Empty line
      else if (line.trim() === '') {
        elements.push(<View key={key++} style={styles.spacer} />);
      }
      // Regular paragraph
      else {
        elements.push(
          <Text key={key++} style={styles.paragraph}>
            {line}
          </Text>
        );
      }
    }

    return elements;
  };

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${scrollProgress}%` }]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => toggleFavorite(content.id)}
            style={styles.iconButton}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={24}
              color={isFav ? colors.error : colors.text}
            />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
      >
        {/* Article header */}
        <View style={styles.articleHeader}>
          <Text style={styles.category}>
            {content.category.toUpperCase()}
          </Text>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.duration}>{content.duration} min read</Text>
        </View>

        {/* Article body */}
        <View style={styles.articleBody}>
          {content.content && renderMarkdown(content.content)}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You've made it to the end. Take a moment to reflect on what resonated with you.
          </Text>
          <Pressable
            style={styles.doneButton}
            onPress={() => {
              updateProgress(content.id, 100);
              onClose();
            }}
          >
            <Text style={styles.doneButtonText}>Done Reading</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Reading progress indicator */}
      {scrollProgress < 100 && (
        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>
            {Math.round(scrollProgress)}% complete
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  closeButton: {
    padding: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  articleHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  category: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    lineHeight: typography.lineHeight.tight * typography.fontSize['3xl'],
    marginBottom: spacing.sm,
  },
  duration: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  articleBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  h1: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.tight * typography.fontSize['2xl'],
  },
  h2: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.tight * typography.fontSize.xl,
  },
  h3: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.normal * typography.fontSize.lg,
  },
  paragraph: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.md,
  },
  bold: {
    fontWeight: typography.fontWeight.semibold,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingLeft: spacing.md,
  },
  bullet: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    marginRight: spacing.sm,
    fontWeight: typography.fontWeight.bold,
  },
  number: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    marginRight: spacing.sm,
    fontWeight: typography.fontWeight.semibold,
    minWidth: 24,
  },
  listText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  spacer: {
    height: spacing.sm,
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  doneButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  progressIndicator: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
});
