/**
 * Trigger Dates Settings Screen
 * Manage difficult dates (anniversaries, etc.) for proactive support
 */

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { usePredictiveStore, type TriggerDate } from '../../stores/predictiveStore';

export default function TriggerDatesScreen() {
  const router = useRouter();
  const { triggerDates, loadTriggerDates, addTriggerDate, updateTriggerDate, deleteTriggerDate, isLoading } =
    usePredictiveStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [label, setLabel] = useState('');
  const [repeatAnnually, setRepeatAnnually] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadTriggerDates();
  }, [loadTriggerDates]);

  const handleSave = async () => {
    if (!label.trim()) {
      Alert.alert('Required', 'Please enter a label for this date');
      return;
    }

    try {
      const dateString = selectedDate.toISOString().split('T')[0];

      if (editingId) {
        await updateTriggerDate(editingId, {
          date: dateString,
          label: label.trim(),
          repeatAnnually,
        });
      } else {
        await addTriggerDate(dateString, label.trim(), repeatAnnually);
      }

      // Reset form
      resetForm();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save trigger date');
    }
  };

  const handleEdit = (triggerDate: TriggerDate) => {
    setEditingId(triggerDate.id);
    setSelectedDate(new Date(triggerDate.date));
    setLabel(triggerDate.label);
    setRepeatAnnually(triggerDate.repeatAnnually);
    setShowAddForm(true);
  };

  const handleDelete = (id: string, label: string) => {
    Alert.alert(
      'Delete Trigger Date',
      `Are you sure you want to delete "${label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTriggerDate(id);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete trigger date');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setSelectedDate(new Date());
    setLabel('');
    setRepeatAnnually(true);
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Difficult Dates</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.infoText}>
            Mark dates that might be difficult for you, like anniversaries or difficult memories.
            We'll provide extra support on these days.
          </Text>
        </Card>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingId ? 'Edit Date' : 'Add Difficult Date'}
            </Text>

            {/* Date Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={styles.dateButtonText}>
                  {selectedDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                />
              )}
            </View>

            {/* Label Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Label</Text>
              <TextInput
                style={styles.input}
                value={label}
                onChangeText={setLabel}
                placeholder="e.g., Anniversary of loss"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            {/* Repeat Toggle */}
            <Pressable
              style={styles.toggleRow}
              onPress={() => setRepeatAnnually(!repeatAnnually)}
            >
              <View style={styles.toggleLeft}>
                <Ionicons
                  name="repeat-outline"
                  size={20}
                  color={repeatAnnually ? colors.primary : colors.textSecondary}
                />
                <Text style={styles.toggleLabel}>Repeat annually</Text>
              </View>
              <View style={[styles.toggleSwitch, repeatAnnually && styles.toggleSwitchActive]}>
                <View style={[styles.toggleThumb, repeatAnnually && styles.toggleThumbActive]} />
              </View>
            </Pressable>

            {/* Action Buttons */}
            <View style={styles.formActions}>
              <Button
                title="Cancel"
                onPress={resetForm}
                variant="outline"
                style={styles.formButton}
              />
              <Button
                title={editingId ? 'Update' : 'Add'}
                onPress={handleSave}
                variant="primary"
                style={styles.formButton}
                loading={isLoading}
              />
            </View>
          </Card>
        )}

        {/* Add Button */}
        {!showAddForm && (
          <Button
            title="Add Difficult Date"
            onPress={() => setShowAddForm(true)}
            variant="outline"
            style={styles.addButton}
            icon={<Ionicons name="add" size={20} color={colors.primary} />}
          />
        )}

        {/* Trigger Dates List */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Your Dates</Text>

          {triggerDates.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No difficult dates added yet</Text>
              <Text style={styles.emptySubtext}>
                Add dates when you might need extra support
              </Text>
            </Card>
          ) : (
            <View style={styles.list}>
              {triggerDates.map((triggerDate) => (
                <TriggerDateCard
                  key={triggerDate.id}
                  triggerDate={triggerDate}
                  onEdit={() => handleEdit(triggerDate)}
                  onDelete={() => handleDelete(triggerDate.id, triggerDate.label)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

interface TriggerDateCardProps {
  triggerDate: TriggerDate;
  onEdit: () => void;
  onDelete: () => void;
}

function TriggerDateCard({ triggerDate, onEdit, onDelete }: TriggerDateCardProps) {
  const date = new Date(triggerDate.date);
  const today = new Date();

  // Check if it's coming up soon
  const daysUntil = Math.floor(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isUpcoming = daysUntil >= 0 && daysUntil <= 7;
  const isPast = daysUntil < 0;

  return (
    <Card style={[styles.dateCard, isUpcoming && styles.dateCardUpcoming]}>
      <View style={styles.dateCardLeft}>
        <View style={[styles.dateCardIcon, isUpcoming && styles.dateCardIconUpcoming]}>
          <Ionicons
            name={isUpcoming ? 'warning-outline' : 'calendar'}
            size={24}
            color={isUpcoming ? colors.connection : colors.primary}
          />
        </View>

        <View style={styles.dateCardContent}>
          <Text style={styles.dateCardLabel}>{triggerDate.label}</Text>
          <Text style={styles.dateCardDate}>
            {date.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>

          <View style={styles.dateCardMeta}>
            {triggerDate.repeatAnnually && (
              <View style={styles.metaBadge}>
                <Ionicons name="repeat-outline" size={12} color={colors.textTertiary} />
                <Text style={styles.metaText}>Annual</Text>
              </View>
            )}

            {isUpcoming && (
              <View style={[styles.metaBadge, styles.metaBadgeUpcoming]}>
                <Ionicons name="alert-circle" size={12} color={colors.connection} />
                <Text style={[styles.metaText, styles.metaTextUpcoming]}>
                  {daysUntil === 0 ? 'Today' : `${daysUntil} day${daysUntil === 1 ? '' : 's'}`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.dateCardActions}>
        <Pressable onPress={onEdit} style={styles.actionButton} hitSlop={8}>
          <Ionicons name="create-outline" size={20} color={colors.primary} />
        </Pressable>
        <Pressable onPress={onDelete} style={styles.actionButton} hitSlop={8}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </Pressable>
      </View>
    </Card>
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
    paddingTop: Platform.OS === 'ios' ? spacing.xl + spacing.md : spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerRight: {
    width: 40, // Balance the back button
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '10',
    marginBottom: spacing.lg,
  },
  infoIcon: {
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  dateButtonText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.textTertiary,
    justifyContent: 'center',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  formButton: {
    flex: 1,
  },
  addButton: {
    marginBottom: spacing.lg,
  },
  listSection: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateCardUpcoming: {
    borderLeftWidth: 4,
    borderLeftColor: colors.connection,
  },
  dateCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateCardIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dateCardIconUpcoming: {
    backgroundColor: colors.connection + '15',
  },
  dateCardContent: {
    flex: 1,
  },
  dateCardLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  dateCardDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dateCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
  },
  metaBadgeUpcoming: {
    backgroundColor: colors.connection + '15',
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  metaTextUpcoming: {
    color: colors.connection,
    fontWeight: typography.fontWeight.medium,
  },
  dateCardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
  },
});
