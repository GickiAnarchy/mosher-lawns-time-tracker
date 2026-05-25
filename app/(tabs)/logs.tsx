import { useEffect, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

type FilterType = "today" | "week" | "month" | "all";

export default function LogsScreen() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const colors = useColors();
  const [filter, setFilter] = useState<FilterType>("today");

  // Queries
  const profileQuery = trpc.employee.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && !authLoading,
  });

  const logsQuery = trpc.timeLogs.list.useQuery(
    { limit: 100 },
    {
      enabled: isAuthenticated && !authLoading,
    }
  );

  const jobSitesQuery = trpc.jobSites.list.useQuery(undefined, {
    enabled: isAuthenticated && !authLoading,
  });

  // Mutations
  const deleteLogMutation = trpc.timeLogs.delete.useMutation({
    onSuccess: () => {
      logsQuery.refetch();
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

  const getFilteredLogs = () => {
    if (!logsQuery.data) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return logsQuery.data.filter((log) => {
      const logDate = new Date(log.clockInTime);
      const logDateOnly = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());

      switch (filter) {
        case "today":
          return logDateOnly.getTime() === today.getTime();
        case "week":
          return logDate >= weekAgo;
        case "month":
          return logDate >= monthAgo;
        case "all":
          return true;
        default:
          return true;
      }
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const calculateDuration = (clockIn: Date | string, clockOut: Date | string | null) => {
    if (!clockOut) return "In Progress";

    const start = new Date(clockIn).getTime();
    const end = new Date(clockOut).getTime();
    const elapsed = Math.floor((end - start) / 1000);

    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);

    return `${hours}h ${minutes}m`;
  };

  const handleDelete = (logId: number) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this time entry?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => {
          deleteLogMutation.mutate({ id: logId });
        },
        style: "destructive",
      },
    ]);
  };

  const handleEdit = (logId: number) => {
    router.push({
      pathname: "/edit-log",
      params: { logId: logId.toString() },
    });
  };

  if (authLoading || profileQuery.isLoading || logsQuery.isLoading || jobSitesQuery.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const filteredLogs = getFilteredLogs();

  return (
    <ScreenContainer className="p-4">
      <View className="gap-4 flex-1">
        {/* Header */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Time Logs</Text>
          <Text className="text-sm text-muted">View and manage your time entries</Text>
        </View>

        {/* Filter Buttons */}
        <View className="flex-row gap-2">
          {(["today", "week", "month", "all"] as FilterType[]).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={{
                backgroundColor: filter === f ? colors.primary : colors.surface,
                borderColor: filter === f ? colors.primary : colors.border,
              }}
              className="flex-1 py-2 px-3 rounded-lg border items-center"
            >
              <Text
                style={{
                  color: filter === f ? colors.background : colors.foreground,
                }}
                className="text-xs font-semibold capitalize"
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logs List */}
        {filteredLogs.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-2">
            <Text className="text-lg font-semibold text-muted">No entries found</Text>
            <Text className="text-sm text-muted">Clock in to start tracking time</Text>
          </View>
        ) : (
          <FlatList
            data={filteredLogs}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={true}
            contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
            renderItem={({ item }) => {
              const jobSite = jobSitesQuery.data?.find((site) => site.id === item.jobSiteId);

              return (
                <View className="bg-surface rounded-lg p-4 border border-border gap-3">
                  {/* Header */}
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 gap-1">
                      <Text className="text-base font-semibold text-foreground">
                        {jobSite?.name || "Unknown Site"}
                      </Text>
                      <Text className="text-xs text-muted">{formatDate(item.clockInTime)}</Text>
                    </View>
                    <View className="items-end gap-1">
                      <Text className="text-sm font-bold text-primary">
                        {calculateDuration(item.clockInTime, item.clockOutTime)}
                      </Text>
                    </View>
                  </View>

                  {/* Times */}
                  <View className="flex-row justify-between text-xs">
                    <View className="gap-1">
                      <Text className="text-xs text-muted">In: {formatTime(item.clockInTime)}</Text>
                      {item.clockOutTime && (
                        <Text className="text-xs text-muted">Out: {formatTime(item.clockOutTime)}</Text>
                      )}
                    </View>
                  </View>

                  {/* Notes */}
                  {item.notes && (
                    <View className="bg-background rounded p-2">
                      <Text className="text-xs text-muted italic">{item.notes}</Text>
                    </View>
                  )}

                  {/* Actions */}
                  <View className="flex-row gap-2 pt-2">
                    <TouchableOpacity
                      onPress={() => handleEdit(item.id)}
                      className="flex-1 py-2 px-3 rounded bg-primary items-center"
                    >
                      <Text className="text-xs font-semibold text-background">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(item.id)}
                      disabled={deleteLogMutation.isPending}
                      className="flex-1 py-2 px-3 rounded bg-error items-center"
                    >
                      {deleteLogMutation.isPending ? (
                        <ActivityIndicator size="small" color={colors.background} />
                      ) : (
                        <Text className="text-xs font-semibold text-background">Delete</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </ScreenContainer>
  );
}
