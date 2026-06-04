import { useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import * as Storage from '@/lib/local-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useColors } from '@/hooks/use-colors';

export default function LogsScreen() {
  const router = useRouter();
  const colors = useColors();
  const [logs, setLogs] = useState<Storage.TimeLog[]>([]);
  const [employees, setEmployees] = useState<Map<string, string>>(new Map());
  const [jobs, setJobs] = useState<Map<string, Storage.JobSite>>(new Map());
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const allLogs = await Storage.getTimeLogs();
      const emps = await Storage.getEmployees();
      const jbs = await Storage.getJobSites();

      const empMap = new Map(emps.map(e => [e.id, e.name]));
      const jobMap = new Map(jbs.map(j => [j.id, j]));

      setLogs(allLogs.sort((a, b) => b.clockInTime - a.clockInTime));
      setEmployees(empMap);
      setJobs(jobMap);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = (id: string) => {
    Alert.alert('Delete Log', 'Are you sure you want to delete this time entry?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await Storage.deleteTimeLog(id);
            loadData();
            Alert.alert('Success', 'Time entry deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete time entry');
          }
        },
      },
    ]);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDuration = (clockIn: number, clockOut: number | null) => {
    if (!clockOut) return 'In Progress';
    const minutes = Math.floor((clockOut - clockIn) / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading && logs.length === 0) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ gap: 24 }}>
          {/* Header */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.foreground }}>
              Time Logs
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted }}>
              View and manage time entries
            </Text>
          </View>

          {/* Management Buttons */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => router.push('/employees-management')}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>
                Manage Employees
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/jobs-management')}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>
                Manage Jobs
              </Text>
            </Pressable>
          </View>

          {/* Logs List Section */}
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                All Time Entries ({logs.length})
              </Text>
            </View>

            {logs.length === 0 ? (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 32,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.muted, fontSize: 14 }}>No time entries yet</Text>
              </View>
            ) : (
              <FlatList
                data={logs}
                keyExtractor={l => l.id}
                scrollEnabled={false}
                renderItem={({ item }) => {
                  const empName = employees.get(item.employeeId) || 'Unknown';
                  const jobSite = jobs.get(item.jobSiteId);
                  const jobName = jobSite?.name || 'Unknown';
                  const jobLocation = jobSite?.location || '';
                  const duration = calculateDuration(item.clockInTime, item.clockOutTime);
                  const isActive = !item.clockOutTime;

                  return (
                    <View
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: isActive ? colors.success : colors.border,
                        borderLeftWidth: 4,
                        borderLeftColor: isActive ? colors.success : colors.border,
                        gap: 12,
                      }}
                    >
                      {/* Employee and Job Info */}
                      <View style={{ gap: 4 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
                          {empName}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.muted }}>
                          {jobName}
                          {jobLocation && ` • ${jobLocation}`}
                        </Text>
                      </View>

                      {/* Time Info */}
                      <View
                        style={{
                          backgroundColor: colors.background,
                          borderRadius: 8,
                          padding: 12,
                          gap: 8,
                        }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 12, color: colors.muted }}>Date</Text>
                          <Text style={{ fontSize: 12, fontWeight: '500', color: colors.foreground }}>
                            {formatDate(item.clockInTime)}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 12, color: colors.muted }}>Clock In</Text>
                          <Text style={{ fontSize: 12, fontWeight: '500', color: colors.foreground }}>
                            {formatTime(item.clockInTime)}
                          </Text>
                        </View>
                        {item.clockOutTime && (
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 12, color: colors.muted }}>Clock Out</Text>
                            <Text style={{ fontSize: 12, fontWeight: '500', color: colors.foreground }}>
                              {formatTime(item.clockOutTime)}
                            </Text>
                          </View>
                        )}
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingTop: 8,
                            borderTopWidth: 1,
                            borderTopColor: colors.border,
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.foreground }}>
                            Duration
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: '600',
                              color: isActive ? colors.success : colors.foreground,
                            }}
                          >
                            {duration}
                          </Text>
                        </View>
                      </View>

                      {/* Delete Button */}
                      <Pressable
                        onPress={() => handleDeleteLog(item.id)}
                        style={{
                          backgroundColor: colors.error,
                          paddingVertical: 10,
                          borderRadius: 8,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                          Delete Entry
                        </Text>
                      </Pressable>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
