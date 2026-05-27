import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import * as Storage from '@/lib/local-storage';
import { useColors } from '@/hooks/use-colors';

export default function DataManagementScreen() {
  const router = useRouter();
  const colors = useColors();
  const [employees, setEmployees] = useState<Storage.Employee[]>([]);
  const [jobs, setJobs] = useState<Storage.JobSite[]>([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newJobName, setNewJobName] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editingEmployeeName, setEditingEmployeeName] = useState('');
  const [editingJobName, setEditingJobName] = useState('');
  const [editingJobLocation, setEditingJobLocation] = useState('');
  const [activeTab, setActiveTab] = useState<'employees' | 'jobs'>('employees');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const emps = await Storage.getEmployees();
      const jbs = await Storage.getJobSites();
      setEmployees(emps);
      setJobs(jbs);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployeeName.trim()) {
      Alert.alert('Error', 'Please enter employee name');
      return;
    }
    const result = await Storage.addEmployee(newEmployeeName);
    if (result === null) {
      Alert.alert('Error', 'Employee with this name already exists');
    } else {
      setNewEmployeeName('');
      loadData();
      Alert.alert('Success', 'Employee added');
    }
  };

  const handleUpdateEmployee = async (id: string) => {
    if (!editingEmployeeName.trim()) {
      Alert.alert('Error', 'Please enter employee name');
      return;
    }
    await Storage.updateEmployee(id, editingEmployeeName);
    setEditingEmployeeId(null);
    setEditingEmployeeName('');
    loadData();
    Alert.alert('Success', 'Employee updated');
  };

  const handleDeleteEmployee = (id: string) => {
    Alert.alert('Delete Employee', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          await Storage.deleteEmployee(id);
          loadData();
          Alert.alert('Success', 'Employee deleted');
        },
      },
    ]);
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

  if (loading && employees.length === 0 && jobs.length === 0) {
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
            <Text className="text-3xl font-bold text-foreground">Data Management</Text>
            <Text className="text-sm text-muted">Add, edit, or delete employees and job sites</Text>
          </View>

          {/* Tab Buttons */}
          <View className="flex-row gap-2 mb-2">
            <Pressable
              onPress={() => setActiveTab('employees')}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: activeTab === 'employees' ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  color: activeTab === 'employees' ? 'white' : colors.foreground,
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                Employees
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('jobs')}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: activeTab === 'jobs' ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  color: activeTab === 'jobs' ? 'white' : colors.foreground,
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                Job Sites
              </Text>
            </Pressable>
          </View>

          {/* Employees Tab */}
          {activeTab === 'employees' && (
            <View className="gap-4">
              {/* Add Employee */}
              <View className="gap-2 p-4 bg-surface rounded-lg border border-border">
                <Text className="text-base font-semibold text-foreground">Add Employee</Text>
                <TextInput
                  placeholder="Employee name"
                  value={newEmployeeName}
                  onChangeText={setNewEmployeeName}
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
                  onPress={handleAddEmployee}
                  disabled={loading}
                  style={{
                    backgroundColor: colors.success,
                    paddingVertical: 10,
                    borderRadius: 6,
                    alignItems: 'center',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  <Text className="text-sm font-semibold text-white">Add Employee</Text>
                </Pressable>
              </View>

              {/* Employee List */}
              <View className="gap-2">
                <Text className="text-base font-semibold text-foreground">
                  Employees ({employees.length})
                </Text>
                <FlatList
                  data={employees}
                  keyExtractor={e => e.id}
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
                      {editingEmployeeId === item.id ? (
                        <View className="gap-2">
                          <TextInput
                            value={editingEmployeeName}
                            onChangeText={setEditingEmployeeName}
                            style={{
                              borderWidth: 1,
                              borderColor: colors.border,
                              borderRadius: 6,
                              paddingHorizontal: 10,
                              paddingVertical: 8,
                              color: colors.foreground,
                              fontSize: 14,
                            }}
                          />
                          <View className="flex-row gap-2">
                            <Pressable
                              onPress={() => handleUpdateEmployee(item.id)}
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
                              onPress={() => setEditingEmployeeId(null)}
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
                          <View className="flex-row gap-2">
                            <Pressable
                              onPress={() => {
                                setEditingEmployeeId(item.id);
                                setEditingEmployeeName(item.name);
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
                              onPress={() => handleDeleteEmployee(item.id)}
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
              </View>
            </View>
          )}

          {/* Job Sites Tab */}
          {activeTab === 'jobs' && (
            <View className="gap-4">
              {/* Add Job Site */}
              <View className="gap-2 p-4 bg-surface rounded-lg border border-border">
                <Text className="text-base font-semibold text-foreground">Add Job Site</Text>
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
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
