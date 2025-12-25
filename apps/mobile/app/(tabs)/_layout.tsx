/**
 * Tabs Layout
 * Bottom tab navigation for the main app
 * Simplified to 5 essential tabs with proper SOS button placement
 */

import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function TabBarIcon({ name, color, size = 24 }: { name: IconName; color: string; size?: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

// Special SOS tab icon - distinctive but properly sized to not overlap
function SOSTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[
      sosStyles.container,
      focused && sosStyles.containerFocused,
    ]}>
      <Ionicons
        name="heart"
        size={22}
        color={colors.textInverse}
      />
    </View>
  );
}

const sosStyles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.sos,
    justifyContent: 'center',
    alignItems: 'center',
    // No negative margin - stays within tab bar
    ...shadows.sm,
    shadowColor: colors.sos,
    shadowOpacity: 0.3,
  },
  containerFocused: {
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.5,
  },
});

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  // Use safe area bottom inset, with minimums for each platform
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 16);
  const tabBarHeight = 60 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          paddingHorizontal: spacing.sm,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      {/* Tab 1: Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerTitle: 'MentalSpace',
        }}
      />

      {/* Tab 2: Check-in */}
      <Tabs.Screen
        name="checkin"
        options={{
          title: 'Check-in',
          tabBarIcon: ({ color }) => <TabBarIcon name="add-circle" color={color} />,
          headerTitle: 'Daily Check-in',
        }}
      />

      {/* Tab 3: SOS (Center) - Crisis support */}
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarIcon: ({ focused }) => <SOSTabIcon focused={focused} />,
          headerTitle: 'Get Help Now',
          tabBarLabel: ({ focused }) => (
            <Text style={{
              fontSize: 11,
              fontWeight: '700',
              color: focused ? colors.sos : colors.textTertiary,
              marginTop: 4,
            }}>
              SOS
            </Text>
          ),
        }}
      />

      {/* Tab 4: Plan - Safety plan */}
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color }) => <TabBarIcon name="shield-checkmark" color={color} />,
          headerTitle: 'Safety Plan',
        }}
      />

      {/* Tab 5: Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="settings" color={color} />,
          headerTitle: 'Settings',
        }}
      />

      {/* Hidden tabs - accessible via navigation but not shown in tab bar */}
      <Tabs.Screen
        name="telehealth"
        options={{
          href: null, // Hide from tab bar - accessible via floating button
          headerTitle: 'Telehealth',
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          href: null, // Hide from tab bar - accessible from home
          headerTitle: 'Weekly Summary',
        }}
      />
    </Tabs>
  );
}
