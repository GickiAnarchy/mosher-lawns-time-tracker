import { useEffect, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const colors = useColors();
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  // Queries
  const profileQuery = trpc.employee.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && !authLoading,
  });

  const currentLogQuery = trpc.timeLogs.getCurrentLog.useQuery(undefined, {
    enabled: isAuthenticated && !authLoading,
    refetchInterval: 1000, // Refresh every second for elapsed time
  });

  const jobSitesQuery = trpc.jobSites.list.useQuery(undefined, {
    enabled: isAuthenticated && !authLoading,
  });

  // Mutations
  const clockInMutation = trpc.timeLogs.clockIn.useMutation({
    onSuccess: () => {
      currentLogQuery.refetch();
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const clockOutMutation = trpc.timeLogs.clockOut.useMutation({
    onSuccess: () => {
      currentLogQuery.refetch();
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, authLoading]);

  // Redirect to profile creation if no profile
  useEffect(() => {
    if (!profileQuery.isLoading && !profileQuery.data) {
      router.replace("/login");
    }
  }, [profileQuery.data, profileQuery.isLoading]);

  // Calculate elapsed time
  useEffect(() => {
    if (!currentLogQuery.data) {
      setElapsedTime("00:00:00");
      return;
    }

    const updateElapsedTime = () => {
      if (!currentLogQuery.data) return;
      const now = new Date().getTime();
      const clockInTime = new Date(currentLogQuery.data.clockInTime).getTime();
      const elapsed = Math.floor((now - clockInTime) / 1000);

      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;

      setElapsedTime(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);
    return () => clearInterval(interval);
  }, [currentLogQuery.data]);

  const handleClockIn = () => {
    if (!jobSitesQuery.data || jobSitesQuery.data.length === 0) {
      Alert.alert("Error", "No job sites available");
      return;
    }

    // Show job site selection
    const options = jobSitesQuery.data.map((site) => ({
      text: site.name,
      onPress: () => {
        clockInMutation.mutate({
          jobSiteId: site.id,
        });
      },
    }));

    Alert.alert("Select Job Site", "Choose the job site you're clocking into:", [
      ...options,
      { text: "Cancel", onPress: () => {}, style: "cancel" },
    ]);
  };

  const handleClockOut = () => {
    Alert.alert("Clock Out", "Are you sure you want to clock out?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Clock Out",
        onPress: () => {
          clockOutMutation.mutate({});
        },
        style: "destructive",
      },
    ]);
  };

  if (authLoading || profileQuery.isLoading || jobSitesQuery.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const isClockedIn = !!currentLogQuery.data;
  const currentJobSite = isClockedIn
    ? jobSitesQuery.data?.find((site) => site.id === currentLogQuery.data?.jobSiteId)
    : null;

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Welcome, {profileQuery.data?.name}
            </Text>
            <Text className="text-sm text-muted">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>

          {/* Status Card */}
            {isClockedIn && currentLogQuery.data ? (
              <View
                className="rounded-2xl p-6 border"
                style={{
                  backgroundColor: colors.success,
                  borderColor: colors.success,
                }}
              >
                <Text className="text-sm font-semibold text-muted mb-2">Current Status</Text>
                <Text className="text-4xl font-bold text-foreground mb-4">Clocked In</Text>

                <View className="gap-2 mb-4">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Job Site:</Text>
                    <Text className="text-sm font-semibold text-foreground">{currentJobSite?.name}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Elapsed Time:</Text>
                    <Text className="text-sm font-semibold text-foreground">{elapsedTime}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Clocked In:</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {new Date(currentLogQuery.data.clockInTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View
                className="rounded-2xl p-6 border"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <Text className="text-sm font-semibold text-muted mb-2">Current Status</Text>
                <Text className="text-4xl font-bold text-foreground mb-4">Clocked Out</Text>
              </View>
            )}

          {/* Main Action Button */}
          <TouchableOpacity
            onPress={isClockedIn ? handleClockOut : handleClockIn}
            disabled={clockInMutation.isPending || clockOutMutation.isPending}
            style={{
              backgroundColor: isClockedIn ? colors.error : colors.success,
              opacity: clockInMutation.isPending || clockOutMutation.isPending ? 0.7 : 1,
            }}
            className="py-6 px-6 rounded-2xl items-center"
          >
            {clockInMutation.isPending || clockOutMutation.isPending ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="text-2xl font-bold text-background">
                {isClockedIn ? "Clock Out" : "Clock In"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Quick Stats */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Today's Summary</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
                <Text className="text-xs text-muted mb-1">Total Hours</Text>
                <Text className="text-2xl font-bold text-foreground">0h 00m</Text>
              </View>
              <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
                <Text className="text-xs text-muted mb-1">Sites Visited</Text>
                <Text className="text-2xl font-bold text-foreground">0</Text>
              </View>
            </View>
          </View>

          {/* Quick Links */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/logs")}
              className="bg-surface rounded-lg p-4 border border-border"
            >
              <Text className="text-base font-semibold text-foreground">View Time Logs</Text>
              <Text className="text-xs text-muted mt-1">See all your time entries</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
