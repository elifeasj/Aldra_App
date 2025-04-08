import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Share, Animated, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_URL } from '../../config';

interface UserData {
  id?: number;
  name: string;
  relationToDementiaPerson: string;
  familyId?: number;
  profile_image?: string;
  avatarUrl?: string;
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
  const [familyMembers, setFamilyMembers] = useState<UserData[]>([]);
  const [userLogs, setUserLogs] = useState<LogData[]>([]);
  const [uniqueCode, setUniqueCode] = useState<string>('');

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleViewLog = (log: LogData) => {
    router.push({ pathname: '/ny-log', params: { date: log.created_at, logId: log.id } });
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
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) return;
      const userData = JSON.parse(userDataString);
      const response = await fetch(`${API_URL}/user-logs/${userData.id}`);
      if (!response.ok) throw new Error('Failed to fetch user logs');
      const data = await response.json();
      setUserLogs(data);
    } catch (error) {
      console.error('Error fetching user logs:', error);
    }
  };

  const loadProfileImage = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        if (parsedData.profile_image && parsedData.id) {
          const response = await fetch(`${API_URL}/user/${parsedData.id}/avatar-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: parsedData.profile_image }),
          });
          const result = await response.json();
          if (result.signedUrl) {
            setUserData(prev => ({ ...prev, avatarUrl: result.signedUrl }));
          }
        }
      }
    } catch (error) {
      console.error('Fejl ved indlæsning af profilbillede:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        console.log('Parsed userData from AsyncStorage:', parsedData);
  
        // Fallback mellem forskellige navne
        const imagePath = parsedData.profile_image || parsedData.profileImage;
  
        const updated = {
          id: parsedData.id,
          name: parsedData.name,
          relationToDementiaPerson: parsedData.relationToDementiaPerson,
          profile_image: imagePath,
          avatarUrl: imagePath,
        };
        
  
        // Midlertidigt sæt
        setUserData(updated);
  
        if (imagePath && parsedData.id) {
          const response = await fetch(`${API_URL}/user/${parsedData.id}/avatar-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: imagePath }),
          });
  
          const result = await response.json();
          if (result.signedUrl) {
            const updatedWithAvatar = { ...updated, avatarUrl: result.signedUrl };
            setUserData(updatedWithAvatar);
            console.log('Updated userData with avatarUrl:', updatedWithAvatar);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };
  
  
  

  const revalidate = useCallback(async () => {
    await loadUserData();        
    await loadProfileImage();     
    getUniqueAldraLink();
    loadFamilyMembers();
    loadUserLogs();
  }, []);
  
  useEffect(() => {
    revalidate();
  }, [revalidate]);
  
  useFocusEffect(
    useCallback(() => {
      revalidate();
    }, [revalidate])
  );
  

  useEffect(() => {
    const checkProfileUpdate = async () => {
      const lastUpdate = await AsyncStorage.getItem('lastProfileUpdate');
      if (lastUpdate) await loadUserData();
    };
    checkProfileUpdate();
  }, []);

  const formatName = (name: string) => {
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const getInitials = (name: string) => {
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 0) return '';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const getUniqueAldraLink = async () => {
    if (userData.id) {
      try {
        const response = await fetch(`${API_URL}/api/family-link/${userData.id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        const data = JSON.parse(text);
        if (data.unique_code) setUniqueCode(`aldra.dk/invite/${data.unique_code}`);
      } catch (error) {
        console.error('Error fetching unique code:', error);
      }
    }
  };

  const formatRelation = (relation: string) => {
    if (!relation) return '';
    if (relation === 'Barn') return 'Datter';
    return relation;
  };

  useEffect(() => {
    getUniqueAldraLink();
  }, [userData.id]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <TouchableOpacity>
          <Ionicons name="moon-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileContainer}>
        <TouchableOpacity onPress={() => router.push('/myprofile')}>
            {userData.avatarUrl ? (
              <Image
                source={{ uri: userData.avatarUrl }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.profileImage,
                  { backgroundColor: 'rgba(255, 255, 255, 0.8)', justifyContent: 'center', alignItems: 'center' }
                ]}
              >
                <Text style={{ color: '#42865F', fontSize: 32, fontFamily: 'RedHatDisplay_700Bold' }}>
                  {getInitials(userData.name)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{formatName(userData.name)}</Text>
            <Text style={styles.profileSubtitle}>
              {formatRelation(userData.relationToDementiaPerson)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Dit personlige Aldra-link</Text>
      </View>
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

      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Familien</Text>
      </View>
      <View style={styles.familySection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.familyScroll}>
          {[...familyMembers, ...Array(6 - familyMembers.length).fill(null)].map((member: UserData | null, index: number) => (

            <View key={member?.id || index} style={styles.familyMemberCard}>
              <View style={[styles.familyImageContainer, !member && styles.emptyFamilyContainer]}>
                {member ? (
                  member.profile_image ? (
                    <Image
                      source={{ uri: member.profile_image }}
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
        <View style={styles.sectionTitleContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Seneste log</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Vis alle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {userLogs.map((log: LogData) => (
          <View key={log.id} style={styles.logItem}>
            <View style={styles.titleRow}>
              <View style={styles.titleAndDescription}>
                <Text style={styles.logTitle} numberOfLines={1}>{log.title}</Text>
                <Text style={styles.dateText} numberOfLines={1}>
                  {`${new Date(log.created_at).getDate()}. ${new Date(log.created_at).toLocaleString('da-DK', { month: 'long' })} ${new Date(log.created_at).getFullYear()}`}
                </Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.viewLogButton} onPress={() => handleViewLog(log)}>
                  <Ionicons name="eye-outline" size={16} color="#ffffff" />
                  <Text style={styles.viewLogText}>Se log</Text>
                </TouchableOpacity>
              </View>
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

      <View style={styles.settingsContainer}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Indstillinger</Text>
        </View>
        <View style={styles.settingsSection}>
        <TouchableOpacity 
          style={styles.settingsItem}
          onPress={() => router.push('../../myprofile')}
        >
          <View style={styles.settingsIcon}>
            <Ionicons name="person-outline" size={24} color="#000" />
          </View>
          <Text style={styles.settingsText}>Personlige oplysninger</Text>
          <Ionicons name="chevron-forward" size={24} color="#707070" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingsItem}
          onPress={() => router.push('../../..')}
        >
          <View style={styles.settingsIcon}>
            <Ionicons name="heart-circle-outline" size={24} color="#000" />
          </View>
          <Text style={styles.settingsText}>Medlemskab</Text>
          <Ionicons name="chevron-forward" size={24} color="#707070" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingsItem}
          onPress={() => router.push('../../..')}
        >
          <View style={styles.settingsIcon}>
            <Ionicons name="tv-outline" size={24} color="#000" />
          </View>
          <Text style={styles.settingsText}>Aldra Display</Text>
          <Ionicons name="chevron-forward" size={24} color="#707070" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingsItem}
          onPress={() => router.push('../../..')}
        >
          <View style={styles.settingsIcon}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </View>
          <Text style={styles.settingsText}>Notifikationer</Text>
          <Ionicons name="chevron-forward" size={24} color="#707070" />
        </TouchableOpacity>
      </View>

      </View>

      <View style={styles.legalContainer}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Juridisk</Text>
        </View>
        <View style={styles.settingsSection}>
        <TouchableOpacity 
          style={styles.settingsItem}
          onPress={() => router.push('../../..')}
        >
          <View style={styles.settingsIcon}>
            <Ionicons name="create-outline" size={24} color="#000" />
          </View>
          <Text style={styles.settingsText}>Giv os feedback</Text>
          <Ionicons name="chevron-forward" size={24} color="#707070" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsIcon}>
              <Ionicons name="document-text-outline" size={24} color="#000" />
            </View>
            <Text style={styles.settingsText}>Vilkår og betingelser</Text>
            <Ionicons name="chevron-forward" size={24} color="#707070" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log ud</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>Version nummer 00.01</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  logItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    marginTop: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleAndDescription: {
    flex: 1,
    marginRight: 14,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  logTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'RedHatDisplay',
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'RedHatDisplay_400Regular',
  },
  viewLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#42865F',
    borderWidth: 1,
    borderColor: '#42865F',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  viewLogText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'RedHatDisplay_700Bold',
  },
  bottomBorder: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginTop: 16,
  },
  logSection: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginBottom: 0,
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
    marginLeft: -16,
    paddingRight: -16,
  },
  viewAllText: {
    color: '#42865F',
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'RedHatDisplay_500Medium',
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
    borderWidth: 3,
    borderColor: '#42865F',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 10,
  },
  settingsSection: {
    backgroundColor: '#fff',
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  sectionTitleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000000',
  },
  settingsContainer: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  legalContainer: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 30,
    marginBottom: 30,
    backgroundColor: '#fff',
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginTop: 16,
  },
  familyScroll: {
    flexGrow: 0,
  },
  familyMemberCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 50,
  },
  familyImageContainer: {
    width: 45,
    height: 45,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 0,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
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
    width: 50,
    height: 50,
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
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 0,
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
    fontSize: 19,
    color: '#333',
    fontFamily: 'RedHatDisplay_400Regular',
  },
  logoutButton: {
    backgroundColor: '#EEEEEE',
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 22,
    paddingLeft: 22,
    borderRadius: 10,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: '#000000',
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    fontWeight: 'medium',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginBottom: 0,
    paddingRight: 20,
  },

  linkSection: {
    backgroundColor: '#42865F',
    marginHorizontal: 16,
    marginBottom: 30,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 16,
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
