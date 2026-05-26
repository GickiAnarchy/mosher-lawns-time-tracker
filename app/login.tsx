import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useLocalAuth } from '@/hooks/use-local-auth';
import { getEmployeeByPin, setCurrentEmployee, initializeDefaultData } from '@/lib/local-storage';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { setEmployee } = useLocalAuth();

  useEffect(() => {
    // Initialize default data on first load
    initializeDefaultData().then(() => setInitialized(true));
  }, []);

  const handleLogin = async () => {
    if (!pin.trim()) {
      Alert.alert('Error', 'Please enter your PIN');
      return;
    }

    setLoading(true);
    try {
      const employee = await getEmployeeByPin(pin);
      if (employee) {
        await setCurrentEmployee(employee);
        setEmployee(employee);

        // Route based on role
        if (employee.role === 'supervisor') {
          router.replace('/dashboard');
        } else {
          router.replace('/(employee)');
        }
      } else {
        Alert.alert('Login Failed', 'Invalid PIN. Please try again.');
        setPin('');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!initialized) {
    return (
      <ScreenContainer containerClassName="bg-background items-center justify-center">
        <Text style={{ color: '#687076' }}>Loading...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View style={{ paddingHorizontal: 24, paddingVertical: 32 }}>
            {/* Header */}
            <View style={{ marginBottom: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#11181c', marginBottom: 8 }}>
                Mosher Lawns
              </Text>
              <Text style={{ fontSize: 16, color: '#687076' }}>
                Time Management System
              </Text>
            </View>

            {/* Login Card */}
            <View
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: 16,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#11181c', marginBottom: 8 }}>
                Welcome
              </Text>
              <Text style={{ fontSize: 14, color: '#687076', marginBottom: 24 }}>
                Sign in to your account
              </Text>

              {/* PIN Input */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#11181c', marginBottom: 8 }}>
                  PIN
                </Text>
                <TextInput
                  placeholder="Enter your PIN"
                  placeholderTextColor="#9ba1a6"
                  secureTextEntry
                  keyboardType="numeric"
                  value={pin}
                  onChangeText={setPin}
                  editable={!loading}
                  style={{
                    backgroundColor: '#ffffff',
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: '#11181c',
                  }}
                />
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#2d7a3a',
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 16 }}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Demo Accounts */}
            <View
              style={{
                backgroundColor: '#ffffff',
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 12,
                padding: 16,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#687076', marginBottom: 12 }}>
                DEMO ACCOUNTS
              </Text>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#11181c' }}>Supervisor:</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#2d7a3a' }}>PIN: 1111</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#11181c' }}>Employee (John):</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#2d7a3a' }}>PIN: 1234</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: '#11181c' }}>Employee (Jane):</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#2d7a3a' }}>PIN: 5678</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
