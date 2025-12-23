/**
 * Warning Signs Editor
 * Add/edit/remove warning signs that indicate you're struggling
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

const SUGGESTED_SIGNS = [
  'Feeling hopeless or worthless',
  'Difficulty sleeping or sleeping too much',
  'Withdrawing from friends and family',
  'Losing interest in activities I usually enjoy',
  'Feeling irritable or on edge',
  'Having trouble concentrating',
  'Changes in appetite',
  'Feeling overwhelmed',
  'Negative self-talk',
  'Physical tension or restlessness',
];

export default function WarningSignsScreen() {
  const router = useRouter();
  const [newSign, setNewSign] = useState('');

  const { safetyPlan, addWarningSign, removeWarningSign, saveSafetyPlan } =
    useSafetyPlanStore();

  const handleAdd = () => {
    if (!newSign.trim()) return;
    addWarningSign(newSign);
    setNewSign('');
    triggerHaptic('light');
  };

  const handleAddSuggestion = (suggestion: string) => {
    if (safetyPlan.warningSigns.includes(suggestion)) {
      Alert.alert('Already Added', 'This warning sign is already in your list.');
      return;
    }
    addWarningSign(suggestion);
    triggerHaptic('light');
  };

  const handleRemove = (index: number) => {
    Alert.alert(
      'Remove Warning Sign',
      'Are you sure you want to remove this warning sign?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeWarningSign(index);
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

  const unusedSuggestions = SUGGESTED_SIGNS.filter(
    (s) => !safetyPlan.warningSigns.includes(s)
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
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Warning signs are thoughts, feelings, or situations that indicate you
            may be starting to struggle. Recognizing them early can help you take
            action before things escalate.
          </Text>
        </Card>

        {/* Add New */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a warning sign..."
            placeholderTextColor={colors.textSecondary}
            value={newSign}
            onChangeText={setNewSign}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            maxLength={200}
          />
          <Pressable
            style={[styles.addButton, !newSign.trim() && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!newSign.trim()}
          >
            <Ionicons
              name="add"
              size={24}
              color={newSign.trim() ? colors.textInverse : colors.textSecondary}
            />
          </Pressable>
        </View>

        {/* Current Signs */}
        {safetyPlan.warningSigns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Warning Signs</Text>
            {safetyPlan.warningSigns.map((sign, index) => (
              <Card key={index} style={styles.itemCard}>
                <View style={styles.itemContent}>
                  <View style={styles.itemNumber}>
                    <Text style={styles.itemNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.itemText}>{sign}</Text>
                </View>
                <Pressable
                  style={styles.removeButton}
                  onPress={() => handleRemove(index)}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={24} color={colors.error} />
                </Pressable>
              </Card>
            ))}
          </View>
        )}

        {/* Suggestions */}
        {unusedSuggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggestions</Text>
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
                  <Ionicons name="add" size={16} color={colors.primary} />
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
    backgroundColor: colors.primary + '10',
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
    backgroundColor: colors.primary,
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
  itemNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
  },
  itemText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  removeButton: {
    padding: spacing.xs,
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
