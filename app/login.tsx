import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useLocalAuth } from '@/hooks/use-local-auth';
import { router } from 'expo-router';
import { initializeDefaultData } from '@/lib/local-storage';

export default function LoginScreen() {
  const { login, loading: authLoading } = useLocalAuth();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpName, setSignUpName] = useState('');
  const [signUpPin, setSignUpPin] = useState('');
  const [initialized, setInitialized] = useState(false);

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
    const success = await login(pin);
    setLoading(false);

    if (success) {
      router.replace('/(protected)/(tabs)');
    } else {
      Alert.alert('Login Failed', 'Invalid PIN. Please try again.');
      setPin('');
    }
  };

  const handleSignUp = async () => {
    if (!signUpName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!signUpPin.trim() || signUpPin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits');
      return;
    }

    // Import here to avoid circular dependency
    const { addEmployee, setCurrentEmployee } = await import('@/lib/local-storage');
    
    const newEmployee = {
      id: Date.now().toString(),
      name: signUpName,
      pin: signUpPin,
    };

    try {
      setLoading(true);
      await addEmployee(newEmployee);
      await setCurrentEmployee(newEmployee);
      router.replace('/(protected)/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (!initialized || authLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Loading...</Text>
      </ScreenContainer>
    );
  }

  if (showSignUp) {
    return (
      <ScreenContainer className="p-6">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <View className="flex-1 justify-center gap-6">
              {/* Header */}
              <View className="items-center gap-2">
                <Text className="text-4xl font-bold text-foreground">Create Account</Text>
                <Text className="text-base text-muted text-center">Set up your employee account</Text>
              </View>

              {/* Form */}
              <View className="gap-4">
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">Full Name</Text>
                  <TextInput
                    placeholder="Enter your name"
                    value={signUpName}
                    onChangeText={setSignUpName}
                    placeholderTextColor="#999"
                    editable={!loading}
                    className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">PIN (4+ digits)</Text>
                  <TextInput
                    placeholder="Enter a PIN"
                    value={signUpPin}
                    onChangeText={setSignUpPin}
                    secureTextEntry
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                    editable={!loading}
                    className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSignUp}
                  disabled={loading}
                  className="bg-primary rounded-lg py-3 mt-4"
                  style={{ opacity: loading ? 0.6 : 1 }}
                >
                  <Text className="text-center text-white font-semibold text-base">
                    {loading ? 'Creating...' : 'Create Account'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowSignUp(false)} disabled={loading}>
                  <Text className="text-center text-primary font-semibold">Back to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-center gap-6">
            {/* Header */}
            <View className="items-center gap-2">
              <Text className="text-4xl font-bold text-foreground">Mosher Lawns</Text>
              <Text className="text-lg text-muted">Time Tracker</Text>
            </View>

            {/* Login Card */}
            <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
              <View>
                <Text className="text-xl font-bold text-foreground mb-2">Welcome</Text>
                <Text className="text-sm text-muted">Sign in to track your time</Text>
              </View>

              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">PIN</Text>
                <TextInput
                  placeholder="Enter your PIN"
                  value={pin}
                  onChangeText={setPin}
                  secureTextEntry
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                  editable={!loading}
                  className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
                />
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className="bg-primary rounded-lg py-3 mt-2"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                <Text className="text-center text-white font-semibold text-base">
                  {loading ? 'Signing in...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowSignUp(true)} disabled={loading}>
                <Text className="text-center text-primary font-semibold">Create New Account</Text>
              </TouchableOpacity>
            </View>

            {/* Demo Info */}
            <View className="bg-background rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-semibold mb-2">DEMO ACCOUNT</Text>
              <Text className="text-sm text-muted">PIN: 1234</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
