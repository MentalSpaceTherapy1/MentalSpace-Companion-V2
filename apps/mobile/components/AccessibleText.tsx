/**
 * AccessibleText Component
 * Text component that respects accessibility settings
 */

import { Text, TextProps, StyleSheet } from 'react-native';
import { useAccessibilitySettings, useAccessibleFontFamily } from '../utils/accessibility';
import { typography } from '../constants/theme';

interface AccessibleTextProps extends TextProps {
  variant?: 'body' | 'caption' | 'heading' | 'title' | 'label';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export function AccessibleText({
  variant = 'body',
  weight = 'normal',
  style,
  children,
  ...props
}: AccessibleTextProps) {
  const { theme, dyslexiaFont } = useAccessibilitySettings();
  const fontFamily = useAccessibleFontFamily();

  const variantStyle = {
    body: { fontSize: theme.fontSize.base },
    caption: { fontSize: theme.fontSize.sm },
    heading: { fontSize: theme.fontSize.xl },
    title: { fontSize: theme.fontSize['2xl'] },
    label: { fontSize: theme.fontSize.sm },
  }[variant];

  const weightStyle = {
    normal: { fontWeight: typography.fontWeight.normal },
    medium: { fontWeight: typography.fontWeight.medium },
    semibold: { fontWeight: typography.fontWeight.semibold },
    bold: { fontWeight: typography.fontWeight.bold },
  }[weight];

  return (
    <Text
      style={[
        styles.text,
        variantStyle,
        weightStyle,
        dyslexiaFont && fontFamily && { fontFamily },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#1A2B3C',
  },
});
