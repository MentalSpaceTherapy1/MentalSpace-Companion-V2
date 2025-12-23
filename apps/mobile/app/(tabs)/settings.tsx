/**
 * Settings Screen
 * User preferences, account settings, and app configuration
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from '../../utils/haptics';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import {
  isBiometricSupported,
  getBiometricType,
  isBiometricEnabled,
  enableBiometricLogin,
  disableBiometricLogin,
} from '../../services/biometricAuth';
import {
  saveNotificationPreferences,
  getNotificationPreferences,
  scheduleDailyCheckinReminder,
} from '../../services/notifications';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, profile, signOut, updatePreferences } = useAuthStore();
  const [notifications, setNotifications] = useState({
    dailyReminder: profile?.preferences?.notifications?.dailyReminder ?? true,
    weeklyDigest: profile?.preferences?.notifications?.weeklyDigest ?? true,
  });
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [dailyTimeBudget, setDailyTimeBudget] = useState(profile?.preferences?.dailyTimeBudget ?? 15);
  const [privacyMode, setPrivacyMode] = useState<'full' | 'partial' | 'minimal'>(
    profile?.preferences?.privacyMode ?? 'partial'
  );

  // Biometric settings
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Notification time settings
  const [reminderTime, setReminderTime] = useState(
    profile?.preferences?.notifications?.reminderTime ?? '09:00'
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notificationPrivacyMode, setNotificationPrivacyMode] = useState(false);

  // Load biometric and notification settings on mount
  useEffect(() => {
    loadBiometricSettings();
    loadNotificationSettings();
  }, []);

  const loadBiometricSettings = async () => {
    const supported = await isBiometricSupported();
    setBiometricSupported(supported);

    if (supported) {
      const type = await getBiometricType();
      setBiometricType(type);
      const enabled = await isBiometricEnabled();
      setBiometricEnabled(enabled);
    }
  };

  const loadNotificationSettings = async () => {
    const prefs = await getNotificationPreferences();
    setReminderTime(prefs.dailyCheckinTime);
    setNotificationPrivacyMode(prefs.privacyMode);
  };

  const handleBiometricToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!user) return;

    if (biometricEnabled) {
      await disableBiometricLogin();
      setBiometricEnabled(false);
    } else {
      const result = await enableBiometricLogin(user.uid);
      if (result.success) {
        setBiometricEnabled(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to enable biometric login');
      }
    }
  };

  const handleTimeChange = async (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');

    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      setReminderTime(timeString);

      // Save to notification preferences
      await saveNotificationPreferences({ dailyCheckinTime: timeString });

      // Reschedule notification
      if (notifications.dailyReminder) {
        await scheduleDailyCheckinReminder(timeString);
      }

      // Also update user profile preferences
      await updatePreferences({
        notifications: {
          ...profile?.preferences?.notifications,
          reminderTime: timeString,
        },
      });
    }
  };

  const handleNotificationPrivacyToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = !notificationPrivacyMode;
    setNotificationPrivacyMode(newValue);
    await saveNotificationPreferences({ privacyMode: newValue });
  };

  // Parse reminder time to Date object for picker
  const getReminderTimeDate = () => {
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const handleToggle = async (key: keyof typeof notifications) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = !notifications[key];
    setNotifications((prev) => ({ ...prev, [key]: newValue }));

    try {
      await updatePreferences({
        notifications: {
          dailyReminder: profile?.preferences?.notifications?.dailyReminder ?? true,
          reminderTime: profile?.preferences?.notifications?.reminderTime ?? '09:00',
          weeklyDigest: profile?.preferences?.notifications?.weeklyDigest ?? true,
          [key]: newValue,
        },
      });
    } catch (error) {
      // Revert on error
      setNotifications((prev) => ({ ...prev, [key]: !newValue }));
    }
  };

  const handleTimeBudgetChange = async (minutes: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDailyTimeBudget(minutes);
    try {
      await updatePreferences({ dailyTimeBudget: minutes });
    } catch (error) {
      console.error('Error updating time budget:', error);
    }
  };

  const handlePrivacyModeChange = async (mode: 'full' | 'partial' | 'minimal') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrivacyMode(mode);
    try {
      await updatePreferences({ privacyMode: mode });
    } catch (error) {
      console.error('Error updating privacy mode:', error);
    }
  };

  const handleSignOut = async () => {
    const doSignOut = async () => {
      setIsSigningOut(true);
      try {
        await signOut();
        router.replace('/(auth)/login');
      } catch (error) {
        console.error('Sign out error:', error);
        setIsSigningOut(false);
      }
    };

    // Use window.confirm for web, Alert.alert for native
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        await doSignOut();
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: doSignOut,
          },
        ]
      );
    }
  };

  const handleDeleteAccount = () => {
    const showContactSupport = () => {
      if (Platform.OS === 'web') {
        window.alert('Please email support@mentalspace.app to request account deletion.');
      } else {
        Alert.alert(
          'Contact Support',
          'Please email support@mentalspace.app to request account deletion.'
        );
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('This action cannot be undone. All your data will be permanently deleted. Continue?')) {
        showContactSupport();
      }
    } else {
      Alert.alert(
        'Delete Account',
        'This action cannot be undone. All your data will be permanently deleted.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: showContactSupport,
          },
        ]
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Profile Section */}
      <Card style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileInitial}>
            {profile?.displayName?.charAt(0) || 'U'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.displayName || 'User'}</Text>
          <Text style={styles.profileEmail}>{profile?.email}</Text>
        </View>
        <Pressable style={styles.editButton}>
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </Pressable>
      </Card>

      {/* Telehealth Services */}
      <Text style={styles.sectionTitle}>Telehealth Services</Text>
      <Card style={[styles.settingsCard, styles.telehealthCard]}>
        <SettingRow
          icon="videocam"
          title="Request Appointment"
          subtitle="Schedule telehealth session with a therapist"
          iconColor={colors.secondary}
          trailing={<Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
          onPress={() => router.push('/(telehealth)')}
        />
        <Divider />
        <SettingRow
          icon="chatbubble-ellipses"
          title="Text Therapy"
          subtitle="Message a licensed therapist"
          iconColor={colors.secondary}
          trailing={<Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
          onPress={() => router.push('/(telehealth)')}
        />
      </Card>

      {/* Notifications */}
      <Text style={styles.sectionTitle}>Notifications</Text>
      <Card style={styles.settingsCard}>
        <SettingRow
          icon="notifications"
          title="Daily Reminder"
          subtitle="Get reminded to check in each day"
          trailing={
            <Switch
              value={notifications.dailyReminder}
              onValueChange={() => handleToggle('dailyReminder')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          }
        />
        <Divider />
        <SettingRow
          icon="time"
          title="Reminder Time"
          subtitle={`Daily check-in reminder at ${reminderTime}`}
          trailing={
            <Pressable
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeButtonText}>{reminderTime}</Text>
            </Pressable>
          }
        />
        <Divider />
        <SettingRow
          icon="eye-off"
          title="Private Notifications"
          subtitle="Hide notification content on lock screen"
          trailing={
            <Switch
              value={notificationPrivacyMode}
              onValueChange={handleNotificationPrivacyToggle}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          }
        />
        <Divider />
        <SettingRow
          icon="mail"
          title="Weekly Digest"
          subtitle="Receive weekly summary via email"
          trailing={
            <Switch
              value={notifications.weeklyDigest}
              onValueChange={() => handleToggle('weeklyDigest')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          }
        />
      </Card>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={getReminderTimeDate()}
          mode="time"
          is24Hour={false}
          onChange={handleTimeChange}
        />
      )}

      {/* Focus Areas */}
      <Text style={styles.sectionTitle}>Focus Areas</Text>
      <Card style={styles.settingsCard}>
        <SettingRow
          icon="compass"
          title="Customize Focus"
          subtitle="Choose areas to focus on"
          trailing={<Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
          onPress={() => {}}
        />
      </Card>

      {/* Sleep Tracking */}
      <Text style={styles.sectionTitle}>Sleep Tracking</Text>
      <Card style={styles.settingsCard}>
        <SettingRow
          icon="moon"
          title="Sleep Tracker"
          subtitle="Log and track your sleep patterns"
          iconColor={colors.coping}
          trailing={<Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
          onPress={() => router.push('/(sleep)')}
        />
        <Divider />
        <SettingRow
          icon="flag"
          title="Sleep Goals"
          subtitle="Set your target sleep schedule"
          iconColor={colors.coping}
          trailing={<Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
          onPress={() => router.push('/(sleep)/goals')}
        />
        <Divider />
        <SettingRow
          icon="bulb"
          title="Sleep Tips"
          subtitle="Learn how to improve your sleep"
          iconColor={colors.connection}
          trailing={<Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
          onPress={() => router.push('/(sleep)/tips')}
        />
      </Card>

      {/* Daily Time Budget */}
      <Text style={styles.sectionTitle}>Daily Time Budget</Text>
      <Card style={styles.settingsCard}>
        <View style={styles.timeBudgetSection}>
          <View style={styles.timeBudgetHeader}>
            <Ionicons name="time-outline" size={24} color={colors.primary} />
            <Text style={styles.timeBudgetLabel}>Minutes for self-care</Text>
          </View>
          <Text style={styles.timeBudgetValue}>{dailyTimeBudget} min</Text>
          <View style={styles.timeBudgetOptions}>
            {[5, 10, 15, 20, 30].map((minutes) => (
              <Pressable
                key={minutes}
                style={[
                  styles.timeBudgetChip,
                  dailyTimeBudget === minutes && styles.timeBudgetChipSelected,
                ]}
                onPress={() => handleTimeBudgetChange(minutes)}
              >
                <Text
                  style={[
                    styles.timeBudgetChipText,
                    dailyTimeBudget === minutes && styles.timeBudgetChipTextSelected,
                  ]}
                >
                  {minutes}m
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.timeBudgetHint}>
            We'll suggest actions that fit within your available time
          </Text>
        </View>
      </Card>

      {/* Default Privacy Mode */}
      <Text style={styles.sectionTitle}>Default Sharing Privacy</Text>
      <Card style={styles.settingsCard}>
        <SettingRow
          icon="eye"
          title="Full Details"
          subtitle="Include all stats and mood scores"
          trailing={
            <View
              style={[
                styles.radioButton,
                privacyMode === 'full' && styles.radioButtonSelected,
              ]}
            >
              {privacyMode === 'full' && <View style={styles.radioButtonInner} />}
            </View>
          }
          onPress={() => handlePrivacyModeChange('full')}
        />
        <Divider />
        <SettingRow
          icon="eye-off"
          title="Highlights Only"
          subtitle="Share achievements without specific numbers"
          trailing={
            <View
              style={[
                styles.radioButton,
                privacyMode === 'partial' && styles.radioButtonSelected,
              ]}
            >
              {privacyMode === 'partial' && <View style={styles.radioButtonInner} />}
            </View>
          }
          onPress={() => handlePrivacyModeChange('partial')}
        />
        <Divider />
        <SettingRow
          icon="shield-checkmark"
          title="Minimal"
          subtitle="Only show progress percentage and streak"
          trailing={
            <View
              style={[
                styles.radioButton,
                privacyMode === 'minimal' && styles.radioButtonSelected,
              ]}
            >
              {privacyMode === 'minimal' && <View style={styles.radioButtonInner} />}
            </View>
          }
          onPress={() => handlePrivacyModeChange('minimal')}
        />
      </Card>

      {/* Privacy & Security */}
      <Text style={styles.sectionTitle}>Privacy & Security</Text>
      <Card style={styles.settingsCard}>
        {biometricSupported && (
          <>
            <SettingRow
              icon={biometricType === 'Face ID' ? 'scan' : 'finger-print'}
              title={biometricType || 'Biometric Login'}
              subtitle={`Use ${biometricType || 'biometrics'} to unlock the app`}
              trailing={
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ true: colors.primary, false: colors.border }}
                />
              }
            />
            <Divider />
          </>
        )}
        <SettingRow
          icon="lock-closed"
          title="Change Password"
          trailing={<Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
          onPress={() => {}}
        />
        <Divider />
        <SettingRow
          icon="download"
          title="Export Data"
          subtitle="Download all your data"
          trailing={<Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
          onPress={() => {}}
        />
        <Divider />
        <SettingRow
          icon="shield-checkmark"
          title="Privacy Policy"
          trailing={<Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
          onPress={() => {}}
        />
      </Card>

      {/* Trusted Contacts */}
      <Text style={styles.sectionTitle}>Your Support Network</Text>
      <Card style={styles.settingsCard}>
        <SettingRow
          icon="shield-checkmark"
          title="My Safety Plan"
          subtitle="Personal crisis guide with contacts and strategies"
          iconColor={colors.success}
          trailing={<Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
          onPress={() => router.push('/(safety-plan)')}
        />
        <Divider />
        <SettingRow
          icon="people"
          title="Trusted Contacts"
          subtitle="Manage emergency and support contacts"
          trailing={<Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
          onPress={() => router.push('/(care-preferences)/trusted-contacts')}
        />
      </Card>

      {/* Support */}
      <Text style={styles.sectionTitle}>Help & Support</Text>
      <Card style={styles.settingsCard}>
        <SettingRow
          icon="help-circle"
          title="Help Center"
          trailing={<Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
          onPress={() => {}}
        />
        <Divider />
        <SettingRow
          icon="chatbubbles"
          title="Contact Support"
          trailing={<Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
          onPress={() => {}}
        />
        <Divider />
        <SettingRow
          icon="heart"
          title="Rate App"
          trailing={<Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
          onPress={() => {}}
        />
      </Card>

      {/* Crisis Resources */}
      <Text style={styles.sectionTitle}>Crisis Resources</Text>
      <Card style={[styles.settingsCard, styles.crisisCard]}>
        <SettingRow
          icon="call"
          title="988 Suicide & Crisis Lifeline"
          subtitle="Call or text 988 (24/7)"
          iconColor={colors.error}
          onPress={() => {}}
        />
        <Divider />
        <SettingRow
          icon="chatbox"
          title="Crisis Text Line"
          subtitle="Text HOME to 741741"
          iconColor={colors.error}
          onPress={() => {}}
        />
      </Card>

      {/* Account Actions */}
      <View style={styles.accountActions}>
        <Button
          title="Sign Out"
          variant="outline"
          onPress={handleSignOut}
          loading={isSigningOut}
        />
        <Pressable style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </Pressable>
      </View>

      {/* App Version */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

function SettingRow({
  icon,
  title,
  subtitle,
  trailing,
  iconColor = colors.primary,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  iconColor?: string;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {trailing}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

function Divider() {
  return <View style={styles.divider} />;
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textInverse,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editButton: {
    padding: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  crisisCard: {
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  telehealthCard: {
    borderWidth: 1,
    borderColor: colors.secondary + '30',
  },
  timeBudgetSection: {
    padding: spacing.md,
  },
  timeBudgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  timeBudgetLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  timeBudgetValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  timeBudgetOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  timeBudgetChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeBudgetChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeBudgetChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  timeBudgetChipTextSelected: {
    color: colors.textInverse,
  },
  timeBudgetHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  settingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 36 + spacing.md,
  },
  accountActions: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  deleteButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  deleteButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
  },
  versionText: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xl,
  },
  timeButton: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});
