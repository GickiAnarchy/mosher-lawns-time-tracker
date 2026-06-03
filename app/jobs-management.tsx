import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import * as Storage from '@/lib/local-storage';
import { useColors } from '@/hooks/use-colors';

export default function JobsManagementScreen() {
  const router = useRouter();
  const colors = useColors();
  const [jobs, setJobs] = useState<Storage.JobSite[]>([]);
  const [newJobName, setNewJobName] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('');
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editingJobName, setEditingJobName] = useState('');
  const [editingJobLocation, setEditingJobLocation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const jbs = await Storage.getJobSites();
      setJobs(jbs);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async () => {
    if (!newJobName.trim() || !newJobLocation.trim()) {
      Alert.alert('Error', 'Please enter job name and location');
      return;
    }
    const result = await Storage.addJobSite(newJobName, newJobLocation);
    if (result === null) {
      Alert.alert('Error', 'Job site with this name already exists');
    } else {
      setNewJobName('');
      setNewJobLocation('');
      loadData();
      Alert.alert('Success', 'Job added');
    }
  };

  const handleUpdateJob = async (id: string) => {
    if (!editingJobName.trim() || !editingJobLocation.trim()) {
      Alert.alert('Error', 'Please enter job name and location');
      return;
    }
    await Storage.updateJobSite(id, editingJobName, editingJobLocation);
    setEditingJobId(null);
    setEditingJobName('');
    setEditingJobLocation('');
    loadData();
    Alert.alert('Success', 'Job updated');
  };

  const handleDeleteJob = (id: string) => {
    Alert.alert('Delete Job', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          await Storage.deleteJobSite(id);
          loadData();
          Alert.alert('Success', 'Job deleted');
        },
      },
    ]);
  };

  if (loading && jobs.length === 0) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2 mb-2">
            <Pressable
              onPress={() => router.back()}
              style={{ marginBottom: 8 }}
            >
              <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>
                ← Back
              </Text>
            </Pressable>
            <Text className="text-3xl font-bold text-foreground">Manage Job Sites</Text>
            <Text className="text-sm text-muted">Add, edit, or delete job sites</Text>
          </View>

          {/* Add Job Site */}
          <View className="gap-2 p-4 bg-surface rounded-lg border border-border">
            <Text className="text-base font-semibold text-foreground">Add New Job Site</Text>
            <TextInput
              placeholder="Job site name"
              value={newJobName}
              onChangeText={setNewJobName}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 6,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.foreground,
                fontSize: 14,
              }}
              placeholderTextColor={colors.muted}
            />
            <TextInput
              placeholder="Location/Address"
              value={newJobLocation}
              onChangeText={setNewJobLocation}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 6,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.foreground,
                fontSize: 14,
              }}
              placeholderTextColor={colors.muted}
            />
            <Pressable
              onPress={handleAddJob}
              disabled={loading}
              style={{
                backgroundColor: colors.success,
                paddingVertical: 10,
                borderRadius: 6,
                alignItems: 'center',
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text className="text-sm font-semibold text-white">Add Job Site</Text>
            </Pressable>
          </View>

          {/* Job Sites List */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">
              Job Sites ({jobs.length})
            </Text>
            {jobs.length === 0 ? (
              <Text className="text-center text-muted py-8">No job sites yet</Text>
            ) : (
              <FlatList
                data={jobs}
                keyExtractor={j => j.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 6,
                      padding: 12,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    {editingJobId === item.id ? (
                      <View className="gap-2">
                        <TextInput
                          value={editingJobName}
                          onChangeText={setEditingJobName}
                          placeholder="Job name"
                          style={{
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 6,
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            color: colors.foreground,
                            fontSize: 14,
                          }}
                          placeholderTextColor={colors.muted}
                        />
                        <TextInput
                          value={editingJobLocation}
                          onChangeText={setEditingJobLocation}
                          placeholder="Location"
                          style={{
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 6,
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            color: colors.foreground,
                            fontSize: 14,
                          }}
                          placeholderTextColor={colors.muted}
                        />
                        <View className="flex-row gap-2">
                          <Pressable
                            onPress={() => handleUpdateJob(item.id)}
                            style={{
                              flex: 1,
                              backgroundColor: colors.success,
                              paddingVertical: 8,
                              borderRadius: 6,
                              alignItems: 'center',
                            }}
                          >
                            <Text className="text-xs font-semibold text-white">Save</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => setEditingJobId(null)}
                            style={{
                              flex: 1,
                              backgroundColor: colors.border,
                              paddingVertical: 8,
                              borderRadius: 6,
                              alignItems: 'center',
                            }}
                          >
                            <Text className="text-xs font-semibold text-foreground">Cancel</Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <View className="gap-2">
                        <Text className="text-base font-medium text-foreground">{item.name}</Text>
                        <Text className="text-sm text-muted">{item.location}</Text>
                        <View className="flex-row gap-2">
                          <Pressable
                            onPress={() => {
                              setEditingJobId(item.id);
                              setEditingJobName(item.name);
                              setEditingJobLocation(item.location);
                            }}
                            style={{
                              flex: 1,
                              backgroundColor: colors.primary,
                              paddingVertical: 8,
                              borderRadius: 6,
                              alignItems: 'center',
                            }}
                          >
                            <Text className="text-xs font-semibold text-white">Edit</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => handleDeleteJob(item.id)}
                            style={{
                              flex: 1,
                              backgroundColor: colors.error,
                              paddingVertical: 8,
                              borderRadius: 6,
                              alignItems: 'center',
                            }}
                          >
                            <Text className="text-xs font-semibold text-white">Delete</Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
