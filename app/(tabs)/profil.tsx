import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { API_URL } from '../../config';

interface UserData {
  id?: number; // Tilføjet id, hvis det modtages
  name: string;
  relationToDementiaPerson: string;
  familyId?: number;
  profileImage?: string;
}

interface LogData {
  id: number;
  title: string;
  description: string;
  date: string;
  created_at: string;
}

const Profil = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({
    name: '',
    relationToDementiaPerson: ''
  });

  const handleLogout = async () => {
    try {
      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem('userData');
      // Redirect to index.js
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<UserData[]>([]);
  const [userLogs, setUserLogs] = useState<LogData[]>([]);

  const handleViewLog = (log: LogData) => {
    router.push({
      pathname: '/ny-log',
      params: { 
        date: log.created_at,
        logId: log.id
      }
    });
  };

  const loadFamilyMembers = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) return;

      const userData = JSON.parse(userDataString);
      const response = await fetch(`${API_URL}/users/family/${userData.id}`);
      if (!response.ok) throw new Error('Failed to fetch family members');

      const data = await response.json();
      setFamilyMembers(data);
    } catch (error) {
      console.error('Error fetching family members:', error);
    }
  };

  const loadUserLogs = async () => {
    try {
      console.log('Loading user logs...');
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        console.log('No user data found');
        return;
      }

      const userData = JSON.parse(userDataString);
      console.log('User ID:', userData.id);
      
      const response = await fetch(`${API_URL}/user-logs/${userData.id}`);
      if (!response.ok) {
        console.error('Failed to fetch logs:', response.status);
        throw new Error('Failed to fetch user logs');
      }

      const data = await response.json();
      console.log('Fetched logs:', data);
      setUserLogs(data);
    } catch (error) {
      console.error('Error fetching user logs:', error);
    }
  };

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          if (parsedData.profileImage) {
            setProfileImage(parsedData.profileImage);
          }
        }
      } catch (error) {
        console.error('Fejl ved indlæsning af profilbillede:', error);
      }
    };
    
    loadProfileImage();
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      await loadUserData();
      await loadFamilyMembers();
      await loadUserLogs();
    };
    initializeData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        console.log('Loaded user data:', parsedData); // Log hele brugerdata
        setUserData({
          id: parsedData.id, // Hvis id er gemt
          name: parsedData.name,
          relationToDementiaPerson: parsedData.relationToDementiaPerson
        });
        console.log('User ID:', parsedData.id); // Log userId for debugging
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Funktion til at formatere navn med stort første bogstav
  const formatName = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Funktion til at beregne initialer ud fra brugerens navn
  const getInitials = (name: string) => {
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 0) return '';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const [uniqueCode, setUniqueCode] = useState<string>('');

  // Funktion til at hente eller oprette et unikt Aldra-link
  const getUniqueAldraLink = async () => {
    if (userData.id) {
      try {
        const response = await fetch(`${API_URL}/api/family-link/${userData.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          if (data.unique_code) {
            setUniqueCode(`aldra.dk/invite/${data.unique_code}`);
          }
        } catch (parseError) {
          console.error('Error parsing response:', text, parseError);
        }
      } catch (error) {
        console.error('Error fetching unique code:', error);
      }
    }
  };

  useEffect(() => {
    getUniqueAldraLink();
  }, [userData.id]);

  const formatRelation = (relation: string) => {
    if (relation === 'Barn') {
      return 'Datter';
    }
    return relation;
  };

  // Expo ImagePicker-version af billedvælgelse
  const pickImage = async () => {
    // Anmod om tilladelse til at få adgang til fotobiblioteket
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Tilladelse krævet", "Tilladelse til fotobibliotek kræves!");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Brug en streng i stedet for MediaType
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    // Tjek for aflysning ved at bruge den nye egenskab "canceled"
    if (!result.canceled) {
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setProfileImage(asset.uri);
        // Send også brugerens id med, hvis det findes
        console.log('User ID before upload:', userData.id); // Log userId for debugging
        uploadProfileImage({ uri: asset.uri, type: 'image/jpeg', fileName: 'photo.jpg' }, userData.id);
      }
    }
  };
  
  const uploadProfileImage = async (
    asset: { uri?: string; type?: string; fileName?: string },
    userId?: number
  ) => {
    if (!asset.uri) {
      console.error('Ingen uri modtaget for billede');
      return;
    }
  
    const formData = new FormData();
    formData.append(
      'profileImage',
      {
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || 'photo.jpg',
      } as any
    );
  
    if (userId) {
      formData.append('userId', String(userId));
    }
  
    console.log('Uploader billede for bruger:', userId);
  
    try {
      const response = await fetch(`${API_URL}/upload-profile-image`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });
  
      const text = await response.text();
      console.log('Server svar:', text);
  
      if (!response.ok) {
        Alert.alert('Fejl', 'Der skete en fejl under upload af billedet');
        console.error('Server fejl:', response.status);
        return;
      }
  
      let data;
      try {
        data = JSON.parse(text);
        console.log('Upload success:', data);
        if (data.imageUrl) {
          // Opdater brugerdata i AsyncStorage med nyt profilbillede
          const storedUserData = await AsyncStorage.getItem('userData');
          if (storedUserData) {
            const parsedData = JSON.parse(storedUserData);
            const updatedUserData = {
              ...parsedData,
              profileImage: data.imageUrl
            };
            await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
          }
          
          setProfileImage(data.imageUrl);
        }
      } catch (jsonError) {
        console.error('Fejl ved parsing af JSON:', jsonError);
        Alert.alert('Fejl', 'Der skete en fejl ved behandling af server-svaret');
      }
  
    } catch (error) {
      console.error('Fejl ved upload:', error);
      Alert.alert('Fejl', 'Kunne ikke uploade billedet. Tjek din internetforbindelse.');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <TouchableOpacity>
          <Ionicons name="moon-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileContainer}>
          <View style={styles.imageContainer}>
            {profileImage ? (
              <Image 
                source={{ uri: profileImage }} 
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.profileImage,
                  { backgroundColor: '#42865F', justifyContent: 'center', alignItems: 'center' }
                ]}
              >
                <Text style={{ color: '#fff', fontSize: 32, fontFamily: 'RedHatDisplay_700Bold' }}>
                  {getInitials(userData.name)}
                </Text>
              </View>
            )}
            {/* Overlay med plus-ikon placeret i bunden af billedet */}
            <TouchableOpacity style={styles.uploadOverlay} onPress={pickImage}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{formatName(userData.name)}</Text>
            <Text style={styles.profileSubtitle}>
              {formatRelation(userData.relationToDementiaPerson)} til person med demens
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Dit personlige Aldra-link</Text>
      <View style={styles.linkSection}>
        <View style={styles.linkSectionContent}>
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>{uniqueCode || 'Indlæser...'}</Text>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={async () => {
                await Clipboard.setStringAsync(uniqueCode);
                Alert.alert('Kopieret', 'Linket er kopieret til udklipsholderen', [
                  { text: 'OK', onPress: () => console.log('Link copied') }
                ]);
              }}
            >
              <Text style={styles.copyButtonText}>Kopiér</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={async () => {
              try {
                await Share.share({
                  message: uniqueCode,
                  url: `https://${uniqueCode}`,
                });
              } catch (error) {
                console.error('Error sharing:', error);
              }
            }}
          >
            <Text style={styles.shareButtonText}>Del</Text>
            <Ionicons name="paper-plane-outline" size={16} color="#42865F" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Familien</Text>
      <View style={styles.familySection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.familyScroll}>
          {[...familyMembers, ...Array(4 - familyMembers.length).fill(null)].map((member: UserData | null, index: number) => (

            <View key={member?.id || index} style={styles.familyMemberCard}>
              <View style={[styles.familyImageContainer, !member && styles.emptyFamilyContainer]}>
                {member ? (
                  member.profileImage ? (
                    <Image
                      source={{ uri: member.profileImage }}
                      style={styles.familyImage}
                    />
                  ) : (
                    <View style={[styles.familyImage, styles.initialsContainer]}>
                      <Text style={styles.initials}>
                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                      </Text>
                    </View>
                  )
                ) : (
                  <View style={styles.emptyFamilyIcon}>
                    <Ionicons name="person-add-outline" size={24} color="#42865F" />
                  </View>
                )}
              </View>
              <Text style={[styles.familyName, !member && styles.emptyFamilyName]}>{member ? member.name.split(' ')[0] : 'Tilføj'}</Text>
            </View>
          ))}

        </ScrollView>
      </View>

      <View style={styles.logSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Seneste log</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>Vis alle</Text>
          </TouchableOpacity>
        </View>

        {userLogs.map((log: LogData) => (
          <View key={log.id} style={styles.logItem}>
            <View style={styles.titleRow}>
              <View style={styles.titleAndDescription}>
                <Text style={styles.logTitle} numberOfLines={1}>{log.title}</Text>
                <Text style={styles.timeText} numberOfLines={1}>
                  {`${new Date(log.created_at).getDate()}. ${new Date(log.created_at).toLocaleString('da-DK', { month: 'long' })} ${new Date(log.created_at).getFullYear()}`}
                </Text>
              </View>
              <TouchableOpacity style={styles.viewLogButton} onPress={() => handleViewLog(log)}>
                <Ionicons name="eye-outline" size={16} color="#42865F" />
                <Text style={styles.viewLogText}>Se log</Text>
              </TouchableOpacity>
            </View>
                      </View>
        ))}

        {userLogs.length === 0 && (
          <Text style={styles.noLogsText}>Ingen logs at vise</Text>
        )}
      </View>

      {/* Familie sektion */}
      <View style={styles.section}>
        {familyMembers.length > 0 && (
          <View style={styles.familyList}>
            <Text style={styles.subtitle}>Familiemedlemmer:</Text>
            {familyMembers.map((member: UserData, index: number) => (
              <View key={index} style={styles.familyListItem}>
                <Text style={styles.familyListName}>{member.name}</Text>
                <Text style={styles.familyListRelation}>{member.relationToDementiaPerson}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>Indstillinger</Text>
        <TouchableOpacity style={styles.settingsItem}>
          <View style={styles.settingsIcon}>
            <Ionicons name="person-outline" size={24} color="#000" />
          </View>
          <Text style={styles.settingsText}>Personlige information</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <View style={styles.settingsIcon}>
            <Ionicons name="settings-outline" size={24} color="#000" />
          </View>
          <Text style={styles.settingsText}>Tilgængelighed</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <View style={styles.settingsIcon}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </View>
          <Text style={styles.settingsText}>Notifikationer</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Juridisk</Text>
      <View style={styles.settingsSection}>
        <TouchableOpacity style={styles.settingsItem}>
          <View style={styles.settingsIcon}>
            <Ionicons name="create-outline" size={24} color="#000" />
          </View>
          <Text style={styles.settingsText}>Giv os feedback</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <View style={styles.settingsIcon}>
            <Ionicons name="document-text-outline" size={24} color="#000" />
          </View>
          <Text style={styles.settingsText}>Vilkår og betingelser</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log ud</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Version nummer 00.01</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  logItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleAndDescription: {
    flex: 1,
    marginRight: 16,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  viewLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#42865F',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  viewLogText: {
    color: '#42865F',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomBorder: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginTop: 16,
  },
  logSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  logDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginLeft: -20,
    paddingRight: -20,
  },
  viewAllText: {
    color: '#42865F',
    fontSize: 14,
    fontWeight: '500',
  },
  noLogsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logUserName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  userLogs: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '100%',
  },
  logEntry: {
    marginBottom: 4,
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  logEntryTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  logEntryDate: {
    fontSize: 10,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 90,
    paddingBottom: 20,
  },
  title: {
    fontSize: 36,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#42865F',
  },
  profileSection: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileInfo: {
    marginLeft: 15,
  },
  profileImage: {
    width: 95,
    height: 95,
    borderRadius: 55,
    borderWidth: 5,
    borderColor: '#42865F',
    backgroundColor: '#f0f0f0',
  },
  imageContainer: {
    position: 'relative',
  },
  uploadOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontFamily: 'RedHatDisplay_700Bold',
    marginBottom: 5,
    color: '#42865F',
  },
  profileSubtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'RedHatDisplay_400Regular',
    fontStyle: 'italic',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'RedHatDisplay_500Medium',
    marginBottom: 15,
    marginHorizontal: 20,
    color: '#000000',
  },
  button: {
    backgroundColor: '#42865F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  familySection: {
    marginBottom: 30,
    marginHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',

  },
  familyScroll: {
    flexGrow: 0,
  },
  familyMemberCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  familyImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 0,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#42865F',
  },
  emptyFamilyContainer: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFamilyIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFamilyName: {
    marginTop: 5,
    color: '#42865F',
    fontFamily: 'RedHatDisplay_500Medium',
  },
  familyImage: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    backgroundColor: '#42865F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  familyName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  addFamilyButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  familyList: {
    marginTop: 0,
  },
  familyListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  familyListName: {
    fontSize: 16,
    color: '#333',
  },
  familyListRelation: {
    fontSize: 14,
    color: '#666',
  },
  settingsSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    paddingVertical: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingsIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'RedHatDisplay_400Regular',
  },
  logoutButton: {
    backgroundColor: '#EEEEEE',
    padding: 16,
    borderRadius: 10,
    marginTop: 32,
    marginHorizontal: 20,
    marginBottom: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'medium',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 20,
  },

  linkSection: {
    backgroundColor: '#42865F',
    marginHorizontal: 16,
    marginBottom: 30,
    borderRadius: 12,
    padding: 18,
  },
  linkSectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  linkContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 0,
    marginBottom: 0,
  },
  linkText: {
    flex: 1,
    fontFamily: 'RedHatDisplay_500Medium',
    fontSize: 16,
    color: '#ffffff',
  },
  copyButton: {
    paddingHorizontal: 1,
    paddingVertical: 0,
    marginRight: 0,
  },
  copyButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'RedHatDisplay_500Medium',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
  },
  legalSection: {
    marginTop: 20,
    paddingHorizontal: 0,
  },
  shareButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#42865F',
    fontSize: 16,
    fontFamily: 'RedHatDisplay_500Medium',
    marginRight: 0,
    paddingLeft: 4,
    paddingRight: 4,
    paddingVertical: 8,
  },
});

export default Profil;
