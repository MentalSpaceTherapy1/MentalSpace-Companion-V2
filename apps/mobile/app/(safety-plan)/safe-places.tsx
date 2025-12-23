/**
 * Safe Places Editor
 * Add/edit/remove safe places where user can go
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

const SUGGESTED_PLACES = [
  'My bedroom',
  'A friend\'s house',
  'A family member\'s home',
  'Local park',
  'Library',
  'Coffee shop',
  'Place of worship',
  'Therapist\'s office',
  'Hospital emergency room',
  'Nature trail or hiking spot',
  'Beach or waterfront',
  'Gym or fitness center',
];

export default function SafePlacesScreen() {
  const router = useRouter();
  const [newPlace, setNewPlace] = useState('');

  const { safetyPlan, addSafePlace, removeSafePlace, saveSafetyPlan } =
    useSafetyPlanStore();

  const handleAdd = () => {
    if (!newPlace.trim()) return;
    addSafePlace(newPlace);
    setNewPlace('');
    triggerHaptic('light');
  };

  const handleAddSuggestion = (suggestion: string) => {
    if (safetyPlan.safePlaces.includes(suggestion)) {
      Alert.alert('Already Added', 'This place is already in your list.');
      return;
    }
    addSafePlace(suggestion);
    triggerHaptic('light');
  };

  const handleRemove = (index: number) => {
    Alert.alert(
      'Remove Safe Place',
      'Are you sure you want to remove this safe place?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeSafePlace(index);
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

  const unusedSuggestions = SUGGESTED_PLACES.filter(
    (s) => !safetyPlan.safePlaces.includes(s)
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
          <Ionicons name="information-circle" size={24} color={colors.lifestyle} />
          <Text style={styles.infoText}>
            Safe places are physical locations where you feel secure, calm, and
            supported. These are places you can go when you need to remove
            yourself from a difficult situation.
          </Text>
        </Card>

        {/* Add New */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a safe place..."
            placeholderTextColor={colors.textSecondary}
            value={newPlace}
            onChangeText={setNewPlace}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            maxLength={200}
          />
          <Pressable
            style={[styles.addButton, !newPlace.trim() && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!newPlace.trim()}
          >
            <Ionicons
              name="add"
              size={24}
              color={newPlace.trim() ? colors.textInverse : colors.textSecondary}
            />
          </Pressable>
        </View>

        {/* Current Places */}
        {safetyPlan.safePlaces.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Safe Places</Text>
            {safetyPlan.safePlaces.map((place, index) => (
              <Card key={index} style={styles.itemCard}>
                <View style={styles.itemContent}>
                  <View style={styles.itemIcon}>
                    <Ionicons name="location" size={20} color={colors.lifestyle} />
                  </View>
                  <Text style={styles.itemText}>{place}</Text>
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
                  <Ionicons name="add" size={16} color={colors.lifestyle} />
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
    backgroundColor: colors.lifestyle + '10',
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
    backgroundColor: colors.lifestyle,
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
    backgroundColor: colors.lifestyle + '20',
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
