import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';


const API_URL = 'http://localhost:5001'; // Erstat med din faktiske API URL

interface UserData {
  id?: number; // Tilføjet id, hvis det modtages
  name: string;
  relationToDementiaPerson: string;
}

const Profil = () => {
  const [userData, setUserData] = useState<UserData>({
    name: '',
    relationToDementiaPerson: ''
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        setUserData({
          id: parsedData.id, // Hvis id er gemt
          name: parsedData.name,
          relationToDementiaPerson: parsedData.relationToDementiaPerson
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
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
      alert("Tilladelse til fotobibliotek kræves!");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        uploadProfileImage({ uri: asset.uri, type: 'image/jpeg', fileName: 'photo.jpg' }, userData.id);
      }
    }
  };
  
  // Ændret til at modtage en ekstra parameter "userId" og tilføje den i formData
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
  
    try {
      const response = await fetch(`${API_URL}/upload-profile-image`, {
        method: 'POST',
        body: formData,
      });
  
      const text = await response.text();
      console.log('Response text:', text);
  
      if (!response.ok) {
        console.error('Server responded with an error:', response.status);
        return;
      }
  
      let data;
      try {
        data = JSON.parse(text);
        console.log('Upload success:', data);
        if (data.imageUrl) {
          setProfileImage(data.imageUrl);
        }
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
      }
  
    } catch (error) {
      console.error('Error uploading image:', error);
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
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
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
            <Text style={styles.name}>{userData.name}</Text>
            <Text style={styles.subtitle}>
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
          {['Peter', 'Lena', 'Claus', 'Pia'].map((name, index) => (
            <View key={index} style={styles.familyMember}>
              <View style={styles.familyImageContainer}>
                <Image
                  source={require('../../assets/images/frame_1.png')}
                  style={styles.familyImage}
                />
              </View>
              <Text style={styles.familyName}>{name}</Text>
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

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Indstillinger</Text>

        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="person-outline" size={24} color="#000" />
          <Text style={styles.settingsText}>Personlige information</Text>
          <Ionicons name="chevron-forward" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="key-outline" size={24} color="#000" />
          <Text style={styles.settingsText}>Tilgængelighed</Text>
          <Ionicons name="chevron-forward" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
          <Text style={styles.settingsText}>Notifikationer</Text>
          <Ionicons name="chevron-forward" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.legalSection}>
        <Text style={styles.sectionTitle}>Juridisk</Text>

        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="chatbubble-outline" size={24} color="#000" />
          <Text style={styles.settingsText}>Giv os feedback</Text>
          <Ionicons name="chevron-forward" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="document-text-outline" size={24} color="#000" />
          <Text style={styles.settingsText}>Vilkår og betingelser</Text>
          <Ionicons name="chevron-forward" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton}>
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
  },
  imageContainer: {
    position: 'relative', // Gør det muligt at positionere overlay absolut i forhold til containeren
  },
  uploadOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Halvt gennemsigtig sort baggrund
    width: 30,
    height: 30,
    borderRadius: 15, // Gør det cirkulært
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontFamily: 'RedHatDisplay_700Bold',
    marginBottom: 5,
    color: '#42865F',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'RedHatDisplay_400Regular',
    fontStyle: 'italic',
  },
  linkSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_700Bold',
    marginBottom: 10,
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
  shareButton: {
    padding: 5,
  },
  familySection: {
    padding: 20,
  },
  familyScroll: {
    marginTop: 10,
  },
  familyMember: {
    alignItems: 'center',
    marginRight: 15,
  },
  familyImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
    overflow: 'hidden',
  },
  familyImage: {
    width: '100%',
    height: '100%',
  },
  familyName: {
    fontSize: 14,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  addFamilyButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    color: '#42865F',
    fontFamily: 'RedHatDisplay_500Medium',
  },
  logItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  logTitle: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay_700Bold',
    marginBottom: 5,
  },
  logDate: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'RedHatDisplay_400Regular',
    marginBottom: 10,
  },
  viewLogButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewLogText: {
    color: '#42865F',
    fontFamily: 'RedHatDisplay_500Medium',
  },
  settingsSection: {
    padding: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  settingsText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  legalSection: {
    padding: 20,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'RedHatDisplay_500Medium',
  },
  versionText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    fontFamily: 'RedHatDisplay_400Regular',
    marginVertical: 20,
  },
  uploadButton: {
    backgroundColor: '#42865F',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 15,
  },
  uploadButtonText: {
    color: '#fff',
    fontFamily: 'RedHatDisplay_500Medium',
  },
});

export default Profil;
