/**
 * Support Contacts Editor
 * Add/edit/remove personal support contacts (friends, family)
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
  Modal,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import {
  useSafetyPlanStore,
  SafetyPlanContact,
} from '../../stores/safetyPlanStore';
import { triggerHaptic } from '../../utils/haptics';

const RELATIONSHIP_OPTIONS: { value: SafetyPlanContact['relationship']; label: string }[] = [
  { value: 'family', label: 'Family' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
];

export default function SupportContactsScreen() {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState<SafetyPlanContact['relationship']>('friend');

  const { safetyPlan, addSupportContact, removeSupportContact, saveSafetyPlan } =
    useSafetyPlanStore();

  const resetForm = () => {
    setName('');
    setPhone('');
    setRelationship('friend');
  };

  const handleAdd = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Missing Information', 'Please enter both name and phone number.');
      return;
    }

    const newContact: SafetyPlanContact = {
      id: `support-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      relationship,
      isProfessional: false,
    };

    addSupportContact(newContact);
    triggerHaptic('success');
    setShowAddModal(false);
    resetForm();
  };

  const handleRemove = (contact: SafetyPlanContact) => {
    Alert.alert(
      'Remove Contact',
      `Are you sure you want to remove ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeSupportContact(contact.id);
            triggerHaptic('medium');
          },
        },
      ]
    );
  };

  const handleCall = (contact: SafetyPlanContact) => {
    Linking.openURL(`tel:${contact.phone}`);
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

  const getRelationshipLabel = (rel: SafetyPlanContact['relationship']) => {
    return RELATIONSHIP_OPTIONS.find((r) => r.value === rel)?.label || rel;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Info */}
        <Card style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.connection} />
          <Text style={styles.infoText}>
            Support contacts are friends and family members you can reach out to
            when you're struggling. They don't need to be mental health experts -
            just people who care about you and can offer support.
          </Text>
        </Card>

        {/* Add Button */}
        <Pressable
          style={styles.addContactButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add-circle" size={24} color={colors.connection} />
          <Text style={styles.addContactText}>Add Support Contact</Text>
        </Pressable>

        {/* Current Contacts */}
        {safetyPlan.supportContacts.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Support Contacts</Text>
            {safetyPlan.supportContacts.map((contact) => (
              <Card key={contact.id} style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <View style={styles.contactIcon}>
                    <Ionicons name="person" size={24} color={colors.connection} />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelationship}>
                      {getRelationshipLabel(contact.relationship)}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => handleRemove(contact)}
                    hitSlop={8}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.error} />
                  </Pressable>
                </View>
                <Pressable
                  style={styles.callButton}
                  onPress={() => handleCall(contact)}
                >
                  <Ionicons name="call" size={18} color={colors.primary} />
                  <Text style={styles.callButtonText}>{contact.phone}</Text>
                </Pressable>
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No support contacts yet</Text>
            <Text style={styles.emptySubtext}>
              Add friends and family you can reach out to
            </Text>
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

      {/* Add Contact Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Add Contact</Text>
            <Pressable onPress={handleAdd}>
              <Text style={styles.modalDone}>Add</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Contact name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoFocus
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor={colors.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Relationship</Text>
            <View style={styles.relationshipOptions}>
              {RELATIONSHIP_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.relationshipChip,
                    relationship === option.value && styles.relationshipChipSelected,
                  ]}
                  onPress={() => setRelationship(option.value)}
                >
                  <Text
                    style={[
                      styles.relationshipChipText,
                      relationship === option.value && styles.relationshipChipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    backgroundColor: colors.connection + '10',
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.connection,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
  },
  addContactText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.connection,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  contactCard: {
    marginBottom: spacing.sm,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.connection + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  contactRelationship: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  removeButton: {
    padding: spacing.xs,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary + '10',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  callButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  modalDone: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  relationshipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  relationshipChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  relationshipChipSelected: {
    backgroundColor: colors.connection,
    borderColor: colors.connection,
  },
  relationshipChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  relationshipChipTextSelected: {
    color: colors.textInverse,
    fontWeight: typography.fontWeight.medium,
  },
});
