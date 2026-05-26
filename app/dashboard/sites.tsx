import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { getJobSites, addJobSite, deleteJobSite, JobSite } from '@/lib/local-storage';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function SitesScreen() {
  const [sites, setSites] = useState<JobSite[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadSites();
    }, [])
  );

  const loadSites = async () => {
    try {
      const data = await getJobSites();
      setSites(data);
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  };

  const handleAddSite = async () => {
    if (!newSiteName.trim()) {
      Alert.alert('Error', 'Please enter site name');
      return;
    }

    try {
      const newSite: JobSite = {
        id: Date.now().toString(),
        name: newSiteName,
      };
      await addJobSite(newSite);
      setSites([...sites, newSite]);
      setNewSiteName('');
      setShowAddModal(false);
      Alert.alert('Success', 'Job site added');
    } catch (error) {
      Alert.alert('Error', 'Failed to add job site');
    }
  };

  const handleDeleteSite = (siteId: string) => {
    Alert.alert('Delete Job Site', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deleteJobSite(siteId);
            setSites(sites.filter(s => s.id !== siteId));
            Alert.alert('Success', 'Job site deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete job site');
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
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#11181c' }}>Job Sites</Text>
            <Text style={{ fontSize: 14, color: '#687076', marginTop: 4 }}>
              {sites.length} sites
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

        {/* Sites List */}
        {sites.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <MaterialIcons name="location-on" size={48} color="#ccc" />
            <Text style={{ fontSize: 16, color: '#687076', marginTop: 12 }}>
              No job sites yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={sites}
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
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#2d7a3a',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <MaterialIcons name="location-on" size={20} color="#ffffff" />
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#11181c' }}>
                    {item.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteSite(item.id)}
                  style={{ padding: 8 }}
                >
                  <MaterialIcons name="delete" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* Add Site Modal */}
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
                  Add Job Site
                </Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <MaterialIcons name="close" size={24} color="#11181c" />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 16 }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#11181c', marginBottom: 8 }}>
                    Site Name
                  </Text>
                  <TextInput
                    placeholder="Enter site name"
                    value={newSiteName}
                    onChangeText={setNewSiteName}
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
                  onPress={handleAddSite}
                  style={{
                    backgroundColor: '#2d7a3a',
                    borderRadius: 8,
                    paddingVertical: 12,
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 16 }}>
                    Add Site
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
