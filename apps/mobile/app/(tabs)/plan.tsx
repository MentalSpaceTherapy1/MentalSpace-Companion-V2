/**
 * Plan Screen
 * Daily action plan with completion tracking and adherence engine
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../utils/haptics';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_ICONS } from '@mentalspace/shared';
import { usePlanStore, PlannedAction, DailyPlan } from '../../stores/planStore';

type ActionCategory = 'coping' | 'lifestyle' | 'connection' | 'therapist-homework';

// Alternative actions for swapping - organized by category
const alternativeActions: Record<ActionCategory, PlannedAction[]> = {
  coping: [
    {
      id: 'alt-coping-1',
      title: 'Box Breathing',
      description: 'Breathe in for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds. Repeat 4 times.',
      category: 'coping',
      duration: 5,
      completed: false,
      skipped: false,
    },
    {
      id: 'alt-coping-2',
      title: 'Progressive Muscle Relaxation',
      description: 'Tense and release each muscle group from your toes to your head for deep relaxation.',
      category: 'coping',
      duration: 10,
      completed: false,
      skipped: false,
    },
    {
      id: 'alt-coping-3',
      title: 'Grounding Exercise (5-4-3-2-1)',
      description: 'Name 5 things you see, 4 you hear, 3 you feel, 2 you smell, and 1 you taste.',
      category: 'coping',
      duration: 3,
      completed: false,
      skipped: false,
    },
  ],
  lifestyle: [
    {
      id: 'alt-lifestyle-1',
      title: 'Drink a Glass of Water',
      description: 'Stay hydrated! Drink a full glass of water mindfully.',
      category: 'lifestyle',
      duration: 2,
      completed: false,
      skipped: false,
    },
    {
      id: 'alt-lifestyle-2',
      title: 'Quick Stretch Break',
      description: 'Do 5 minutes of gentle stretching to release tension and improve circulation.',
      category: 'lifestyle',
      duration: 5,
      completed: false,
      skipped: false,
    },
    {
      id: 'alt-lifestyle-3',
      title: 'Listen to Calming Music',
      description: 'Put on your favorite calming song or playlist and just listen.',
      category: 'lifestyle',
      duration: 5,
      completed: false,
      skipped: false,
    },
  ],
  connection: [
    {
      id: 'alt-connection-1',
      title: 'Call a Friend or Family Member',
      description: 'Make a quick 5-minute call to someone you care about.',
      category: 'connection',
      duration: 5,
      completed: false,
      skipped: false,
    },
    {
      id: 'alt-connection-2',
      title: 'Write a Gratitude Note',
      description: 'Write a short note expressing gratitude to someone who has helped you.',
      category: 'connection',
      duration: 5,
      completed: false,
      skipped: false,
    },
    {
      id: 'alt-connection-3',
      title: 'Share a Memory',
      description: 'Send someone a photo or memory that made you think of them.',
      category: 'connection',
      duration: 3,
      completed: false,
      skipped: false,
    },
  ],
  'therapist-homework': [], // Therapist homework cannot be swapped
};

// Mock data for now - would come from store
const mockPlan: DailyPlan = {
  id: '1',
  date: new Date().toISOString().split('T')[0],
  actions: [
    {
      id: '1',
      title: '4-7-8 Breathing Exercise',
      description: 'Breathe in for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Repeat 4 times.',
      category: 'coping' as ActionCategory,
      duration: 5,
      completed: false,
      skipped: false,
    },
    {
      id: '2',
      title: 'Take a 10-Minute Walk',
      description: 'Step outside for a brief walk. Focus on your surroundings and breathe fresh air.',
      category: 'lifestyle' as ActionCategory,
      duration: 10,
      completed: false,
      skipped: false,
    },
    {
      id: '3',
      title: 'Send a Kind Message',
      description: 'Text or message someone you care about just to check in or share something positive.',
      category: 'connection' as ActionCategory,
      duration: 5,
      completed: false,
      skipped: false,
    },
  ],
  completedCount: 0,
  totalCount: 3,
};

export default function PlanScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [showAnchorModal, setShowAnchorModal] = useState(false);
  const [anchorActionId, setAnchorActionId] = useState<string | null>(null);
  const [showSimplifyModal, setShowSimplifyModal] = useState(false);
  const [simplifyCategory, setSimplifyCategory] = useState<ActionCategory | null>(null);

  // Plan store
  const {
    currentPlan,
    setPlan,
    completeAction,
    skipAction,
    swapAction,
    setAnchor,
    adherenceInsights,
    dismissInsight,
    getSimplifiedAction,
    getSuggestedAnchor,
    availableAnchors,
    categoryStats,
    checkAdherence,
  } = usePlanStore();

  // Initialize with mock plan if empty
  useEffect(() => {
    if (!currentPlan) {
      setPlan(mockPlan);
    }
    checkAdherence();
  }, []);

  const plan = currentPlan || mockPlan;
  const completionRate = Math.round((plan.completedCount / plan.totalCount) * 100);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    checkAdherence();
    setRefreshing(false);
  };

  const toggleComplete = (actionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    completeAction(actionId);
  };

  const handleSwap = (actionId: string) => {
    const doSwap = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const currentAction = plan.actions.find((a) => a.id === actionId);
      if (!currentAction) return;

      const alternatives = alternativeActions[currentAction.category];
      const availableAlternatives = alternatives.filter(
        (alt) => !plan.actions.some((a) => a.title === alt.title)
      );

      if (availableAlternatives.length === 0) {
        if (Platform.OS === 'web') {
          window.alert('No more alternatives available for this category.');
        } else {
          Alert.alert('No Alternatives', 'No more alternatives available for this category.');
        }
        return;
      }

      const newAction = availableAlternatives[Math.floor(Math.random() * availableAlternatives.length)];
      swapAction(actionId, newAction);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Would you like to get a different action?')) {
        doSwap();
      }
    } else {
      Alert.alert(
        'Swap Action',
        'Would you like to get a different action?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Swap', onPress: doSwap },
        ]
      );
    }
  };

  const handleSkip = (actionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    skipAction(actionId);
  };

  const handleAnchorPress = (actionId: string) => {
    setAnchorActionId(actionId);
    setShowAnchorModal(true);
  };

  const handleSelectAnchor = (anchorId: string) => {
    if (anchorActionId) {
      setAnchor(anchorActionId, anchorId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowAnchorModal(false);
    setAnchorActionId(null);
  };

  const handleSimplify = (category: ActionCategory) => {
    const simplified = getSimplifiedAction(category);
    if (!simplified) return;

    const categoryAction = plan.actions.find((a) => a.category === category && !a.completed);
    if (categoryAction) {
      swapAction(categoryAction.id, simplified);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (Platform.OS === 'web') {
        window.alert(`Switched to a simpler ${category} action: "${simplified.title}"`);
      } else {
        Alert.alert(
          'Simplified!',
          `We've switched to a simpler ${category} action: "${simplified.title}"`,
          [{ text: 'Great!', style: 'default' }]
        );
      }
    }
    setShowSimplifyModal(false);
    setSimplifyCategory(null);
  };

  if (!plan) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="clipboard-outline" size={64} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>No Plan Yet</Text>
        <Text style={styles.emptySubtitle}>
          Complete your daily check-in to get a personalized action plan
        </Text>
        <Button
          title="Start Check-in"
          onPress={() => router.push('/(tabs)/checkin')}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Adherence Insights */}
        {adherenceInsights.length > 0 && (
          <View style={styles.insightsContainer}>
            {adherenceInsights.map((insight, index) => (
              <Card
                key={index}
                style={[
                  styles.insightCard,
                  insight.type === 'simplify' && styles.insightCardSimplify,
                  insight.type === 'anchor' && styles.insightCardAnchor,
                  insight.type === 'encourage' && styles.insightCardEncourage,
                ]}
              >
                <View style={styles.insightContent}>
                  <Ionicons
                    name={
                      insight.type === 'simplify'
                        ? 'flash'
                        : insight.type === 'anchor'
                        ? 'link'
                        : 'star'
                    }
                    size={20}
                    color={
                      insight.type === 'simplify'
                        ? colors.warning
                        : insight.type === 'anchor'
                        ? colors.primary
                        : colors.success
                    }
                  />
                  <Text style={styles.insightText}>{insight.message}</Text>
                </View>
                <View style={styles.insightActions}>
                  {insight.type === 'simplify' && insight.category && (
                    <Pressable
                      style={styles.insightButton}
                      onPress={() => handleSimplify(insight.category!)}
                    >
                      <Text style={styles.insightButtonText}>Simplify</Text>
                    </Pressable>
                  )}
                  {insight.type === 'anchor' && insight.actionId && (
                    <Pressable
                      style={styles.insightButton}
                      onPress={() => handleAnchorPress(insight.actionId!)}
                    >
                      <Text style={styles.insightButtonText}>Add Anchor</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={() => dismissInsight(index)}>
                    <Ionicons name="close" size={20} color={colors.textTertiary} />
                  </Pressable>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Progress Card */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressPercent}>{completionRate}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${completionRate}%` }]}
            />
          </View>
          <Text style={styles.progressSubtext}>
            {plan.completedCount} of {plan.totalCount} actions completed
          </Text>
        </Card>

        {/* Actions List */}
        <Text style={styles.sectionTitle}>Your Actions</Text>
        <View style={styles.actionsList}>
          {plan.actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              expanded={expandedAction === action.id}
              onToggleExpand={() =>
                setExpandedAction(expandedAction === action.id ? null : action.id)
              }
              onComplete={() => toggleComplete(action.id)}
              onSwap={() => handleSwap(action.id)}
              onSkip={() => handleSkip(action.id)}
              onAnchor={() => handleAnchorPress(action.id)}
            />
          ))}
        </View>

        {/* Encouragement */}
        {completionRate === 100 && (
          <Card style={styles.celebrationCard}>
            <Ionicons name="trophy" size={48} color={colors.connection} />
            <Text style={styles.celebrationTitle}>All Done!</Text>
            <Text style={styles.celebrationSubtitle}>
              Amazing work completing all your actions today!
            </Text>
          </Card>
        )}

        {/* Telehealth CTA - Need More Support */}
        <Pressable
          style={styles.telehealthBanner}
          onPress={() => router.push('/(telehealth)')}
        >
          <View style={styles.telehealthBannerIcon}>
            <Ionicons name="videocam" size={24} color={colors.secondary} />
          </View>
          <View style={styles.telehealthBannerContent}>
            <Text style={styles.telehealthBannerTitle}>Need more support?</Text>
            <Text style={styles.telehealthBannerSubtitle}>
              Talk to a licensed therapist via telehealth
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondary} />
        </Pressable>
      </ScrollView>

      {/* Anchor Selection Modal */}
      <Modal
        visible={showAnchorModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAnchorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Link to a Routine</Text>
              <Pressable onPress={() => setShowAnchorModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <Text style={styles.modalSubtitle}>
              Attach this action to a daily habit for better follow-through
            </Text>
            <ScrollView style={styles.anchorList}>
              {availableAnchors.map((anchor) => (
                <Pressable
                  key={anchor.id}
                  style={styles.anchorItem}
                  onPress={() => handleSelectAnchor(anchor.id)}
                >
                  <View style={styles.anchorIcon}>
                    <Ionicons
                      name={
                        anchor.time === 'morning'
                          ? 'sunny'
                          : anchor.time === 'afternoon'
                          ? 'partly-sunny'
                          : 'moon'
                      }
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.anchorContent}>
                    <Text style={styles.anchorLabel}>{anchor.label}</Text>
                    <Text style={styles.anchorDescription}>{anchor.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function ActionCard({
  action,
  expanded,
  onToggleExpand,
  onComplete,
  onSwap,
  onSkip,
  onAnchor,
}: {
  action: PlannedAction;
  expanded: boolean;
  onToggleExpand: () => void;
  onComplete: () => void;
  onSwap: () => void;
  onSkip: () => void;
  onAnchor: () => void;
}) {
  const categoryColor = CATEGORY_COLORS[action.category] || colors.primary;
  const categoryIcon = CATEGORY_ICONS[action.category] || 'ellipse';

  return (
    <Pressable onPress={onToggleExpand}>
      <Card
        style={[
          styles.actionCard,
          action.completed && styles.actionCardCompleted,
          action.skipped && styles.actionCardSkipped,
        ]}
      >
        {/* Anchor Badge */}
        {action.anchor && (
          <View style={styles.anchorBadge}>
            <Ionicons name="link" size={12} color={colors.primary} />
            <Text style={styles.anchorBadgeText}>{action.anchor}</Text>
          </View>
        )}

        {/* Simplified Badge */}
        {action.simplified && (
          <View style={styles.simplifiedBadge}>
            <Ionicons name="flash" size={12} color={colors.warning} />
            <Text style={styles.simplifiedBadgeText}>Quick version</Text>
          </View>
        )}

        {/* Main Row */}
        <View style={styles.actionMain}>
          {/* Checkbox */}
          <Pressable
            onPress={onComplete}
            style={[
              styles.checkbox,
              { borderColor: categoryColor },
              action.completed && { backgroundColor: categoryColor },
            ]}
          >
            {action.completed && (
              <Ionicons name="checkmark" size={20} color={colors.textInverse} />
            )}
          </Pressable>

          {/* Content */}
          <View style={styles.actionContent}>
            <View style={styles.actionHeader}>
              <View
                style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}
              >
                <Ionicons
                  name={categoryIcon as any}
                  size={14}
                  color={categoryColor}
                />
                <Text style={[styles.categoryText, { color: categoryColor }]}>
                  {CATEGORY_LABELS[action.category]}
                </Text>
              </View>
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                <Text style={styles.durationText}>{action.duration} min</Text>
              </View>
            </View>
            <Text
              style={[styles.actionTitle, action.completed && styles.actionTitleCompleted]}
            >
              {action.title}
            </Text>
          </View>

          {/* Expand Icon */}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={colors.textTertiary}
          />
        </View>

        {/* Expanded Content */}
        {expanded && (
          <View style={styles.actionExpanded}>
            <Text style={styles.actionDescription}>{action.description}</Text>
            <View style={styles.actionActions}>
              <Button
                title={action.completed ? 'Undo' : 'Mark Complete'}
                variant={action.completed ? 'outline' : 'primary'}
                size="sm"
                onPress={onComplete}
                style={styles.actionButton}
              />
              {!action.completed && (
                <>
                  <Button
                    title="Swap"
                    variant="ghost"
                    size="sm"
                    onPress={onSwap}
                    style={styles.actionButton}
                  />
                  <Button
                    title="Skip"
                    variant="ghost"
                    size="sm"
                    onPress={onSkip}
                    style={styles.actionButton}
                  />
                </>
              )}
            </View>
            {!action.completed && !action.anchor && (
              <Pressable style={styles.addAnchorButton} onPress={onAnchor}>
                <Ionicons name="link" size={16} color={colors.primary} />
                <Text style={styles.addAnchorText}>Link to a routine</Text>
              </Pressable>
            )}
          </View>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  // Adherence Insights
  insightsContainer: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  insightCardSimplify: {
    backgroundColor: colors.warning + '15',
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  insightCardAnchor: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  insightCardEncourage: {
    backgroundColor: colors.success + '10',
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  insightText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 18,
  },
  insightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  insightButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  insightButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textInverse,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  anchorList: {
    flexGrow: 0,
  },
  anchorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  anchorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  anchorContent: {
    flex: 1,
  },
  anchorLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  anchorDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Action Card Badges
  anchorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  anchorBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  simplifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warning + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  simplifiedBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.warning,
    fontWeight: typography.fontWeight.medium,
  },
  addAnchorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    borderRadius: borderRadius.lg,
    borderStyle: 'dashed',
  },
  addAnchorText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  progressCard: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  progressPercent: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionsList: {
    gap: spacing.md,
  },
  actionCard: {
    padding: spacing.md,
  },
  actionCardCompleted: {
    opacity: 0.7,
  },
  actionCardSkipped: {
    opacity: 0.5,
  },
  actionMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  actionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  actionTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  actionExpanded: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  actionActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyButton: {
    minWidth: 200,
  },
  celebrationCard: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.connection + '10',
  },
  celebrationTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  celebrationSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  // Telehealth Banner
  telehealthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary + '10',
    borderWidth: 1,
    borderColor: colors.secondary + '30',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  telehealthBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  telehealthBannerContent: {
    flex: 1,
  },
  telehealthBannerTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  telehealthBannerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
