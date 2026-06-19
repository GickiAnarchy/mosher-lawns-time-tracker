import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, FlatList, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import * as Storage from '@/lib/local-storage';
import { useColors } from '@/hooks/use-colors';

export default function ClockInOutScreen() {
  const router = useRouter();
  const colors = useColors();
  const [employees, setEmployees] = useState<Storage.Employee[]>([]);
  const [jobSites, setJobSites] = useState<Storage.JobSite[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [selectedJobSite, setSelectedJobSite] = useState<string | null>(null);
  const [activeLogs, setActiveLogs] = useState<Map<string, Storage.TimeLog>>(new Map());
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const emps = await Storage.getEmployees();
      const jobs = await Storage.getJobSites();
      const logs = await Storage.getTimeLogs();

      setEmployees(emps);
      setJobSites(jobs);

      // Find active logs (no clock out time)
      const active = new Map<string, Storage.TimeLog>();
      logs.forEach(log => {
        if (!log.clockOutTime) {
          active.set(log.employeeId, log);
        }
      });
      setActiveLogs(active);
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleClockIn = async () => {
    if (selectedEmployees.size === 0) {
      Alert.alert('Error', 'Please select at least one employee');
      return;
    }
    if (!selectedJobSite) {
      Alert.alert('Error', 'Please select a job site');
      return;
    }

    try {
      setLoading(true);
      for (const empId of selectedEmployees) {
        await Storage.addTimeLog(empId, selectedJobSite);
      }
      setSelectedEmployees(new Set());
      setSelectedJobSite(null);
      loadData();
      Alert.alert('Success', `${selectedEmployees.size} employee(s) clocked in`);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async (logId: string) => {
    try {
      setLoading(true);
      await Storage.clockOutTimeLog(logId);
      loadData();
      Alert.alert('Success', 'Employee clocked out');
    } finally {
      setLoading(false);
    }
  };

  if (loading && employees.length === 0) {
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
              Clock In/Out
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted }}>
              Select employees and job site
            </Text>
          </View>

          {/* Active Clocks Section */}
          {activeLogs.size > 0 && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                Active Clocks
              </Text>
              <FlatList
                data={Array.from(activeLogs.values())}
                keyExtractor={log => log.id}
                scrollEnabled={false}
                renderItem={({ item }) => {
                  const emp = employees.find(e => e.id === item.employeeId);
                  const job = jobSites.find(j => j.id === item.jobSiteId);
                  const elapsed = Math.floor((Date.now() - item.clockInTime) / 60000);
                  const hours = Math.floor(elapsed / 60);
                  const mins = elapsed % 60;

                  return (
                    <View
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 8,
                        borderLeftWidth: 4,
                        borderLeftColor: colors.success,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
                          {emp?.name || 'Unknown'}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.muted }}>
                          {job?.name || 'Unknown'} • {hours}h {mins}m
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleClockOut(item.id)}
                        style={{
                          backgroundColor: colors.error,
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                          Clock Out
                        </Text>
                      </Pressable>
                    </View>
                  );
                }}
              />
            </View>
          )}

          {/* Select Employees Section */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
              Select Employees ({selectedEmployees.size})
            </Text>
            {employees.length === 0 ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ color: colors.muted, fontSize: 14 }}>No employees available</Text>
              </View>
            ) : (
              <FlatList
                data={employees}
                keyExtractor={e => e.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => toggleEmployeeSelection(item.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      marginBottom: 8,
                      backgroundColor: selectedEmployees.has(item.id)
                        ? colors.primary
                        : colors.background,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: selectedEmployees.has(item.id)
                        ? colors.primary
                        : colors.border,
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: selectedEmployees.has(item.id)
                          ? 'white'
                          : colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                        backgroundColor: selectedEmployees.has(item.id)
                          ? colors.primary
                          : 'transparent',
                      }}
                    >
                      {selectedEmployees.has(item.id) && (
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>✓</Text>
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: selectedEmployees.has(item.id)
                          ? 'white'
                          : colors.foreground,
                      }}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                )}
              />
            )}
          </View>

          {/* Select Job Site Section */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
              Select Job Site
            </Text>
            {jobSites.length === 0 ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ color: colors.muted, fontSize: 14 }}>No job sites available</Text>
              </View>
            ) : (
              <FlatList
                data={jobSites}
                keyExtractor={j => j.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => setSelectedJobSite(item.id)}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      marginBottom: 8,
                      backgroundColor: selectedJobSite === item.id
                        ? colors.primary
                        : colors.background,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: selectedJobSite === item.id
                        ? colors.primary
                        : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: selectedJobSite === item.id
                          ? 'white'
                          : colors.foreground,
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: selectedJobSite === item.id
                          ? 'rgba(255,255,255,0.8)'
                          : colors.muted,
                        marginTop: 4,
                      }}
                    >
                      {item.location}
                    </Text>
                  </Pressable>
                )}
              />
            )}
          </View>

          {/* Clock In Button */}
          <Pressable
            onPress={handleClockIn}
            disabled={loading || selectedEmployees.size === 0 || !selectedJobSite}
            style={{
              backgroundColor:
                selectedEmployees.size > 0 && selectedJobSite
                  ? colors.success
                  : colors.border,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color:
                  selectedEmployees.size > 0 && selectedJobSite
                    ? 'white'
                    : colors.muted,
              }}
            >
              {loading ? 'Clocking In...' : 'Clock In'}
            </Text>
          </Pressable>

          {/* Management Link */}
          <View style={{ marginTop: 8 }}>
            <Pressable
              onPress={() => router.push('/data-management')}
              style={{
                backgroundColor: colors.surface,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                ⚙️ Admin & Data Management
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
