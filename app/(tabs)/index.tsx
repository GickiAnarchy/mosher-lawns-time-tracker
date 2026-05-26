import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, FlatList, TextInput, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import * as Storage from '@/lib/local-storage';

export default function HomeScreen() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Storage.Employee[]>([]);
  const [jobs, setJobs] = useState<Storage.JobSite[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [activeLog, setActiveLog] = useState<Storage.TimeLog | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!activeLog) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - activeLog.clockInTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeLog]);

  const loadData = async () => {
    const emps = await Storage.getEmployees();
    const jbs = await Storage.getJobSites();
    setEmployees(emps);
    setJobs(jbs);

    if (emps.length > 0 && !selectedEmployee) {
      setSelectedEmployee(emps[0].id);
      const active = await Storage.getActiveTimeLog(emps[0].id);
      setActiveLog(active);
    }
  };

  const handleEmployeeChange = async (empId: string) => {
    setSelectedEmployee(empId);
    const active = await Storage.getActiveTimeLog(empId);
    setActiveLog(active);
    setElapsedTime(0);
  };

  const handleClockIn = async () => {
    if (!selectedEmployee || !selectedJob) {
      Alert.alert('Error', 'Please select an employee and job site');
      return;
    }

    const log = await Storage.addTimeLog(selectedEmployee, selectedJob);
    setActiveLog(log);
    setElapsedTime(0);
    Alert.alert('Success', 'Clocked in');
  };

  const handleClockOut = async () => {
    if (!activeLog) return;

    await Storage.clockOutTimeLog(activeLog.id);
    setActiveLog(null);
    setElapsedTime(0);
    Alert.alert('Success', 'Clocked out');
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-foreground">Clock In/Out</Text>
            <Pressable
              onPress={() => router.push('/data-management')}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Text className="text-primary font-semibold">Manage Data</Text>
            </Pressable>
          </View>

          {/* Employee Selection */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Select Employee</Text>
            <FlatList
              data={employees}
              keyExtractor={e => e.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleEmployeeChange(item.id)}
                  style={({ pressed }) => [
                    {
                      padding: 12,
                      marginBottom: 8,
                      backgroundColor: selectedEmployee === item.id ? '#4CAF50' : '#f0f0f0',
                      borderRadius: 8,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: selectedEmployee === item.id ? 'white' : 'black',
                      fontWeight: '500',
                    }}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
          </View>

          {/* Job Selection */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Select Job Site</Text>
            <FlatList
              data={jobs}
              keyExtractor={j => j.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setSelectedJob(item.id)}
                  style={({ pressed }) => [
                    {
                      padding: 12,
                      marginBottom: 8,
                      backgroundColor: selectedJob === item.id ? '#4CAF50' : '#f0f0f0',
                      borderRadius: 8,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: selectedJob === item.id ? 'white' : 'black',
                      fontWeight: '500',
                    }}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
          </View>

          {/* Status */}
          <View className="bg-surface p-4 rounded-lg">
            <Text className="text-sm text-muted mb-2">Status</Text>
            <Text className="text-lg font-bold text-foreground">
              {activeLog ? 'Clocked In' : 'Clocked Out'}
            </Text>
            {activeLog && (
              <Text className="text-2xl font-bold text-primary mt-2">{formatTime(elapsedTime)}</Text>
            )}
          </View>

          {/* Buttons */}
          <View className="gap-3">
            {!activeLog ? (
              <Pressable
                onPress={handleClockIn}
                style={({ pressed }) => [
                  {
                    padding: 16,
                    backgroundColor: '#4CAF50',
                    borderRadius: 8,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-center text-white font-bold text-lg">Clock In</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleClockOut}
                style={({ pressed }) => [
                  {
                    padding: 16,
                    backgroundColor: '#f44336',
                    borderRadius: 8,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-center text-white font-bold text-lg">Clock Out</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
