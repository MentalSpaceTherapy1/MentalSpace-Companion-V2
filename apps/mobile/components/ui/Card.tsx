/**
 * Card Component
 * Reusable card container with consistent styling and accessibility support
 */

import { View, StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { useAccessibilitySettings } from '../../utils/accessibility';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'none';
}

export function Card({
  children,
  style,
  variant = 'default',
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
}: CardProps) {
  const { theme, reduceMotion } = useAccessibilitySettings();

  const content = (
    <View
      style={[
        styles.card,
        getVariantStyle(variant, theme, reduceMotion),
        { borderRadius: theme.borderRadius.lg },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          pressed && !reduceMotion && styles.pressed,
          { minHeight: theme.minimumTouchTarget },
        ]}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole || 'button'}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

function getVariantStyle(variant: string, theme: any, reduceMotion: boolean) {
  switch (variant) {
    case 'elevated':
      return {
        backgroundColor: theme.colors.surface,
        ...(reduceMotion ? {} : shadows.lg),
      };
    case 'outlined':
      return {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
      };
    default:
      return {
        backgroundColor: theme.colors.surface,
        ...(reduceMotion ? {} : shadows.sm),
      };
  }
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
