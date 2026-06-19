import { useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/use-colors';
import * as Storage from '@/lib/local-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function DataManagementScreen() {
  const router = useRouter();
  const colors = useColors();
  const [exporting, setExporting] = useState(false);

  const handleExportData = async () => {
    try {
      setExporting(true);
      
      const logs = await Storage.getTimeLogs();
      const employees = await Storage.getEmployees();
      const jobs = await Storage.getJobSites();

      const empMap = new Map(employees.map(e => [e.id, e.name]));
      const jobMap = new Map(jobs.map(j => [j.id, j.name]));

      // Create CSV content
      let csvContent = 'ID,Employee,Job Site,Clock In,Clock Out,Duration (minutes)\n';
      
      logs.forEach(log => {
        const empName = empMap.get(log.employeeId) || 'Unknown';
        const jobName = jobMap.get(log.jobSiteId) || 'Unknown';
        const clockIn = new Date(log.clockInTime).toLocaleString();
        const clockOut = log.clockOutTime ? new Date(log.clockOutTime).toLocaleString() : 'In Progress';
        const duration = log.clockOutTime ? Math.floor((log.clockOutTime - log.clockInTime) / 60000) : '';
        
        csvContent += `"${log.id}","${empName}","${jobName}","${clockIn}","${clockOut}","${duration}"\n`;
      });

      // Save to a temporary file
      const fileName = `mosher_lawns_logs_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = FileSystem.cacheDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Time Logs',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <View style={{ flex: 1, justifyContent: 'center', gap: 20 }}>
        {/* Header */}
        <View style={{ gap: 8, alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.foreground }}>
            Data Management
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, textAlign: 'center' }}>
            Manage app data and export records
          </Text>
        </View>

        {/* Manage Employees Button */}
        <Pressable
          onPress={() => router.push('/employees-management')}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>
            Manage Employees
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
            Add, edit, or delete employees
          </Text>
        </Pressable>

        {/* Manage Jobs Button */}
        <Pressable
          onPress={() => router.push('/jobs-management')}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>
            Manage Job Sites
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
            Add, edit, or delete job sites with GPS
          </Text>
        </Pressable>

        {/* Export Data Button */}
        <Pressable
          onPress={handleExportData}
          disabled={exporting}
          style={{
            backgroundColor: colors.success,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            gap: 4,
            opacity: exporting ? 0.7 : 1,
          }}
        >
          {exporting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>
                Export Time Logs (CSV)
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                Save or share all time records
              </Text>
            </>
          )}
        </Pressable>

        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          style={{
            backgroundColor: colors.surface,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
            Back
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
