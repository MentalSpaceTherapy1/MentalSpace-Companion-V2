/**
 * Telehealth Tab Screen
 * Direct access to telehealth services from the main navigation
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import * as Haptics from '../../utils/haptics';

export default function TelehealthTabScreen() {
  const router = useRouter();

  const handleBookSession = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(telehealth)');
  };

  const handleViewAppointments = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(telehealth)/appointments');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroIcon}>
          <Ionicons name="videocam" size={48} color={colors.textInverse} />
        </View>
        <Text style={styles.heroTitle}>Talk to a Therapist</Text>
        <Text style={styles.heroSubtitle}>
          Connect with licensed mental health professionals through secure video sessions
        </Text>
      </View>

      {/* Primary CTA */}
      <Button
        title="Book a Session"
        onPress={handleBookSession}
        style={styles.primaryButton}
        icon={<Ionicons name="calendar" size={20} color={colors.textInverse} />}
      />

      {/* Features Grid */}
      <View style={styles.featuresGrid}>
        <FeatureCard
          icon="shield-checkmark"
          title="Insurance Accepted"
          description="Most major insurance plans covered"
          color={colors.success}
        />
        <FeatureCard
          icon="lock-closed"
          title="HIPAA Compliant"
          description="Your sessions are private & secure"
          color={colors.primary}
        />
        <FeatureCard
          icon="time"
          title="Flexible Scheduling"
          description="Morning, evening & weekend slots"
          color={colors.lifestyle}
        />
        <FeatureCard
          icon="heart"
          title="Compassionate Care"
          description="Experienced, licensed professionals"
          color={colors.sos}
        />
      </View>

      {/* View Appointments Card */}
      <Card style={styles.appointmentsCard}>
        <Pressable style={styles.appointmentsContent} onPress={handleViewAppointments}>
          <View style={styles.appointmentsIcon}>
            <Ionicons name="calendar-outline" size={28} color={colors.secondary} />
          </View>
          <View style={styles.appointmentsText}>
            <Text style={styles.appointmentsTitle}>Your Appointments</Text>
            <Text style={styles.appointmentsSubtitle}>
              View and manage your scheduled sessions
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
        </Pressable>
      </Card>

      {/* How It Works */}
      <Text style={styles.sectionTitle}>How It Works</Text>
      <View style={styles.stepsContainer}>
        <StepItem
          number={1}
          title="Request a Session"
          description="Choose your preferred date, time, and session type"
        />
        <StepItem
          number={2}
          title="Get Matched"
          description="We'll connect you with a suitable therapist"
        />
        <StepItem
          number={3}
          title="Join Your Session"
          description="Meet via secure video call from anywhere"
        />
      </View>

      {/* Crisis Note */}
      <View style={styles.crisisNote}>
        <Ionicons name="information-circle" size={20} color={colors.warning} />
        <Text style={styles.crisisNoteText}>
          If you're in crisis, please use the SOS button for immediate support resources.
        </Text>
      </View>
    </ScrollView>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={[styles.featureIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

function StepItem({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  heroTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  primaryButton: {
    marginBottom: spacing.xl,
    backgroundColor: colors.secondary,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  featureCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  appointmentsCard: {
    marginBottom: spacing.xl,
  },
  appointmentsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentsIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  appointmentsText: {
    flex: 1,
  },
  appointmentsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  appointmentsSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  stepsContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textInverse,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  crisisNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.warning + '15',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  crisisNoteText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 18,
  },
});
