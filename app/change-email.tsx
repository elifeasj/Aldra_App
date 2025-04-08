import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import Toast from '@/components/Toast';

const ChangeEmail = () => {
  const router = useRouter();
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    loadCurrentEmail();
  }, []);

  const loadCurrentEmail = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { email } = JSON.parse(userData) as UserData;
        setCurrentEmail(email);
      }
    } catch (error) {
      console.error('Error loading email:', error);
    }
  };

  interface UserData {
  id: string;
  email: string;
}

interface ApiResponse {
  error?: string;
}

const handleRequestChange = async () => {
    try {
      if (!newEmail) {
        setToast({ type: 'error', message: 'Indtast venligst en ny e-mailadresse' });
        setTimeout(() => setToast(null), 4000);
        return;
      }

      if (newEmail === currentEmail) {
        setToast({ type: 'error', message: 'Den nye e-mailadresse skal være forskellig fra den nuværende' });
        setTimeout(() => setToast(null), 4000);
        return;
      }

      setIsLoading(true);
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) throw new Error('No user data found');

      const { id } = JSON.parse(userData) as UserData;
      
      const response = await fetch(`${API_URL}/request-email-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: id,
          newEmail,
        }),
      });

      const data = await response.json() as ApiResponse;
      
      if (!response.ok) {
        throw new Error(data.error || 'Could not request email change');
      }

      // Navigate to confirmation screen
      router.push({
        pathname: '/confirm-email',
        params: { newEmail },
      });

    } catch (error) {
      console.error('Error requesting email change:', error);
      setToast({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Der opstod en fejl'
      });
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
          <Text style={styles.title}>E-mailadresse</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Skift din e-mailadresse her. 
          Vi sender en bekræftelse til din nye adresse for at fuldføre ændringen.</Text>
          
          <Text style={styles.inputLabel}>Nuværende e-mailadresse</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currentEmail}>{currentEmail}</Text>
          </View>

          <Text style={styles.inputLabel}>Ny e-mailadresse</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Indtast ny e-mailadresse"
              placeholderTextColor="#A0A0A0"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            style={[styles.changeButton, isLoading && styles.changeButtonDisabled]}
            onPress={handleRequestChange}
            disabled={isLoading}
          >
            <Text style={styles.changeButtonText}>
              {isLoading ? 'Sender...' : 'Gem ændringer'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {toast && (
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
    fontSize: 20,
    lineHeight: 30,
    marginBottom: 40,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  inputLabel: {
    fontSize: 19,
    color: '#000',
    marginBottom: 14,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingRight: 16,
    marginBottom: 24,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  currentEmail: {
    fontSize: 18,
    color: '#666',
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

export default ChangeEmail;
