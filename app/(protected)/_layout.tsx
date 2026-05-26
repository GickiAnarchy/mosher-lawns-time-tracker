import { Redirect, Stack } from 'expo-router';
import { useLocalAuth } from '@/hooks/use-local-auth';
import { ActivityIndicator, View } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export default function ProtectedLayout() {
  // All hooks must be called before any conditional returns
  const { isAuthenticated, loading } = useLocalAuth();
  const colors = useColors();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="edit-log" />
    </Stack>
  );
}
