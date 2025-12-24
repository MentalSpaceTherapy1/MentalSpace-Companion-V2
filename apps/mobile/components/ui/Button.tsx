/**
 * Button Component
 * Reusable button with multiple variants and accessibility support
 */

import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useAccessibilitySettings, getAccessibleButtonProps } from '../../utils/accessibility';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const { theme, reduceMotion, highContrast } = useAccessibilitySettings();

  // Get accessible colors
  const buttonColors = highContrast ? theme.colors : colors;

  // Get accessibility props
  const a11yProps = getAccessibleButtonProps(
    accessibilityLabel || title,
    accessibilityHint,
    'button'
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        getButtonStyle(variant, buttonColors),
        getSizeStyle(size, theme),
        isDisabled && styles.disabled,
        pressed && !isDisabled && !reduceMotion && styles.pressed,
        { minHeight: theme.minimumTouchTarget },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      {...a11yProps}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? buttonColors.textInverse : buttonColors.primary}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              getTextStyle(variant, buttonColors),
              getTextSizeStyle(size, theme),
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

// Helper functions for dynamic styles
function getButtonStyle(variant: string, buttonColors: any) {
  switch (variant) {
    case 'primary':
      return { backgroundColor: buttonColors.primary };
    case 'secondary':
      return { backgroundColor: buttonColors.surfaceSecondary };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: buttonColors.primary,
      };
    case 'ghost':
      return { backgroundColor: 'transparent' };
    default:
      return { backgroundColor: buttonColors.primary };
  }
}

function getTextStyle(variant: string, buttonColors: any) {
  switch (variant) {
    case 'primary':
      return { color: buttonColors.textInverse };
    case 'secondary':
      return { color: buttonColors.text };
    case 'outline':
    case 'ghost':
      return { color: buttonColors.primary };
    default:
      return { color: buttonColors.textInverse };
  }
}

function getSizeStyle(size: string, theme: any) {
  switch (size) {
    case 'sm':
      return {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
      };
    case 'lg':
      return {
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.xl,
      };
    default:
      return {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
      };
  }
}

function getTextSizeStyle(size: string, theme: any) {
  switch (size) {
    case 'sm':
      return { fontSize: theme.fontSize.sm };
    case 'lg':
      return { fontSize: theme.fontSize.lg };
    default:
      return { fontSize: theme.fontSize.base };
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceSecondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  size_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  size_lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
  },
  text_primary: {
    color: colors.textInverse,
  },
  text_secondary: {
    color: colors.text,
  },
  text_outline: {
    color: colors.primary,
  },
  text_ghost: {
    color: colors.primary,
  },
  text_sm: {
    fontSize: typography.fontSize.sm,
  },
  text_md: {
    fontSize: typography.fontSize.base,
  },
  text_lg: {
    fontSize: typography.fontSize.lg,
  },
});
