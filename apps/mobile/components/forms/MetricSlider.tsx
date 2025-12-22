/**
 * MetricSlider Component
 * Custom slider for metric input with visual feedback
 */

import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import * as Haptics from '../../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const THUMB_SIZE = 48;

interface MetricSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
  inverted?: boolean;
  color?: string;
}

export function MetricSlider({
  value,
  onChange,
  min = 1,
  max = 10,
  lowLabel = 'Low',
  highLabel = 'High',
  inverted = false,
  color = colors.primary,
}: MetricSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const range = max - min;
  const normalizedValue = (value - min) / range;
  const position = normalizedValue * (SLIDER_WIDTH - THUMB_SIZE);

  const getValueFromPosition = (x: number): number => {
    const bounded = Math.max(0, Math.min(x, SLIDER_WIDTH - THUMB_SIZE));
    const normalized = bounded / (SLIDER_WIDTH - THUMB_SIZE);
    const rawValue = min + normalized * range;
    return Math.round(rawValue);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsDragging(true);
        Haptics.selectionAsync();
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
        }).start();

        const x = evt.nativeEvent.locationX - THUMB_SIZE / 2;
        const newValue = getValueFromPosition(x);
        onChange(newValue);
      },
      onPanResponderMove: (evt, gestureState) => {
        const x = position + gestureState.dx;
        const newValue = getValueFromPosition(x);
        if (newValue !== value) {
          Haptics.selectionAsync();
          onChange(newValue);
        }
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  // Calculate color intensity based on value
  const getIntensityColor = () => {
    if (inverted) {
      // For stress/anxiety: low is green, high is red
      if (value <= 3) return colors.success;
      if (value >= 8) return colors.error;
      return color;
    } else {
      // For mood/energy: low is concerning, high is good
      if (value <= 3) return colors.error;
      if (value >= 8) return colors.success;
      return color;
    }
  };

  const intensityColor = getIntensityColor();

  return (
    <View style={styles.container}>
      {/* Value Display */}
      <View style={styles.valueContainer}>
        <Animated.Text
          style={[
            styles.valueText,
            { color: intensityColor, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {value}
        </Animated.Text>
        <Text style={styles.valueLabel}>out of {max}</Text>
      </View>

      {/* Slider Track */}
      <View style={styles.sliderContainer} {...panResponder.panHandlers}>
        <View style={styles.track}>
          {/* Fill */}
          <View
            style={[
              styles.fill,
              {
                width: `${normalizedValue * 100}%`,
                backgroundColor: intensityColor,
              },
            ]}
          />

          {/* Step Indicators */}
          <View style={styles.stepsContainer}>
            {Array.from({ length: max - min + 1 }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.step,
                  i + min <= value && { backgroundColor: 'rgba(255,255,255,0.5)' },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {
              left: position,
              backgroundColor: intensityColor,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.thumbText}>{value}</Text>
        </Animated.View>
      </View>

      {/* Labels */}
      <View style={styles.labelsContainer}>
        <Text style={styles.label}>{lowLabel}</Text>
        <Text style={styles.label}>{highLabel}</Text>
      </View>

      {/* Quick Select Buttons */}
      <View style={styles.quickSelect}>
        {[1, 3, 5, 7, 10].map((v) => (
          <QuickButton
            key={v}
            value={v}
            selected={value === v}
            color={intensityColor}
            onPress={() => onChange(v)}
          />
        ))}
      </View>
    </View>
  );
}

function QuickButton({
  value,
  selected,
  color,
  onPress,
}: {
  value: number;
  selected: boolean;
  color: string;
  onPress: () => void;
}) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={[
        styles.quickButton,
        selected && { backgroundColor: color, borderColor: color },
      ]}
      onPress={handlePress}
    >
      <Text
        style={[
          styles.quickButtonText,
          selected && { color: colors.textInverse },
        ]}
      >
        {value}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  valueText: {
    fontSize: 72,
    fontWeight: typography.fontWeight.bold,
  },
  valueLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  sliderContainer: {
    height: THUMB_SIZE + spacing.lg,
    justifyContent: 'center',
  },
  track: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
  stepsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  step: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  quickSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  quickButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  quickButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
});
