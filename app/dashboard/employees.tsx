import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee, Employee } from '@/lib/local-storage';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadEmployees();
    }, [])
  );

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data.filter(e => e.role === 'employee'));
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleAddEmployee = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter employee name');
      return;
    }
    if (!newPin.trim() || newPin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits');
      return;
    }

    try {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        name: newName,
        pin: newPin,
        role: 'employee',
      };
      await addEmployee(newEmployee);
      setEmployees([...employees, newEmployee]);
      setNewName('');
      setNewPin('');
      setShowAddModal(false);
      Alert.alert('Success', 'Employee added');
    } catch (error) {
      Alert.alert('Error', 'Failed to add employee');
    }
  };

  const handleDeleteEmployee = (employeeId: string) => {
    Alert.alert('Delete Employee', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deleteEmployee(employeeId);
            setEmployees(employees.filter(e => e.id !== employeeId));
            Alert.alert('Success', 'Employee deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete employee');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#11181c' }}>Employees</Text>
            <Text style={{ fontSize: 14, color: '#687076', marginTop: 4 }}>
              {employees.length} employees
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={{
              backgroundColor: '#2d7a3a',
              borderRadius: 8,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Employees List */}
        {employees.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <MaterialIcons name="people" size={48} color="#ccc" />
            <Text style={{ fontSize: 16, color: '#687076', marginTop: 12 }}>
              No employees yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={employees}
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
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#11181c' }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#687076', marginTop: 4 }}>
                    PIN: {item.pin}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteEmployee(item.id)}
                  style={{ padding: 8 }}
                >
                  <MaterialIcons name="delete" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* Add Employee Modal */}
        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View
              style={{
                backgroundColor: '#ffffff',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
                paddingBottom: 40,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: '600', color: '#11181c' }}>
                  Add Employee
                </Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <MaterialIcons name="close" size={24} color="#11181c" />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 16 }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#11181c', marginBottom: 8 }}>
                    Employee Name
                  </Text>
                  <TextInput
                    placeholder="Enter name"
                    value={newName}
                    onChangeText={setNewName}
                    style={{
                      backgroundColor: '#f5f5f5',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      fontSize: 16,
                      color: '#11181c',
                    }}
                  />
                </View>

                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#11181c', marginBottom: 8 }}>
                    PIN (4+ digits)
                  </Text>
                  <TextInput
                    placeholder="Enter PIN"
                    value={newPin}
                    onChangeText={setNewPin}
                    keyboardType="numeric"
                    secureTextEntry
                    style={{
                      backgroundColor: '#f5f5f5',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      fontSize: 16,
                      color: '#11181c',
                    }}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleAddEmployee}
                  style={{
                    backgroundColor: '#2d7a3a',
                    borderRadius: 8,
                    paddingVertical: 12,
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 16 }}>
                    Add Employee
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
}
