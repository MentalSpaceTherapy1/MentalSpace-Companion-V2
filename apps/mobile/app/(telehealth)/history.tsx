/**
 * Session History Screen
 * Displays list of past therapy sessions with reflections
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SessionCard } from '../../components/telehealth/SessionCard';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { useSessionStore } from '../../stores/sessionStore';
import type { TherapistSession } from '../../stores/sessionStore';

const RATING_EMOJIS = ['😞', '😕', '😐', '🙂', '😊'];

export default function SessionHistoryScreen() {
  const router = useRouter();
  const { getPastSessions, updateHomeworkStatus } = useSessionStore();
  const pastSessions = getPastSessions();

  const [selectedSession, setSelectedSession] = useState<TherapistSession | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleSessionPress = (session: TherapistSession) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSession(session);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDetailModal(false);
    setSelectedSession(null);
  };

  const handleHomeworkToggle = (sessionId: string, homeworkIndex: number, completed: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateHomeworkStatus(sessionId, homeworkIndex, completed);

    // Update local state if modal is showing
    if (selectedSession?.id === sessionId) {
      const updated = { ...selectedSession };
      if (updated.homeworkCompleted) {
        updated.homeworkCompleted[homeworkIndex] = completed;
        setSelectedSession(updated);
      }
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Session History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {pastSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Session History</Text>
            <Text style={styles.emptySubtitle}>
              Your past therapy sessions with reflections will appear here.
            </Text>
            <Button
              title="Schedule a Session"
              onPress={() => router.push('/(telehealth)')}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <>
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{pastSessions.length}</Text>
                <Text style={styles.statLabel}>Total Sessions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {pastSessions.filter((s) => s.reflection).length}
                </Text>
                <Text style={styles.statLabel}>With Reflections</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Your Sessions</Text>

            {pastSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onPress={() => handleSessionPress(session)}
                showReflection={true}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Detail Modal */}
      {selectedSession && (
        <Modal
          visible={showDetailModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCloseModal}
        >
          <SafeAreaView style={styles.modalContainer} edges={['top']}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Session Details</Text>
              <Pressable onPress={handleCloseModal} style={styles.closeButton}>
                <Ionicons name="close" size={28} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Session Info */}
              <Card style={styles.modalCard}>
                <View style={styles.therapistHeader}>
                  <View style={styles.therapistAvatar}>
                    <Ionicons name="person" size={32} color={colors.primary} />
                  </View>
                  <View style={styles.therapistDetails}>
                    <Text style={styles.therapistName}>{selectedSession.therapistName}</Text>
                    <Text style={styles.sessionDateTime}>
                      {formatDate(selectedSession.sessionDate)}
                    </Text>
                    <Text style={styles.sessionDateTime}>
                      {formatTime(selectedSession.sessionDate)} • {selectedSession.duration} min
                    </Text>
                  </View>
                </View>
              </Card>

              {selectedSession.reflection ? (
                <>
                  {/* Rating */}
                  <Card style={styles.modalCard}>
                    <Text style={styles.cardTitle}>Session Rating</Text>
                    <View style={styles.ratingDisplay}>
                      <Text style={styles.ratingEmojiLarge}>
                        {RATING_EMOJIS[selectedSession.reflection.rating - 1]}
                      </Text>
                      <Text style={styles.ratingTextLarge}>
                        {selectedSession.reflection.rating}/5
                      </Text>
                    </View>
                  </Card>

                  {/* Key Takeaways */}
                  {selectedSession.reflection.keyTakeaways.length > 0 && (
                    <Card style={styles.modalCard}>
                      <Text style={styles.cardTitle}>Key Takeaways</Text>
                      {selectedSession.reflection.keyTakeaways.map((takeaway, index) => (
                        <View key={index} style={styles.takeawayItem}>
                          <Ionicons name="bulb" size={20} color={colors.primary} />
                          <Text style={styles.takeawayText}>{takeaway}</Text>
                        </View>
                      ))}
                    </Card>
                  )}

                  {/* Homework */}
                  {selectedSession.reflection.homework.length > 0 && (
                    <Card style={styles.modalCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Homework & Action Items</Text>
                        <View style={styles.homeworkBadge}>
                          <Text style={styles.homeworkBadgeText}>
                            {selectedSession.homeworkCompleted?.filter(Boolean).length || 0}/
                            {selectedSession.reflection.homework.length}
                          </Text>
                        </View>
                      </View>
                      {selectedSession.reflection.homework.map((item, index) => {
                        const isCompleted = selectedSession.homeworkCompleted?.[index] || false;
                        return (
                          <Pressable
                            key={index}
                            style={styles.homeworkItem}
                            onPress={() =>
                              handleHomeworkToggle(selectedSession.id, index, !isCompleted)
                            }
                          >
                            <Ionicons
                              name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                              size={24}
                              color={isCompleted ? colors.success : colors.border}
                            />
                            <Text
                              style={[
                                styles.homeworkItemText,
                                isCompleted && styles.homeworkItemTextCompleted,
                              ]}
                            >
                              {item}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </Card>
                  )}

                  {/* Notes */}
                  {selectedSession.reflection.notes && (
                    <Card style={styles.modalCard}>
                      <Text style={styles.cardTitle}>Additional Notes</Text>
                      <Text style={styles.notesText}>{selectedSession.reflection.notes}</Text>
                    </Card>
                  )}
                </>
              ) : (
                <Card style={styles.noReflectionCard}>
                  <Ionicons name="create-outline" size={48} color={colors.textTertiary} />
                  <Text style={styles.noReflectionTitle}>No Reflection Added</Text>
                  <Text style={styles.noReflectionText}>
                    Add a reflection to remember key insights from this session.
                  </Text>
                  <Button
                    title="Add Reflection"
                    onPress={() => {
                      handleCloseModal();
                      router.push(`/(telehealth)/reflection?sessionId=${selectedSession.id}`);
                    }}
                    style={styles.addReflectionButton}
                  />
                </Card>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyButton: {
    marginTop: spacing.lg,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalCard: {
    marginBottom: spacing.lg,
  },
  therapistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  therapistAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  therapistDetails: {
    flex: 1,
  },
  therapistName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sessionDateTime: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  ratingDisplay: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  ratingEmojiLarge: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  ratingTextLarge: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  takeawayItem: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary + '08',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  takeawayText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: 22,
  },
  homeworkBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.full,
  },
  homeworkBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  homeworkItem: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  homeworkItemText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: 22,
  },
  homeworkItemTextCompleted: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  notesText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  noReflectionCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  noReflectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  noReflectionText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  addReflectionButton: {
    marginTop: spacing.md,
  },
});
