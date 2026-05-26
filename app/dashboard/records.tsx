import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { getTimeLogs, getEmployees, getJobSites, deleteTimeLog, TimeLog, Employee, JobSite } from '@/lib/local-storage';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function RecordsScreen() {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<JobSite[]>([]);
  const [filterEmployee, setFilterEmployee] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const logs = await getTimeLogs();
      const emps = await getEmployees();
      const jobSites = await getJobSites();
      setTimeLogs(logs.sort((a, b) => b.clockInTime - a.clockInTime));
      setEmployees(emps.filter(e => e.role === 'employee'));
      setSites(jobSites);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleDelete = (logId: string) => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel' },
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

  const getEmployeeName = (empId: string) => {
    return employees.find(e => e.id === empId)?.name || 'Unknown';
  };

  const getSiteName = (siteId: string) => {
    return sites.find(s => s.id === siteId)?.name || 'Unknown';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  const filteredLogs = filterEmployee
    ? timeLogs.filter(l => l.employeeId === filterEmployee)
    : timeLogs;

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#11181c' }}>Time Records</Text>
          <Text style={{ fontSize: 14, color: '#687076', marginTop: 4 }}>
            {filteredLogs.length} entries
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={{ paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
          <TouchableOpacity
            onPress={() => setFilterEmployee(null)}
            style={{
              backgroundColor: filterEmployee === null ? '#2d7a3a' : '#f5f5f5',
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                color: filterEmployee === null ? '#ffffff' : '#11181c',
                fontWeight: '600',
                fontSize: 14,
              }}
            >
              All Employees
            </Text>
          </TouchableOpacity>
        </View>

        {/* Records List */}
        {filteredLogs.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <MaterialIcons name="history" size={48} color="#ccc" />
            <Text style={{ fontSize: 16, color: '#687076', marginTop: 12 }}>
              No time records
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredLogs}
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
                      {getEmployeeName(item.employeeId)}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#687076', marginTop: 4 }}>
                      {getSiteName(item.jobSiteId)}
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
                    <Text style={{ fontSize: 13, color: '#687076' }}>Date</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#11181c' }}>
                      {formatDate(item.clockInTime)}
                    </Text>
                  </View>
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
