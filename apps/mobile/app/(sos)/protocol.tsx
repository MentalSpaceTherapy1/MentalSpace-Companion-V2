/**
 * SOS Protocol Screen
 * Step-by-step crisis support guide
 */

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { BreathingAnimation } from '../../components/sos/BreathingAnimation';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { SOS_PROTOCOLS } from '@mentalspace/shared';
import type { SOSStep, SOSProtocolType } from '@mentalspace/shared';

// Helper to get protocolId from URL on web (fallback for static export)
function getProtocolIdFromUrl(): SOSProtocolType | undefined {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('protocolId');
    if (id && SOS_PROTOCOLS.some(p => p.id === id)) {
      return id as SOSProtocolType;
    }
  }
  return undefined;
}

export default function ProtocolScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ protocolId: SOSProtocolType }>();

  // On web, try to get protocolId from URL params as fallback
  const protocolId = params.protocolId || getProtocolIdFromUrl();

  const protocol = SOS_PROTOCOLS.find((p) => p.id === protocolId);
  const steps = protocol?.steps || [];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingActive, setBreathingActive] = useState(true);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const breathingCycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Breathing phase cycling
  useEffect(() => {
    if (currentStep?.type === 'breathing' && breathingActive) {
      const phases: ('inhale' | 'hold' | 'exhale')[] = ['inhale', 'hold', 'exhale'];
      let phaseIndex = 0;

      const cycleBreathing = () => {
        phaseIndex = (phaseIndex + 1) % phases.length;
        setBreathingPhase(phases[phaseIndex]);
      };

      breathingCycleRef.current = setInterval(cycleBreathing, 4000);
      return () => {
        if (breathingCycleRef.current) clearInterval(breathingCycleRef.current);
      };
    }
  }, [currentStep, breathingActive]);

  useEffect(() => {
    setTapCount(0);
    // Animate step transition
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStepIndex]);

  if (!protocol || !currentStep) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Protocol not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (isLastStep) {
        setIsCompleted(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setCurrentStepIndex((prev) => prev + 1);
        slideAnim.setValue(50);
      }
    });
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleExit = () => {
    router.back();
  };

  const handleTap = () => {
    const targetCount = currentStep.interactive?.targetCount || 0;
    if (tapCount < targetCount) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTapCount((prev) => prev + 1);
    }
  };

  const handleShowResources = () => {
    router.push('/(sos)/resources');
  };

  const handleFinish = () => {
    router.replace('/(tabs)');
  };

  // Completion Screen
  if (isCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completionContent}>
          <View style={[styles.completionIcon, { backgroundColor: protocol.color }]}>
            <Ionicons name="checkmark" size={48} color={colors.textInverse} />
          </View>
          <Text style={styles.completionTitle}>You did it!</Text>
          <Text style={styles.completionSubtitle}>
            You made it through. Remember, it's okay to repeat this whenever you need.
          </Text>

          <Card style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>How are you feeling now?</Text>
            <View style={styles.feedbackOptions}>
              {['Much better', 'A bit better', 'About the same', 'Still struggling'].map(
                (option, index) => (
                  <Pressable
                    key={option}
                    style={styles.feedbackOption}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={styles.feedbackOptionText}>{option}</Text>
                  </Pressable>
                )
              )}
            </View>
          </Card>

          <Pressable style={styles.resourcesLink} onPress={handleShowResources}>
            <Ionicons name="call" size={20} color={colors.error} />
            <Text style={styles.resourcesText}>Need more support? View crisis resources</Text>
          </Pressable>
        </View>

        <View style={styles.completionFooter}>
          <Button title="Return Home" onPress={handleFinish} />
        </View>
      </SafeAreaView>
    );
  }

  const renderStepContent = () => {
    switch (currentStep.type) {
      case 'breathing':
        return (
          <BreathingAnimation
            phase={breathingPhase}
            duration={4}
            isActive={breathingActive}
            pattern={{ inhale: 4, hold: 4, exhale: 4 }}
          />
        );

      case 'grounding':
        if (currentStep.interactive?.type === 'tap') {
          const targetCount = currentStep.interactive.targetCount || 5;
          return (
            <View style={styles.tapCounterContainer}>
              <Pressable
                style={[styles.tapCircle, { borderColor: protocol.color }]}
                onPress={handleTap}
              >
                <Text style={[styles.tapCount, { color: protocol.color }]}>{tapCount}</Text>
                <Text style={styles.tapLabel}>
                  {tapCount >= targetCount ? 'Complete!' : 'Tap when ready'}
                </Text>
              </Pressable>
              <View style={styles.dotsContainer}>
                {Array.from({ length: targetCount }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index < tapCount && { backgroundColor: protocol.color },
                    ]}
                  />
                ))}
              </View>
            </View>
          );
        }
        return null;

      case 'movement':
        return (
          <View style={styles.movementContainer}>
            <Ionicons name="body" size={80} color={protocol.color} />
          </View>
        );

      case 'affirmation':
        return (
          <View style={styles.affirmationContainer}>
            <Ionicons name="heart" size={64} color={protocol.color} />
          </View>
        );

      case 'reflection':
        return (
          <View style={styles.reflectionContainer}>
            <Ionicons name="create" size={64} color={protocol.color} />
          </View>
        );

      case 'contact':
        return (
          <View style={styles.contactContainer}>
            <Ionicons name="people" size={64} color={protocol.color} />
          </View>
        );

      default:
        return null;
    }
  };

  // Check if step can proceed
  const canProceed = () => {
    if (currentStep.interactive?.type === 'tap') {
      return tapCount >= (currentStep.interactive.targetCount || 0);
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.exitButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: protocol.color,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentStepIndex + 1} / {steps.length}
          </Text>
        </View>
      </View>

      {/* Step Content */}
      <Animated.View
        style={[
          styles.stepContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Step Icon/Animation */}
        <View style={styles.stepVisual}>{renderStepContent()}</View>

        {/* Step Text */}
        <View style={styles.stepText}>
          <Text style={[styles.stepTitle, { color: protocol.color }]}>
            {currentStep.title}
          </Text>
          <Text style={styles.stepInstruction}>{currentStep.instruction}</Text>
        </View>
      </Animated.View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <View style={styles.navButtons}>
          {currentStepIndex > 0 && (
            <Button
              title="Back"
              variant="ghost"
              onPress={handlePrevious}
              style={styles.backButton}
            />
          )}
          <Button
            title={isLastStep ? 'Finish' : 'Next'}
            onPress={handleNext}
            disabled={!canProceed()}
            style={{
              ...styles.nextButton,
              backgroundColor: protocol.color,
            }}
          />
        </View>
        <Pressable onPress={handleShowResources} style={styles.resourcesTrigger}>
          <Ionicons name="call" size={16} color={colors.error} />
          <Text style={styles.resourcesTriggerText}>Need to talk to someone?</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  exitButton: {
    alignSelf: 'flex-end',
    padding: spacing.xs,
    marginBottom: spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },
  stepContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepVisual: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  stepText: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  stepTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  stepInstruction: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 28,
  },
  movementContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  affirmationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reflectionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapCounterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tapCount: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
  },
  tapLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  navigation: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  resourcesTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  resourcesTriggerText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
  },
  // Completion styles
  completionContent: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  completionTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  completionSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  feedbackCard: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  feedbackTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  feedbackOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  feedbackOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
  },
  feedbackOptionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  resourcesLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.error + '10',
    borderRadius: borderRadius.lg,
  },
  resourcesText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  completionFooter: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
