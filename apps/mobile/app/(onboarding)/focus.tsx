/**
 * Onboarding Focus Areas Screen
 * Select focus areas for personalization
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

const FOCUS_AREAS = [
  {
    id: 'breathing',
    title: 'Breathing Exercises',
    description: 'Calm your mind with guided breathing',
    icon: 'leaf-outline' as const,
    category: 'mindfulness',
  },
  {
    id: 'meditation',
    title: 'Meditation',
    description: 'Build a meditation practice',
    icon: 'flower-outline' as const,
    category: 'mindfulness',
  },
  {
    id: 'journaling',
    title: 'Journaling',
    description: 'Express thoughts through writing',
    icon: 'book-outline' as const,
    category: 'mental',
  },
  {
    id: 'exercise',
    title: 'Physical Activity',
    description: 'Move your body, boost your mood',
    icon: 'fitness-outline' as const,
    category: 'physical',
  },
  {
    id: 'sleep',
    title: 'Sleep Hygiene',
    description: 'Improve your sleep quality',
    icon: 'moon-outline' as const,
    category: 'physical',
  },
  {
    id: 'social',
    title: 'Social Connection',
    description: 'Nurture your relationships',
    icon: 'people-outline' as const,
    category: 'social',
  },
  {
    id: 'gratitude',
    title: 'Gratitude Practice',
    description: 'Cultivate appreciation daily',
    icon: 'heart-outline' as const,
    category: 'mental',
  },
  {
    id: 'nature',
    title: 'Time in Nature',
    description: 'Connect with the outdoors',
    icon: 'leaf-outline' as const,
    category: 'physical',
  },
];

export default function FocusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reasons: string }>();
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const toggleArea = (areaId: string) => {
    if (selectedAreas.includes(areaId)) {
      setSelectedAreas(selectedAreas.filter((a) => a !== areaId));
    } else if (selectedAreas.length < 4) {
      setSelectedAreas([...selectedAreas, areaId]);
    }
  };

  const isValid = selectedAreas.length >= 1;

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
        <Text style={styles.progressText}>2 of 4</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What would you like to focus on?</Text>
          <Text style={styles.subtitle}>
            Choose up to 4 areas. We'll suggest activities based on your choices.
          </Text>
        </View>

        {/* Options Grid */}
        <View style={styles.grid}>
          {FOCUS_AREAS.map((area) => {
            const isSelected = selectedAreas.includes(area.id);

            return (
              <Pressable
                key={area.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}
                onPress={() => toggleArea(area.id)}
              >
                <View style={[
                  styles.cardIcon,
                  isSelected && styles.cardIconSelected,
                ]}>
                  <Ionicons
                    name={area.icon}
                    size={28}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                </View>
                <Text style={[
                  styles.cardTitle,
                  isSelected && styles.cardTitleSelected,
                ]}>
                  {area.title}
                </Text>
                <Text style={styles.cardDescription}>
                  {area.description}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={() => router.push({
            pathname: '/(onboarding)/notifications',
            params: {
              reasons: params.reasons,
              focusAreas: selectedAreas.join(','),
            },
          })}
          disabled={!isValid}
          style={styles.button}
        />
        <Pressable onPress={() => router.push({
          pathname: '/(onboarding)/notifications',
          params: {
            reasons: params.reasons,
            focusAreas: '',
          },
        })}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '48%',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardIconSelected: {
    backgroundColor: colors.primary + '20',
  },
  cardTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  cardTitleSelected: {
    color: colors.primary,
  },
  cardDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  button: {},
  skipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.sm,
  },
});
