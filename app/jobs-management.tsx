import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, FlatList, TextInput, Alert, ActivityIndicator, Linking } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import * as Storage from '@/lib/local-storage';
import { useColors } from '@/hooks/use-colors';
import * as Location from 'expo-location';

export default function JobsManagementScreen() {
  const router = useRouter();
  const colors = useColors();
  const [jobs, setJobs] = useState<Storage.JobSite[]>([]);
  const [newJobName, setNewJobName] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('');
  const [newJobCoords, setNewJobCoords] = useState<{lat: number, lon: number} | null>(null);
  
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editingJobName, setEditingJobName] = useState('');
  const [editingJobLocation, setEditingJobLocation] = useState('');
  const [editingJobCoords, setEditingJobCoords] = useState<{lat: number, lon: number} | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

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

  const getCurrentLocation = async (isEditing: boolean) => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      };

      if (isEditing) {
        setEditingJobCoords(coords);
      } else {
        setNewJobCoords(coords);
      }
      Alert.alert('Success', 'Current GPS location attached');
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleAddJob = async () => {
    if (!newJobName.trim() || !newJobLocation.trim()) {
      Alert.alert('Error', 'Please enter job name and location');
      return;
    }
    const result = await Storage.addJobSite(
      newJobName, 
      newJobLocation, 
      newJobCoords?.lat, 
      newJobCoords?.lon
    );
    if (result === null) {
      Alert.alert('Error', 'Job site with this name already exists');
    } else {
      setNewJobName('');
      setNewJobLocation('');
      setNewJobCoords(null);
      loadData();
      Alert.alert('Success', 'Job added');
    }
  };

  const handleUpdateJob = async (id: string) => {
    if (!editingJobName.trim() || !editingJobLocation.trim()) {
      Alert.alert('Error', 'Please enter job name and location');
      return;
    }
    await Storage.updateJobSite(
      id, 
      editingJobName, 
      editingJobLocation, 
      editingJobCoords?.lat, 
      editingJobCoords?.lon
    );
    setEditingJobId(null);
    setEditingJobName('');
    setEditingJobLocation('');
    setEditingJobCoords(null);
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

  const openInMaps = (lat: number, lon: number, label: string) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lon}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    
    if (url) {
      Linking.openURL(url);
    }
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
        <View style={{ gap: 24 }}>
          {/* Header */}
          <View style={{ gap: 8 }}>
            <Pressable onPress={() => router.back()} style={{ marginBottom: 8 }}>
              <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>
                ← Back
              </Text>
            </Pressable>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.foreground }}>
              Manage Job Sites
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted }}>
              Add, edit, or delete job sites with GPS
            </Text>
          </View>

          {/* Add Job Section */}
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
              Add New Job Site
            </Text>
            <TextInput
              placeholder="Job site name"
              value={newJobName}
              onChangeText={setNewJobName}
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
            <TextInput
              placeholder="Location / Address"
              value={newJobLocation}
              onChangeText={setNewJobLocation}
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
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pressable
                onPress={() => getCurrentLocation(false)}
                disabled={locationLoading}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  opacity: locationLoading ? 0.6 : 1,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                  {locationLoading ? 'Getting Location...' : 'Get Current GPS'}
                </Text>
              </Pressable>
              {newJobCoords && (
                <Text style={{ fontSize: 12, color: colors.success, fontWeight: '600' }}>
                  ✓ GPS Attached
                </Text>
              )}
            </View>

            <Pressable
              onPress={handleAddJob}
              disabled={loading}
              style={{
                backgroundColor: colors.success,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                opacity: loading ? 0.6 : 1,
                marginTop: 4,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                Add Job Site
              </Text>
            </Pressable>
          </View>

          {/* Jobs List Section */}
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                Job Sites ({jobs.length})
              </Text>
            </View>

            {jobs.length === 0 ? (
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
                <Text style={{ color: colors.muted, fontSize: 14 }}>No job sites yet</Text>
              </View>
            ) : (
              <FlatList
                data={jobs}
                keyExtractor={j => j.id}
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
                    {editingJobId === item.id ? (
                      <View style={{ gap: 12 }}>
                        <TextInput
                          value={editingJobName}
                          onChangeText={setEditingJobName}
                          placeholder="Job site name"
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
                        <TextInput
                          value={editingJobLocation}
                          onChangeText={setEditingJobLocation}
                          placeholder="Location / Address"
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
                        
                        <Pressable
                          onPress={() => getCurrentLocation(true)}
                          disabled={locationLoading}
                          style={{
                            backgroundColor: colors.primary,
                            paddingVertical: 10,
                            borderRadius: 8,
                            alignItems: 'center',
                            opacity: locationLoading ? 0.6 : 1,
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                            {locationLoading ? 'Getting Location...' : 'Update GPS to Current'}
                          </Text>
                        </Pressable>

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Pressable
                            onPress={() => handleUpdateJob(item.id)}
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
                            onPress={() => {
                              setEditingJobId(null);
                              setEditingJobCoords(null);
                            }}
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
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.foreground }}>
                              {item.name}
                            </Text>
                            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                              {item.location}
                            </Text>
                            {item.latitude && item.longitude && (
                              <Pressable 
                                onPress={() => openInMaps(item.latitude!, item.longitude!, item.name)}
                                style={{ marginTop: 8 }}
                              >
                                <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>
                                  📍 View on Map ({item.latitude.toFixed(4)}, {item.longitude.toFixed(4)})
                                </Text>
                              </Pressable>
                            )}
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Pressable
                            onPress={() => {
                              setEditingJobId(item.id);
                              setEditingJobName(item.name);
                              setEditingJobLocation(item.location);
                              if (item.latitude && item.longitude) {
                                setEditingJobCoords({ lat: item.latitude, lon: item.longitude });
                              }
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
                            onPress={() => handleDeleteJob(item.id)}
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
