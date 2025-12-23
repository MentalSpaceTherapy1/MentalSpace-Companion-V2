/**
 * Professional Contacts Editor
 * Add/edit/remove professional support contacts (therapists, doctors, counselors)
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
  DEFAULT_CRISIS_CONTACTS,
} from '../../stores/safetyPlanStore';
import { triggerHaptic } from '../../utils/haptics';

const RELATIONSHIP_OPTIONS: { value: SafetyPlanContact['relationship']; label: string }[] = [
  { value: 'therapist', label: 'Therapist' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'crisis_line', label: 'Crisis Line' },
  { value: 'other', label: 'Other Professional' },
];

export default function ProfessionalContactsScreen() {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState<SafetyPlanContact['relationship']>('therapist');

  const { safetyPlan, addProfessionalContact, removeProfessionalContact, saveSafetyPlan } =
    useSafetyPlanStore();

  const resetForm = () => {
    setName('');
    setPhone('');
    setRelationship('therapist');
  };

  const handleAdd = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Missing Information', 'Please enter both name and phone number.');
      return;
    }

    const newContact: SafetyPlanContact = {
      id: `professional-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      relationship,
      isProfessional: true,
    };

    addProfessionalContact(newContact);
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
            removeProfessionalContact(contact.id);
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

  const getRelationshipIcon = (rel: SafetyPlanContact['relationship']): keyof typeof Ionicons.glyphMap => {
    switch (rel) {
      case 'therapist':
        return 'chatbubble-ellipses';
      case 'doctor':
        return 'medkit';
      case 'crisis_line':
        return 'call';
      default:
        return 'medical';
    }
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
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Professional contacts are mental health providers, doctors, and crisis
            lines you can contact when you need professional support. They're
            trained to help during difficult times.
          </Text>
        </Card>

        {/* Default Crisis Lines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>24/7 Crisis Lines</Text>
          <Text style={styles.sectionSubtitle}>Always available - tap to call</Text>
          {DEFAULT_CRISIS_CONTACTS.map((contact) => (
            <Card key={contact.id} style={styles.crisisCard}>
              <View style={styles.contactHeader}>
                <View style={[styles.contactIcon, styles.crisisIcon]}>
                  <Ionicons name="call" size={24} color={colors.error} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactRelationship}>
                    {contact.relationship === 'crisis_line' ? 'Crisis Support' : contact.relationship}
                  </Text>
                </View>
              </View>
              <Pressable
                style={styles.crisisCallButton}
                onPress={() => handleCall(contact)}
              >
                <Ionicons name="call" size={18} color={colors.textInverse} />
                <Text style={styles.crisisCallText}>{contact.phone}</Text>
              </Pressable>
            </Card>
          ))}
        </View>

        {/* Add Button */}
        <Pressable
          style={styles.addContactButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add-circle" size={24} color={colors.primary} />
          <Text style={styles.addContactText}>Add Professional Contact</Text>
        </Pressable>

        {/* Current Contacts */}
        {safetyPlan.professionalContacts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Professional Contacts</Text>
            {safetyPlan.professionalContacts.map((contact) => (
              <Card key={contact.id} style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <View style={styles.contactIcon}>
                    <Ionicons
                      name={getRelationshipIcon(contact.relationship)}
                      size={24}
                      color={colors.primary}
                    />
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
            <Text style={styles.modalTitle}>Add Professional</Text>
            <Pressable onPress={handleAdd}>
              <Text style={styles.modalDone}>Add</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Name / Organization</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Dr. Smith, Local Crisis Center"
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

            <Text style={styles.inputLabel}>Type</Text>
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
    backgroundColor: colors.primary + '10',
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
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
  crisisCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.error + '08',
    borderColor: colors.error + '20',
    borderWidth: 1,
  },
  crisisIcon: {
    backgroundColor: colors.error + '20',
  },
  crisisCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  crisisCallText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textInverse,
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
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
  },
  addContactText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
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
    backgroundColor: colors.primary + '20',
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
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
