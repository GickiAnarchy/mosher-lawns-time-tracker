import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useLocalAuth } from '@/hooks/use-local-auth';
import { getJobSites, getActiveTimeLog, addTimeLog, updateTimeLog, TimeLog, JobSite } from '@/lib/local-storage';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function EmployeeClockScreen() {
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
      const updatedLog: TimeLog = {
        ...activeLog,
        clockOutTime: Date.now(),
      };

      await updateTimeLog(updatedLog);
      setActiveLog(null);
      setSelectedSite(null);
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

  const getSiteName = (siteId: string) => {
    return jobSites.find(s => s.id === siteId)?.name || 'Unknown Site';
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ padding: 16, gap: 16 }}>
          {/* Header */}
          <View>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#11181c' }}>Clock In/Out</Text>
            <Text style={{ fontSize: 14, color: '#687076', marginTop: 4 }}>
              Welcome, {employee?.name}
            </Text>
          </View>

          {activeLog ? (
            // Clocked In View
            <>
              <View
                style={{
                  backgroundColor: '#2d7a3a',
                  borderRadius: 16,
                  padding: 24,
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <MaterialIcons name="check-circle" size={48} color="#ffffff" />
                </View>
                <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', marginBottom: 8 }}>
                  Currently Clocked In
                </Text>
                <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>
                  {getSiteName(activeLog.jobSiteId)}
                </Text>
              </View>

              {/* Elapsed Time */}
              <View
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 16,
                  padding: 24,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, color: '#687076', marginBottom: 8 }}>Elapsed Time</Text>
                <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#2d7a3a', fontFamily: 'monospace' }}>
                  {formatTime(elapsedTime)}
                </Text>
              </View>

              {/* Clock Out Button */}
              <TouchableOpacity
                onPress={handleClockOut}
                disabled={loading}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#ef4444',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 18 }}>
                  {loading ? 'Clocking Out...' : 'Clock Out'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            // Clocked Out View
            <>
              <View
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 16,
                  padding: 24,
                  alignItems: 'center',
                }}
              >
                <MaterialIcons name="schedule" size={48} color="#2d7a3a" />
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#11181c', marginTop: 12 }}>
                  Ready to Clock In
                </Text>
                <Text style={{ fontSize: 14, color: '#687076', marginTop: 4 }}>
                  Select a job site to begin
                </Text>
              </View>

              {/* Job Sites Selection */}
              <View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#11181c', marginBottom: 12 }}>
                  Select Job Site
                </Text>

                <FlatList
                  data={jobSites}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => setSelectedSite(item.id)}
                      activeOpacity={0.7}
                      style={{
                        padding: 16,
                        marginBottom: 8,
                        borderRadius: 12,
                        borderWidth: 2,
                        backgroundColor: selectedSite === item.id ? '#2d7a3a' : '#ffffff',
                        borderColor: selectedSite === item.id ? '#2d7a3a' : '#e5e7eb',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: '600',
                          color: selectedSite === item.id ? '#ffffff' : '#11181c',
                          fontSize: 16,
                        }}
                      >
                        {item.name}
                      </Text>
                      {selectedSite === item.id && (
                        <MaterialIcons name="check-circle" size={24} color="#ffffff" />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>

              {/* Clock In Button */}
              <TouchableOpacity
                onPress={handleClockIn}
                disabled={loading || !selectedSite}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#2d7a3a',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  opacity: loading || !selectedSite ? 0.6 : 1,
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 18 }}>
                  {loading ? 'Clocking In...' : 'Clock In'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
