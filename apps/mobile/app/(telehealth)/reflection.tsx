/**
 * Session Reflection Screen
 * Post-session reflection form to capture insights and homework from therapy sessions
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { useSessionStore } from '../../stores/sessionStore';
import type { SessionReflection } from '../../stores/sessionStore';

const RATING_EMOJIS = ['😞', '😕', '😐', '🙂', '😊'];
const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function SessionReflectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionId = params.sessionId as string;

  const { getSessionById, updateReflection } = useSessionStore();
  const session = getSessionById(sessionId);

  const [rating, setRating] = useState<number>(0);
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>(['']);
  const [homework, setHomework] = useState<string[]>(['']);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>Session not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleAddTakeaway = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setKeyTakeaways([...keyTakeaways, '']);
  };

  const handleRemoveTakeaway = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setKeyTakeaways(keyTakeaways.filter((_, i) => i !== index));
  };

  const handleUpdateTakeaway = (index: number, text: string) => {
    const updated = [...keyTakeaways];
    updated[index] = text;
    setKeyTakeaways(updated);
  };

  const handleAddHomework = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHomework([...homework, '']);
  };

  const handleRemoveHomework = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHomework(homework.filter((_, i) => i !== index));
  };

  const handleUpdateHomework = (index: number, text: string) => {
    const updated = [...homework];
    updated[index] = text;
    setHomework(updated);
  };

  const handleRatingPress = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRating(value);
  };

  const canSave = (): boolean => {
    return (
      rating > 0 &&
      keyTakeaways.some((t) => t.trim().length > 0)
    );
  };

  const handleSave = async () => {
    if (!canSave()) {
      if (Platform.OS === 'web') {
        window.alert('Please provide a rating and at least one key takeaway.');
      } else {
        Alert.alert(
          'Incomplete Reflection',
          'Please provide a rating and at least one key takeaway.',
          [{ text: 'OK' }]
        );
      }
      return;
    }

    setIsSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Filter out empty entries
    const reflection: SessionReflection = {
      rating,
      keyTakeaways: keyTakeaways.filter((t) => t.trim().length > 0),
      homework: homework.filter((h) => h.trim().length > 0),
      notes: notes.trim(),
    };

    // Save reflection to store
    updateReflection(sessionId, reflection);

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsSaving(false);

    // Navigate back or to history
    if (Platform.OS === 'web') {
      if (window.confirm('Reflection saved! Would you like to view your session history?')) {
        router.replace('/(telehealth)/history');
      } else {
        router.replace('/(tabs)');
      }
    } else {
      Alert.alert(
        'Reflection Saved!',
        'Your session reflection has been saved.',
        [
          { text: 'View History', onPress: () => router.replace('/(telehealth)/history') },
          { text: 'Go Home', onPress: () => router.replace('/(tabs)'), style: 'cancel' },
        ]
      );
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Session Reflection</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Session Info Card */}
        <Card style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <View style={styles.therapistInfo}>
              <View style={styles.therapistAvatar}>
                <Ionicons name="person" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.therapistName}>{session.therapistName}</Text>
                <Text style={styles.sessionDate}>{formatDate(session.sessionDate)}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How was your session?</Text>
          <View style={styles.ratingContainer}>
            {RATING_EMOJIS.map((emoji, index) => {
              const value = index + 1;
              const isSelected = rating === value;
              return (
                <Pressable
                  key={value}
                  style={[styles.ratingButton, isSelected && styles.ratingButtonSelected]}
                  onPress={() => handleRatingPress(value)}
                >
                  <Text style={styles.ratingEmoji}>{emoji}</Text>
                  <Text
                    style={[
                      styles.ratingLabel,
                      isSelected && styles.ratingLabelSelected,
                    ]}
                  >
                    {RATING_LABELS[index]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Key Takeaways Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Takeaways *</Text>
          <Text style={styles.sectionSubtitle}>
            What insights or realizations did you have?
          </Text>
          {keyTakeaways.map((takeaway, index) => (
            <View key={index} style={styles.inputRow}>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={takeaway}
                onChangeText={(text) => handleUpdateTakeaway(index, text)}
                placeholder="Enter a key takeaway..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {keyTakeaways.length > 1 && (
                <Pressable
                  style={styles.removeButton}
                  onPress={() => handleRemoveTakeaway(index)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.error} />
                </Pressable>
              )}
            </View>
          ))}
          <Pressable style={styles.addButton} onPress={handleAddTakeaway}>
            <Ionicons name="add-circle" size={20} color={colors.primary} />
            <Text style={styles.addButtonText}>Add another takeaway</Text>
          </Pressable>
        </View>

        {/* Homework Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Homework / Things to Try</Text>
          <Text style={styles.sectionSubtitle}>
            What did your therapist suggest you work on?
          </Text>
          {homework.map((item, index) => (
            <View key={index} style={styles.inputRow}>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={item}
                onChangeText={(text) => handleUpdateHomework(index, text)}
                placeholder="Enter homework or action item..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
              {homework.length > 1 && (
                <Pressable
                  style={styles.removeButton}
                  onPress={() => handleRemoveHomework(index)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.error} />
                </Pressable>
              )}
            </View>
          ))}
          <Pressable style={styles.addButton} onPress={handleAddHomework}>
            <Ionicons name="add-circle" size={20} color={colors.primary} />
            <Text style={styles.addButtonText}>Add homework item</Text>
          </Pressable>
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Anything you want to remember?</Text>
          <Text style={styles.sectionSubtitle}>
            Optional notes about this session
          </Text>
          <TextInput
            style={[styles.textInput, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional thoughts or reminders..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <View style={styles.footer}>
          <Button
            title="Save Reflection"
            onPress={handleSave}
            disabled={!canSave()}
            loading={isSaving}
          />
          <Button
            title="Skip for Now"
            variant="ghost"
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sessionCard: {
    marginBottom: spacing.xl,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  therapistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  therapistAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  therapistName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  sessionDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  ratingButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  ratingButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  ratingEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  ratingLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  ratingLabelSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  multilineInput: {
    minHeight: 80,
  },
  notesInput: {
    minHeight: 120,
  },
  removeButton: {
    padding: spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  addButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.error,
    fontWeight: typography.fontWeight.semibold,
  },
});
