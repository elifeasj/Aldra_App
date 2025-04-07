import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MediaTypeOptions, launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { API_URL } from '../config.js';
import DateTimePicker from '@react-native-community/datetimepicker';

interface UserProfileData {
  name: string;
  email: string;
  password?: string;
  birthday: string;
  profileImage?: string;
  relationToDementiaPerson?: string;
}

const danishMonths = [
  'januar', 'februar', 'marts', 'april', 'maj', 'juni',
  'juli', 'august', 'september', 'oktober', 'november', 'december'
];

const formatDanishDate = (date: Date) => {
  const day = date.getDate();
  const month = danishMonths[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const EditProfile = () => {
  const router = useRouter();
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [profileImage, setProfileImage] = useState('');
  const relations = ["Ægtefælle/Partner", "Barn", "Søskende", "Forældre", "Andet"];
  
  const [userData, setUserData] = useState<UserProfileData>({
    name: '',
    email: '',
    password: '',
    birthday: '',
    profileImage: '',
    relationToDementiaPerson: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  // Watch for profile image updates
  useEffect(() => {
    const checkProfileUpdate = async () => {
      const lastUpdate = await AsyncStorage.getItem('lastProfileUpdate');
      if (lastUpdate) {
        await loadUserData();
      }
    };
    checkProfileUpdate();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        // Format birthday from ISO to Danish format if it exists
        let formattedBirthday = '';
        if (parsedData.birthday) {
          const date = new Date(parsedData.birthday);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          formattedBirthday = `${day}/${month}/${year}`;
        }

        setUserData(prevData => ({
          ...prevData,
          name: parsedData.name || '',
          email: parsedData.email || '',
          password: '',
          birthday: formattedBirthday,
          profileImage: parsedData.profile_image || '',
          relationToDementiaPerson: parsedData.relationToDementiaPerson || ''
        }));
        console.log('Updated user data with profile:', parsedData.profile_image);
        console.log('Formatted birthday:', formattedBirthday);

        // Set selected date from stored birthday if it exists
        if (parsedData.birthday) {
          const [day, month, year] = parsedData.birthday.split('/');
          setSelectedDate(new Date(Number(year), Number(month) - 1, Number(day)));
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Tilladelse nødvendig', 'Vi skal bruge din tilladelse for at vælge et billede.');
      return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      console.log('Selected image URI:', result.assets[0].uri);
      const formData = new FormData();
      formData.append('profileImage', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'profile-image.jpg',
      });

      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (!storedUserData) return;

        const parsedData = JSON.parse(storedUserData);
        const userId = parsedData.id;
        console.log('User ID for update:', userId);
        console.log('Stored user data:', parsedData);

        // Upload image first
        console.log('Uploading to:', `${API_URL}/upload-profile-image`);
        const uploadResponse = await fetch(`${API_URL}/upload-profile-image`, {
          method: 'POST',
          body: formData,
          // Don't set Content-Type for FormData, browser will set it with boundary
        });

        console.log('Upload response status:', uploadResponse.status);
        const responseText = await uploadResponse.text();
        console.log('Upload response text:', responseText);

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload image: ${responseText}`);
        }

        const imageData = JSON.parse(responseText);
        console.log('Parsed image data:', imageData);

        if (!imageData.imageUrl) {
          throw new Error('No image URL in response');
        }

        // Get the auth token
        const token = parsedData.token;
        if (!token) {
          throw new Error('No auth token found');
        }

        // Transform local URL to production URL
        const imagePath = imageData.imageUrl.split('/uploads/')[1];
        const productionImageUrl = `https://aldra-app.onrender.com/uploads/${imagePath}`;
        console.log('Using production URL:', productionImageUrl);

        // Update user data with profile image
        const updateData = {
          name: parsedData.name,
          email: parsedData.email,
          relationToDementiaPerson: parsedData.relationToDementiaPerson,
          profile_image: productionImageUrl,
          // Add all other fields to prevent them from being nulled
          birthday: parsedData.birthday || null
        };
        console.log('Full update data:', updateData);
        console.log('Profile image URL being sent:', productionImageUrl);

        const updateUrl = `${API_URL}/users/${userId}`;
        console.log('Updating user data:', updateData);
        console.log('Making request to:', updateUrl);

        const updateResponse = await fetch(updateUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        });

        console.log('Update response status:', updateResponse.status);
        const updateResponseText = await updateResponse.text();
        console.log('Update response:', updateResponseText);

        if (!updateResponse.ok) {
          throw new Error(`Failed to update user profile: ${updateResponseText}`);
        }

        console.log('Update successful');
        // Remove old profileImage field and use only profile_image
        const { profileImage, ...rest } = parsedData;
        const updatedUserData = { 
          ...rest,
          profile_image: productionImageUrl
        };
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
        console.log('Saved to AsyncStorage:', updatedUserData);
        
        // Update local state
        setUserData(prev => ({
          ...prev,
          profile_image: productionImageUrl
        }));
        
        // Force reload profile image in parent component
        await AsyncStorage.setItem('lastProfileUpdate', new Date().toISOString());
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Fejl', 'Der opstod en fejl ved upload af billedet. Prøv igen.');
      }
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
          {userData.profileImage && userData.profileImage.startsWith('http') ? (
            <Image 
              source={{ uri: userData.profileImage }} 
              style={styles.profileImage}
              onError={(error) => {
                console.log('Image loading error:', error.nativeEvent.error);
                setUserData(prev => ({ ...prev, profileImage: '' }));
              }}
              onLoad={() => console.log('Image loaded successfully:', userData.profileImage)}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="person" size={40} color="#999" />
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
          {userData.birthday || 'Vælg fødselsdato (valgfrit)'}
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
                  console.log('Date selected in picker:', currentDate);
                }}
              />
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => {
                    setShowDatePicker(false);
                    // Reset selected date to current value
                    if (userData.birthday) {
                      const [day, month, year] = userData.birthday.split('/');
                      setSelectedDate(new Date(Number(year), Number(month) - 1, Number(day)));
                    }
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuller</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalSaveButton]}
                  onPress={async () => {
                  try {
                    // Get current user data
                    const storedData = await AsyncStorage.getItem('userData');
                    if (!storedData) return;

                    const parsedData = JSON.parse(storedData);

                    // Ensure we have a valid date
                    const currentDate = new Date(selectedDate);
                    const day = String(currentDate.getDate()).padStart(2, '0');
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const year = currentDate.getFullYear();
                    
                    // Format date for database (YYYY-MM-DD)
                    const isoDate = `${year}-${month}-${day}`;
                    // Format date in Danish format (DD/MM/YYYY)
                    const formattedDate = `${day}/${month}/${year}`;

                    // Update local state with formatted date
                    setUserData(prev => ({ ...prev, birthday: formattedDate }));

                    const updatedData = { ...parsedData, birthday: formattedDate };

                    // Update database
                    const response = await fetch(`${API_URL}/users/${parsedData.id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${parsedData.token}`
                      },
                      body: JSON.stringify({
                        birthday: isoDate,
                        // Keep other fields unchanged
                        name: parsedData.name,
                        email: parsedData.email,
                        profile_image: parsedData.profile_image,
                        relationToDementiaPerson: parsedData.relationToDementiaPerson
                      })
                    });
                    console.log('Birthday update response:', await response.text());

                    if (!response.ok) {
                      throw new Error('Failed to update birthday');
                    }

                    // Update AsyncStorage
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
              onPress={() => router.push('../../myprofile')}
            >
              <View style={styles.settingsIcon}>
                <Ionicons name="mail-outline" size={24} color="#000" />
              </View>
              <Text style={styles.settingsText}>E-mailadresse</Text>
              <Ionicons name="chevron-forward" size={24} color="#707070" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => router.push('../../..')}
            >
              <View style={styles.settingsIcon}>
                <Ionicons name="key-outline" size={24} color="#000" />
              </View>
              <Text style={styles.settingsText}>Adgangskode</Text>
              <Ionicons name="chevron-forward" size={24} color="#707070" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => router.push('../../..')}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 90,
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

  settingsContainer: {
    marginTop: 0,
    marginBottom: 16,
  },
  settingsSection: {
    backgroundColor: '#fff',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 11,
  },
  settingsIcon: {
    marginRight: 12,
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
  relationItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  relationText: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'RedHatDisplay_400Regular',
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
    marginBottom: 8,
  },
});

export default EditProfile;
