/**
 * Telehealth Request Success Screen
 * Confirmation page shown after submitting a telehealth appointment request
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

export default function TelehealthSuccessScreen() {
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleViewRequests = () => {
    // For now, go back to home - future: dedicated requests screen
    router.replace('/(tabs)');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Success Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={48} color={colors.surface} />
        </View>
      </View>

      {/* Success Message */}
      <Text style={styles.title}>Request Submitted!</Text>
      <Text style={styles.subtitle}>
        Your telehealth appointment request has been received. A member of our care team will contact you within 24-48 hours.
      </Text>

      {/* What Happens Next */}
      <Card style={styles.infoCard}>
        <Text style={styles.cardTitle}>What Happens Next?</Text>

        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review</Text>
            <Text style={styles.stepDescription}>
              Our care coordination team will review your request and insurance information.
            </Text>
          </View>
        </View>

        <View style={styles.stepConnector} />

        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Contact</Text>
            <Text style={styles.stepDescription}>
              A care coordinator will reach out via phone or email to confirm your appointment.
            </Text>
          </View>
        </View>

        <View style={styles.stepConnector} />

        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Connect</Text>
            <Text style={styles.stepDescription}>
              You'll receive appointment details and instructions for your telehealth session.
            </Text>
          </View>
        </View>
      </Card>

      {/* Urgent Help Notice */}
      <Card style={styles.urgentCard}>
        <View style={styles.urgentHeader}>
          <Ionicons name="alert-circle" size={24} color={colors.error} />
          <Text style={styles.urgentTitle}>Need Immediate Help?</Text>
        </View>
        <Text style={styles.urgentText}>
          If you're experiencing a mental health crisis, please don't wait for a callback.
        </Text>
        <View style={styles.crisisResources}>
          <View style={styles.crisisItem}>
            <Ionicons name="call" size={18} color={colors.error} />
            <Text style={styles.crisisText}>988 Suicide & Crisis Lifeline</Text>
          </View>
          <View style={styles.crisisItem}>
            <Ionicons name="chatbox" size={18} color={colors.error} />
            <Text style={styles.crisisText}>Text HOME to 741741</Text>
          </View>
        </View>
      </Card>

      {/* Reference Number */}
      <View style={styles.referenceContainer}>
        <Text style={styles.referenceLabel}>Reference Number</Text>
        <Text style={styles.referenceNumber}>
          TH-{Date.now().toString(36).toUpperCase()}
        </Text>
        <Text style={styles.referenceHint}>
          Save this for your records
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Back to Home"
          onPress={handleGoHome}
          style={styles.primaryButton}
        />
        <Button
          title="Submit Another Request"
          variant="outline"
          onPress={() => router.replace('/(telehealth)')}
        />
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.surface,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  stepConnector: {
    width: 2,
    height: 24,
    backgroundColor: colors.primary + '30',
    marginLeft: 13,
    marginVertical: spacing.sm,
  },
  urgentCard: {
    backgroundColor: colors.error + '10',
    borderWidth: 1,
    borderColor: colors.error + '30',
    marginBottom: spacing.lg,
  },
  urgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  urgentTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
    marginLeft: spacing.sm,
  },
  urgentText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  crisisResources: {
    gap: spacing.sm,
  },
  crisisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  crisisText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  referenceContainer: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  referenceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  referenceNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    fontFamily: 'monospace',
    marginBottom: spacing.xs,
  },
  referenceHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    marginBottom: spacing.xs,
  },
});
