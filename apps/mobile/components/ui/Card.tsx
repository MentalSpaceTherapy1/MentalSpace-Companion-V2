/**
 * Card Component
 * Reusable card container with consistent styling
 */

import { View, StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
}

export function Card({ children, style, variant = 'default', onPress }: CardProps) {
  const content = (
    <View style={[styles.card, styles[variant], style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  default: {
    ...shadows.sm,
  },
  elevated: {
    ...shadows.lg,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
