/**
 * SOS Index Screen
 * Quick access to crisis protocols
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { SOS_PROTOCOLS, CRISIS_RESOURCES } from '@mentalspace/shared';
import type { SOSProtocolType } from '@mentalspace/shared';

export default function SOSIndexScreen() {
  const router = useRouter();
  const [selectedProtocol, setSelectedProtocol] = useState<SOSProtocolType | null>(null);

  const handleProtocolSelect = (protocolId: SOSProtocolType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedProtocol(protocolId);
  };

  const handleStartProtocol = () => {
    if (!selectedProtocol) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: '/(sos)/protocol',
      params: { protocolId: selectedProtocol },
    });
  };

  const handleClose = () => {
    // Always navigate to home tabs for consistent behavior
    router.replace('/(tabs)');
  };

  const handleShowResources = () => {
    router.push('/(sos)/resources');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>SOS Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <View style={styles.sosIcon}>
            <Ionicons name="heart" size={32} color={colors.textInverse} />
          </View>
          <Text style={styles.title}>How can we help?</Text>
          <Text style={styles.subtitle}>
            Choose what you're experiencing and we'll guide you through it.
          </Text>
        </View>

        {/* Protocol Options */}
        <View style={styles.protocolList}>
          {SOS_PROTOCOLS.map((protocol) => {
            const isSelected = selectedProtocol === protocol.id;

            return (
              <Pressable
                key={protocol.id}
                style={[
                  styles.protocolCard,
                  isSelected && { borderColor: protocol.color, borderWidth: 2 },
                ]}
                onPress={() => handleProtocolSelect(protocol.id)}
              >
                <View
                  style={[
                    styles.protocolIcon,
                    { backgroundColor: protocol.color + '20' },
                  ]}
                >
                  <Ionicons
                    name={protocol.icon as any}
                    size={28}
                    color={protocol.color}
                  />
                </View>
                <View style={styles.protocolContent}>
                  <Text style={styles.protocolTitle}>{protocol.title}</Text>
                  <Text style={styles.protocolSubtitle}>{protocol.subtitle}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.selectedCheck, { backgroundColor: protocol.color }]}>
                    <Ionicons name="checkmark" size={16} color={colors.textInverse} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Crisis Resources Link */}
        <Pressable style={styles.resourcesLink} onPress={handleShowResources}>
          <Ionicons name="call" size={20} color={colors.error} />
          <Text style={styles.resourcesText}>
            Need to talk to someone? View crisis helplines
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </Pressable>

        {/* Telehealth Option */}
        <Pressable
          style={styles.telehealthLink}
          onPress={() => router.push('/(telehealth)')}
        >
          <Ionicons name="videocam" size={20} color={colors.secondary} />
          <Text style={styles.telehealthLinkText}>
            Schedule a telehealth session with a therapist
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </Pressable>
      </ScrollView>

      {/* Start Button */}
      <View style={styles.footer}>
        <Button
          title="Start"
          onPress={handleStartProtocol}
          disabled={!selectedProtocol}
          style={{
            ...styles.startButton,
            ...(selectedProtocol ? {
              backgroundColor: SOS_PROTOCOLS.find((p) => p.id === selectedProtocol)?.color,
            } : {}),
          }}
        />
        <Text style={styles.footerNote}>
          You can exit at any time
        </Text>
      </View>
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
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  sosIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.sos,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  protocolList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  protocolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  protocolIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  protocolContent: {
    flex: 1,
  },
  protocolTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  protocolSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  selectedCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourcesLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.error + '10',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  resourcesText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  telehealthLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.secondary + '10',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  telehealthLinkText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  footerNote: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
});
