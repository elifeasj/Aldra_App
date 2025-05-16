import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from '../components/Toast';
import { auth } from '../firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';


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
      if (!currentPassword || !newPassword || !confirmPassword) {
        setToast({ type: 'error', message: 'Udfyld venligst alle felter' });
        setTimeout(() => setToast(null), 4000);
        return;
      }
  
      if (newPassword !== confirmPassword) {
        setToast({ type: 'error', message: 'De nye adgangskoder matcher ikke' });
        setTimeout(() => setToast(null), 4000);
        return;
      }
  
      if (!validatePassword(newPassword)) {
        setToast({ type: 'error', message: 'Den nye adgangskode skal være mindst 8 tegn og indeholde tal og specialtegn' });
        setTimeout(() => setToast(null), 4000);
        return;
      }
  
      if (currentPassword === newPassword) {
        setToast({ type: 'error', message: 'Den nye adgangskode må ikke være den samme som den nuværende' });
        setTimeout(() => setToast(null), 4000);
        return;
      }
  
      setIsLoading(true);
  
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('Bruger ikke logget ind');
  
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
  
      await updatePassword(user, newPassword);
  
      setToast({ type: 'success', message: 'Adgangskoden er opdateret. Brug den næste gang du logger ind.' });
      setTimeout(() => router.back(), 4000);
    } catch (error) {
      console.error('Fejl ved adgangskodeopdatering:', error);
      const message = error instanceof Error && error.message.includes('auth/wrong-password')
        ? 'Den nuværende adgangskode er forkert'
        : 'Kunne ikke opdatere adgangskode';
      setToast({ type: 'error', message });
      setTimeout(() => setToast(null), 4000);
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
