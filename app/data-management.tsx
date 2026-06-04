import { View, Text, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/use-colors';

export default function DataManagementScreen() {
  const router = useRouter();
  const colors = useColors();

  return (
    <ScreenContainer className="p-4">
      <View style={{ flex: 1, justifyContent: 'center', gap: 24 }}>
        {/* Header */}
        <View style={{ gap: 8, alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.foreground }}>
            Data Management
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, textAlign: 'center' }}>
            Select what you want to manage
          </Text>
        </View>

        {/* Manage Employees Button */}
        <Pressable
          onPress={() => router.push('/employees-management')}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 20,
            borderRadius: 12,
            alignItems: 'center',
            gap: 8,
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
            backgroundColor: colors.success,
            paddingVertical: 20,
            borderRadius: 12,
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>
            Manage Job Sites
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
            Add, edit, or delete job sites
          </Text>
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
