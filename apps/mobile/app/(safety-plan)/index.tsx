/**
 * Safety Plan Screen
 * Main overview of user's safety plan with navigation to edit each section
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import {
  useSafetyPlanStore,
  DEFAULT_CRISIS_CONTACTS,
  SafetyPlanContact,
} from '../../stores/safetyPlanStore';
import { triggerHaptic } from '../../utils/haptics';

interface SectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  items: string[] | SafetyPlanContact[];
  emptyText: string;
  onPress: () => void;
  renderItem?: (item: any, index: number) => React.ReactNode;
}

function Section({
  title,
  icon,
  iconColor,
  items,
  emptyText,
  onPress,
  renderItem,
}: SectionProps) {
  const isEmpty = items.length === 0;

  return (
    <Card style={styles.section} onPress={onPress}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionCount}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>

      {isEmpty ? (
        <Text style={styles.emptyText}>{emptyText}</Text>
      ) : (
        <View style={styles.sectionItems}>
          {items.slice(0, 3).map((item, index) =>
            renderItem ? (
              renderItem(item, index)
            ) : (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemBullet} />
                <Text style={styles.itemText} numberOfLines={1}>
                  {item as string}
                </Text>
              </View>
            )
          )}
          {items.length > 3 && (
            <Text style={styles.moreText}>+{items.length - 3} more</Text>
          )}
        </View>
      )}
    </Card>
  );
}

export default function SafetyPlanScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const {
    safetyPlan,
    isLoading,
    hasUnsavedChanges,
    loadSafetyPlan,
    saveSafetyPlan,
  } = useSafetyPlanStore();

  useEffect(() => {
    loadSafetyPlan();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSafetyPlan();
    setRefreshing(false);
  };

  const handleSave = async () => {
    try {
      await saveSafetyPlan();
      triggerHaptic('success');
      Alert.alert('Saved', 'Your safety plan has been saved.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save your safety plan. Please try again.');
    }
  };

  const handleCallContact = (contact: SafetyPlanContact) => {
    Alert.alert(
      `Call ${contact.name}?`,
      `This will call ${contact.phone}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${contact.phone}`);
          },
        },
      ]
    );
  };

  const renderContactItem = (contact: SafetyPlanContact, index: number) => (
    <Pressable
      key={contact.id}
      style={styles.contactRow}
      onPress={() => handleCallContact(contact)}
    >
      <Ionicons
        name={contact.isProfessional ? 'medical' : 'person'}
        size={16}
        color={colors.textSecondary}
      />
      <Text style={styles.contactName} numberOfLines={1}>
        {contact.name}
      </Text>
      <Ionicons name="call" size={16} color={colors.primary} />
    </Pressable>
  );

  const allContacts = [
    ...safetyPlan.supportContacts,
    ...safetyPlan.professionalContacts,
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="shield-checkmark" size={32} color={colors.success} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Your Safety Plan</Text>
              <Text style={styles.infoDescription}>
                A personalized guide to help you through difficult moments.
                Keep this updated and accessible.
              </Text>
            </View>
          </View>
          {safetyPlan.updatedAt && (
            <Text style={styles.lastUpdated}>
              Last updated:{' '}
              {new Date(safetyPlan.updatedAt).toLocaleDateString()}
            </Text>
          )}
        </Card>

        {/* Crisis Hotlines - Always visible */}
        <Card style={styles.crisisCard}>
          <View style={styles.crisisHeader}>
            <Ionicons name="call" size={24} color={colors.error} />
            <Text style={styles.crisisTitle}>24/7 Crisis Support</Text>
          </View>
          <View style={styles.crisisContacts}>
            {DEFAULT_CRISIS_CONTACTS.map((contact) => (
              <Pressable
                key={contact.id}
                style={styles.crisisButton}
                onPress={() => handleCallContact(contact)}
              >
                <Text style={styles.crisisButtonText}>{contact.name}</Text>
                <Text style={styles.crisisPhone}>{contact.phone}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Warning Signs */}
        <Section
          title="Warning Signs"
          icon="alert-circle"
          iconColor={colors.error}
          items={safetyPlan.warningSigns}
          emptyText="Add signs that indicate you're struggling"
          onPress={() => router.push('/(safety-plan)/warning-signs')}
        />

        {/* Coping Strategies */}
        <Section
          title="Coping Strategies"
          icon="fitness"
          iconColor={colors.coping}
          items={safetyPlan.copingStrategies}
          emptyText="Add things you can do on your own to feel better"
          onPress={() => router.push('/(safety-plan)/coping-strategies')}
        />

        {/* Support Contacts */}
        <Section
          title="Support Contacts"
          icon="people"
          iconColor={colors.connection}
          items={safetyPlan.supportContacts}
          emptyText="Add friends and family you can reach out to"
          onPress={() => router.push('/(safety-plan)/support-contacts')}
          renderItem={renderContactItem}
        />

        {/* Professional Contacts */}
        <Section
          title="Professional Contacts"
          icon="medical"
          iconColor={colors.primary}
          items={safetyPlan.professionalContacts}
          emptyText="Add therapists, doctors, or counselors"
          onPress={() => router.push('/(safety-plan)/professional-contacts')}
          renderItem={renderContactItem}
        />

        {/* Safe Places */}
        <Section
          title="Safe Places"
          icon="home"
          iconColor={colors.lifestyle}
          items={safetyPlan.safePlaces}
          emptyText="Add places where you feel safe and calm"
          onPress={() => router.push('/(safety-plan)/safe-places')}
        />

        {/* Reasons to Live */}
        <Section
          title="Reasons to Live"
          icon="heart"
          iconColor={colors.error}
          items={safetyPlan.reasonsToLive}
          emptyText="Add things that matter most to you"
          onPress={() => router.push('/(safety-plan)/reasons-to-live')}
        />

        {/* Environment Safety - Optional */}
        {safetyPlan.environmentSafety.length > 0 && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: colors.textSecondary + '20' },
                ]}
              >
                <Ionicons name="lock-closed" size={24} color={colors.textSecondary} />
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Environment Safety</Text>
                <Text style={styles.sectionCount}>
                  {safetyPlan.environmentSafety.length} items
                </Text>
              </View>
            </View>
            <View style={styles.sectionItems}>
              {safetyPlan.environmentSafety.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemBullet} />
                  <Text style={styles.itemText} numberOfLines={1}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Save Button */}
      {hasUnsavedChanges && (
        <View style={styles.saveContainer}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isLoading}
            style={styles.saveButton}
          />
        </View>
      )}
    </View>
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
    marginBottom: spacing.md,
  },
  infoHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  lastUpdated: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  crisisCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.error + '10',
    borderColor: colors.error + '30',
    borderWidth: 1,
  },
  crisisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  crisisTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
  crisisContacts: {
    gap: spacing.sm,
  },
  crisisButton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  crisisButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  crisisPhone: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  sectionCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingLeft: spacing.xs,
  },
  sectionItems: {
    gap: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  itemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
  },
  itemText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  moreText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
  },
  contactName: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  spacer: {
    height: spacing.xxl,
  },
  saveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    width: '100%',
  },
});
