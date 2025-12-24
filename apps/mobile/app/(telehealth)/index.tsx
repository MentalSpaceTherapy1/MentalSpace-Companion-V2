/**
 * Telehealth Appointment Request Screen
 * Multi-step form to request a telehealth appointment with a therapist
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import {
  TELEHEALTH_APPOINTMENT_TYPES,
  TELEHEALTH_URGENCY_LEVELS,
  US_STATES,
  INSURANCE_PROVIDERS,
  TELEHEALTH_REASONS,
} from '@mentalspace/shared';
import type {
  TelehealthAppointmentType,
  TelehealthUrgency,
  USState,
  InsuranceProvider,
} from '@mentalspace/shared';
import { trackTherapistBooked } from '../../services/analytics';

type Step = 'type' | 'urgency' | 'contact' | 'insurance' | 'reason' | 'review';

interface FormData {
  appointmentType: TelehealthAppointmentType | null;
  urgency: TelehealthUrgency | null;
  fullName: string;
  email: string;
  phone: string;
  state: USState | null;
  hasInsurance: boolean | null;
  insuranceProvider: InsuranceProvider | null;
  memberId: string;
  reasonForVisit: string;
  additionalNotes: string;
}

const STEPS: Step[] = ['type', 'urgency', 'contact', 'insurance', 'reason', 'review'];

export default function TelehealthRequestScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>('type');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showInsurancePicker, setShowInsurancePicker] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    appointmentType: null,
    urgency: null,
    fullName: profile?.displayName || '',
    email: profile?.email || '',
    phone: '',
    state: null,
    hasInsurance: null,
    insuranceProvider: null,
    memberId: '',
    reasonForVisit: '',
    additionalNotes: '',
  });

  const currentStepIndex = STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleClose = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
        router.back();
      }
    } else {
      Alert.alert(
        'Exit Request',
        'Are you sure you want to exit? Your progress will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', style: 'destructive', onPress: () => router.back() },
        ]
      );
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    } else {
      handleClose();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Track therapist booking
    trackTherapistBooked({
      session_type: formData.appointmentType === 'initial_consult' ? 'initial' : 'follow_up',
    });

    // Simulate API call - in production, this would save to Firestore
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Navigate to success screen
    router.replace('/(telehealth)/success');
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'type':
        return formData.appointmentType !== null;
      case 'urgency':
        return formData.urgency !== null;
      case 'contact':
        return (
          formData.fullName.trim().length >= 2 &&
          formData.email.includes('@') &&
          formData.phone.length >= 10 &&
          formData.state !== null
        );
      case 'insurance':
        if (formData.hasInsurance === null) return false;
        if (formData.hasInsurance && formData.insuranceProvider === null) return false;
        return true;
      case 'reason':
        return formData.reasonForVisit.trim().length >= 3;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const formatPhone = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'type':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>How would you like to connect?</Text>
            <Text style={styles.stepSubtitle}>
              Choose the type of session that works best for you
            </Text>
            <View style={styles.optionsList}>
              {TELEHEALTH_APPOINTMENT_TYPES.map((type) => {
                const isSelected = formData.appointmentType === type.id;
                return (
                  <Pressable
                    key={type.id}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFormData((prev) => ({ ...prev, appointmentType: type.id }));
                    }}
                  >
                    <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
                      <Ionicons
                        name={type.icon as any}
                        size={28}
                        color={isSelected ? colors.textInverse : colors.primary}
                      />
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={styles.optionTitle}>{type.label}</Text>
                      <Text style={styles.optionDescription}>{type.description}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark" size={20} color={colors.primary} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        );

      case 'urgency':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>How soon do you need to talk?</Text>
            <Text style={styles.stepSubtitle}>
              This helps us prioritize your request appropriately
            </Text>
            <View style={styles.optionsList}>
              {TELEHEALTH_URGENCY_LEVELS.map((level) => {
                const isSelected = formData.urgency === level.id;
                return (
                  <Pressable
                    key={level.id}
                    style={[
                      styles.optionCard,
                      isSelected && { borderColor: level.color, borderWidth: 2 },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFormData((prev) => ({ ...prev, urgency: level.id }));
                    }}
                  >
                    <View style={[styles.urgencyDot, { backgroundColor: level.color }]} />
                    <View style={styles.optionContent}>
                      <Text style={styles.optionTitle}>{level.label}</Text>
                      <Text style={styles.optionDescription}>{level.description}</Text>
                      <Text style={[styles.responseTime, { color: level.color }]}>
                        {level.responseTime}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.checkmark, { backgroundColor: level.color + '20' }]}>
                        <Ionicons name="checkmark" size={20} color={level.color} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
            {formData.urgency === 'crisis' && (
              <Card style={styles.crisisWarning}>
                <Ionicons name="alert-circle" size={24} color={colors.error} />
                <Text style={styles.crisisText}>
                  If you're in immediate danger, please call 988 or go to your nearest emergency room.
                </Text>
              </Card>
            )}
          </View>
        );

      case 'contact':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Your Contact Information</Text>
            <Text style={styles.stepSubtitle}>
              We'll use this to reach out and schedule your appointment
            </Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, fullName: text }))}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
                placeholder="your.email@example.com"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: formatPhone(text) }))}
                placeholder="(555) 123-4567"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
                maxLength={14}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>State *</Text>
              <Pressable
                style={styles.pickerButton}
                onPress={() => setShowStatePicker(!showStatePicker)}
              >
                <Text style={formData.state ? styles.pickerText : styles.pickerPlaceholder}>
                  {formData.state
                    ? US_STATES.find((s) => s.id === formData.state)?.label
                    : 'Select your state'}
                </Text>
                <Ionicons
                  name={showStatePicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
              {showStatePicker && (
                <View style={styles.pickerDropdown}>
                  <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                    {US_STATES.map((state) => (
                      <Pressable
                        key={state.id}
                        style={[
                          styles.pickerItem,
                          formData.state === state.id && styles.pickerItemSelected,
                        ]}
                        onPress={() => {
                          setFormData((prev) => ({ ...prev, state: state.id }));
                          setShowStatePicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            formData.state === state.id && styles.pickerItemTextSelected,
                          ]}
                        >
                          {state.label}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        );

      case 'insurance':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Insurance Information</Text>
            <Text style={styles.stepSubtitle}>
              Let us know if you have insurance coverage
            </Text>
            <View style={styles.insuranceToggle}>
              <Pressable
                style={[
                  styles.insuranceOption,
                  formData.hasInsurance === true && styles.insuranceOptionSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFormData((prev) => ({ ...prev, hasInsurance: true }));
                }}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={24}
                  color={formData.hasInsurance === true ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.insuranceOptionText,
                    formData.hasInsurance === true && styles.insuranceOptionTextSelected,
                  ]}
                >
                  Yes, I have insurance
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.insuranceOption,
                  formData.hasInsurance === false && styles.insuranceOptionSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFormData((prev) => ({
                    ...prev,
                    hasInsurance: false,
                    insuranceProvider: null,
                    memberId: '',
                  }));
                }}
              >
                <Ionicons
                  name="cash"
                  size={24}
                  color={formData.hasInsurance === false ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.insuranceOptionText,
                    formData.hasInsurance === false && styles.insuranceOptionTextSelected,
                  ]}
                >
                  No, I'll pay out of pocket
                </Text>
              </Pressable>
            </View>

            {formData.hasInsurance && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Insurance Provider *</Text>
                  <Pressable
                    style={styles.pickerButton}
                    onPress={() => setShowInsurancePicker(!showInsurancePicker)}
                  >
                    <Text
                      style={formData.insuranceProvider ? styles.pickerText : styles.pickerPlaceholder}
                    >
                      {formData.insuranceProvider
                        ? INSURANCE_PROVIDERS.find((p) => p.id === formData.insuranceProvider)?.label
                        : 'Select your insurance'}
                    </Text>
                    <Ionicons
                      name={showInsurancePicker ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                  {showInsurancePicker && (
                    <View style={styles.pickerDropdown}>
                      <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                        <Text style={styles.pickerSectionHeader}>Popular Plans</Text>
                        {INSURANCE_PROVIDERS.filter((p) => p.popular).map((provider) => (
                          <Pressable
                            key={provider.id}
                            style={[
                              styles.pickerItem,
                              formData.insuranceProvider === provider.id && styles.pickerItemSelected,
                            ]}
                            onPress={() => {
                              setFormData((prev) => ({ ...prev, insuranceProvider: provider.id }));
                              setShowInsurancePicker(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.pickerItemText,
                                formData.insuranceProvider === provider.id &&
                                  styles.pickerItemTextSelected,
                              ]}
                            >
                              {provider.label}
                            </Text>
                          </Pressable>
                        ))}
                        <Text style={styles.pickerSectionHeader}>All Providers</Text>
                        {INSURANCE_PROVIDERS.filter((p) => !p.popular).map((provider) => (
                          <Pressable
                            key={provider.id}
                            style={[
                              styles.pickerItem,
                              formData.insuranceProvider === provider.id && styles.pickerItemSelected,
                            ]}
                            onPress={() => {
                              setFormData((prev) => ({ ...prev, insuranceProvider: provider.id }));
                              setShowInsurancePicker(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.pickerItemText,
                                formData.insuranceProvider === provider.id &&
                                  styles.pickerItemTextSelected,
                              ]}
                            >
                              {provider.label}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Member ID (optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.memberId}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, memberId: text }))}
                    placeholder="Your member ID number"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              </>
            )}

            {formData.hasInsurance === false && (
              <Card style={styles.selfPayInfo}>
                <Ionicons name="information-circle" size={24} color={colors.primary} />
                <Text style={styles.selfPayText}>
                  We offer sliding scale rates based on income. Our team will discuss payment options
                  during your consultation.
                </Text>
              </Card>
            )}
          </View>
        );

      case 'reason':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What brings you in?</Text>
            <Text style={styles.stepSubtitle}>
              This helps us match you with the right therapist
            </Text>
            <View style={styles.reasonTags}>
              {TELEHEALTH_REASONS.map((reason) => {
                const isSelected = formData.reasonForVisit === reason;
                return (
                  <Pressable
                    key={reason}
                    style={[styles.reasonTag, isSelected && styles.reasonTagSelected]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFormData((prev) => ({ ...prev, reasonForVisit: reason }));
                    }}
                  >
                    <Text style={[styles.reasonTagText, isSelected && styles.reasonTagTextSelected]}>
                      {reason}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Additional Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.additionalNotes}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, additionalNotes: text }))}
                placeholder="Anything else you'd like us to know..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        );

      case 'review':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review Your Request</Text>
            <Text style={styles.stepSubtitle}>
              Please confirm your information is correct
            </Text>
            <Card style={styles.reviewCard}>
              <ReviewRow
                label="Appointment Type"
                value={
                  TELEHEALTH_APPOINTMENT_TYPES.find((t) => t.id === formData.appointmentType)?.label ||
                  ''
                }
              />
              <ReviewRow
                label="Urgency"
                value={
                  TELEHEALTH_URGENCY_LEVELS.find((u) => u.id === formData.urgency)?.label || ''
                }
              />
              <ReviewRow label="Name" value={formData.fullName} />
              <ReviewRow label="Email" value={formData.email} />
              <ReviewRow label="Phone" value={formData.phone} />
              <ReviewRow
                label="State"
                value={US_STATES.find((s) => s.id === formData.state)?.label || ''}
              />
              <ReviewRow
                label="Insurance"
                value={
                  formData.hasInsurance
                    ? INSURANCE_PROVIDERS.find((p) => p.id === formData.insuranceProvider)?.label ||
                      'Yes'
                    : 'Self-pay'
                }
              />
              <ReviewRow label="Reason for Visit" value={formData.reasonForVisit} />
            </Card>
            <Text style={styles.disclaimer}>
              By submitting this request, you agree to be contacted by MentalSpace EHR regarding
              your appointment. Your information is protected under HIPAA.
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Request Appointment</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Step {currentStepIndex + 1} of {STEPS.length}
        </Text>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          {currentStepIndex > 0 && (
            <Button
              title="Back"
              variant="ghost"
              onPress={handleBack}
              style={styles.backButton}
            />
          )}
          <Button
            title={currentStep === 'review' ? 'Submit Request' : 'Continue'}
            onPress={currentStep === 'review' ? handleSubmit : handleNext}
            disabled={!canProceed()}
            loading={isSubmitting}
            style={styles.nextButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  placeholder: {
    width: 32,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  progressTrack: {
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
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  stepContent: {
    paddingTop: spacing.md,
  },
  stepTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  optionsList: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + '08',
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionIconSelected: {
    backgroundColor: colors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgencyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  responseTime: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.xs,
  },
  crisisWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.error + '10',
    borderColor: colors.error + '30',
    borderWidth: 1,
    marginTop: spacing.lg,
  },
  crisisText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  pickerText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  pickerPlaceholder: {
    fontSize: typography.fontSize.base,
    color: colors.textTertiary,
  },
  pickerDropdown: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    maxHeight: 200,
    overflow: 'hidden',
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerSectionHeader: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  pickerItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerItemSelected: {
    backgroundColor: colors.primary + '10',
  },
  pickerItemText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  pickerItemTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  insuranceToggle: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  insuranceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  insuranceOptionSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + '08',
  },
  insuranceOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  insuranceOptionTextSelected: {
    color: colors.primary,
  },
  selfPayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary + '10',
    marginTop: spacing.lg,
  },
  selfPayText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  reasonTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  reasonTag: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonTagSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  reasonTagText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  reasonTagTextSelected: {
    color: colors.textInverse,
    fontWeight: typography.fontWeight.medium,
  },
  reviewCard: {
    marginBottom: spacing.lg,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  reviewValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  disclaimer: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
