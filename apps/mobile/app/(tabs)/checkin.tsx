/**
 * Check-in Screen
 * Multi-step wizard for daily mental health check-in
 */

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../utils/haptics';
import { useCheckinStore } from '../../stores/checkinStore';
import { useHealthStore, getLatestSleepForCheckin } from '../../stores/healthStore';
import { convertDurationToQuality } from '../../services/healthIntegration';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MetricSlider } from '../../components/forms/MetricSlider';
import { CrisisModal } from '../../components/crisis/CrisisModal';
import { detectCrisis, getCrisisResponse } from '../../utils/crisisDetection';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { METRICS, METRIC_ORDER, JOURNAL_MAX_LENGTH } from '@mentalspace/shared';
import type { CrisisSeverity } from '@mentalspace/shared';
import { pickImage, takePhoto, savePhotoLocally } from '../../services/photoService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Step configuration
const STEPS = [
  { key: 'mood', title: 'Mood', subtitle: 'How are you feeling emotionally?' },
  { key: 'stress', title: 'Stress', subtitle: 'How stressed are you feeling?' },
  { key: 'sleep', title: 'Sleep', subtitle: 'How well did you sleep?' },
  { key: 'energy', title: 'Energy', subtitle: 'How energetic do you feel?' },
  { key: 'focus', title: 'Focus', subtitle: 'How clear is your mind?' },
  { key: 'anxiety', title: 'Anxiety', subtitle: 'How anxious are you feeling?' },
  { key: 'journal', title: 'Journal', subtitle: 'Anything on your mind?' },
  { key: 'photo', title: 'Add a Photo', subtitle: 'What does today look like?' },
  { key: 'review', title: 'Review', subtitle: 'Check your responses' },
];

type MetricKey = 'mood' | 'stress' | 'sleep' | 'energy' | 'focus' | 'anxiety';

export default function CheckinScreen() {
  const router = useRouter();
  const { draft, updateDraft, createCheckin, todayCheckin, isLoading } = useCheckinStore();
  const { isConnected, permissions } = useHealthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [healthDataLoaded, setHealthDataLoaded] = useState(false);

  // Crisis detection state
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [crisisSeverity, setCrisisSeverity] = useState<CrisisSeverity>('low');
  const [crisisAcknowledged, setCrisisAcknowledged] = useState(false);

  const currentStepConfig = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const isJournalStep = currentStepConfig.key === 'journal';
  const isPhotoStep = currentStepConfig.key === 'photo';
  const isReviewStep = currentStepConfig.key === 'review';

  const canProceed = () => {
    if (isJournalStep || isPhotoStep || isReviewStep) return true;
    const value = draft[currentStepConfig.key as MetricKey];
    return value !== undefined;
  };

  const goToStep = (step: number) => {
    if (step < 0 || step >= STEPS.length) return;

    const direction = step > currentStep ? 1 : -1;

    // useNativeDriver doesn't work on web for transform animations
    const useNativeDriver = Platform.OS !== 'web';

    Animated.timing(slideAnim, {
      toValue: direction,
      duration: 150,
      useNativeDriver,
    }).start(() => {
      setCurrentStep(step);
      slideAnim.setValue(-direction);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver,
      }).start();
    });
  };

  const handleNext = () => {
    if (!canProceed()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goToStep(currentStep + 1);
  };

  // Load health data on mount to pre-fill sleep quality
  useEffect(() => {
    const loadHealthData = async () => {
      if (!healthDataLoaded && isConnected && permissions.sleep && draft.sleep === undefined) {
        try {
          const sleepData = await getLatestSleepForCheckin();
          if (sleepData.quality !== undefined) {
            // Use the quality from health data if available
            updateDraft({ sleep: sleepData.quality });
          } else if (sleepData.duration !== undefined) {
            // Convert duration to quality if only duration is available
            const quality = convertDurationToQuality(sleepData.duration);
            updateDraft({ sleep: quality });
          }
          setHealthDataLoaded(true);
        } catch (error) {
          console.log('Could not load health data for check-in:', error);
          setHealthDataLoaded(true);
        }
      }
    };

    loadHealthData();
  }, [isConnected, permissions.sleep, healthDataLoaded]);

  // Initialize default value for metric steps if not set
  useEffect(() => {
    const key = currentStepConfig.key as MetricKey;
    if (!isJournalStep && !isPhotoStep && !isReviewStep && draft[key] === undefined) {
      // Don't set default for sleep if we're still loading health data
      if (key === 'sleep' && isConnected && permissions.sleep && !healthDataLoaded) {
        return;
      }
      updateDraft({ [key]: 5 }); // Set default value of 5
    }
  }, [currentStep, healthDataLoaded]);

  // If already checked in today, show completion state
  // This check must be AFTER all hooks to follow React's rules of hooks
  if (todayCheckin) {
    return <CheckinComplete onNewCheckin={() => router.push('/(tabs)/plan')} />;
  }

  const handleBack = () => {
    if (currentStep === 0) {
      router.back();
    } else {
      goToStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Check for crisis indicators before submitting
    if (!crisisAcknowledged) {
      const crisisResult = detectCrisis(draft.journalEntry, {
        mood: draft.mood!,
        stress: draft.stress!,
        sleep: draft.sleep!,
        energy: draft.energy!,
        focus: draft.focus!,
        anxiety: draft.anxiety!,
      });

      if (crisisResult.detected) {
        setCrisisSeverity(crisisResult.severity);
        setShowCrisisModal(true);
        return;
      }
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Save photo locally if one was selected
      let savedPhotoUri: string | undefined;
      if (draft.photoUri) {
        const today = new Date().toISOString().split('T')[0];
        const photoId = `checkin-${today}`;
        const savedPath = await savePhotoLocally(draft.photoUri, photoId);
        savedPhotoUri = savedPath || undefined;
      }

      await createCheckin({
        mood: draft.mood!,
        stress: draft.stress!,
        sleep: draft.sleep!,
        energy: draft.energy!,
        focus: draft.focus!,
        anxiety: draft.anxiety!,
        journalEntry: draft.journalEntry,
        photoUri: savedPhotoUri,
        crisisDetected: crisisAcknowledged,
        crisisHandled: crisisAcknowledged,
      });
      router.push('/(tabs)/plan');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleCrisisAcknowledge = () => {
    setCrisisAcknowledged(true);
    setShowCrisisModal(false);
    // User acknowledged, proceed with submission
    handleSubmit();
  };

  const handleCrisisDismiss = () => {
    setShowCrisisModal(false);
  };

  const handleMetricChange = (value: number) => {
    updateDraft({ [currentStepConfig.key]: value });
    Haptics.selectionAsync();
  };

  const translateX = slideAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [SCREEN_WIDTH, 0, -SCREEN_WIDTH],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / STEPS.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {STEPS.length}
        </Text>
      </View>

      {/* Step Content */}
      <Animated.View
        style={[styles.stepContainer, { transform: [{ translateX }] }]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Step Header */}
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>{currentStepConfig.title}</Text>
            <Text style={styles.stepSubtitle}>{currentStepConfig.subtitle}</Text>
          </View>

          {/* Step Content */}
          {isReviewStep ? (
            <ReviewStep draft={draft} onEdit={goToStep} />
          ) : isPhotoStep ? (
            <PhotoStep
              photoUri={draft.photoUri}
              onPhotoSelected={(uri) => updateDraft({ photoUri: uri })}
            />
          ) : isJournalStep ? (
            <JournalStep
              value={draft.journalEntry || ''}
              onChange={(text) => updateDraft({ journalEntry: text })}
            />
          ) : (
            <MetricStep
              metricKey={currentStepConfig.key as MetricKey}
              value={draft[currentStepConfig.key as MetricKey]}
              onChange={handleMetricChange}
              healthDataUsed={
                currentStepConfig.key === 'sleep' &&
                isConnected &&
                permissions.sleep &&
                healthDataLoaded &&
                draft.sleep !== undefined &&
                draft.sleep !== 5
              }
            />
          )}
        </ScrollView>
      </Animated.View>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        <Button
          title="Back"
          variant="ghost"
          onPress={handleBack}
          style={styles.backButton}
        />
        {isLastStep ? (
          <Button
            title="Submit Check-in"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.nextButton}
          />
        ) : (
          <Button
            title="Continue"
            onPress={handleNext}
            disabled={!canProceed()}
            style={styles.nextButton}
          />
        )}
      </View>

      {/* Crisis Detection Modal */}
      <CrisisModal
        visible={showCrisisModal}
        severity={crisisSeverity}
        onDismiss={handleCrisisDismiss}
        onAcknowledge={handleCrisisAcknowledge}
      />
    </KeyboardAvoidingView>
  );
}

// Metric Step Component
function MetricStep({
  metricKey,
  value,
  onChange,
  healthDataUsed,
}: {
  metricKey: MetricKey;
  value?: number;
  onChange: (value: number) => void;
  healthDataUsed?: boolean;
}) {
  const config = METRICS[metricKey];

  return (
    <View style={styles.metricContainer}>
      {healthDataUsed && (
        <View style={styles.healthDataBadge}>
          <Ionicons name="fitness" size={16} color={colors.primary} />
          <Text style={styles.healthDataText}>Pre-filled from Health data</Text>
        </View>
      )}
      <MetricSlider
        value={value ?? 5}
        onChange={onChange}
        min={1}
        max={10}
        lowLabel={config.lowLabel}
        highLabel={config.highLabel}
        inverted={config.invertedScale}
        color={getMetricColor(metricKey)}
      />
    </View>
  );
}

// Journal Step Component
function JournalStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    <View style={styles.journalContainer}>
      <Card style={styles.journalCard}>
        <TextInput
          style={styles.journalInput}
          placeholder="Write about your day, thoughts, or feelings..."
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={JOURNAL_MAX_LENGTH}
          value={value}
          onChangeText={onChange}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>
          {value.length} / {JOURNAL_MAX_LENGTH}
        </Text>
      </Card>
      <Text style={styles.journalHint}>
        This is optional. Your journal is private and secure.
      </Text>
    </View>
  );
}

// Photo Step Component
function PhotoStep({
  photoUri,
  onPhotoSelected,
}: {
  photoUri?: string;
  onPhotoSelected: (uri: string | undefined) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleTakePhoto = async () => {
    setIsLoading(true);
    const uri = await takePhoto();
    setIsLoading(false);
    if (uri) {
      onPhotoSelected(uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handlePickImage = async () => {
    setIsLoading(true);
    const uri = await pickImage();
    setIsLoading(false);
    if (uri) {
      onPhotoSelected(uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleRemovePhoto = () => {
    onPhotoSelected(undefined);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.photoContainer}>
      {photoUri ? (
        <View style={styles.photoPreviewContainer}>
          <Card style={styles.photoPreview}>
            <Image source={{ uri: photoUri }} style={styles.photoImage} resizeMode="cover" />
            <Pressable style={styles.removePhotoButton} onPress={handleRemovePhoto}>
              <Ionicons name="close-circle" size={32} color={colors.error} />
            </Pressable>
          </Card>
          <Text style={styles.photoHint}>
            This photo will be added to your mood board
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.photoButtonsContainer}>
            <Pressable
              style={styles.photoButton}
              onPress={handleTakePhoto}
              disabled={isLoading}
            >
              <View style={[styles.photoButtonIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="camera" size={32} color={colors.primary} />
              </View>
              <Text style={styles.photoButtonLabel}>Take Photo</Text>
            </Pressable>

            <Pressable
              style={styles.photoButton}
              onPress={handlePickImage}
              disabled={isLoading}
            >
              <View style={[styles.photoButtonIcon, { backgroundColor: colors.secondary + '15' }]}>
                <Ionicons name="images" size={32} color={colors.secondary} />
              </View>
              <Text style={styles.photoButtonLabel}>Choose from Gallery</Text>
            </Pressable>
          </View>

          <Text style={styles.photoHint}>
            Optional: Capture a moment from your day to remember this check-in
          </Text>
        </>
      )}
    </View>
  );
}

// Review Step Component
type CheckinDraft = Partial<{
  mood: number;
  stress: number;
  sleep: number;
  energy: number;
  focus: number;
  anxiety: number;
  journalEntry: string;
}>;

function ReviewStep({
  draft,
  onEdit,
}: {
  draft: CheckinDraft;
  onEdit: (step: number) => void;
}) {
  return (
    <View style={styles.reviewContainer}>
      {METRIC_ORDER.map((key, index) => {
        const value = draft[key as keyof CheckinDraft] as number | undefined;
        const config = METRICS[key];
        return (
          <Pressable
            key={key}
            style={styles.reviewItem}
            onPress={() => onEdit(index)}
          >
            <View style={styles.reviewItemLeft}>
              <Ionicons
                name={getMetricIcon(key)}
                size={24}
                color={getMetricColor(key)}
              />
              <Text style={styles.reviewItemLabel}>{config.label}</Text>
            </View>
            <View style={styles.reviewItemRight}>
              <Text style={styles.reviewItemValue}>{value ?? '-'}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </Pressable>
        );
      })}

      {draft.journalEntry && (
        <Pressable
          style={styles.reviewJournal}
          onPress={() => onEdit(STEPS.length - 2)}
        >
          <View style={styles.reviewItemLeft}>
            <Ionicons name="document-text" size={24} color={colors.primary} />
            <Text style={styles.reviewItemLabel}>Journal Entry</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </Pressable>
      )}
    </View>
  );
}

// Checkin Complete Component
function CheckinComplete({ onNewCheckin }: { onNewCheckin: () => void }) {
  const router = useRouter();

  return (
    <View style={styles.completeContainer}>
      <View style={styles.completeIcon}>
        <Ionicons name="checkmark-circle" size={80} color={colors.success} />
      </View>
      <Text style={styles.completeTitle}>Already Checked In!</Text>
      <Text style={styles.completeSubtitle}>
        You've already completed your check-in today. Great job staying consistent!
      </Text>
      <Button
        title="View Today's Plan"
        onPress={onNewCheckin}
        style={styles.completeButton}
      />

      {/* Telehealth Suggestion */}
      <Pressable
        style={styles.telehealthSuggestion}
        onPress={() => router.push('/(telehealth)')}
      >
        <View style={styles.telehealthSuggestionIcon}>
          <Ionicons name="videocam" size={24} color={colors.secondary} />
        </View>
        <View style={styles.telehealthSuggestionContent}>
          <Text style={styles.telehealthSuggestionTitle}>
            Want to talk to someone?
          </Text>
          <Text style={styles.telehealthSuggestionSubtitle}>
            Book a telehealth session with a therapist
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.secondary} />
      </Pressable>
    </View>
  );
}

// Helper functions
function getMetricColor(key: string): string {
  const colorMap: Record<string, string> = {
    mood: colors.primary,
    stress: colors.error,
    sleep: colors.coping,
    energy: colors.connection,
    focus: colors.info,
    anxiety: colors.secondary,
  };
  return colorMap[key] || colors.primary;
}

function getMetricIcon(key: string): keyof typeof Ionicons.glyphMap {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    mood: 'happy',
    stress: 'flash',
    sleep: 'moon',
    energy: 'battery-charging',
    focus: 'eye',
    anxiety: 'pulse',
  };
  return iconMap[key] || 'ellipse';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    minWidth: 50,
    textAlign: 'right',
  },
  stepContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  stepHeader: {
    marginBottom: spacing.xl,
  },
  stepTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  metricContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  healthDataBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
    alignSelf: 'center',
  },
  healthDataText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  journalContainer: {
    flex: 1,
  },
  journalCard: {
    minHeight: 200,
  },
  journalInput: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    minHeight: 150,
    lineHeight: 24,
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
  journalHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  photoButtonsContainer: {
    gap: spacing.md,
  },
  photoButton: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photoButtonIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  photoButtonLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  photoHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 20,
  },
  photoPreviewContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  photoPreview: {
    overflow: 'hidden',
    padding: 0,
    height: 400,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewContainer: {
    gap: spacing.sm,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  reviewItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  reviewItemLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  reviewItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewItemValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  reviewJournal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nextButton: {
    flex: 1,  // Equal size with back button for balanced navigation
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  completeIcon: {
    marginBottom: spacing.lg,
  },
  completeTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  completeSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  completeButton: {
    minWidth: 200,
  },
  // Telehealth Suggestion
  telehealthSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary + '10',
    borderWidth: 1,
    borderColor: colors.secondary + '30',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginTop: spacing.xl,
    width: '100%',
  },
  telehealthSuggestionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  telehealthSuggestionContent: {
    flex: 1,
  },
  telehealthSuggestionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  telehealthSuggestionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
