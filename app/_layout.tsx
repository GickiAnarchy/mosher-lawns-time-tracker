import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@/lib/theme-provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="login" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="(employee)" />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
