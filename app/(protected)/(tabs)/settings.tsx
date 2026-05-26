import { ScrollView, Text, View, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useLocalAuth } from '@/hooks/use-local-auth';

export default function SettingsScreen() {
  const { employee, logout } = useLocalAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await logout();
            router.replace('/login');
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Settings</Text>
            <Text className="text-sm text-muted mt-1">Manage your account</Text>
          </View>

          {/* Employee Info */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
            <Text className="text-lg font-semibold text-foreground">Employee Information</Text>

            <View className="gap-3">
              <View>
                <Text className="text-xs text-muted font-semibold mb-1">NAME</Text>
                <Text className="text-base font-semibold text-foreground">{employee?.name}</Text>
              </View>

              <View>
                <Text className="text-xs text-muted font-semibold mb-1">EMPLOYEE ID</Text>
                <Text className="text-base font-semibold text-foreground">{employee?.id}</Text>
              </View>
            </View>
          </View>

          {/* App Info */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
            <Text className="text-lg font-semibold text-foreground">App Information</Text>

            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Version</Text>
                <Text className="text-sm font-semibold text-foreground">1.0.0</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Storage</Text>
                <Text className="text-sm font-semibold text-foreground">Local Only</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Internet Required</Text>
                <Text className="text-sm font-semibold text-foreground">No</Text>
              </View>
            </View>
          </View>

          {/* About */}
          <View className="bg-background rounded-lg p-4 border border-border">
            <Text className="text-xs text-muted font-semibold mb-2">ABOUT</Text>
            <Text className="text-sm text-muted leading-relaxed">
              Mosher Lawns Time Tracker is a simple, offline-first app for tracking employee time on job sites. All data is stored locally on your device.
            </Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-error rounded-lg py-3 mt-4"
          >
            <Text className="text-center text-white font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
