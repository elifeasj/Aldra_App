import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../config.js';

interface UserProfileData {
  name: string;
  fullName: string;
  email: string;
  password?: string;
  birthday: string;
  profileImage?: string;
}

const EditProfile = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserProfileData>({
    name: '',
    fullName: '',
    email: '',
    password: '',
    birthday: '',
    profileImage: '',
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
          fullName: parsedData.fullName || '',
          email: parsedData.email || '',
          password: '',
          birthday: parsedData.birthday || '',
          profileImage: parsedData.profileImage || ''
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Tilladelse nødvendig', 'Vi skal bruge din tilladelse for at vælge et billede.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
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

        const response = await fetch(`${API_URL}/upload-profile-image`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const data = await response.json();
        setUserData(prev => ({ ...prev, profileImage: data.imageUrl }));
        
        // Opdater AsyncStorage med nyt billede URL
        const updatedUserData = { ...parsedData, profileImage: data.imageUrl };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Fejl', 'Der opstod en fejl ved upload af billedet. Prøv igen.');
      }
    }
  };

  const handleSave = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (!storedUserData) {
        Alert.alert('Fejl', 'Kunne ikke finde brugerdata');
        return;
      }

      const parsedData = JSON.parse(storedUserData);
      const userId = parsedData.id;

      if (!userId) {
        Alert.alert('Fejl', 'Kunne ikke finde bruger ID');
        return;
      }

      interface UpdateData {
        name: string;
        fullName: string;
        email: string;
        birthday: string;
        password?: string;
      }

      const updateData: UpdateData = {
        name: userData.name,
        fullName: userData.fullName,
        email: userData.email,
        birthday: userData.birthday,
      };

      // Kun inkluder password hvis det er udfyldt
      if (userData.password && userData.password.trim() !== '') {
        updateData.password = userData.password;
      }

      console.log('Sending update request to:', `${API_URL}/users/${userId}`);
      console.log('Update data:', updateData);

      console.log('Making request to:', `${API_URL}/users/${userId}`);
      console.log('With data:', updateData);

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Server response:', responseText);
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error || 'Failed to update user data');
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      const responseText = await response.text();
      console.log('Server response:', responseText);
      let updatedData;
      try {
        updatedData = JSON.parse(responseText);
        console.log('Parsed updated data:', updatedData);
      } catch (parseError) {
        console.error('Error parsing success response:', parseError);
        throw new Error('Invalid response from server');
      }

      await AsyncStorage.setItem('userData', JSON.stringify({
        ...parsedData,
        ...updatedData,
      }));

      Alert.alert('Succes', 'Dine ændringer er blevet gemt');
      router.back();
    } catch (error) {
      console.error('Error updating user data:', error);
      Alert.alert('Fejl', 'Der skete en fejl ved opdatering af dine data. Prøv igen.');
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
            <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
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

      <View style={styles.inputGroup}>
          <Text style={styles.label}>Fuldenavn</Text>
          <TextInput
            style={styles.input}
            value={userData.fullName}
            onChangeText={(text) => setUserData({ ...userData, fullName: text })}
            placeholder="Linda Boe"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Relation til person med demens</Text>
          <TouchableOpacity style={styles.input} onPress={() => {/* Add relation picker logic */}}>
            <Text>Datter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fødselsdato</Text>
          <TextInput
            style={styles.input}
            value={userData.birthday}
            onChangeText={(text) => setUserData({ ...userData, birthday: text })}
            placeholder="mm/dd/åååå"
          />
        </View>

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

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Gem ændringer</Text>
        </TouchableOpacity>
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
  saveButton: {
    backgroundColor: '#42865F',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'RedHatDisplay_500Medium',
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
});

export default EditProfile;
