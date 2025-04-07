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

const EditProfile = () => {
  const router = useRouter();
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
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

  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        setUserData(prevData => ({
          ...prevData,
          name: parsedData.name || '',
          email: parsedData.email || '',
          password: '',
          birthday: parsedData.birthday || '',
          profileImage: parsedData.profileImage || '',
          relationToDementiaPerson: parsedData.relationToDementiaPerson || ''
        }));

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

        // Transform local URL to production URL
        const originalUrl = new URL(imageData.imageUrl);
        const productionImageUrl = `https://aldra-app.onrender.com${originalUrl.pathname}`;
        console.log('Transformed image URL:', productionImageUrl);

        // Get the auth token
        const token = parsedData.token;
        if (!token) {
          throw new Error('No auth token found');
        }

        // Update user data with new profile image
        const updateData = {
          name: parsedData.name,
          email: parsedData.email,
          relationToDementiaPerson: parsedData.relationToDementiaPerson,
          profile_image: productionImageUrl
        };
        console.log('Updating user data:', updateData);

        const updateUrl = `${API_URL}/users/${userId}`;
        console.log('Making request to:', updateUrl);
        console.log('With data:', JSON.stringify(updateData, null, 2));

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
        const updatedUserData = { 
          ...parsedData,
          profile_image: productionImageUrl  // Match database column name
        };
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
        console.log('Saved to AsyncStorage:', updatedUserData);
        
        // Update local state to show new image immediately
        setUserData(prev => ({ ...prev, profile_image: productionImageUrl }));
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
          {userData.profileImage ? (
            <Image 
              source={{ uri: userData.profileImage }} 
              style={styles.profileImage}
              onError={(error) => console.log('Image loading error:', error.nativeEvent.error)}
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
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { color: '#000' }]}>Vælg fødselsdato</Text>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                textColor="#000"
                themeVariant="light"
                minimumDate={new Date(1900, 0, 1)}
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  if (event.type === 'set' && selectedDate) {
                    setSelectedDate(selectedDate);
                    const day = String(selectedDate.getDate()).padStart(2, '0');
                    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const year = selectedDate.getFullYear();
                    const formattedDate = `${day}/${month}/${year}`;
                    setUserData(prev => ({ ...prev, birthday: formattedDate }));
                  }
                }}
              />
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={async () => {
                  try {
                    // Get current user data
                    const storedData = await AsyncStorage.getItem('userData');
                    if (!storedData) return;

                    const parsedData = JSON.parse(storedData);
                    const updatedData = { ...parsedData, birthday: userData.birthday };

                    // Update database
                    const response = await fetch(`${API_URL}/users/${parsedData.id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        birthday: userData.birthday
                      })
                    });

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
                <Text style={styles.modalSaveButtonText}>Gem</Text>
              </TouchableOpacity>
            </View>
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
  modalSaveButton: {
    backgroundColor: '#42865F',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'RedHatDisplay_500Medium',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'RedHatDisplay_700Bold',
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
