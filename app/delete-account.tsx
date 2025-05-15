import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal, KeyboardAvoidingView, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import Toast from '../components/Toast';

const DeleteAccount = () => {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);

      // Hent brugerdata fra AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) throw new Error('No user data found');

      const { id, token } = JSON.parse(userData);

      // Send delete account request
      const response = await fetch(`${API_URL}/user/${id}/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke slette kontoen');
      }

      // Clear AsyncStorage
      await AsyncStorage.clear();

      // Vis success besked og redirect til login
      setToast({ type: 'success', message: 'Din konto er nu slettet' });
      setTimeout(() => {
        router.replace('/onboarding/login');
      }, 2000);

    } catch (error) {
      console.error('Error deleting account:', error);
      setToast({ type: 'error', message: 'Der opstod en fejl ved sletning af kontoen' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsLoading(false);
      setIsModalVisible(false);
    }
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://aldra.dk/persondatapolitik');
  };

  const openTerms = () => {
    Linking.openURL('https://aldra.dk/vilkaar-og-betingelser');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Slet min konto</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.warningTitle}>
            Hvis du sletter din konto sker der følgende:
          </Text>

          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Din konto og alle personlige data – permanent slettet.</Text>
            <Text style={styles.bulletPoint}>• Dine tilknyttede enheder (inkl. Aldra-device) – afmeldes og fjernes.</Text>
            <Text style={styles.bulletPoint}>• Eventuelle gemte præferencer og tilknyttede tjenester – fjernes fra systemet.</Text>
            <Text style={styles.bulletPoint}>• Du vil ikke længere kunne logge ind eller bruge Aldra.</Text>
            <Text style={styles.bulletPoint}>• Eventuelle aktive abonnementer skal annulleres separat for at undgå fremtidige omkostninger.</Text>
            <Text style={styles.bulletPoint}>• Denne handling kan ikke fortrydes.</Text>
          </View>

          <Text style={styles.infoText}>
            Vil du vide mere om, hvordan vi håndterer dine data, beskytter din privatliv og hvilke vilkår der gælder?
          </Text>

          <View style={styles.linkContainer}>
            <TouchableOpacity onPress={openPrivacyPolicy} style={styles.linkButton}>
              <Text style={styles.link}>Persondatapolitik</Text>
              <Ionicons name="open-outline" size={18} color="#42865F" />
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>og</Text>
            <TouchableOpacity onPress={openTerms} style={styles.linkButton}>
              <Text style={styles.link}>Vilkår & Betingelser</Text>
              <Ionicons name="open-outline" size={18} color="#42865F" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.deleteButton, isLoading && styles.deleteButtonDisabled]}
            onPress={() => setIsModalVisible(true)}
            disabled={isLoading}
          >
            <Text style={styles.deleteButtonText}>
              {isLoading ? 'Sletter konto...' : 'Slet min konto'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Er du sikker?</Text>
            <Text style={styles.modalText}>
              Denne handling kan ikke fortrydes. Alle dine data vil blive permanent slettet.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuller</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmDeleteButton}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.confirmDeleteButtonText}>Slet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  warningTitle: {
    fontSize: 22,
    marginBottom: 20,
    fontFamily: 'RedHatDisplay_500Medium',
  },
  bulletPoints: {
    marginBottom: 10,
  },
  bulletPoint: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    fontFamily: 'RedHatDisplay_400Regular',
    lineHeight: 24,
  },
  infoText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
    fontFamily: 'RedHatDisplay_400Regular',
    lineHeight: 24,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  link: {
    color: '#42865F',
    textDecorationLine: 'underline',
    fontSize: 18,
    fontFamily: 'RedHatDisplay_500Medium',
  },
  linkSeparator: {
    marginHorizontal: 8,
    color: '#333',
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonDisabled: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'RedHatDisplay_500Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'RedHatDisplay_500Medium',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'RedHatDisplay_400Regular',
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    padding: 14,
    borderRadius: 8,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'RedHatDisplay_500Medium',
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#D32F2F',
    padding: 14,
    borderRadius: 8,
    marginLeft: 12,
  },
  confirmDeleteButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'RedHatDisplay_500Medium',
  },
});

export default DeleteAccount;
