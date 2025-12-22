/**
 * Breathing Animation Component
 * Animated circle for guided breathing exercises
 */

import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { colors, typography } from '../../constants/theme';

interface BreathingAnimationProps {
  phase: 'inhale' | 'hold' | 'exhale';
  duration: number; // seconds for current phase
  isActive: boolean;
  pattern?: {
    inhale: number;
    hold: number;
    exhale: number;
  };
}

export function BreathingAnimation({
  phase,
  duration,
  isActive,
  pattern = { inhale: 4, hold: 4, exhale: 4 },
}: BreathingAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) {
      scaleAnim.setValue(0.6);
      opacityAnim.setValue(0.5);
      return;
    }

    let animation: Animated.CompositeAnimation;

    switch (phase) {
      case 'inhale':
        // Expand
        animation = Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: duration * 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: duration * 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]);
        break;

      case 'hold':
        // Gentle pulse while holding
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'exhale':
        // Contract
        animation = Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.6,
            duration: duration * 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.5,
            duration: duration * 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]);
        break;
    }

    animation?.start();

    return () => {
      animation?.stop();
      pulseAnim.setValue(1);
    };
  }, [phase, duration, isActive]);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return colors.primary;
      case 'hold':
        return colors.secondary;
      case 'exhale':
        return colors.accent;
    }
  };

  return (
    <View style={styles.container}>
      {/* Outer ring */}
      <View style={styles.outerRing}>
        {/* Middle ring */}
        <Animated.View
          style={[
            styles.middleRing,
            {
              transform: [
                { scale: Animated.multiply(scaleAnim, pulseAnim) },
              ],
              opacity: opacityAnim,
              borderColor: getPhaseColor(),
            },
          ]}
        >
          {/* Inner circle */}
          <Animated.View
            style={[
              styles.innerCircle,
              {
                transform: [
                  { scale: Animated.multiply(scaleAnim, pulseAnim) },
                ],
                backgroundColor: getPhaseColor() + '30',
              },
            ]}
          >
            <Text style={[styles.phaseText, { color: getPhaseColor() }]}>
              {getPhaseText()}
            </Text>
            <Text style={styles.durationText}>{duration}s</Text>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Pattern indicator */}
      <View style={styles.patternContainer}>
        <View style={styles.patternItem}>
          <View
            style={[
              styles.patternDot,
              phase === 'inhale' && styles.patternDotActive,
            ]}
          />
          <Text style={styles.patternText}>In {pattern.inhale}s</Text>
        </View>
        <View style={styles.patternItem}>
          <View
            style={[
              styles.patternDot,
              phase === 'hold' && styles.patternDotActive,
            ]}
          />
          <Text style={styles.patternText}>Hold {pattern.hold}s</Text>
        </View>
        <View style={styles.patternItem}>
          <View
            style={[
              styles.patternDot,
              phase === 'exhale' && styles.patternDotActive,
            ]}
          />
          <Text style={styles.patternText}>Out {pattern.exhale}s</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  outerRing: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 4,
  },
  durationText: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  patternContainer: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 24,
  },
  patternItem: {
    alignItems: 'center',
    gap: 6,
  },
  patternDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  patternDotActive: {
    backgroundColor: colors.primary,
  },
  patternText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
