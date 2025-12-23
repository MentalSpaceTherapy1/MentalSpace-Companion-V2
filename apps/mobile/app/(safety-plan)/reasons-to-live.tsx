/**
 * Reasons to Live Editor
 * Add/edit/remove reasons for living - things that matter most
 */

import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useSafetyPlanStore } from '../../stores/safetyPlanStore';
import { triggerHaptic } from '../../utils/haptics';

const SUGGESTED_REASONS = [
  'My children / family members',
  'My pets',
  'Future goals and dreams',
  'People who care about me',
  'Things I haven\'t done yet',
  'Making a difference in others\' lives',
  'My favorite hobbies and activities',
  'Beautiful places I want to visit',
  'Milestones I want to reach',
  'The possibility of things getting better',
  'Music, art, or books I love',
  'Good memories I treasure',
];

export default function ReasonsToLiveScreen() {
  const router = useRouter();
  const [newReason, setNewReason] = useState('');

  const { safetyPlan, addReasonToLive, removeReasonToLive, saveSafetyPlan } =
    useSafetyPlanStore();

  const handleAdd = () => {
    if (!newReason.trim()) return;
    addReasonToLive(newReason);
    setNewReason('');
    triggerHaptic('light');
  };

  const handleAddSuggestion = (suggestion: string) => {
    if (safetyPlan.reasonsToLive.includes(suggestion)) {
      Alert.alert('Already Added', 'This reason is already in your list.');
      return;
    }
    addReasonToLive(suggestion);
    triggerHaptic('light');
  };

  const handleRemove = (index: number) => {
    Alert.alert(
      'Remove Reason',
      'Are you sure you want to remove this reason?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeReasonToLive(index);
            triggerHaptic('medium');
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      await saveSafetyPlan();
      triggerHaptic('success');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  };

  const unusedSuggestions = SUGGESTED_REASONS.filter(
    (s) => !safetyPlan.reasonsToLive.includes(s)
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info */}
        <Card style={styles.infoCard}>
          <Ionicons name="heart" size={24} color={colors.error} />
          <Text style={styles.infoText}>
            Reasons to live are the people, experiences, goals, and things that
            matter most to you. During difficult moments, these reminders can
            provide hope and perspective.
          </Text>
        </Card>

        {/* Add New */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a reason..."
            placeholderTextColor={colors.textSecondary}
            value={newReason}
            onChangeText={setNewReason}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            maxLength={200}
          />
          <Pressable
            style={[styles.addButton, !newReason.trim() && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!newReason.trim()}
          >
            <Ionicons
              name="add"
              size={24}
              color={newReason.trim() ? colors.textInverse : colors.textSecondary}
            />
          </Pressable>
        </View>

        {/* Current Reasons */}
        {safetyPlan.reasonsToLive.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Reasons to Live</Text>
            {safetyPlan.reasonsToLive.map((reason, index) => (
              <Card key={index} style={styles.itemCard}>
                <View style={styles.itemContent}>
                  <View style={styles.itemIcon}>
                    <Ionicons name="heart" size={20} color={colors.error} />
                  </View>
                  <Text style={styles.itemText}>{reason}</Text>
                </View>
                <Pressable
                  style={styles.removeButton}
                  onPress={() => handleRemove(index)}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
                </Pressable>
              </Card>
            ))}
          </View>
        )}

        {/* Inspiration Note */}
        {safetyPlan.reasonsToLive.length === 0 && (
          <Card style={styles.inspirationCard}>
            <Text style={styles.inspirationTitle}>Take a moment to reflect</Text>
            <Text style={styles.inspirationText}>
              Think about the people, experiences, and possibilities that bring
              meaning to your life. Even small things matter - a pet's greeting,
              a favorite meal, or a beautiful sunset.
            </Text>
          </Card>
        )}

        {/* Suggestions */}
        {unusedSuggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ideas to Consider</Text>
            <Text style={styles.sectionSubtitle}>
              Tap to add to your list
            </Text>
            <View style={styles.suggestions}>
              {unusedSuggestions.map((suggestion, index) => (
                <Pressable
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => handleAddSuggestion(suggestion)}
                >
                  <Ionicons name="add" size={16} color={colors.error} />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Button
          title="Save & Close"
          onPress={handleSave}
          style={styles.saveButton}
        />
      </View>
    </KeyboardAvoidingView>
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
  infoCard: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.error + '10',
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.border,
  },
  section: {
    marginBottom: spacing.lg,
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
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  removeButton: {
    padding: spacing.xs,
  },
  inspirationCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  inspirationTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inspirationText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  suggestionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    width: '100%',
  },
});
