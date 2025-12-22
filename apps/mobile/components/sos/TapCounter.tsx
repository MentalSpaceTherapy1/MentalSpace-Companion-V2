/**
 * Tap Counter Component
 * Interactive tap counter for grounding exercises (5-4-3-2-1)
 */

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../utils/haptics';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface TapCounterProps {
  targetCount: number;
  instruction: string;
  sense: 'see' | 'touch' | 'hear' | 'smell' | 'taste';
  onComplete: () => void;
}

const senseConfig = {
  see: { icon: 'eye', color: colors.primary, label: 'things you can SEE' },
  touch: { icon: 'hand-left', color: colors.secondary, label: 'things you can TOUCH' },
  hear: { icon: 'ear', color: colors.accent, label: 'things you can HEAR' },
  smell: { icon: 'rose', color: colors.connection, label: 'things you can SMELL' },
  taste: { icon: 'restaurant', color: colors.coping, label: 'thing you can TASTE' },
};

export function TapCounter({
  targetCount,
  instruction,
  sense,
  onComplete,
}: TapCounterProps) {
  const [count, setCount] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const config = senseConfig[sense];

  useEffect(() => {
    // Animate progress
    Animated.timing(progressAnim, {
      toValue: count / targetCount,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // Check completion
    if (count >= targetCount) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(onComplete, 500);
    }
  }, [count, targetCount]);

  const handleTap = () => {
    if (count >= targetCount) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate tap feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
    ]).start();

    setCount((c) => c + 1);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Ionicons
          name={config.icon as keyof typeof Ionicons.glyphMap}
          size={32}
          color={config.color}
        />
        <Text style={styles.instructionText}>
          Name <Text style={[styles.countHighlight, { color: config.color }]}>{targetCount}</Text> {config.label}
        </Text>
      </View>

      {/* Tap Area */}
      <Pressable onPress={handleTap} style={styles.tapAreaContainer}>
        <Animated.View
          style={[
            styles.tapArea,
            {
              transform: [{ scale: scaleAnim }],
              borderColor: config.color,
            },
          ]}
        >
          <Text style={[styles.countText, { color: config.color }]}>
            {count}
          </Text>
          <Text style={styles.tapLabel}>
            {count >= targetCount ? 'Complete!' : 'Tap when you find one'}
          </Text>
        </Animated.View>
      </Pressable>

      {/* Progress Dots */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: targetCount }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < count && { backgroundColor: config.color },
            ]}
          />
        ))}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth,
                backgroundColor: config.color,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {count} of {targetCount}
        </Text>
      </View>

      {/* Hint */}
      <Text style={styles.hintText}>{instruction}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  instructionText: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  countHighlight: {
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.xl,
  },
  tapAreaContainer: {
    marginVertical: spacing.lg,
  },
  tapArea: {
    width: 180,
    height: 180,
    borderRadius: 90,
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
  countText: {
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
    marginVertical: spacing.lg,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  progressTrack: {
    width: '80%',
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  hintText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
});
