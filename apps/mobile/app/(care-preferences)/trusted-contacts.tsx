/**
 * Trusted Contacts Screen
 * Manage emergency and support contacts
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';

interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: ContactRelationship;
  notifyOnCrisis: boolean;
  notifyOnWeeklyUpdate: boolean;
}

type ContactRelationship =
  | 'family'
  | 'friend'
  | 'therapist'
  | 'doctor'
  | 'partner'
  | 'mentor'
  | 'other';

const RELATIONSHIP_OPTIONS: { id: ContactRelationship; label: string; icon: string }[] = [
  { id: 'family', label: 'Family', icon: 'people' },
  { id: 'friend', label: 'Friend', icon: 'person' },
  { id: 'partner', label: 'Partner', icon: 'heart' },
  { id: 'therapist', label: 'Therapist', icon: 'medical' },
  { id: 'doctor', label: 'Doctor', icon: 'medkit' },
  { id: 'mentor', label: 'Mentor', icon: 'school' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

const MAX_CONTACTS = 5;

export default function TrustedContactsScreen() {
  const router = useRouter();
  const { profile, updatePreferences } = useAuthStore();

  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRelationship, setFormRelationship] = useState<ContactRelationship>('family');
  const [formNotifyCrisis, setFormNotifyCrisis] = useState(true);
  const [formNotifyWeekly, setFormNotifyWeekly] = useState(false);

  // Load existing contacts
  useEffect(() => {
    if (profile?.preferences?.trustedContacts) {
      setContacts(profile.preferences.trustedContacts);
    }
  }, [profile]);

  const resetForm = () => {
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormRelationship('family');
    setFormNotifyCrisis(true);
    setFormNotifyWeekly(false);
    setEditingContact(null);
  };

  const handleOpenAdd = () => {
    if (contacts.length >= MAX_CONTACTS) {
      const message = `You can add up to ${MAX_CONTACTS} trusted contacts.`;
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Limit Reached', message);
      }
      return;
    }
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (contact: TrustedContact) => {
    setEditingContact(contact);
    setFormName(contact.name);
    setFormPhone(contact.phone);
    setFormEmail(contact.email || '');
    setFormRelationship(contact.relationship);
    setFormNotifyCrisis(contact.notifyOnCrisis);
    setFormNotifyWeekly(contact.notifyOnWeeklyUpdate);
    setShowAddModal(true);
  };

  const handleSaveContact = async () => {
    if (!formName.trim() || !formPhone.trim()) {
      const message = 'Please enter a name and phone number.';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Missing Information', message);
      }
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newContact: TrustedContact = {
      id: editingContact?.id || `contact-${Date.now()}`,
      name: formName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim() || undefined,
      relationship: formRelationship,
      notifyOnCrisis: formNotifyCrisis,
      notifyOnWeeklyUpdate: formNotifyWeekly,
    };

    let updatedContacts: TrustedContact[];
    if (editingContact) {
      updatedContacts = contacts.map((c) => (c.id === editingContact.id ? newContact : c));
    } else {
      updatedContacts = [...contacts, newContact];
    }

    setContacts(updatedContacts);
    setShowAddModal(false);
    resetForm();

    // Save to profile
    try {
      await updatePreferences({
        trustedContacts: updatedContacts,
      });
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  };

  const handleDeleteContact = (contactId: string) => {
    const doDelete = async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const updatedContacts = contacts.filter((c) => c.id !== contactId);
      setContacts(updatedContacts);

      try {
        await updatePreferences({
          trustedContacts: updatedContacts,
        });
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to remove this contact?')) {
        doDelete();
      }
    } else {
      Alert.alert('Remove Contact', 'Are you sure you want to remove this contact?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join('-');
    }
    return text;
  };

  const getRelationshipLabel = (relationship: ContactRelationship) => {
    return RELATIONSHIP_OPTIONS.find((r) => r.id === relationship)?.label || 'Other';
  };

  const getRelationshipIcon = (relationship: ContactRelationship) => {
    return RELATIONSHIP_OPTIONS.find((r) => r.id === relationship)?.icon || 'person';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Trusted Contacts</Text>
          <Text style={styles.subtitle}>
            People you trust who can be contacted during difficult moments or receive wellness updates.
          </Text>
        </View>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Your Privacy Matters</Text>
            <Text style={styles.infoText}>
              We'll only reach out to these contacts if you request it or during a crisis situation you've pre-authorized.
            </Text>
          </View>
        </Card>

        {/* Contact List */}
        {contacts.length > 0 ? (
          <View style={styles.contactList}>
            {contacts.map((contact) => (
              <Card key={contact.id} style={styles.contactCard}>
                <View style={styles.contactMain}>
                  <View style={styles.contactAvatar}>
                    <Ionicons
                      name={getRelationshipIcon(contact.relationship) as any}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelationship}>
                      {getRelationshipLabel(contact.relationship)}
                    </Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                  <View style={styles.contactActions}>
                    <Pressable
                      onPress={() => handleOpenEdit(contact)}
                      style={styles.contactActionButton}
                    >
                      <Ionicons name="pencil" size={20} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteContact(contact.id)}
                      style={styles.contactActionButton}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.contactBadges}>
                  {contact.notifyOnCrisis && (
                    <View style={[styles.badge, styles.badgeCrisis]}>
                      <Ionicons name="warning" size={12} color={colors.error} />
                      <Text style={styles.badgeCrisisText}>Crisis Contact</Text>
                    </View>
                  )}
                  {contact.notifyOnWeeklyUpdate && (
                    <View style={[styles.badge, styles.badgeWeekly]}>
                      <Ionicons name="calendar" size={12} color={colors.secondary} />
                      <Text style={styles.badgeWeeklyText}>Weekly Updates</Text>
                    </View>
                  )}
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Contacts Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add people you trust to your support network
            </Text>
          </Card>
        )}

        {/* Add Button */}
        {contacts.length < MAX_CONTACTS && (
          <Button
            title="Add Trusted Contact"
            variant="outline"
            onPress={handleOpenAdd}
            style={styles.addButton}
          />
        )}

        {/* Counter */}
        <Text style={styles.counterText}>
          {contacts.length} of {MAX_CONTACTS} contacts added
        </Text>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingContact ? 'Edit Contact' : 'Add Contact'}
                </Text>
                <Pressable onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
              </View>

              {/* Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter name"
                  placeholderTextColor={colors.textTertiary}
                  value={formName}
                  onChangeText={setFormName}
                  autoCapitalize="words"
                />
              </View>

              {/* Phone */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="000-000-0000"
                  placeholderTextColor={colors.textTertiary}
                  value={formPhone}
                  onChangeText={(text) => setFormPhone(formatPhone(text))}
                  keyboardType="phone-pad"
                  maxLength={12}
                />
              </View>

              {/* Email */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.textTertiary}
                  value={formEmail}
                  onChangeText={setFormEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Relationship */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Relationship</Text>
                <View style={styles.relationshipGrid}>
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <Pressable
                      key={option.id}
                      style={[
                        styles.relationshipChip,
                        formRelationship === option.id && styles.relationshipChipSelected,
                      ]}
                      onPress={() => setFormRelationship(option.id)}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={16}
                        color={
                          formRelationship === option.id ? colors.primary : colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.relationshipText,
                          formRelationship === option.id && styles.relationshipTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Notification Settings */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notification Settings</Text>
                <Pressable
                  style={styles.toggleRow}
                  onPress={() => setFormNotifyCrisis(!formNotifyCrisis)}
                >
                  <View style={styles.toggleContent}>
                    <Ionicons name="warning" size={20} color={colors.error} />
                    <View style={styles.toggleText}>
                      <Text style={styles.toggleTitle}>Crisis Contact</Text>
                      <Text style={styles.toggleDescription}>
                        May be contacted during emergencies
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.toggleSwitch,
                      formNotifyCrisis && styles.toggleSwitchActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleKnob,
                        formNotifyCrisis && styles.toggleKnobActive,
                      ]}
                    />
                  </View>
                </Pressable>
                <Pressable
                  style={styles.toggleRow}
                  onPress={() => setFormNotifyWeekly(!formNotifyWeekly)}
                >
                  <View style={styles.toggleContent}>
                    <Ionicons name="calendar" size={20} color={colors.secondary} />
                    <View style={styles.toggleText}>
                      <Text style={styles.toggleTitle}>Weekly Updates</Text>
                      <Text style={styles.toggleDescription}>
                        Can receive your weekly wellness summary
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.toggleSwitch,
                      formNotifyWeekly && styles.toggleSwitchActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleKnob,
                        formNotifyWeekly && styles.toggleKnobActive,
                      ]}
                    />
                  </View>
                </Pressable>
              </View>

              <Button
                title={editingContact ? 'Save Changes' : 'Add Contact'}
                onPress={handleSaveContact}
                style={styles.saveButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.md,
    marginLeft: -spacing.xs,
    padding: spacing.xs,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primary + '10',
    marginBottom: spacing.lg,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  contactList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  contactCard: {
    padding: spacing.md,
  },
  contactMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
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
    color: colors.primary,
    marginTop: 2,
  },
  contactPhone: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  contactActionButton: {
    padding: spacing.sm,
  },
  contactBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeCrisis: {
    backgroundColor: colors.error + '15',
  },
  badgeCrisisText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
  },
  badgeWeekly: {
    backgroundColor: colors.secondary + '15',
  },
  badgeWeeklyText: {
    fontSize: typography.fontSize.xs,
    color: colors.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  addButton: {
    marginBottom: spacing.md,
  },
  counterText: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  formInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  relationshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  relationshipChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  relationshipChipSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  relationshipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  relationshipTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  toggleDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  saveButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
});
