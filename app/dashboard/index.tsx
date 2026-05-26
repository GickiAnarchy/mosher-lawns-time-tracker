import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useFocusEffect } from '@react-navigation/native';
import { getEmployees, getTimeLogs, getJobSites } from '@/lib/local-storage';
import { MaterialIcons } from '@expo/vector-icons';

interface ActiveClock {
  employeeId: string;
  employeeName: string;
  jobSiteId: string;
  siteName: string;
  clockInTime: number;
}

export default function DashboardScreen() {
  const [activeClocks, setActiveClocks] = useState<ActiveClock[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalSites, setTotalSites] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const employees = await getEmployees();
      const timeLogs = await getTimeLogs();
      const sites = await getJobSites();

      setTotalEmployees(employees.filter(e => e.role === 'employee').length);
      setTotalSites(sites.length);

      // Find active clocks
      const activeLogs = timeLogs.filter(log => log.clockOutTime === null);
      const active: ActiveClock[] = [];

      for (const log of activeLogs) {
        const employee = employees.find(e => e.id === log.employeeId);
        const site = sites.find(s => s.id === log.jobSiteId);
        if (employee && site) {
          active.push({
            employeeId: log.employeeId,
            employeeName: employee.name,
            jobSiteId: log.jobSiteId,
            siteName: site.name,
            clockInTime: log.clockInTime,
          });
        }
      }

      setActiveClocks(active);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
      const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={{ padding: 16, gap: 16 }}>
          {/* Header */}
          <View>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#11181c' }}>Dashboard</Text>
            <Text style={{ fontSize: 14, color: '#687076', marginTop: 4 }}>
              Real-time overview of your team
            </Text>
          </View>

          {/* Stats Cards */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#2d7a3a',
                borderRadius: 12,
                padding: 16,
              }}
            >
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#ffffff' }}>
                {activeClocks.length}
              </Text>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                Currently Clocked In
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: '#f5f5f5',
                borderRadius: 12,
                padding: 16,
              }}
            >
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#11181c' }}>
                {totalEmployees}
              </Text>
              <Text style={{ fontSize: 14, color: '#687076', marginTop: 4 }}>
                Total Employees
              </Text>
            </View>
          </View>

          {/* Active Clocks Section */}
          <View>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#11181c', marginBottom: 12 }}>
              Active Clocks
            </Text>

            {activeClocks.length === 0 ? (
              <View
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 12,
                  padding: 24,
                  alignItems: 'center',
                }}
              >
                <MaterialIcons name="check-circle" size={48} color="#2d7a3a" />
                <Text style={{ fontSize: 16, color: '#687076', marginTop: 12 }}>
                  No active clocks
                </Text>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {activeClocks.map(clock => (
                  <View
                    key={`${clock.employeeId}-${clock.clockInTime}`}
                    style={{
                      backgroundColor: '#ffffff',
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      borderRadius: 12,
                      padding: 16,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#11181c' }}>
                        {clock.employeeName}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#687076', marginTop: 4 }}>
                        {clock.siteName}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <View
                        style={{
                          backgroundColor: '#2d7a3a',
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          marginBottom: 4,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}>
                          {formatTime(clock.clockInTime)}
                        </Text>
                      </View>
                      <MaterialIcons name="access-time" size={16} color="#2d7a3a" />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Quick Stats */}
          <View
            style={{
              backgroundColor: '#f5f5f5',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#11181c', marginBottom: 12 }}>
              Quick Stats
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: '#687076' }}>Total Job Sites</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#11181c' }}>
                  {totalSites}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: '#687076' }}>Employees on Duty</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#11181c' }}>
                  {activeClocks.length} / {totalEmployees}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
