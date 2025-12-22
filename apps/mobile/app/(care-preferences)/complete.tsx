/**
 * Care Preferences Complete Screen
 * Confirmation and summary of personalized care settings
 */

import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';

export default function CompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { updateCarePreferences } = useAuthStore();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Success animation
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Save care preferences
    saveCarePreferences();
  }, []);

  const saveCarePreferences = async () => {
    const goals = (params.goals as string)?.split(',') || [];
    const copingStrategies = (params.copingStrategies as string)?.split(',').filter(Boolean) || [];

    try {
      await updateCarePreferences({
        currentMentalState: params.mentalState as any,
        therapyStatus: params.therapyStatus as any,
        primaryGoals: goals as any[],
        preferredSupportStyle: params.supportStyle as any,
        socialSupport: params.socialSupport as any,
        exerciseFrequency: params.exerciseFrequency as any,
        copingStrategiesUsed: copingStrategies,
        crisisContacts: params.crisisContactName
          ? [
              {
                name: params.crisisContactName as string,
                relationship: 'Emergency Contact',
                phone: params.crisisContactPhone as string,
                isPrimary: true,
              },
            ]
          : [],
        triggerTopics: [],
        sleepSchedule: {
          typicalBedtime: '22:00',
          typicalWakeTime: '07:00',
          sleepQualityRating: 5,
        },
      });
    } catch (error) {
      console.error('Failed to save care preferences:', error);
    }
  };

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  // Generate personalized summary based on selections
  const getSummaryItems = () => {
    const items: { icon: string; text: string; color: string }[] = [];

    // Mental state
    const stateLabels: Record<string, string> = {
      thriving: 'You\'re doing well - we\'ll help you maintain progress',
      managing: 'We\'ll provide balanced support for your challenges',
      struggling: 'Extra support and gentle guidance coming your way',
      crisis: 'We\'re here with immediate support and resources',
    };
    if (params.mentalState) {
      items.push({
        icon: 'heart',
        text: stateLabels[params.mentalState as string] || 'Personalized support ready',
        color: colors.error,
      });
    }

    // Goals count
    const goalsCount = (params.goals as string)?.split(',').length || 0;
    if (goalsCount > 0) {
      items.push({
        icon: 'flag',
        text: `${goalsCount} focus ${goalsCount === 1 ? 'area' : 'areas'} identified`,
        color: colors.primary,
      });
    }

    // Support style
    const styleLabels: Record<string, string> = {
      gentle_encouragement: 'Gentle, nurturing guidance',
      direct_coaching: 'Direct, action-oriented support',
      reflective_listening: 'Empathetic validation',
      structured_guidance: 'Step-by-step instructions',
    };
    if (params.supportStyle) {
      items.push({
        icon: 'chatbubbles',
        text: styleLabels[params.supportStyle as string] || 'Personalized communication',
        color: colors.secondary,
      });
    }

    // Social support
    if (params.socialSupport === 'isolated' || params.socialSupport === 'limited') {
      items.push({
        icon: 'people',
        text: 'Extra connection-focused activities',
        color: colors.connection,
      });
    }

    return items;
  };

  const summaryItems = getSummaryItems();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View
          style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={48} color={colors.textInverse} />
          </View>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.subtitle}>
          We've personalized your MentalSpace experience based on your preferences.
        </Text>

        {/* Summary Card */}
        <Animated.View style={[styles.summaryContainer, { opacity: fadeAnim }]}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Your Personalized Plan</Text>
            <View style={styles.summaryItems}>
              {summaryItems.map((item, index) => (
                <View key={index} style={styles.summaryItem}>
                  <View
                    style={[styles.summaryIcon, { backgroundColor: item.color + '20' }]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={18}
                      color={item.color}
                    />
                  </View>
                  <Text style={styles.summaryText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* What's Next */}
        <Animated.View style={[styles.nextSteps, { opacity: fadeAnim }]}>
          <Text style={styles.nextTitle}>What's Next?</Text>
          <View style={styles.nextItem}>
            <View style={styles.nextNumber}>
              <Text style={styles.nextNumberText}>1</Text>
            </View>
            <Text style={styles.nextText}>Complete your first daily check-in</Text>
          </View>
          <View style={styles.nextItem}>
            <View style={styles.nextNumber}>
              <Text style={styles.nextNumberText}>2</Text>
            </View>
            <Text style={styles.nextText}>Get personalized action suggestions</Text>
          </View>
          <View style={styles.nextItem}>
            <View style={styles.nextNumber}>
              <Text style={styles.nextNumberText}>3</Text>
            </View>
            <Text style={styles.nextText}>Track your progress over time</Text>
          </View>
        </Animated.View>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          title="Start Your Journey"
          onPress={handleContinue}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  summaryContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  summaryCard: {
    backgroundColor: colors.surface,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryItems: {
    gap: spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: 22,
  },
  nextSteps: {
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  nextTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  nextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  nextNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  nextText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  button: {},
});
