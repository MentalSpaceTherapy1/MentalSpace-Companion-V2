/**
 * Tabs Layout
 * Bottom tab navigation for the main app
 */

import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function TabBarIcon({ name, color }: { name: IconName; color: string }) {
  return <Ionicons name={name} size={24} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
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
