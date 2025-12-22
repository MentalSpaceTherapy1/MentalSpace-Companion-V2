/**
 * Onboarding Welcome Screen
 * Introduction to the app
 */

import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();

  const firstName = profile?.displayName?.split(' ')[0] || 'there';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="heart" size={64} color={colors.primary} />
          </View>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <View style={styles.decorCircle3} />
        </View>

        {/* Welcome Text */}
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>Hey {firstName}!</Text>
          <Text style={styles.title}>Welcome to MentalSpace</Text>
          <Text style={styles.subtitle}>
            Your personal companion for mental wellness. Let's set up your
            experience in just a few steps.
          </Text>
        </View>

        {/* Features Preview */}
        <View style={styles.features}>
          <FeatureItem
            icon="checkbox-outline"
            title="Daily Check-ins"
            description="Track your mood and wellbeing"
          />
          <FeatureItem
            icon="list-outline"
            title="Personalized Actions"
            description="Get tailored wellness activities"
          />
          <FeatureItem
            icon="analytics-outline"
            title="Track Progress"
            description="See your journey over time"
          />
        </View>
      </View>

      {/* Bottom Action */}
      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={() => router.push('/(onboarding)/reasons')}
          style={styles.button}
        />
        <Text style={styles.footerText}>
          Takes only 2 minutes to set up
        </Text>
      </View>
    </View>
  );
}

function FeatureItem({
  icon,
  title,
  description
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
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
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    marginBottom: spacing.xl,
    position: 'relative',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  decorCircle1: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    top: 10,
    left: width / 2 - 80,
  },
  decorCircle2: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent,
    top: 30,
    right: width / 2 - 70,
  },
  decorCircle3: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success + '60',
    bottom: 10,
    right: width / 2 - 90,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  features: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  button: {
    marginBottom: spacing.sm,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
