import { useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const colors = useColors();

  // Queries
  const profileQuery = trpc.employee.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && !authLoading,
  });

  // Auth guards are handled by the protected layout

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await logout();
            // Protected layout will redirect to login automatically
          } catch (error) {
            Alert.alert("Error", error instanceof Error ? error.message : "Failed to logout");
          }
        },
        style: "destructive",
      },
    ]);
  };

  if (authLoading || profileQuery.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Settings</Text>
            <Text className="text-sm text-muted">Manage your account and preferences</Text>
          </View>

          {/* Employee Information */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Employee Information</Text>

            <View className="bg-surface rounded-lg p-4 border border-border gap-4">
              <View className="gap-1">
                <Text className="text-xs text-muted">Employee ID</Text>
                <Text className="text-base font-semibold text-foreground">
                  {profileQuery.data?.employeeId}
                </Text>
              </View>

              <View className="gap-1">
                <Text className="text-xs text-muted">Full Name</Text>
                <Text className="text-base font-semibold text-foreground">
                  {profileQuery.data?.name}
                </Text>
              </View>

              {profileQuery.data?.email && (
                <View className="gap-1">
                  <Text className="text-xs text-muted">Email</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {profileQuery.data.email}
                  </Text>
                </View>
              )}

              {profileQuery.data?.phone && (
                <View className="gap-1">
                  <Text className="text-xs text-muted">Phone</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {profileQuery.data.phone}
                  </Text>
                </View>
              )}

              <View className="gap-1">
                <Text className="text-xs text-muted">Role</Text>
                <Text className="text-base font-semibold text-foreground capitalize">
                  {profileQuery.data?.role}
                </Text>
              </View>
            </View>
          </View>

          {/* Account Information */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Account</Text>

            <View className="bg-surface rounded-lg p-4 border border-border gap-2">
              <Text className="text-xs text-muted">Manus Account</Text>
              <Text className="text-base font-semibold text-foreground">{user?.email || user?.name}</Text>
            </View>
          </View>

          {/* App Information */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">App Information</Text>

            <View className="bg-surface rounded-lg p-4 border border-border gap-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted">Version</Text>
                <Text className="text-sm font-semibold text-foreground">1.0.0</Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted">Company</Text>
                <Text className="text-sm font-semibold text-foreground">Mosher Lawns</Text>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="py-3 px-6 rounded-lg items-center"
            style={{
              backgroundColor: colors.error,
            }}
          >
            <Text className="text-base font-semibold text-background">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
