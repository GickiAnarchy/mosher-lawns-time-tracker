import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

export default function EmployeeLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'web' ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2d7a3a',
        headerShown: false,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Clock In/Out',
          tabBarIcon: ({ color }) => <MaterialIcons name="schedule" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'My Logs',
          tabBarIcon: ({ color }) => <MaterialIcons name="history" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
