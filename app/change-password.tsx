import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const ChangePassword = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return minLength && hasNumber && hasSpecialChar;
  };

  const handleChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        Alert.alert('Fejl', 'Udfyld venligst alle felter');
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert('Fejl', 'De nye adgangskoder matcher ikke');
        return;
      }

      if (!validatePassword(newPassword)) {
        Alert.alert('Fejl', 'Den nye adgangskode skal indeholde mindst 8 tegn, et tal og et specialtegn');
        return;
      }

      setIsLoading(true);

      const userData = await AsyncStorage.getItem('userData');
      if (!userData) throw new Error('No user data found');

      const { id, token } = JSON.parse(userData);

      // Log only non-sensitive information
      console.log('Attempting to change password...');

      const response = await fetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: id,
          currentPassword,
          newPassword
        })
      });

      console.log('Password change request sent');

      const data = await response.json();

      if (!response.ok) {
        console.log('Server response not OK:', response.status);
        const errorMessage = data.error || 'Kunne ikke ændre adgangskode';
        throw new Error(errorMessage);
      }

      setShowSuccessMessage(true);
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error('Error changing password:', error instanceof Error ? error.message : 'Unknown error');
      Alert.alert('Fejl', 
        error instanceof Error && error.message ? 
        error.message : 
        'Der opstod en fejl ved ændring af adgangskode'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Skift adgangskode</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Opret sikker adgangskode</Text>
          
          <View style={styles.requirements}>
            <Text style={styles.requirementText}>• Brug mindst 8 tegn</Text>
            <Text style={styles.requirementText}>• Brug en kombination af bogstaver, tal og specialtegn (f.eks.: #$!%)</Text>
          </View>

          <Text style={styles.inputLabel}>Nuværende adgangskode</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Indtast nuværende adgangskode"
            />
            <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
              <Ionicons name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#707070" />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Ny adgangskode</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Indtast ny adgangskode"
            />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
              <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#707070" />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Bekræft ny adgangskode</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Bekræft ny adgangskode"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#707070" />
            </TouchableOpacity>
          </View>

          {showSuccessMessage ? (
            <View style={styles.successMessageContainer}>
              <View style={styles.successMessage}>
                <View style={styles.successIconContainer}>
                  <Ionicons name="checkmark-circle-outline" size={28} color="#42865F" />
                </View>
                <Text style={styles.successText}>
                  Din adgangskode er opdateret{"\n"}
                  – brug den ved næste login.
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.changeButton, isLoading && styles.changeButtonDisabled]}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              <Text style={styles.changeButtonText}>
                {isLoading ? 'Ændrer adgangskode...' : 'Skift adgangskode'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  successMessageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 1000,
  },
  successMessage: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '90%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  successIconContainer: {
    marginBottom: 12,
  },
  successText: {
    color: '#000',
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontFamily: 'RedHatDisplay_400Regular',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  requirements: {
    marginBottom: 30,
  },
  requirementText: {
    fontSize: 19,
    color: '#333',
    marginBottom: 8,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  inputLabel: {
    fontSize: 19,
    color: '#000',
    marginBottom: 14,
    marginLeft: 4,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  changeButton: {
    backgroundColor: '#42865F',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  changeButtonDisabled: {
    opacity: 0.7,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'RedHatDisplay_500Medium',
  },
});

export default ChangePassword;
