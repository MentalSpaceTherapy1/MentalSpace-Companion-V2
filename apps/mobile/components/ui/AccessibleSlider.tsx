/**
 * Accessible Slider Component
 * Slider with enhanced accessibility features
 */

import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useAccessibilitySettings, getAccessibleSliderProps } from '../../utils/accessibility';
import { AccessibleText } from '../AccessibleText';
import { colors, spacing } from '../../constants/theme';

interface AccessibleSliderProps {
  label: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  onValueChange: (value: number) => void;
  formatValue?: (value: number) => string;
  hint?: string;
  disabled?: boolean;
}

export function AccessibleSlider({
  label,
  value,
  minimumValue,
  maximumValue,
  step = 1,
  onValueChange,
  formatValue = (v) => v.toString(),
  hint,
  disabled = false,
}: AccessibleSliderProps) {
  const { theme } = useAccessibilitySettings();

  const a11yProps = getAccessibleSliderProps(
    label,
    value,
    minimumValue,
    maximumValue,
    hint
  );

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <AccessibleText variant="body" weight="medium">
          {label}
        </AccessibleText>
        <AccessibleText variant="body" weight="semibold" style={{ color: theme.colors.primary }}>
          {formatValue(value)}
        </AccessibleText>
      </View>

      <Slider
        style={[styles.slider, { minHeight: theme.minimumTouchTarget }]}
        value={value}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        onValueChange={onValueChange}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.border}
        thumbTintColor={theme.colors.primary}
        disabled={disabled}
        {...a11yProps}
      />

      {hint && (
        <AccessibleText variant="caption" style={styles.hint}>
          {hint}
        </AccessibleText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  hint: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
