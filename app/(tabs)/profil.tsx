import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

const API_URL = 'http://192.168.0.215:5001'; // Server API URL

interface UserData {
  id?: number; // Tilføjet id, hvis det modtages
  name: string;
  relationToDementiaPerson: string;
  familyId?: number;
  profileImage?: string;
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
  const [familyLink, setFamilyLink] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<UserData[]>([]);

  // Indlæs profilbillede når brugerdata indlæses
  const generateFamilyLink = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) return;

      const userData = JSON.parse(userDataString);
      const response = await fetch(`${API_URL}/family-link/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userData.id }),
      });

      if (!response.ok) throw new Error('Failed to generate family link');

      const data = await response.json();
      setFamilyLink(data.shareLink);
      Alert.alert('Link genereret', 'Del dette link med dine familiemedlemmer for at invitere dem til Aldra.');
    } catch (error) {
      console.error('Error generating family link:', error);
      Alert.alert('Fejl', 'Der opstod en fejl ved generering af familie-link');
    }
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
    loadUserData();
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

  // Funktion til at generere et unikt Aldra-link
  const getUniqueAldraLink = () => {
    if (userData.id) {
      return `aldra.dk/link/${userData.id}`;
    }
    return `aldra.dk/link/${userData.name.replace(/\s/g, '').toLowerCase() || 'default'}`;
  };

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

      <View style={styles.linkSection}>
        <Text style={styles.sectionTitle}>Dit personlige Aldra-link</Text>
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>{getUniqueAldraLink()}</Text>
          <TouchableOpacity style={styles.copyButton}>
            <Text style={styles.copyButtonText}>Kopiér</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.familySection}>
        <Text style={styles.sectionTitle}>Familien</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.familyScroll}>
          {familyMembers.map((member: UserData, index: number) => (
            <View key={member.id || index} style={styles.familyMemberCard}>
              <View style={styles.familyImageContainer}>
                {member.profileImage ? (
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
                )}
              </View>
              <Text style={styles.familyName}>{member.name.split(' ')[0]}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.addFamilyButton}>
            <Ionicons name="add" size={24} color="#42865F" />
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.logSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Seneste log</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>Vis alle</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logItem}>
          <Text style={styles.logTitle}>Besøg mor</Text>
          <Text style={styles.logDate}>22. november 2024</Text>
          <TouchableOpacity style={styles.viewLogButton}>
            <Text style={styles.viewLogText}>Se log</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logItem}>
          <Text style={styles.logTitle}>Snak med overlæge</Text>
          <Text style={styles.logDate}>29. november 2024</Text>
          <TouchableOpacity style={styles.viewLogButton}>
            <Text style={styles.viewLogText}>Se log</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Familie sektion */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Familie</Text>
        <TouchableOpacity style={styles.button} onPress={generateFamilyLink}>
          <Text style={styles.buttonText}>Generer familie-link</Text>
        </TouchableOpacity>

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

      <Text style={styles.sectionTitle}>Indstillinger</Text>
      <View style={styles.settingsSection}>
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
    fontFamily: 'RedHatDisplay_700Bold',
    marginBottom: 15,
    marginHorizontal: 16,
    color: '#42865F',
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
    padding: 20,
  },
  familyScroll: {
    flexGrow: 0,
  },
  familyMemberCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  familyImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
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
    marginTop: 15,
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
    marginHorizontal: 16,
    paddingVertical: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
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
    backgroundColor: '#42865F',
    padding: 16,
    borderRadius: 10,
    marginTop: 32,
    marginHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 20,
  },

  linkSection: {
    padding: 20,
  },

  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  linkText: {
    flex: 1,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  copyButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  copyButtonText: {
    color: '#42865F',
    fontFamily: 'RedHatDisplay_500Medium',
  },
  logSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewAllText: {
    color: '#42865F',
    fontSize: 14,
  },
  logItem: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  logDate: {
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
  },
  viewLogButton: {
    backgroundColor: '#42865F',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  viewLogText: {
    color: '#fff',
    fontSize: 14,
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
    padding: 5,
  },
});

export default Profil;
