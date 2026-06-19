import { Tabs } from 'expo-router';
import { useColors } from '@/hooks/use-colors';

export default function TabsLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Clock In/Out',
          tabBarLabel: 'Clock',
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'Time Logs',
          tabBarLabel: 'History',
        }}
      />
    </Tabs>
  );
}
