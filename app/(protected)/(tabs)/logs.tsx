import { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Alert, FlatList } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useLocalAuth } from '@/hooks/use-local-auth';
import { getEmployeeTimeLogs, getJobSites, deleteTimeLog, TimeLog, JobSite } from '@/lib/local-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

type FilterType = 'today' | 'week' | 'month' | 'all';

export default function LogsScreen() {
  const { employee } = useLocalAuth();
  const [filter, setFilter] = useState<FilterType>('today');
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [employee, filter])
  );

  const loadData = async () => {
    if (!employee) return;
    setLoading(true);
    try {
      const allLogs = await getEmployeeTimeLogs(employee.id);
      const sites = await getJobSites();
      setJobSites(sites);

      // Filter logs based on selected date range
      const now = new Date();
      const filteredLogs = allLogs.filter(log => {
        const logDate = new Date(log.clockInTime);
        
        switch (filter) {
          case 'today': {
            return logDate.toDateString() === now.toDateString();
          }
          case 'week': {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return logDate >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return logDate >= monthAgo;
          }
          case 'all':
          default:
            return true;
        }
      });

      // Sort by most recent first
      filteredLogs.sort((a, b) => b.clockInTime - a.clockInTime);
      setLogs(filteredLogs);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (logId: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this time entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTimeLog(logId);
            setLogs(logs.filter(l => l.id !== logId));
            Alert.alert('Success', 'Time entry deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete time entry');
          }
        },
      },
    ]);
  };

  const handleEdit = (log: TimeLog) => {
    router.push({
      pathname: '/(protected)/edit-log',
      params: { logId: log.id },
    });
  };

  const getJobSiteName = (siteId: string) => {
    return jobSites.find(s => s.id === siteId)?.name || 'Unknown Site';
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDuration = (log: TimeLog) => {
    if (!log.clockOutTime) return 'In Progress';
    const duration = Math.floor((log.clockOutTime - log.clockInTime) / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const renderLogItem = ({ item }: { item: TimeLog }) => (
    <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">{getJobSiteName(item.jobSiteId)}</Text>
          <Text className="text-xs text-muted mt-1">{formatDate(item.clockInTime)}</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            className="bg-primary rounded px-3 py-1"
          >
            <Text className="text-white text-xs font-semibold">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            className="bg-error rounded px-3 py-1"
          >
            <Text className="text-white text-xs font-semibold">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-xs text-muted">Clock In</Text>
          <Text className="text-sm font-semibold text-foreground">{formatTime(item.clockInTime)}</Text>
        </View>
        <Text className="text-xs text-muted">→</Text>
        <View>
          <Text className="text-xs text-muted">Clock Out</Text>
          <Text className="text-sm font-semibold text-foreground">
            {item.clockOutTime ? formatTime(item.clockOutTime) : 'In Progress'}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-muted">Duration</Text>
          <Text className="text-sm font-semibold text-primary">{getDuration(item)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Time Logs</Text>
            <Text className="text-sm text-muted mt-1">{logs.length} entries</Text>
          </View>

          {/* Filter Buttons */}
          <View className="flex-row gap-2">
            {(['today', 'week', 'month', 'all'] as FilterType[]).map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg ${
                  filter === f ? 'bg-primary' : 'bg-surface border border-border'
                }`}
              >
                <Text
                  className={`text-xs font-semibold capitalize ${
                    filter === f ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logs List */}
          {loading ? (
            <Text className="text-center text-muted py-8">Loading...</Text>
          ) : logs.length === 0 ? (
            <View className="bg-surface rounded-lg p-6 border border-border items-center">
              <Text className="text-muted text-center">No time entries for this period</Text>
            </View>
          ) : (
            <FlatList
              data={logs}
              keyExtractor={item => item.id}
              renderItem={renderLogItem}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
