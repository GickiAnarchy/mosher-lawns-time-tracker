import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useLocalAuth } from '@/hooks/use-local-auth';
import { getJobSites, getActiveTimeLog, addTimeLog, updateTimeLog, TimeLog, JobSite } from '@/lib/local-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { employee } = useLocalAuth();
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [activeLog, setActiveLog] = useState<TimeLog | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
      const interval = setInterval(() => {
        if (activeLog && !activeLog.clockOutTime) {
          setElapsedTime(Math.floor((Date.now() - activeLog.clockInTime) / 1000));
        }
      }, 1000);
      return () => clearInterval(interval);
    }, [activeLog])
  );

  const loadData = async () => {
    if (!employee) return;
    try {
      const sites = await getJobSites();
      setJobSites(sites);

      const active = await getActiveTimeLog(employee.id);
      setActiveLog(active);

      if (active) {
        setElapsedTime(Math.floor((Date.now() - active.clockInTime) / 1000));
      } else {
        setElapsedTime(0);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleClockIn = async () => {
    if (!selectedSite) {
      Alert.alert('Error', 'Please select a job site');
      return;
    }

    if (!employee) return;

    setLoading(true);
    try {
      const newLog: TimeLog = {
        id: Date.now().toString(),
        employeeId: employee.id,
        jobSiteId: selectedSite,
        clockInTime: Date.now(),
        clockOutTime: null,
      };

      await addTimeLog(newLog);
      setActiveLog(newLog);
      setElapsedTime(0);
      Alert.alert('Success', 'Clocked in successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeLog) return;

    setLoading(true);
    try {
      await updateTimeLog(activeLog.id, { clockOutTime: Date.now() });
      setActiveLog(null);
      setElapsedTime(0);
      Alert.alert('Success', 'Clocked out successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to clock out');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getActiveSiteName = () => {
    if (!activeLog) return '';
    const site = jobSites.find(s => s.id === activeLog.jobSiteId);
    return site?.name || 'Unknown Site';
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-6">
          {/* Welcome */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Welcome</Text>
            <Text className="text-base text-muted">{employee?.name}</Text>
          </View>

          {/* Clock Status Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
            {activeLog ? (
              <>
                <View>
                  <Text className="text-sm text-muted mb-2">Currently Clocked In</Text>
                  <Text className="text-2xl font-bold text-primary">{getActiveSiteName()}</Text>
                </View>

                <View className="bg-background rounded-lg p-4 items-center">
                  <Text className="text-5xl font-bold text-primary font-mono">{formatTime(elapsedTime)}</Text>
                  <Text className="text-sm text-muted mt-2">Elapsed Time</Text>
                </View>

                <TouchableOpacity
                  onPress={handleClockOut}
                  disabled={loading}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: '#ef4444',
                    borderRadius: 8,
                    paddingVertical: 12,
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  <Text style={{ textAlign: 'center', color: '#ffffff', fontWeight: '600' }}>Clock Out</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text className="text-lg font-semibold text-foreground">Clock In</Text>
                <Text className="text-sm text-muted mb-2">Select a job site:</Text>

                <FlatList
                  data={jobSites}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => setSelectedSite(item.id)}
                      activeOpacity={0.7}
                      style={{
                        padding: 12,
                        marginBottom: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        backgroundColor: selectedSite === item.id ? '#2d7a3a' : '#f5f5f5',
                        borderColor: selectedSite === item.id ? '#2d7a3a' : '#e5e7eb',
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: '600',
                          color: selectedSite === item.id ? '#ffffff' : '#11181c',
                        }}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />

                <TouchableOpacity
                  onPress={handleClockIn}
                  disabled={loading || !selectedSite}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: '#2d7a3a',
                    borderRadius: 8,
                    paddingVertical: 12,
                    marginTop: 8,
                    opacity: loading || !selectedSite ? 0.6 : 1,
                  }}
                >
                  <Text style={{ textAlign: 'center', color: '#ffffff', fontWeight: '600' }}>Clock In</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Quick Links */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(protected)/(tabs)/logs')}
              className="bg-surface rounded-lg p-4 border border-border"
            >
              <Text className="text-base font-semibold text-foreground">View Time Logs</Text>
              <Text className="text-xs text-muted mt-1">See all your time entries</Text>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View className="bg-background rounded-lg p-4 border border-border">
            <Text className="text-xs text-muted font-semibold mb-2">TIP</Text>
            <Text className="text-sm text-muted">
              All your time tracking data is stored locally on your phone. No internet connection required.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
