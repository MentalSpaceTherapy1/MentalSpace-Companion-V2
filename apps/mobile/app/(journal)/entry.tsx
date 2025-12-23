/**
 * Journal Entry Screen
 * Create or edit a journal entry with text and voice note support
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { VoiceNoteRecorder } from '../../components/VoiceNoteRecorder';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import {
  useJournalStore,
  JOURNAL_PROMPTS,
  getRandomPrompt,
  MOOD_EMOJIS,
} from '../../stores/journalStore';
import { triggerHaptic } from '../../utils/haptics';

const SUGGESTED_TAGS = [
  'grateful',
  'anxious',
  'happy',
  'sad',
  'stressed',
  'calm',
  'productive',
  'tired',
  'motivated',
  'reflective',
];

export default function JournalEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; checkinId?: string }>();
  const isEditing = !!params.id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [voiceNoteUri, setVoiceNoteUri] = useState<string | undefined>();
  const [voiceNoteDuration, setVoiceNoteDuration] = useState<number | undefined>();
  const [moodScore, setMoodScore] = useState<number | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(getRandomPrompt());

  const {
    currentEntry,
    isLoading,
    createEntry,
    updateEntry,
    loadEntry,
    setCurrentEntry,
    saveDraft,
  } = useJournalStore();

  useEffect(() => {
    if (isEditing && params.id) {
      loadEntry(params.id);
    } else {
      // Initialize new entry
      setCurrentEntry({
        checkinId: params.checkinId,
      });
    }
  }, [params.id]);

  useEffect(() => {
    if (currentEntry && isEditing) {
      setTitle(currentEntry.title || '');
      setContent(currentEntry.content || '');
      setVoiceNoteUri(currentEntry.voiceNoteUri);
      setVoiceNoteDuration(currentEntry.voiceNoteDuration);
      setMoodScore(currentEntry.moodScore);
      setTags(currentEntry.tags || []);
    }
  }, [currentEntry, isEditing]);

  const handleSave = async () => {
    if (!content.trim() && !voiceNoteUri) {
      Alert.alert('Empty Entry', 'Please write something or record a voice note.');
      return;
    }

    try {
      triggerHaptic('success');

      const entryData = {
        title: title.trim() || undefined,
        content: content.trim(),
        voiceNoteUri,
        voiceNoteDuration,
        moodScore,
        moodEmoji: moodScore ? MOOD_EMOJIS[moodScore] : undefined,
        tags,
        checkinId: params.checkinId,
      };

      if (isEditing && params.id) {
        await updateEntry(params.id, entryData);
      } else {
        await createEntry(entryData);
      }

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save your entry. Please try again.');
    }
  };

  const handleCancel = () => {
    if (content.trim() || voiceNoteUri || title.trim()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleVoiceRecordingComplete = (uri: string, duration: number) => {
    setVoiceNoteUri(uri);
    setVoiceNoteDuration(duration);
    setShowVoiceRecorder(false);
    triggerHaptic('success');
  };

  const handleDeleteVoiceNote = () => {
    setVoiceNoteUri(undefined);
    setVoiceNoteDuration(undefined);
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
      triggerHaptic('light');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    triggerHaptic('light');
  };

  const handleAddSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      triggerHaptic('light');
    }
  };

  const handleUsePrompt = () => {
    setContent(currentPrompt.text + '\n\n');
    setShowPrompts(false);
    triggerHaptic('light');
  };

  const handleNewPrompt = () => {
    setCurrentPrompt(getRandomPrompt());
    triggerHaptic('light');
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel} hitSlop={8}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Entry' : 'New Entry'}
        </Text>
        <Pressable onPress={handleSave} disabled={isLoading} hitSlop={8}>
          <Text style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}>
            Save
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Input */}
        <TextInput
          style={styles.titleInput}
          placeholder="Title (optional)"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        {/* Prompt Suggestion */}
        {!content && !showPrompts && (
          <Pressable style={styles.promptButton} onPress={() => setShowPrompts(true)}>
            <Ionicons name="bulb" size={18} color={colors.connection} />
            <Text style={styles.promptButtonText}>Need inspiration?</Text>
          </Pressable>
        )}

        {/* Prompts Section */}
        {showPrompts && (
          <Card style={styles.promptCard}>
            <View style={styles.promptHeader}>
              <Ionicons name="bulb" size={20} color={colors.connection} />
              <Text style={styles.promptTitle}>Writing Prompt</Text>
              <Pressable onPress={() => setShowPrompts(false)}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <Text style={styles.promptText}>{currentPrompt.text}</Text>
            <View style={styles.promptActions}>
              <Pressable style={styles.promptAction} onPress={handleNewPrompt}>
                <Ionicons name="shuffle" size={16} color={colors.primary} />
                <Text style={styles.promptActionText}>New Prompt</Text>
              </Pressable>
              <Pressable
                style={[styles.promptAction, styles.promptActionPrimary]}
                onPress={handleUsePrompt}
              >
                <Ionicons name="checkmark" size={16} color={colors.textInverse} />
                <Text style={styles.promptActionTextPrimary}>Use This</Text>
              </Pressable>
            </View>
          </Card>
        )}

        {/* Content Input */}
        <TextInput
          style={styles.contentInput}
          placeholder="What's on your mind?"
          placeholderTextColor={colors.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {/* Word Count */}
        <Text style={styles.wordCount}>{wordCount} words</Text>

        {/* Voice Note Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mic" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Voice Note</Text>
          </View>

          {showVoiceRecorder || voiceNoteUri ? (
            <VoiceNoteRecorder
              onRecordingComplete={handleVoiceRecordingComplete}
              onDelete={handleDeleteVoiceNote}
              existingUri={voiceNoteUri}
              existingDuration={voiceNoteDuration}
            />
          ) : (
            <Pressable
              style={styles.addVoiceButton}
              onPress={() => setShowVoiceRecorder(true)}
            >
              <Ionicons name="mic" size={24} color={colors.primary} />
              <Text style={styles.addVoiceText}>Add Voice Note</Text>
            </Pressable>
          )}
        </View>

        {/* Mood Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="happy" size={20} color={colors.connection} />
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
          </View>
          <View style={styles.moodSelector}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
              <Pressable
                key={score}
                style={[
                  styles.moodButton,
                  moodScore === score && styles.moodButtonSelected,
                ]}
                onPress={() => setMoodScore(moodScore === score ? undefined : score)}
              >
                <Text style={styles.moodEmoji}>{MOOD_EMOJIS[score]}</Text>
              </Pressable>
            ))}
          </View>
          {moodScore && (
            <Text style={styles.moodLabel}>
              {moodScore}/10 - {moodScore >= 8 ? 'Great!' : moodScore >= 5 ? 'Okay' : 'Struggling'}
            </Text>
          )}
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag" size={20} color={colors.coping} />
            <Text style={styles.sectionTitle}>Tags</Text>
          </View>

          {/* Current Tags */}
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <Pressable
                  key={tag}
                  style={styles.tagChip}
                  onPress={() => handleRemoveTag(tag)}
                >
                  <Text style={styles.tagChipText}>{tag}</Text>
                  <Ionicons name="close" size={14} color={colors.primary} />
                </Pressable>
              ))}
            </View>
          )}

          {/* Add Tag Input */}
          <View style={styles.addTagContainer}>
            <TextInput
              style={styles.addTagInput}
              placeholder="Add a tag..."
              placeholderTextColor={colors.textSecondary}
              value={newTag}
              onChangeText={setNewTag}
              onSubmitEditing={handleAddTag}
              returnKeyType="done"
              maxLength={30}
            />
            <Pressable
              style={[styles.addTagButton, !newTag.trim() && styles.addTagButtonDisabled]}
              onPress={handleAddTag}
              disabled={!newTag.trim()}
            >
              <Ionicons
                name="add"
                size={20}
                color={newTag.trim() ? colors.textInverse : colors.textSecondary}
              />
            </Pressable>
          </View>

          {/* Suggested Tags */}
          <View style={styles.suggestedTags}>
            {SUGGESTED_TAGS.filter((t) => !tags.includes(t))
              .slice(0, 6)
              .map((tag) => (
                <Pressable
                  key={tag}
                  style={styles.suggestedTag}
                  onPress={() => handleAddSuggestedTag(tag)}
                >
                  <Text style={styles.suggestedTagText}>{tag}</Text>
                </Pressable>
              ))}
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelButton: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  saveButton: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  saveButtonDisabled: {
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  titleInput: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  promptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  promptButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.connection,
  },
  promptCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.connection + '10',
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  promptTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  promptText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  promptActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  promptAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  promptActionPrimary: {
    backgroundColor: colors.primary,
  },
  promptActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  promptActionTextPrimary: {
    fontSize: typography.fontSize.sm,
    color: colors.textInverse,
  },
  contentInput: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: 24,
    minHeight: 200,
    paddingVertical: spacing.md,
  },
  wordCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'right',
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  addVoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addVoiceText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  moodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  moodButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  addTagContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  addTagInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.coping,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonDisabled: {
    backgroundColor: colors.border,
  },
  suggestedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  suggestedTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestedTagText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  spacer: {
    height: spacing.xxl,
  },
});
