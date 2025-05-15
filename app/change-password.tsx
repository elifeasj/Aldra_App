import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import Toast from '../components/Toast';

const ChangePassword = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return minLength && hasNumber && hasSpecialChar;
  };

  const handleChangePassword = async () => {
    try {
      // Tjek om alle felter er udfyldt
      if (!currentPassword || !newPassword || !confirmPassword) {
        setToast({ type: 'error', message: 'Udfyld venligst alle felter' });
        setTimeout(() => setToast(null), 4000); // 4 sekunder
        return;
      }

      // Tjek om nye adgangskoder er ens
      if (newPassword !== confirmPassword) {
        setToast({ type: 'error', message: 'De nye adgangskoder matcher ikke' });
        setTimeout(() => setToast(null), 4000); // 4 sekunder
        return;
      }

      // Tjek adgangskode strenghed
      if (!validatePassword(newPassword)) {
        setToast({ type: 'error', message: 'Den nye adgangskode skal indeholde mindst 8 tegn, et tal og et specialtegn' });
        setTimeout(() => setToast(null), 4000); // 4 sekunder
        return;
      }

      // Tjek om nye adgangskoder er ens
      if (currentPassword === newPassword) {
        setToast({ type: 'error', message: 'Den nye adgangskode må ikke være den samme som den nuværende' });
        setTimeout(() => setToast(null), 4000); // 4 sekunder
        return;
      }

      setIsLoading(true);

      // Hent brugerdata fra AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) throw new Error('No user data found');

      const { id, token } = JSON.parse(userData);

      // Log only non-sensitive information
      console.log('Attempting to change password...');

      // Send change-password request
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

      // Log response
      console.log('Password change request sent');

      const data = await response.json();

      // Tjek response
      if (!response.ok) {
        console.log('Server response not OK:', response.status);
        const errorMessage = data.error || 'Kunne ikke ændre adgangskode';
        throw new Error(errorMessage);
      }

      // Vis success overlay
      setToast({ type: 'success', message: 'Din adgangskode er opdateret – brug den ved næste login.' });
      setTimeout(() => {
        router.back();
      }, 5000);
    } catch (error) {
      console.error('Error changing password:', error instanceof Error ? error.message : 'Unknown error');
      setToast({ type: 'error', message: 'Der opstod en fejl ved ændring af adgangskode' });
      setTimeout(() => setToast(null), 4000); // 4 sekunder
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
              placeholderTextColor="#A0A0A0"
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
              placeholderTextColor="#A0A0A0"
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
              placeholderTextColor="#A0A0A0"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#707070" />
            </TouchableOpacity>
          </View>
  
          <TouchableOpacity 
            style={[styles.changeButton, isLoading && styles.changeButtonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            <Text style={styles.changeButtonText}>
              {isLoading ? 'Ændrer adgangskode...' : 'Skift adgangskode'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      { toast && (
        <Toast type={toast.type} message={toast.message} />
      )}
    </KeyboardAvoidingView>
  );
};  

const styles = StyleSheet.create({
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
    marginLeft: 0,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingRight: 16,
    marginBottom: 32,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    textAlign: 'left',
    padding: 0,
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
