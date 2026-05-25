import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

export default function LoginScreen() {
  // All hooks must be called before any conditional returns
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, refresh } = useAuth();
  const colors = useColors();
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const createProfileMutation = trpc.employee.createProfile.useMutation();
  const getProfileQuery = trpc.employee.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && !authLoading,
  });

  // If user is authenticated and has a profile, redirect to home
  useEffect(() => {
    if (isAuthenticated && !authLoading && getProfileQuery.data) {
      router.replace("/(protected)/(tabs)");
    }
  }, [isAuthenticated, authLoading, getProfileQuery.data, router]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      // Use the app's configured redirect URL for OAuth callback
      const redirectUrl = Linking.createURL("oauth/callback");
      // Open the OAuth login page
      const result = await WebBrowser.openAuthSessionAsync(
        `https://auth.manus.im/login?redirect_uri=${encodeURIComponent(redirectUrl)}`,
        redirectUrl
      );

      if (result.type === "success") {
        // Refresh auth state after successful login
        await refresh();
      }
    } catch (error) {
      Alert.alert("Login Error", error instanceof Error ? error.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterProfile = async () => {
    if (!employeeId.trim() || !name.trim()) {
      Alert.alert("Validation Error", "Employee ID and Name are required");
      return;
    }

    try {
      setLoading(true);
      await createProfileMutation.mutateAsync({
        employeeId: employeeId.trim(),
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      Alert.alert("Success", "Profile created successfully!");
      router.replace("/(protected)/(tabs)");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  // Now we can have conditional returns after all hooks are called
  if (authLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center gap-8">
            {/* Header */}
            <View className="items-center gap-2">
              <Text className="text-4xl font-bold text-foreground">Mosher Lawns</Text>
              <Text className="text-lg text-muted">Time Tracker</Text>
            </View>

            {/* Login Card */}
            <View className="bg-surface rounded-2xl p-6 shadow-sm border border-border gap-4">
              <Text className="text-2xl font-bold text-foreground">Welcome</Text>
              <Text className="text-sm text-muted">Sign in to track your time</Text>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                style={{
                  backgroundColor: colors.primary,
                  opacity: loading ? 0.7 : 1,
                }}
                className="py-3 px-6 rounded-lg items-center"
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold">Sign In</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Show profile registration if user is authenticated but has no profile
  if (isAuthenticated && !getProfileQuery.data && !getProfileQuery.isLoading) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center gap-6">
            {/* Header */}
            <View className="items-center gap-2">
              <Text className="text-3xl font-bold text-foreground">Create Profile</Text>
              <Text className="text-sm text-muted">Complete your employee information</Text>
            </View>

            {/* Form Card */}
            <View className="bg-surface rounded-2xl p-6 shadow-sm border border-border gap-4">
              {/* Employee ID */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Employee ID *</Text>
                <TextInput
                  placeholder="e.g., EMP001"
                  value={employeeId}
                  onChangeText={setEmployeeId}
                  editable={!loading}
                  className="border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholderTextColor={colors.muted}
                />
              </View>

              {/* Name */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Full Name *</Text>
                <TextInput
                  placeholder="Your name"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                  className="border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholderTextColor={colors.muted}
                />
              </View>

              {/* Email */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Email (Optional)</Text>
                <TextInput
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                  keyboardType="email-address"
                  className="border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholderTextColor={colors.muted}
                />
              </View>

              {/* Phone */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Phone (Optional)</Text>
                <TextInput
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChangeText={setPhone}
                  editable={!loading}
                  keyboardType="phone-pad"
                  className="border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholderTextColor={colors.muted}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleRegisterProfile}
                disabled={loading}
                style={{
                  backgroundColor: colors.primary,
                  opacity: loading ? 0.7 : 1,
                }}
                className="py-3 px-6 rounded-lg items-center mt-2"
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold">Create Profile</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="items-center justify-center">
      <ActivityIndicator size="large" color={colors.primary} />
    </ScreenContainer>
  );
}
