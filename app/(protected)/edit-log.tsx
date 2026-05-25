import { useEffect, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function EditLogScreen() {
  const router = useRouter();
  const { logId } = useLocalSearchParams<{ logId: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const colors = useColors();

  const [clockInTime, setClockInTime] = useState("");
  const [clockOutTime, setClockOutTime] = useState("");
  const [notes, setNotes] = useState("");

  // Queries
  const profileQuery = trpc.employee.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && !authLoading,
  });

  const logQuery = trpc.timeLogs.getById.useQuery(
    { id: parseInt(logId || "0") },
    {
      enabled: isAuthenticated && !authLoading && !!logId,
    }
  );

  const jobSitesQuery = trpc.jobSites.list.useQuery(undefined, {
    enabled: isAuthenticated && !authLoading,
  });

  // Mutations
  const updateLogMutation = trpc.timeLogs.update.useMutation({
    onSuccess: () => {
      Alert.alert("Success", "Time entry updated successfully!");
      router.back();
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  // Initialize form with log data
  useEffect(() => {
    if (logQuery.data) {
      setClockInTime(new Date(logQuery.data.clockInTime).toISOString().slice(0, 16));
      setClockOutTime(
        logQuery.data.clockOutTime
          ? new Date(logQuery.data.clockOutTime).toISOString().slice(0, 16)
          : ""
      );
      setNotes(logQuery.data.notes || "");
    }
  }, [logQuery.data]);

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

  const handleSave = () => {
    if (!clockInTime) {
      Alert.alert("Validation Error", "Clock in time is required");
      return;
    }

    try {
      const clockInDate = new Date(clockInTime);
      const clockOutDate = clockOutTime ? new Date(clockOutTime) : null;

      if (clockOutDate && clockOutDate <= clockInDate) {
        Alert.alert("Validation Error", "Clock out time must be after clock in time");
        return;
      }

      updateLogMutation.mutate({
        id: parseInt(logId || "0"),
        clockInTime: clockInDate,
        clockOutTime: clockOutDate || undefined,
        notes: notes || undefined,
      });
    } catch (error) {
      Alert.alert("Error", "Invalid time format");
    }
  };

  if (authLoading || profileQuery.isLoading || logQuery.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const jobSite = jobSitesQuery.data?.find((site) => site.id === logQuery.data?.jobSiteId);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          {/* Header */}
          <View className="gap-2">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-lg text-primary font-semibold">← Back</Text>
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Edit Time Entry</Text>
          </View>

          {/* Job Site Info */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-2">
            <Text className="text-xs text-muted">Job Site</Text>
            <Text className="text-lg font-semibold text-foreground">{jobSite?.name || "Unknown"}</Text>
          </View>

          {/* Form Card */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-4">
            {/* Clock In Time */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Clock In Time *</Text>
              <TextInput
                placeholder="YYYY-MM-DDTHH:MM"
                value={clockInTime}
                onChangeText={setClockInTime}
                editable={!updateLogMutation.isPending}
                className="border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor={colors.muted}
              />
              <Text className="text-xs text-muted">Format: YYYY-MM-DDTHH:MM</Text>
            </View>

            {/* Clock Out Time */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Clock Out Time (Optional)</Text>
              <TextInput
                placeholder="YYYY-MM-DDTHH:MM"
                value={clockOutTime}
                onChangeText={setClockOutTime}
                editable={!updateLogMutation.isPending}
                className="border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor={colors.muted}
              />
              <Text className="text-xs text-muted">Leave empty if still clocked in</Text>
            </View>

            {/* Notes */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Notes</Text>
              <TextInput
                placeholder="Add any notes about this entry"
                value={notes}
                onChangeText={setNotes}
                editable={!updateLogMutation.isPending}
                multiline
                numberOfLines={4}
                className="border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor={colors.muted}
                textAlignVertical="top"
              />
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3 pt-4">
              <TouchableOpacity
                onPress={() => router.back()}
                disabled={updateLogMutation.isPending}
                className="flex-1 py-3 px-4 rounded-lg border border-border items-center"
              >
                <Text className="text-base font-semibold text-foreground">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                disabled={updateLogMutation.isPending}
                style={{
                  backgroundColor: colors.primary,
                  opacity: updateLogMutation.isPending ? 0.7 : 1,
                }}
                className="flex-1 py-3 px-4 rounded-lg items-center"
              >
                {updateLogMutation.isPending ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-base font-semibold text-background">Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
