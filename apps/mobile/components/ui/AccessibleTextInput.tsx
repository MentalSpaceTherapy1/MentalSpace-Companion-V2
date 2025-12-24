/**
 * Accessible TextInput Component
 * Text input with enhanced accessibility features
 */

import { View, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useAccessibilitySettings, getAccessibleTextInputProps } from '../../utils/accessibility';
import { AccessibleText } from '../AccessibleText';
import { colors, spacing, borderRadius } from '../../constants/theme';

interface AccessibleTextInputProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
  containerStyle?: any;
}

export function AccessibleTextInput({
  label,
  hint,
  error,
  value,
  containerStyle,
  style,
  ...props
}: AccessibleTextInputProps) {
  const { theme } = useAccessibilitySettings();

  const a11yProps = getAccessibleTextInputProps(label, hint, value);

  return (
    <View style={[styles.container, containerStyle]}>
      <AccessibleText variant="label" weight="medium" style={styles.label}>
        {label}
      </AccessibleText>

      <TextInput
        value={value}
        style={[
          styles.input,
          {
            fontSize: theme.fontSize.base,
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.error : theme.colors.border,
            color: theme.colors.text,
            minHeight: theme.minimumTouchTarget,
          },
          style,
        ]}
        placeholderTextColor={theme.colors.textTertiary}
        {...a11yProps}
        {...props}
      />

      {hint && !error && (
        <AccessibleText variant="caption" style={styles.hint}>
          {hint}
        </AccessibleText>
      )}

      {error && (
        <AccessibleText variant="caption" style={[styles.hint, styles.error]}>
          {error}
        </AccessibleText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  hint: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.error,
  },
});
