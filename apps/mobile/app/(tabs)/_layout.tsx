/**
 * Tabs Layout
 * Bottom tab navigation for the main app
 */

import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function TabBarIcon({ name, color }: { name: IconName; color: string }) {
  return <Ionicons name={name} size={24} color={color} />;
}

// Special SOS tab icon with distinctive styling
function SOSTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[
      sosStyles.container,
      focused && sosStyles.containerFocused,
    ]}>
      <Ionicons
        name="heart"
        size={26}
        color={colors.textInverse}
      />
    </View>
  );
}

const sosStyles = StyleSheet.create({
  container: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.sos,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    ...shadows.md,
    shadowColor: colors.sos,
    shadowOpacity: 0.4,
  },
  containerFocused: {
    transform: [{ scale: 1.1 }],
  },
});

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  // Use safe area bottom inset, with minimums for each platform
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 16);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerTitle: 'MentalSpace',
        }}
      />
      <Tabs.Screen
        name="checkin"
        options={{
          title: 'Check-in',
          tabBarIcon: ({ color }) => <TabBarIcon name="add-circle" color={color} />,
          headerTitle: 'Daily Check-in',
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarIcon: ({ focused }) => <SOSTabIcon focused={focused} />,
          headerTitle: 'Get Help',
          tabBarLabel: () => null, // Hide the label for the center button
        }}
      />
      <Tabs.Screen
        name="telehealth"
        options={{
          title: 'Therapy',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="videocam"
              color={focused ? colors.secondary : color}
            />
          ),
          headerTitle: 'Telehealth',
          tabBarActiveTintColor: colors.secondary,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          headerTitle: "Today's Plan",
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Summary',
          tabBarIcon: ({ color }) => <TabBarIcon name="stats-chart" color={color} />,
          headerTitle: 'Weekly Summary',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="settings" color={color} />,
          headerTitle: 'Settings',
        }}
      />
    </Tabs>
  );
}
