/**
 * SOS Tab Screen
 * Quick access to crisis support and coping tools
 */

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../utils/haptics';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import type { SOSProtocolType } from '@mentalspace/shared';

// SOS Protocol options
const SOS_PROTOCOLS: Array<{
  id: SOSProtocolType;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}> = [
  {
    id: 'overwhelm',
    title: "I'm overwhelmed",
    subtitle: 'Feeling too much right now',
    icon: 'cloud',
    color: '#7B68EE',
  },
  {
    id: 'panic',
    title: 'Panic attack',
    subtitle: 'Heart racing, hard to breathe',
    icon: 'heart-dislike',
    color: '#FF6B6B',
  },
  {
    id: 'anger',
    title: "I'm really angry",
    subtitle: 'Need to calm down',
    icon: 'flame',
    color: '#FF8C00',
  },
  {
    id: 'cant_sleep',
    title: "Can't sleep",
    subtitle: 'Mind racing at night',
    icon: 'moon',
    color: '#4169E1',
  },
  {
    id: 'struggling',
    title: 'Just struggling',
    subtitle: 'Need some support',
    icon: 'heart',
    color: colors.sos,
  },
];

// Crisis resources
const CRISIS_RESOURCES = [
  {
    id: '988',
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free, 24/7 support',
    phone: '988',
    icon: 'call',
    primary: true,
  },
  {
    id: 'crisis-text',
    name: 'Crisis Text Line',
    description: 'Text HOME to 741741',
    phone: '741741',
    icon: 'chatbubble-ellipses',
    primary: false,
  },
];

export default function SOSTabScreen() {
  const router = useRouter();

  const handleProtocolSelect = (protocolId: SOSProtocolType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(sos)/protocol',
      params: { type: protocolId },
    });
  };

  const handleCrisisCall = (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // This will open the phone dialer
    router.push({
      pathname: '/(sos)/resources',
      params: { dial: phone },
    });
  };

  const handleViewAllResources = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(sos)/resources');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="heart" size={32} color={colors.sos} />
        </View>
        <Text style={styles.headerTitle}>How can I help?</Text>
        <Text style={styles.headerSubtitle}>
          Choose what you're experiencing for guided support
        </Text>
      </View>

      {/* Quick Protocols */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>I need help with...</Text>
        <View style={styles.protocolGrid}>
          {SOS_PROTOCOLS.map((protocol) => (
            <Pressable
              key={protocol.id}
              style={({ pressed }) => [
                styles.protocolCard,
                pressed && styles.protocolCardPressed,
              ]}
              onPress={() => handleProtocolSelect(protocol.id)}
            >
              <View style={[styles.protocolIcon, { backgroundColor: protocol.color + '20' }]}>
                <Ionicons name={protocol.icon} size={28} color={protocol.color} />
              </View>
              <Text style={styles.protocolTitle}>{protocol.title}</Text>
              <Text style={styles.protocolSubtitle}>{protocol.subtitle}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Crisis Resources */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Crisis Resources</Text>
          <Pressable onPress={handleViewAllResources}>
            <Text style={styles.viewAllLink}>View all</Text>
          </Pressable>
        </View>
        <View style={styles.resourcesContainer}>
          {CRISIS_RESOURCES.map((resource) => (
            <Pressable
              key={resource.id}
              style={[
                styles.resourceCard,
                resource.primary && styles.resourceCardPrimary,
              ]}
              onPress={() => handleCrisisCall(resource.phone)}
            >
              <View style={[
                styles.resourceIcon,
                resource.primary && styles.resourceIconPrimary,
              ]}>
                <Ionicons
                  name={resource.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={resource.primary ? colors.textInverse : colors.sos}
                />
              </View>
              <View style={styles.resourceInfo}>
                <Text style={[
                  styles.resourceName,
                  resource.primary && styles.resourceNamePrimary,
                ]}>
                  {resource.name}
                </Text>
                <Text style={[
                  styles.resourceDescription,
                  resource.primary && styles.resourceDescriptionPrimary,
                ]}>
                  {resource.description}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={resource.primary ? 'rgba(255,255,255,0.7)' : colors.textTertiary}
              />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Safety Plan */}
      <View style={styles.section}>
        <Pressable
          style={styles.safetyPlanCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(safety-plan)');
          }}
        >
          <View style={styles.safetyPlanIcon}>
            <Ionicons name="shield-checkmark" size={28} color={colors.success} />
          </View>
          <View style={styles.safetyPlanInfo}>
            <Text style={styles.safetyPlanTitle}>My Safety Plan</Text>
            <Text style={styles.safetyPlanDescription}>
              Your personalized guide for difficult moments
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </Pressable>
      </View>

      {/* Safety Note */}
      <View style={styles.safetyNote}>
        <Ionicons name="shield-checkmark" size={20} color={colors.success} />
        <Text style={styles.safetyText}>
          Your data is private. Crisis resources connect to trained counselors, not emergency services.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.sos + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  viewAllLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  protocolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  protocolCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  protocolCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  protocolIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  protocolTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  protocolSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  resourcesContainer: {
    gap: spacing.md,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  resourceCardPrimary: {
    backgroundColor: colors.sos,
  },
  resourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.sos + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  resourceIconPrimary: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  resourceNamePrimary: {
    color: colors.textInverse,
  },
  resourceDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  resourceDescriptionPrimary: {
    color: 'rgba(255,255,255,0.85)',
  },
  safetyPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  safetyPlanIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  safetyPlanInfo: {
    flex: 1,
  },
  safetyPlanTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  safetyPlanDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.success + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  safetyText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
