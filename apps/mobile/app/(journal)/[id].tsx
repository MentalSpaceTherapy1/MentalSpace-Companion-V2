/**
 * Journal Entry View Screen
 * View a single journal entry with edit/delete options
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { VoiceNoteRecorder } from '../../components/VoiceNoteRecorder';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import {
  useJournalStore,
  JournalEntry,
  MOOD_EMOJIS,
} from '../../stores/journalStore';
import { triggerHaptic } from '../../utils/haptics';

export default function JournalEntryViewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<JournalEntry | null>(null);

  const { entries, loadEntry, deleteEntry, toggleFavorite } = useJournalStore();

  useEffect(() => {
    if (id) {
      const foundEntry = entries.find((e) => e.id === id);
      if (foundEntry) {
        setEntry(foundEntry);
      } else {
        loadEntry(id);
      }
    }
  }, [id, entries]);

  const handleEdit = () => {
    triggerHaptic('light');
    router.push({
      pathname: '/(journal)/entry',
      params: { id: entry?.id },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (entry) {
              triggerHaptic('medium');
              await deleteEntry(entry.id);
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async () => {
    if (entry) {
      triggerHaptic('medium');
      await toggleFavorite(entry.id);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!entry) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.headerActions}>
        <Pressable
          style={styles.actionButton}
          onPress={handleToggleFavorite}
          hitSlop={8}
        >
          <Ionicons
            name={entry.isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={entry.isFavorite ? colors.error : colors.textSecondary}
          />
        </Pressable>
        <Pressable style={styles.actionButton} onPress={handleEdit} hitSlop={8}>
          <Ionicons name="pencil" size={24} color={colors.primary} />
        </Pressable>
        <Pressable style={styles.actionButton} onPress={handleDelete} hitSlop={8}>
          <Ionicons name="trash" size={24} color={colors.error} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Date and Mood */}
        <View style={styles.dateRow}>
          <View>
            <Text style={styles.date}>{formatDate(entry.date)}</Text>
            <Text style={styles.time}>{formatTime(entry.createdAt)}</Text>
          </View>
          {entry.moodEmoji && (
            <View style={styles.moodBadge}>
              <Text style={styles.moodEmojiLarge}>{entry.moodEmoji}</Text>
              {entry.moodScore && (
                <Text style={styles.moodScore}>{entry.moodScore}/10</Text>
              )}
            </View>
          )}
        </View>

        {/* Title */}
        {entry.title && <Text style={styles.title}>{entry.title}</Text>}

        {/* Content */}
        <Text style={styles.contentText}>{entry.content}</Text>

        {/* Voice Note */}
        {entry.voiceNoteUri && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="mic" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Voice Note</Text>
            </View>
            <VoiceNoteRecorder
              onRecordingComplete={() => {}}
              existingUri={entry.voiceNoteUri}
              existingDuration={entry.voiceNoteDuration}
            />
          </View>
        )}

        {/* Transcription */}
        {entry.transcription && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={18} color={colors.textSecondary} />
              <Text style={styles.sectionTitle}>Transcription</Text>
            </View>
            <Card style={styles.transcriptionCard}>
              <Text style={styles.transcriptionText}>{entry.transcription}</Text>
            </Card>
          </View>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetag" size={18} color={colors.coping} />
              <Text style={styles.sectionTitle}>Tags</Text>
            </View>
            <View style={styles.tagsContainer}>
              {entry.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Metadata */}
        <View style={styles.metadataSection}>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Word Count</Text>
            <Text style={styles.metadataValue}>{entry.wordCount}</Text>
          </View>
          {entry.updatedAt && entry.createdAt !== entry.updatedAt && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Last Edited</Text>
              <Text style={styles.metadataValue}>
                {formatDate(entry.updatedAt)} at {formatTime(entry.updatedAt)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  date: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  time: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  moodBadge: {
    alignItems: 'center',
  },
  moodEmojiLarge: {
    fontSize: 36,
  },
  moodScore: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  contentText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transcriptionCard: {
    backgroundColor: colors.surface,
  },
  transcriptionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.coping + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: typography.fontSize.sm,
    color: colors.coping,
    fontWeight: typography.fontWeight.medium,
  },
  metadataSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  metadataLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  metadataValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
});
