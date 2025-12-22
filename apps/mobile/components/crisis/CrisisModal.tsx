/**
 * Crisis Modal Component
 * Displays when crisis indicators are detected
 */

import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Linking,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from '../../utils/haptics';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { CRISIS_RESOURCES } from '@mentalspace/shared';
import type { CrisisSeverity } from '@mentalspace/shared';

interface CrisisModalProps {
  visible: boolean;
  severity: CrisisSeverity;
  onDismiss: () => void;
  onAcknowledge: () => void;
}

export function CrisisModal({
  visible,
  severity,
  onDismiss,
  onAcknowledge,
}: CrisisModalProps) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleCall988 = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL('tel:988');
  };

  const handleViewResources = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAcknowledge();
    router.push('/(sos)/resources');
  };

  const handleSOS = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAcknowledge();
    router.push('/(sos)');
  };

  const getContent = () => {
    switch (severity) {
      case 'high':
        return {
          icon: 'heart',
          title: "We're Here for You",
          message:
            "It sounds like you're going through a really difficult time. You don't have to face this alone. Please consider reaching out to someone who can help right now.",
          showEmergency: true,
        };
      case 'medium':
        return {
          icon: 'hand-left',
          title: "We Notice You're Struggling",
          message:
            "It looks like things are tough right now. Remember, it's okay to ask for help. We have some resources that might help you feel better.",
          showEmergency: false,
        };
      case 'low':
      default:
        return {
          icon: 'chatbubble-ellipses',
          title: 'Checking In',
          message:
            'We noticed some signs that you might be having a hard time. Would you like to explore some support options?',
          showEmergency: false,
        };
    }
  };

  const content = getContent();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Icon */}
            <View
              style={[
                styles.iconContainer,
                severity === 'high' && styles.iconContainerHigh,
              ]}
            >
              <Ionicons
                name={content.icon as keyof typeof Ionicons.glyphMap}
                size={40}
                color={severity === 'high' ? colors.error : colors.primary}
              />
            </View>

            {/* Title & Message */}
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.message}>{content.message}</Text>

            {/* Emergency Button (High Severity) */}
            {content.showEmergency && (
              <Pressable style={styles.emergencyButton} onPress={handleCall988}>
                <Ionicons name="call" size={24} color={colors.textInverse} />
                <View style={styles.emergencyText}>
                  <Text style={styles.emergencyTitle}>
                    Call 988 Suicide & Crisis Lifeline
                  </Text>
                  <Text style={styles.emergencySubtitle}>
                    Free, confidential, 24/7
                  </Text>
                </View>
              </Pressable>
            )}

            {/* Quick Resources */}
            <View style={styles.resourcesSection}>
              <Text style={styles.resourcesTitle}>Immediate Support</Text>
              {CRISIS_RESOURCES.slice(0, 2).map((resource) => (
                <Card key={resource.id} style={styles.resourceCard}>
                  <View style={styles.resourceHeader}>
                    <Text style={styles.resourceName}>{resource.name}</Text>
                    {resource.available24x7 && (
                      <View style={styles.badge24}>
                        <Text style={styles.badgeText}>24/7</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.resourceDescription}>
                    {resource.description}
                  </Text>
                  <View style={styles.resourceActions}>
                    {resource.phone && (
                      <Pressable
                        style={styles.resourceAction}
                        onPress={() => Linking.openURL(`tel:${resource.phone}`)}
                      >
                        <Ionicons name="call" size={16} color={colors.success} />
                        <Text style={styles.resourceActionText}>
                          {resource.phone}
                        </Text>
                      </Pressable>
                    )}
                    {resource.textLine && (
                      <Pressable
                        style={styles.resourceAction}
                        onPress={() => Linking.openURL(`sms:${resource.textLine}`)}
                      >
                        <Ionicons name="chatbubble" size={16} color={colors.primary} />
                        <Text style={styles.resourceActionText}>
                          Text {resource.textLine}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </Card>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Button
                title="Get Support Now"
                onPress={handleSOS}
                style={styles.primaryButton}
              />
              <Pressable style={styles.secondaryButton} onPress={handleViewResources}>
                <Text style={styles.secondaryButtonText}>
                  View All Resources
                </Text>
              </Pressable>
              <Pressable style={styles.dismissButton} onPress={onAcknowledge}>
                <Text style={styles.dismissButtonText}>
                  I'm okay, continue
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  iconContainerHigh: {
    backgroundColor: colors.error + '20',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  emergencyText: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textInverse,
  },
  emergencySubtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  resourcesSection: {
    marginBottom: spacing.lg,
  },
  resourcesTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  resourceCard: {
    marginBottom: spacing.sm,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resourceName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  badge24: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  resourceDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  resourceActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  resourceAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  resourceActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  actions: {
    gap: spacing.sm,
  },
  primaryButton: {},
  secondaryButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  dismissButton: {
    padding: spacing.sm,
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
