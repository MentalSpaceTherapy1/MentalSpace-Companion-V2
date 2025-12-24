/**
 * Breathing Animation Component
 * Animated circle for guided breathing exercises with accessibility support
 */

import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  AccessibilityInfo,
} from 'react-native';
import { colors, typography } from '../../constants/theme';
import { useAccessibilitySettings } from '../../utils/accessibility';
import { AccessibleText } from '../AccessibleText';

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
  const { theme, reduceMotion } = useAccessibilitySettings();
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Announce phase changes for screen readers
  useEffect(() => {
    if (isActive) {
      const message = `${getPhaseText()}, ${duration} seconds`;
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [phase, isActive]);

  useEffect(() => {
    if (!isActive) {
      scaleAnim.setValue(0.6);
      opacityAnim.setValue(0.5);
      return;
    }

    // Skip animations if reduce motion is enabled
    if (reduceMotion) {
      // Set values instantly without animation
      switch (phase) {
        case 'inhale':
          scaleAnim.setValue(1);
          opacityAnim.setValue(1);
          break;
        case 'exhale':
          scaleAnim.setValue(0.6);
          opacityAnim.setValue(0.5);
          break;
      }
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
  }, [phase, duration, isActive, reduceMotion]);

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
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="timer"
      accessibilityLabel={`Breathing exercise: ${getPhaseText()}, ${duration} seconds remaining`}
      accessibilityHint="Follow the breathing pattern shown on screen"
    >
      {/* Outer ring */}
      <View
        style={[
          styles.outerRing,
          { borderColor: theme.colors.border },
        ]}
      >
        {/* Middle ring */}
        <Animated.View
          style={[
            styles.middleRing,
            {
              transform: reduceMotion
                ? []
                : [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
              opacity: reduceMotion ? 1 : opacityAnim,
              borderColor: getPhaseColor(),
            },
          ]}
        >
          {/* Inner circle */}
          <Animated.View
            style={[
              styles.innerCircle,
              {
                transform: reduceMotion
                  ? []
                  : [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
                backgroundColor: getPhaseColor() + '30',
              },
            ]}
          >
            <AccessibleText
              variant="heading"
              weight="bold"
              style={[styles.phaseText, { color: getPhaseColor() }]}
            >
              {getPhaseText()}
            </AccessibleText>
            <AccessibleText variant="body" style={styles.durationText}>
              {duration}s
            </AccessibleText>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Pattern indicator */}
      <View style={styles.patternContainer}>
        <View
          style={styles.patternItem}
          accessible={true}
          accessibilityLabel={`Inhale ${pattern.inhale} seconds`}
          accessibilityState={{ selected: phase === 'inhale' }}
        >
          <View
            style={[
              styles.patternDot,
              { backgroundColor: phase === 'inhale' ? theme.colors.primary : theme.colors.border },
            ]}
          />
          <AccessibleText variant="caption" style={styles.patternText}>
            In {pattern.inhale}s
          </AccessibleText>
        </View>
        <View
          style={styles.patternItem}
          accessible={true}
          accessibilityLabel={`Hold ${pattern.hold} seconds`}
          accessibilityState={{ selected: phase === 'hold' }}
        >
          <View
            style={[
              styles.patternDot,
              { backgroundColor: phase === 'hold' ? theme.colors.primary : theme.colors.border },
            ]}
          />
          <AccessibleText variant="caption" style={styles.patternText}>
            Hold {pattern.hold}s
          </AccessibleText>
        </View>
        <View
          style={styles.patternItem}
          accessible={true}
          accessibilityLabel={`Exhale ${pattern.exhale} seconds`}
          accessibilityState={{ selected: phase === 'exhale' }}
        >
          <View
            style={[
              styles.patternDot,
              { backgroundColor: phase === 'exhale' ? theme.colors.primary : theme.colors.border },
            ]}
          />
          <AccessibleText variant="caption" style={styles.patternText}>
            Out {pattern.exhale}s
          </AccessibleText>
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
    marginBottom: 4,
  },
  durationText: {
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
  },
  patternText: {
    color: colors.textSecondary,
  },
});
