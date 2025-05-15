import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL } from '../config';
import Toast from '../components/Toast';

interface UserProfileData {
  name: string;
  email: string;
  password?: string;
  birthday: string;
  profile_image?: string;
  relationToDementiaPerson?: string;
  token?: string;
  id?: number;
  avatarUrl?: string;
}


const parseBirthdayToDate = (dateString: string): Date => {
  if (!dateString) return new Date();

  // Hvis ISO-format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  // Hvis DD-MM-YYYY (vores gemte format)
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return new Date(dateString); // fallback
};

const formatDanishDate = (date: Date) => {
  const danishMonths = [
    'januar', 'februar', 'marts', 'april', 'maj', 'juni',
    'juli', 'august', 'september', 'oktober', 'november', 'december'
  ];
  const day = String(date.getDate()).padStart(2, '0');
  const month = danishMonths[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};


const parseDanishDateString = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
};

const EditProfile = () => {
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [userData, setUserData] = useState<UserProfileData>({
    name: '',
    email: '',
    password: '',
    birthday: '',
    profile_image: '',
    relationToDementiaPerson: '',

  });

// 1. Hent brugerdata, når siden loader
  useEffect(() => {
    loadUserData();
  }, []);

// 2. Når fødselsdatoen er sat (fra AsyncStorage), opdater selectedDate
  useEffect(() => {
    if (userData.birthday) {
      const parsed = parseBirthdayToDate(userData.birthday);
      setSelectedDate(parsed);
    }
  }, [userData.birthday]);


  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (!storedUserData) return;
  
      const parsedData = JSON.parse(storedUserData);
      const imagePath = parsedData.profile_image || parsedData.profileImage; // sikrer begge versioner
  
      let signedUrl = '';
      if (imagePath && parsedData.id) {
        console.log('Sending imagePath to backend:', imagePath);
  
        const response = await fetch(`${API_URL}/user/${parsedData.id}/avatar-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: imagePath }),
        });
  
        const result = await response.json();
        signedUrl = result.signedUrl;
        console.log('Signed URL fetched:', signedUrl);
      }
  
      setUserData({
        name: parsedData.name || '',
        email: parsedData.email || '',
        password: '',
        birthday: parsedData.birthday || '',
        avatarUrl: signedUrl || '',
        relationToDementiaPerson: parsedData.relationToDementiaPerson || '',
        token: parsedData.token,
        id: parsedData.id
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Tilladelse nødvendig', 'Vi skal bruge din tilladelse for at vælge et billede.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Fejl', 'Der opstod en fejl ved valg af billede.');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setIsUploading(true);
      const storedUserData = await AsyncStorage.getItem('userData');
      if (!storedUserData) throw new Error('No user data found');
  
      const parsedData = JSON.parse(storedUserData);
      const userId = parsedData.id;
  
      const manipulatedImage = await manipulateAsync(
        uri,
        [{ resize: { width: 500 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );
  
      const formData = new FormData();
      formData.append('image', {
        uri: manipulatedImage.uri,
        type: 'image/jpeg',
        name: `user_${userId}_${Date.now()}.jpg`,
      });
      formData.append('userId', userId.toString());
  
      const response = await fetch(`${API_URL}/upload-avatar`, {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
      if (!response.ok || !result.path) throw new Error('Upload failed');
      
      console.log('Image uploaded successfully:', result.path); // Log the uploaded path
  
      const signedUrlRes = await fetch(`${API_URL}/user/${userId}/avatar-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: result.path }),
      });
  
      const signedUrlJson = await signedUrlRes.json();
      const signedUrl = signedUrlJson.signedUrl;
  
      console.log('Signed URL fetched:', signedUrl); // Log the signed URL
  
      const updatedUserData = {
        ...parsedData,
        birthday: parsedData.birthday,     // gem fødselsdato
        profile_image: result.path,         // gem kun stien!
        avatarUrl: signedUrl,              // brug denne til visning i UI
      };
  
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
  
      setToast({ type: 'success', message: 'Dit profilbillede er nu opdateret' });
      
      setTimeout(() => {
        setToast(null);
      }, 4000);
  
    } catch (error) {
      console.error('Error uploading image:', error);
      setToast({ type: 'error', message: 'Kunne ikke uploade billede' });
      setTimeout(() => {
        setToast(null);
      }, 5000);
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      contentContainerStyle={{ flex: 1 }}
      keyboardVerticalOffset={-200}
      enabled
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back-outline" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Personlige oplysninger</Text>
          </View>

          <View style={styles.profileImageContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.profileImageWrapper}>
              {userData.avatarUrl ? (
                <>
                  <Image
                    source={{ uri: userData.avatarUrl }}
                    style={styles.profileImage}
                    onError={() => {
                      console.log('Image failed to load, fallback to initials');
                      setUserData(prev => ({ ...prev, profile_image: '' }));
                    }}
                  />
                  {isUploading && (
                    <View style={[styles.placeholderImage, styles.uploadingOverlay]}>
                      <ActivityIndicator size="large" color="#42865F" />
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.placeholderImage}>
                  {userData.name ? (
                    <Text style={[styles.initialsText, { color: '#42865F' }]}>
                      {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Text>
                  ) : (
                    <Ionicons name="person-outline" size={40} color="#42865F" />
                  )}
                </View>
              )}
              <View style={styles.editIconContainer}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Fuldenavn</Text>
          <View style={styles.settingsItem}>
            <Text style={styles.settingsText}>{userData.name}</Text>
          </View>

          <Text style={styles.sectionLabel}>Relation</Text>
          <View style={styles.settingsItem}>
            <Text style={styles.settingsText}>
              {userData.relationToDementiaPerson || 'Relation til person med demens'}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Fødselsdato</Text>
          <View style={styles.settingsItem}>
            <Text style={styles.settingsText}>
              {userData.birthday ? formatDanishDate(parseBirthdayToDate(userData.birthday)) : 'Vælg fødselsdato (valgfrit)'}
            </Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Ionicons name="create-outline" size={24} color="#707070" />
            </TouchableOpacity>
          </View>
      

      {/* Birthday Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: '#000' }]}>Vælg fødselsdato</Text>
            <Text style={[styles.modalText, { marginBottom: 10 }]}>
              {formatDanishDate(selectedDate)}
            </Text>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              textColor="#000"
              themeVariant="light"
              minimumDate={new Date(1900, 0, 1)}
              maximumDate={new Date()}
              onChange={(event, date) => {
                const currentDate = date || selectedDate;
                setSelectedDate(currentDate);
              }}
               locale="da" // Danish locale
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowDatePicker(false);
                  if (userData.birthday) {
                    const parsed = parseBirthdayToDate(userData.birthday);
                    setSelectedDate(parsed);
                  }
                }}
              >
                <Text style={styles.modalButtonText}>Annuller</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={async () => {
                  try {
                    const storedData = await AsyncStorage.getItem('userData');
                    if (!storedData) return;

                    const parsedData = JSON.parse(storedData);
                    const currentDate = new Date(selectedDate);
                    const day = String(currentDate.getDate()).padStart(2, '0');
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const year = currentDate.getFullYear();

                    const isoDate = `${year}-${month}-${day}`;
                    const formattedDate = `${day}-${month}-${year}`;

                    setUserData(prev => ({ ...prev, birthday: formattedDate }));

                    const updatedData = { ...parsedData, birthday: formattedDate };

                    const response = await fetch(`${API_URL}/users/${parsedData.id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${parsedData.token}`
                      },
                      body: JSON.stringify({
                        birthday: isoDate,
                        name: parsedData.name,
                        email: parsedData.email,
                        profile_image: parsedData.profile_image,
                        relationToDementiaPerson: parsedData.relationToDementiaPerson
                      })
                    });

                    if (!response.ok) throw new Error('Failed to update birthday');

                    await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
                    setShowDatePicker(false);
                  } catch (error) {
                    console.error('Error updating birthday:', error);
                    Alert.alert('Fejl', 'Der opstod en fejl ved opdatering af fødselsdato. Prøv igen.');
                  }
                }}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Gem</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
</Modal>


        <View style={styles.settingsContainer}>
          <View style={styles.settingsSection}>


           
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => router.push('../../change-email')}
            >
              <View style={styles.settingsIcon}>
                <Ionicons name="mail-outline" size={24} color="#000" />
              </View>
              <Text style={styles.settingsText}>E-mailadresse</Text>
              <Ionicons name="chevron-forward" size={24} color="#707070" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => router.push('../../change-password')}
            >
              <View style={styles.settingsIcon}>
                <Ionicons name="key-outline" size={24} color="#000" />
              </View>
              <Text style={styles.settingsText}>Adgangskode</Text>
              <Ionicons name="chevron-forward" size={24} color="#707070" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => router.push('../../delete-account')}
            >
              <View style={styles.settingsIcon}>
                <Ionicons name="trash-outline" size={24} color="#000" />
              </View>
              <Text style={styles.settingsText}>Slet min konto</Text>
              <Ionicons name="chevron-forward" size={24} color="#707070" />
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </ScrollView>

      { toast && (
        <Toast type={toast.type} message={toast.message} />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  initialsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#42865F',
  },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
    },
    formContainer: {
      paddingHorizontal: 20,
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      fontSize: 18,
      marginBottom: 8,
      color: '#00000',
      fontFamily: 'RedHatDisplay_400Regular',
    },
    input: {
      borderWidth: 1,
      borderColor: '#E5E5E5',
      borderRadius: 8,
      padding: 12,
      fontSize: 18,
      fontFamily: 'RedHatDisplay_400Regular',
    },
    relationItem: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E5E5',
    },
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    scrollView: {
      flex: 1,
      backgroundColor: '#fff',
      paddingVertical: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 70,
      paddingBottom: 20,
      backgroundColor: '#fff',
    },
    backButton: {
      marginRight: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '400',
      fontFamily: 'RedHatDisplay_400Regular',
    },
    profileImageContainer: {
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 30,
    },
    profileImageWrapper: {
      width: 120,
      height: 120,
      borderRadius: 60,
      position: 'relative',
    },
    profileImage: {
      width: '100%',
      height: '100%',
      borderRadius: 60,
    },
    placeholderImage: {
      width: '100%',
      height: '100%',
      borderRadius: 60,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    uploadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: 60,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    editIconContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#42865F',
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: '#fff',
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
      marginBottom: 8,
    },
    settingsText: {
      flex: 1,
      fontSize: 18,
      color: '#000',
      fontFamily: 'RedHatDisplay_400Regular',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      fontFamily: 'RedHatDisplay_700Bold',
    },
    modalText: {
      fontSize: 18,
      textAlign: 'center',
      color: '#000',
      fontFamily: 'RedHatDisplay_400Regular',
    },
    modalButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      marginHorizontal: 10,
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalCancelButton: {
      backgroundColor: '#e0e0e0',
    },
    modalSaveButton: {
      backgroundColor: '#42865F',
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#000',
    },
    relationOption: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E5E5',
    },
    relationText: {
      fontSize: 18,
      color: '#000',
      fontFamily: 'RedHatDisplay_400Regular',
    },
    settingsContainer: {
      marginTop: 0,
      marginBottom: 16,
    },
    settingsSection: {
      backgroundColor: '#fff',
    },
    settingsIcon: {
      marginRight: 12,
    },
    sectionLabel: {
      ...Platform.select({
        ios: {
          fontSize: 18,
          color: '#000000',
          fontFamily: 'RedHatDisplay_400Regular',
        },
        android: {
          fontSize: 18,
          color: '#000000',
          fontFamily: 'RedHatDisplay_400Regular',
        },
      }),
      marginLeft: 20,
      marginBottom: 2,
    }
});

export default EditProfile;
