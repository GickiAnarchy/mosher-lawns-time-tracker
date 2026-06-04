import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import * as Storage from '@/lib/local-storage';
import { useColors } from '@/hooks/use-colors';

export default function EmployeesManagementScreen() {
  const router = useRouter();
  const colors = useColors();
  const [employees, setEmployees] = useState<Storage.Employee[]>([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [editingEmployeeName, setEditingEmployeeName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const emps = await Storage.getEmployees();
      setEmployees(emps);
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
            <Pressable onPress={() => router.back()} style={{ marginBottom: 8 }}>
              <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>
                ← Back
              </Text>
            </Pressable>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.foreground }}>
              Manage Employees
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted }}>
              Add, edit, or delete employees
            </Text>
          </View>

          {/* Add Employee Section */}
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
              Add New Employee
            </Text>
            <TextInput
              placeholder="Employee name"
              value={newEmployeeName}
              onChangeText={setNewEmployeeName}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
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
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                Add Employee
              </Text>
            </Pressable>
          </View>

          {/* Employees List Section */}
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                Employees ({employees.length})
              </Text>
            </View>

            {employees.length === 0 ? (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 32,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.muted, fontSize: 14 }}>No employees yet</Text>
              </View>
            ) : (
              <FlatList
                data={employees}
                keyExtractor={e => e.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      gap: 12,
                    }}
                  >
                    {editingEmployeeId === item.id ? (
                      <View style={{ gap: 12 }}>
                        <TextInput
                          value={editingEmployeeName}
                          onChangeText={setEditingEmployeeName}
                          placeholder="Employee name"
                          style={{
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            color: colors.foreground,
                            fontSize: 14,
                          }}
                          placeholderTextColor={colors.muted}
                        />
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Pressable
                            onPress={() => handleUpdateEmployee(item.id)}
                            style={{
                              flex: 1,
                              backgroundColor: colors.success,
                              paddingVertical: 10,
                              borderRadius: 8,
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                              Save
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => setEditingEmployeeId(null)}
                            style={{
                              flex: 1,
                              backgroundColor: colors.border,
                              paddingVertical: 10,
                              borderRadius: 8,
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.foreground }}>
                              Cancel
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <View style={{ gap: 12 }}>
                        <Text style={{ fontSize: 16, fontWeight: '500', color: colors.foreground }}>
                          {item.name}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Pressable
                            onPress={() => {
                              setEditingEmployeeId(item.id);
                              setEditingEmployeeName(item.name);
                            }}
                            style={{
                              flex: 1,
                              backgroundColor: colors.primary,
                              paddingVertical: 10,
                              borderRadius: 8,
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                              Edit
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => handleDeleteEmployee(item.id)}
                            style={{
                              flex: 1,
                              backgroundColor: colors.error,
                              paddingVertical: 10,
                              borderRadius: 8,
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                              Delete
                            </Text>
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
