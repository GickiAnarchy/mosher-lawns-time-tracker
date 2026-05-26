import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useLocalAuth } from '@/hooks/use-local-auth';
import { getEmployeeTimeLogs, getJobSites, deleteTimeLog, TimeLog, JobSite } from '@/lib/local-storage';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function EmployeeLogsScreen() {
  const { employee } = useLocalAuth();
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    if (!employee) return;
    try {
      const logs = await getEmployeeTimeLogs(employee.id);
      const sites = await getJobSites();
      setJobSites(sites);
      setTimeLogs(logs.sort((a, b) => b.clockInTime - a.clockInTime));
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const handleDelete = (logId: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this time entry?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deleteTimeLog(logId);
            setTimeLogs(timeLogs.filter(l => l.id !== logId));
            Alert.alert('Success', 'Entry deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete entry');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const getSiteName = (siteId: string) => {
    return jobSites.find(s => s.id === siteId)?.name || 'Unknown';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDuration = (clockIn: number, clockOut: number | null) => {
    if (!clockOut) return 'Active';
    const duration = Math.floor((clockOut - clockIn) / (1000 * 60));
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#11181c' }}>My Time Logs</Text>
          <Text style={{ fontSize: 14, color: '#687076', marginTop: 4 }}>
            {timeLogs.length} entries
          </Text>
        </View>

        {/* Logs List */}
        {timeLogs.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <MaterialIcons name="history" size={48} color="#ccc" />
            <Text style={{ fontSize: 16, color: '#687076', marginTop: 12 }}>
              No time logs yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={timeLogs}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 12 }}
            renderItem={({ item }) => (
              <View
                style={{
                  backgroundColor: '#ffffff',
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#11181c' }}>
                      {getSiteName(item.jobSiteId)}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#687076', marginTop: 4 }}>
                      {formatDate(item.clockInTime)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <MaterialIcons name="delete" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: 8,
                    padding: 12,
                    gap: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 13, color: '#687076' }}>Clock In</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#11181c' }}>
                      {formatTime(item.clockInTime)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 13, color: '#687076' }}>Clock Out</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#11181c' }}>
                      {item.clockOutTime ? formatTime(item.clockOutTime) : 'Still clocked in'}
                    </Text>
                  </View>
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: '#e5e7eb',
                      paddingTop: 8,
                      marginTop: 8,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ fontSize: 13, color: '#687076', fontWeight: '600' }}>Duration</Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: '#2d7a3a',
                      }}
                    >
                      {calculateDuration(item.clockInTime, item.clockOutTime)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}
