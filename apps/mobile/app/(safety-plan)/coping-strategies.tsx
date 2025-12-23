/**
 * Coping Strategies Editor
 * Add/edit/remove personal coping strategies
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

const SUGGESTED_STRATEGIES = [
  'Deep breathing exercises',
  'Go for a walk outside',
  'Listen to calming music',
  'Take a warm shower or bath',
  'Journal my thoughts',
  'Practice meditation',
  'Do some stretching or yoga',
  'Watch a comforting show or movie',
  'Play with a pet',
  'Organize or clean something',
  'Draw, paint, or do crafts',
  'Read a book',
  'Cook or bake something',
  'Exercise or work out',
  'Practice progressive muscle relaxation',
];

export default function CopingStrategiesScreen() {
  const router = useRouter();
  const [newStrategy, setNewStrategy] = useState('');

  const { safetyPlan, addCopingStrategy, removeCopingStrategy, saveSafetyPlan } =
    useSafetyPlanStore();

  const handleAdd = () => {
    if (!newStrategy.trim()) return;
    addCopingStrategy(newStrategy);
    setNewStrategy('');
    triggerHaptic('light');
  };

  const handleAddSuggestion = (suggestion: string) => {
    if (safetyPlan.copingStrategies.includes(suggestion)) {
      Alert.alert('Already Added', 'This strategy is already in your list.');
      return;
    }
    addCopingStrategy(suggestion);
    triggerHaptic('light');
  };

  const handleRemove = (index: number) => {
    Alert.alert(
      'Remove Strategy',
      'Are you sure you want to remove this coping strategy?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeCopingStrategy(index);
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

  const unusedSuggestions = SUGGESTED_STRATEGIES.filter(
    (s) => !safetyPlan.copingStrategies.includes(s)
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
          <Ionicons name="information-circle" size={24} color={colors.coping} />
          <Text style={styles.infoText}>
            Coping strategies are healthy activities you can do on your own to
            feel better when you notice warning signs. These should be things you
            can do without relying on others.
          </Text>
        </Card>

        {/* Add New */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a coping strategy..."
            placeholderTextColor={colors.textSecondary}
            value={newStrategy}
            onChangeText={setNewStrategy}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            maxLength={200}
          />
          <Pressable
            style={[styles.addButton, !newStrategy.trim() && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!newStrategy.trim()}
          >
            <Ionicons
              name="add"
              size={24}
              color={newStrategy.trim() ? colors.textInverse : colors.textSecondary}
            />
          </Pressable>
        </View>

        {/* Current Strategies */}
        {safetyPlan.copingStrategies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Coping Strategies</Text>
            {safetyPlan.copingStrategies.map((strategy, index) => (
              <Card key={index} style={styles.itemCard}>
                <View style={styles.itemContent}>
                  <View style={styles.itemNumber}>
                    <Text style={styles.itemNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.itemText}>{strategy}</Text>
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
                  <Ionicons name="add" size={16} color={colors.coping} />
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
    backgroundColor: colors.coping + '10',
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
    backgroundColor: colors.coping,
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
    backgroundColor: colors.coping + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.coping,
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
