/**
 * Accessibility Settings Screen
 * Configure text size, contrast, motion, fonts, and touch targets
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibilityStore, type TextSize } from '../../stores/accessibilityStore';
import { useAccessibilitySettings } from '../../utils/accessibility';
import { AccessibleText } from '../../components/AccessibleText';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius } from '../../constants/theme';

export default function AccessibilityScreen() {
  const store = useAccessibilityStore();
  const { theme, reduceMotion } = useAccessibilitySettings();
  const [previewText, setPreviewText] = useState('This is a preview of how text will appear');

  const textSizeOptions: { value: TextSize; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'large', label: 'Large (+15%)' },
    { value: 'xlarge', label: 'Extra Large (+30%)' },
  ];

  const handleReset = () => {
    Alert.alert(
      'Reset Accessibility Settings',
      'Are you sure you want to reset all accessibility settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => store.resetToDefaults(),
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Accessibility',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <AccessibleText variant="title" weight="bold">
            Accessibility Settings
          </AccessibleText>
          <AccessibleText variant="body" style={styles.subtitle}>
            Customize your experience for better usability
          </AccessibleText>
        </View>

        {/* Text Size Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="text"
              size={24}
              color={theme.colors.primary}
              style={styles.sectionIcon}
            />
            <AccessibleText variant="heading" weight="semibold">
              Text Size
            </AccessibleText>
          </View>

          <View style={styles.optionsContainer}>
            {textSizeOptions.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.option,
                  store.textSize === option.value && styles.optionSelected,
                  { borderColor: theme.colors.border },
                ]}
                onPress={() => store.updateSetting('textSize', option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: store.textSize === option.value }}
                accessibilityLabel={`${option.label} text size`}
              >
                <Text
                  style={[
                    styles.optionText,
                    store.textSize === option.value && {
                      color: theme.colors.primary,
                      fontWeight: '600',
                    },
                  ]}
                >
                  {option.label}
                </Text>
                {store.textSize === option.value && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                )}
              </Pressable>
            ))}
          </View>

          {/* Preview */}
          <View
            style={[
              styles.previewBox,
              { backgroundColor: theme.colors.surfaceSecondary },
            ]}
          >
            <AccessibleText variant="body" style={styles.previewLabel}>
              Preview:
            </AccessibleText>
            <AccessibleText variant="body" style={styles.previewText}>
              {previewText}
            </AccessibleText>
            <AccessibleText variant="caption" style={styles.previewSubtext}>
              Current size: {textSizeOptions.find((o) => o.value === store.textSize)?.label}
            </AccessibleText>
          </View>
        </View>

        {/* Visual Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="contrast"
              size={24}
              color={theme.colors.primary}
              style={styles.sectionIcon}
            />
            <AccessibleText variant="heading" weight="semibold">
              Visual
            </AccessibleText>
          </View>

          <SettingToggle
            label="High Contrast Mode"
            description="Increases color contrast for better visibility"
            value={store.highContrast}
            onValueChange={(value) => store.updateSetting('highContrast', value)}
            icon="color-palette"
          />

          <SettingToggle
            label="Reduce Motion"
            description="Minimizes animations and transitions"
            value={store.reduceMotion}
            onValueChange={(value) => store.updateSetting('reduceMotion', value)}
            icon="speedometer"
          />
        </View>

        {/* Typography Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="book"
              size={24}
              color={theme.colors.primary}
              style={styles.sectionIcon}
            />
            <AccessibleText variant="heading" weight="semibold">
              Typography
            </AccessibleText>
          </View>

          <SettingToggle
            label="Dyslexia-Friendly Font"
            description="Uses OpenDyslexic font for easier reading"
            value={store.dyslexiaFont}
            onValueChange={(value) => store.updateSetting('dyslexiaFont', value)}
            icon="glasses"
          />
        </View>

        {/* Interaction Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="hand-left"
              size={24}
              color={theme.colors.primary}
              style={styles.sectionIcon}
            />
            <AccessibleText variant="heading" weight="semibold">
              Interaction
            </AccessibleText>
          </View>

          <SettingToggle
            label="Larger Touch Targets"
            description="Makes buttons and interactive elements bigger"
            value={store.largerTouchTargets}
            onValueChange={(value) => store.updateSetting('largerTouchTargets', value)}
            icon="resize"
          />

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={theme.colors.info} />
            <AccessibleText variant="caption" style={styles.infoText}>
              Minimum touch target: {theme.minimumTouchTarget}pt
            </AccessibleText>
          </View>
        </View>

        {/* Screen Reader Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="volume-medium"
              size={24}
              color={theme.colors.primary}
              style={styles.sectionIcon}
            />
            <AccessibleText variant="heading" weight="semibold">
              Screen Reader
            </AccessibleText>
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <AccessibleText variant="body" weight="medium" style={styles.cardTitle}>
              VoiceOver & TalkBack
            </AccessibleText>
            <AccessibleText variant="caption" style={styles.cardDescription}>
              This app is optimized for screen readers with:
            </AccessibleText>
            <View style={styles.featureList}>
              <FeatureItem text="Descriptive labels for all interactive elements" />
              <FeatureItem text="Contextual hints for complex interactions" />
              <FeatureItem text="Proper heading hierarchy for navigation" />
              <FeatureItem text="Announcements for important state changes" />
            </View>
            <AccessibleText variant="caption" style={styles.cardFooter}>
              Enable VoiceOver (iOS) or TalkBack (Android) in your device settings.
            </AccessibleText>
          </View>
        </View>

        {/* Reset Button */}
        <View style={styles.section}>
          <Button
            title="Reset to Defaults"
            onPress={handleReset}
            variant="outline"
            accessibilityLabel="Reset all accessibility settings to default values"
            accessibilityHint="Double tap to confirm reset"
          />
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </>
  );
}

interface SettingToggleProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon: keyof typeof Ionicons.glyphMap;
}

function SettingToggle({ label, description, value, onValueChange, icon }: SettingToggleProps) {
  const { theme } = useAccessibilitySettings();

  return (
    <View
      style={[
        styles.toggleContainer,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <View style={styles.toggleIcon}>
        <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
      </View>
      <View style={styles.toggleContent}>
        <AccessibleText variant="body" weight="medium">
          {label}
        </AccessibleText>
        <AccessibleText variant="caption" style={styles.toggleDescription}>
          {description}
        </AccessibleText>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={value ? theme.colors.white : theme.colors.textTertiary}
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        accessibilityHint={description}
      />
    </View>
  );
}

interface FeatureItemProps {
  text: string;
}

function FeatureItem({ text }: FeatureItemProps) {
  const { theme } = useAccessibilitySettings();

  return (
    <View style={styles.featureItem}>
      <Ionicons
        name="checkmark-circle"
        size={16}
        color={theme.colors.success}
        style={styles.featureIcon}
      />
      <AccessibleText variant="caption" style={styles.featureText}>
        {text}
      </AccessibleText>
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
  },
  header: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  previewBox: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  previewLabel: {
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  previewText: {
    marginBottom: spacing.xs,
  },
  previewSubtext: {
    color: colors.textSecondary,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  toggleIcon: {
    marginRight: spacing.md,
  },
  toggleContent: {
    flex: 1,
  },
  toggleDescription: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  cardTitle: {
    marginBottom: spacing.sm,
  },
  cardDescription: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  featureList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    color: colors.textSecondary,
  },
  cardFooter: {
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.info + '10',
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  infoText: {
    color: colors.textSecondary,
  },
});
