import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useLocalAuth } from '@/hooks/use-local-auth';
import { setCurrentEmployee } from '@/lib/local-storage';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { employee, setEmployee } = useLocalAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await setCurrentEmployee(null);
            setEmployee(null);
            router.replace('/login');
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={{ flex: 1, padding: 16 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#11181c' }}>Settings</Text>
        </View>

        {/* Supervisor Info Card */}
        <View
          style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#2d7a3a',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff' }}>
                {employee?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#11181c' }}>
                {employee?.name}
              </Text>
              <Text style={{ fontSize: 14, color: '#687076', marginTop: 4 }}>
                Supervisor
              </Text>
            </View>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#687076' }}>Supervisor ID</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#11181c' }}>
                {employee?.id}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: '#687076' }}>Role</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#11181c' }}>
                Supervisor
              </Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View
          style={{
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: '#e5e7eb',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#687076', marginBottom: 12 }}>
            APP INFORMATION
          </Text>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: '#687076' }}>App Name</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#11181c' }}>
                Mosher Lawns
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: '#687076' }}>Version</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#11181c' }}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={{
            backgroundColor: '#ef4444',
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <MaterialIcons name="logout" size={20} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 16 }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
