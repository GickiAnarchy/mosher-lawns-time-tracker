import { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { getTimeLogs, updateTimeLog, getJobSites, TimeLog, JobSite } from '@/lib/local-storage';

export default function EditLogScreen() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  const [log, setLog] = useState<TimeLog | null>(null);
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [logId]);

  const loadData = async () => {
    if (!logId) return;
    try {
      const logs = await getTimeLogs();
      const currentLog = logs.find(l => l.id === logId);
      if (currentLog) {
        setLog(currentLog);
        setClockInTime(formatDateTimeForInput(currentLog.clockInTime));
        if (currentLog.clockOutTime) {
          setClockOutTime(formatDateTimeForInput(currentLog.clockOutTime));
        }
        setSelectedSiteId(currentLog.jobSiteId);
      }

      const sites = await getJobSites();
      setJobSites(sites);
    } catch (error) {
      Alert.alert('Error', 'Failed to load time entry');
      router.back();
    }
  };

  const formatDateTimeForInput = (timestamp: number) => {
    return new Date(timestamp).toISOString().slice(0, 16);
  };

  const parseDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).getTime();
  };

  const handleSave = async () => {
    if (!log || !clockInTime || !selectedSiteId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const clockInMs = parseDateTime(clockInTime);
    const clockOutMs = clockOutTime ? parseDateTime(clockOutTime) : null;

    if (clockOutMs && clockOutMs <= clockInMs) {
      Alert.alert('Error', 'Clock out time must be after clock in time');
      return;
    }

    setLoading(true);
    try {
      await updateTimeLog(log.id, {
        clockInTime: clockInMs,
        clockOutTime: clockOutMs,
        jobSiteId: selectedSiteId,
      });
      Alert.alert('Success', 'Time entry updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update time entry');
    } finally {
      setLoading(false);
    }
  };

  if (!log) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Loading...</Text>
      </ScreenContainer>
    );
  }

  const getJobSiteName = (siteId: string) => {
    return jobSites.find(s => s.id === siteId)?.name || 'Unknown';
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-6">
          {/* Header */}
          <View>
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Text className="text-primary font-semibold">← Back</Text>
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Edit Time Entry</Text>
          </View>

          {/* Form */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
            {/* Job Site */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-3">Job Site</Text>
              {jobSites.map(site => (
                <TouchableOpacity
                  key={site.id}
                  onPress={() => setSelectedSiteId(site.id)}
                  className={`p-3 rounded-lg mb-2 border ${
                    selectedSiteId === site.id
                      ? 'bg-primary border-primary'
                      : 'bg-background border-border'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      selectedSiteId === site.id ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {site.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Clock In Time */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Clock In Time</Text>
              <TextInput
                value={clockInTime}
                onChangeText={setClockInTime}
                placeholder="YYYY-MM-DDTHH:mm"
                className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
              />
            </View>

            {/* Clock Out Time */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Clock Out Time (Optional)</Text>
              <TextInput
                value={clockOutTime}
                onChangeText={setClockOutTime}
                placeholder="YYYY-MM-DDTHH:mm"
                className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              className="bg-primary rounded-lg py-3 mt-4"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <Text className="text-center text-white font-semibold">
                {loading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
