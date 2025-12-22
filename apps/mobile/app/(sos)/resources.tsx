/**
 * Crisis Resources Screen
 * Emergency helplines and support contacts
 */

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';
import { Card } from '../../components/ui/Card';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { CRISIS_RESOURCES } from '@mentalspace/shared';

export default function ResourcesScreen() {
  const router = useRouter();

  const handleCall = (phone: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      `Call ${name}`,
      `You're about to call ${phone}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${phone}`);
          },
        },
      ]
    );
  };

  const handleText = (number: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`sms:${number}`);
  };

  const handleWebsite = (url: string) => {
    Linking.openURL(url);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Crisis Resources</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Important Note */}
        <Card style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <Ionicons name="heart" size={24} color={colors.error} />
            <Text style={styles.noteTitle}>You're Not Alone</Text>
          </View>
          <Text style={styles.noteText}>
            If you're in immediate danger, please call 911. These resources are
            staffed by trained professionals who care about you and want to help.
          </Text>
        </Card>

        {/* Resources List */}
        <View style={styles.resourcesList}>
          {CRISIS_RESOURCES.map((resource) => (
            <Card key={resource.id} style={styles.resourceCard}>
              <View style={styles.resourceHeader}>
                <View>
                  <Text style={styles.resourceName}>{resource.name}</Text>
                  <Text style={styles.resourceDescription}>
                    {resource.description}
                  </Text>
                </View>
                {resource.available24x7 && (
                  <View style={styles.badge24}>
                    <Text style={styles.badgeText}>24/7</Text>
                  </View>
                )}
              </View>

              <View style={styles.resourceActions}>
                {resource.phone && (
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleCall(resource.phone!, resource.name)}
                  >
                    <Ionicons name="call" size={20} color={colors.success} />
                    <Text style={styles.actionText}>{resource.phone}</Text>
                  </Pressable>
                )}

                {resource.textLine && (
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleText(resource.textLine!, resource.name)}
                  >
                    <Ionicons name="chatbubble" size={20} color={colors.primary} />
                    <Text style={styles.actionText}>Text {resource.textLine}</Text>
                  </Pressable>
                )}

                {resource.website && (
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleWebsite(resource.website!)}
                  >
                    <Ionicons name="globe" size={20} color={colors.info} />
                    <Text style={styles.actionText}>Website</Text>
                  </Pressable>
                )}
              </View>
            </Card>
          ))}
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <Text style={styles.infoTitle}>International Resources</Text>
          <Text style={styles.infoText}>
            If you're outside the US, please visit{' '}
            <Text
              style={styles.link}
              onPress={() =>
                handleWebsite('https://www.iasp.info/resources/Crisis_Centres/')
              }
            >
              findahelpline.com
            </Text>{' '}
            to find resources in your country.
          </Text>
        </View>
      </ScrollView>
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
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  placeholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  noteCard: {
    backgroundColor: colors.error + '10',
    borderWidth: 1,
    borderColor: colors.error + '30',
    marginBottom: spacing.lg,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  noteTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
  },
  noteText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: 24,
  },
  resourcesList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  resourceCard: {},
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  resourceName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  resourceDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
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
  resourceActions: {
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  actionText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  additionalInfo: {
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
