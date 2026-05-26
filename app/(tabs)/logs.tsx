import { useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, Pressable, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import * as Storage from '@/lib/local-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function LogsScreen() {
  const [logs, setLogs] = useState<Storage.TimeLog[]>([]);
  const [employees, setEmployees] = useState<Map<string, string>>(new Map());
  const [jobs, setJobs] = useState<Map<string, string>>(new Map());

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const allLogs = await Storage.getTimeLogs();
    const emps = await Storage.getEmployees();
    const jbs = await Storage.getJobSites();

    const empMap = new Map(emps.map(e => [e.id, e.name]));
    const jobMap = new Map(jbs.map(j => [j.id, j.name]));

    setLogs(allLogs.reverse());
    setEmployees(empMap);
    setJobs(jobMap);
  };

  const handleDeleteLog = (id: string) => {
    Alert.alert('Delete Log', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          await Storage.deleteTimeLog(id);
          loadData();
          Alert.alert('Success', 'Log deleted');
        },
      },
    ]);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const calculateDuration = (clockIn: number, clockOut: number | null) => {
    if (!clockOut) return 'In Progress';
    const minutes = Math.floor((clockOut - clockIn) / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          <Text className="text-2xl font-bold text-foreground">Time Logs</Text>

          {logs.length === 0 ? (
            <Text className="text-center text-muted mt-8">No time logs yet</Text>
          ) : (
            <FlatList
              data={logs}
              keyExtractor={l => l.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <View className="mb-2">
                    <Text className="font-semibold text-foreground">
                      {employees.get(item.employeeId) || 'Unknown Employee'}
                    </Text>
                    <Text className="text-sm text-muted">
                      {jobs.get(item.jobSiteId) || 'Unknown Job'}
                    </Text>
                  </View>

                  <View className="mb-2">
                    <Text className="text-xs text-muted">
                      In: {formatTime(item.clockInTime)}
                    </Text>
                    {item.clockOutTime && (
                      <Text className="text-xs text-muted">
                        Out: {formatTime(item.clockOutTime)}
                      </Text>
                    )}
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className="font-bold text-primary">
                      {calculateDuration(item.clockInTime, item.clockOutTime)}
                    </Text>
                    <Pressable
                      onPress={() => handleDeleteLog(item.id)}
                      style={({ pressed }) => [
                        {
                          padding: 8,
                          backgroundColor: '#f44336',
                          borderRadius: 6,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <Text className="text-white font-semibold text-sm">Delete</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
