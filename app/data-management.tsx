import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, FlatList, TextInput, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import * as Storage from '@/lib/local-storage';

export default function DataManagementScreen() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Storage.Employee[]>([]);
  const [jobs, setJobs] = useState<Storage.JobSite[]>([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newJobName, setNewJobName] = useState('');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editingEmployeeName, setEditingEmployeeName] = useState('');
  const [editingJobName, setEditingJobName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const emps = await Storage.getEmployees();
    const jbs = await Storage.getJobSites();
    setEmployees(emps);
    setJobs(jbs);
  };

  const handleAddEmployee = async () => {
    if (!newEmployeeName.trim()) {
      Alert.alert('Error', 'Please enter employee name');
      return;
    }
    await Storage.addEmployee(newEmployeeName);
    setNewEmployeeName('');
    loadData();
    Alert.alert('Success', 'Employee added');
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
    if (!newJobName.trim()) {
      Alert.alert('Error', 'Please enter job name');
      return;
    }
    await Storage.addJobSite(newJobName);
    setNewJobName('');
    loadData();
    Alert.alert('Success', 'Job added');
  };

  const handleUpdateJob = async (id: string) => {
    if (!editingJobName.trim()) {
      Alert.alert('Error', 'Please enter job name');
      return;
    }
    await Storage.updateJobSite(id, editingJobName);
    setEditingJobId(null);
    setEditingJobName('');
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

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-foreground">Data Management</Text>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Text className="text-primary font-semibold">Back</Text>
            </Pressable>
          </View>

          {/* Employees Section */}
          <View>
            <Text className="text-xl font-bold text-foreground mb-3">Employees</Text>

            {/* Add Employee */}
            <View className="gap-2 mb-4">
              <TextInput
                placeholder="New employee name"
                value={newEmployeeName}
                onChangeText={setNewEmployeeName}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                }}
              />
              <Pressable
                onPress={handleAddEmployee}
                style={({ pressed }) => [
                  {
                    padding: 12,
                    backgroundColor: '#4CAF50',
                    borderRadius: 8,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-center text-white font-semibold">Add Employee</Text>
              </Pressable>
            </View>

            {/* Employee List */}
            <FlatList
              data={employees}
              keyExtractor={e => e.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  {editingEmployeeId === item.id ? (
                    <View className="gap-2">
                      <TextInput
                        value={editingEmployeeName}
                        onChangeText={setEditingEmployeeName}
                        style={{
                          borderWidth: 1,
                          borderColor: '#ccc',
                          borderRadius: 6,
                          padding: 10,
                        }}
                      />
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => handleUpdateEmployee(item.id)}
                          style={({ pressed }) => [
                            {
                              flex: 1,
                              padding: 10,
                              backgroundColor: '#4CAF50',
                              borderRadius: 6,
                              opacity: pressed ? 0.8 : 1,
                            },
                          ]}
                        >
                          <Text className="text-center text-white font-semibold text-sm">Save</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setEditingEmployeeId(null)}
                          style={({ pressed }) => [
                            {
                              flex: 1,
                              padding: 10,
                              backgroundColor: '#999',
                              borderRadius: 6,
                              opacity: pressed ? 0.8 : 1,
                            },
                          ]}
                        >
                          <Text className="text-center text-white font-semibold text-sm">Cancel</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View>
                      <Text className="text-foreground font-semibold mb-2">{item.name}</Text>
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => {
                            setEditingEmployeeId(item.id);
                            setEditingEmployeeName(item.name);
                          }}
                          style={({ pressed }) => [
                            {
                              flex: 1,
                              padding: 10,
                              backgroundColor: '#2196F3',
                              borderRadius: 6,
                              opacity: pressed ? 0.8 : 1,
                            },
                          ]}
                        >
                          <Text className="text-center text-white font-semibold text-sm">Edit</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleDeleteEmployee(item.id)}
                          style={({ pressed }) => [
                            {
                              flex: 1,
                              padding: 10,
                              backgroundColor: '#f44336',
                              borderRadius: 6,
                              opacity: pressed ? 0.8 : 1,
                            },
                          ]}
                        >
                          <Text className="text-center text-white font-semibold text-sm">Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              )}
            />
          </View>

          {/* Jobs Section */}
          <View>
            <Text className="text-xl font-bold text-foreground mb-3">Job Sites</Text>

            {/* Add Job */}
            <View className="gap-2 mb-4">
              <TextInput
                placeholder="New job name"
                value={newJobName}
                onChangeText={setNewJobName}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                }}
              />
              <Pressable
                onPress={handleAddJob}
                style={({ pressed }) => [
                  {
                    padding: 12,
                    backgroundColor: '#4CAF50',
                    borderRadius: 8,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-center text-white font-semibold">Add Job</Text>
              </Pressable>
            </View>

            {/* Job List */}
            <FlatList
              data={jobs}
              keyExtractor={j => j.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  {editingJobId === item.id ? (
                    <View className="gap-2">
                      <TextInput
                        value={editingJobName}
                        onChangeText={setEditingJobName}
                        style={{
                          borderWidth: 1,
                          borderColor: '#ccc',
                          borderRadius: 6,
                          padding: 10,
                        }}
                      />
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => handleUpdateJob(item.id)}
                          style={({ pressed }) => [
                            {
                              flex: 1,
                              padding: 10,
                              backgroundColor: '#4CAF50',
                              borderRadius: 6,
                              opacity: pressed ? 0.8 : 1,
                            },
                          ]}
                        >
                          <Text className="text-center text-white font-semibold text-sm">Save</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setEditingJobId(null)}
                          style={({ pressed }) => [
                            {
                              flex: 1,
                              padding: 10,
                              backgroundColor: '#999',
                              borderRadius: 6,
                              opacity: pressed ? 0.8 : 1,
                            },
                          ]}
                        >
                          <Text className="text-center text-white font-semibold text-sm">Cancel</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View>
                      <Text className="text-foreground font-semibold mb-2">{item.name}</Text>
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => {
                            setEditingJobId(item.id);
                            setEditingJobName(item.name);
                          }}
                          style={({ pressed }) => [
                            {
                              flex: 1,
                              padding: 10,
                              backgroundColor: '#2196F3',
                              borderRadius: 6,
                              opacity: pressed ? 0.8 : 1,
                            },
                          ]}
                        >
                          <Text className="text-center text-white font-semibold text-sm">Edit</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleDeleteJob(item.id)}
                          style={({ pressed }) => [
                            {
                              flex: 1,
                              padding: 10,
                              backgroundColor: '#f44336',
                              borderRadius: 6,
                              opacity: pressed ? 0.8 : 1,
                            },
                          ]}
                        >
                          <Text className="text-center text-white font-semibold text-sm">Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              )}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
