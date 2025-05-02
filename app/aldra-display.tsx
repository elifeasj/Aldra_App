import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from '@/components/Toast';

// We'll use an icon for the QR code placeholder

const AldraDisplay = () => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Dummy function for the connect button
  const handleConnect = () => {
    // This would contain the actual connection logic in the future
    console.log('Attempting to connect with code:', code);
    
    // Show success toast message
    setToast({ 
      type: 'success', 
      message: 'Forbindelsen er oprettet - minder du deler, vises automatisk på skærmen.' 
    });
    
    // Clear toast after a few seconds
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Aldra Display</Text>
        </View>

        <View style={styles.content}>
          {/* Main title and description */}
          <Text style={styles.mainTitle}>Forbind din Aldra Display</Text>
          
          <Text style={styles.description}>
            For at sende minder til en skærm (Smart TV eller tablet), 
            skal du først installere Aldra Display og forbinde den med 
            din app.
          </Text>

          {/* QR Code section */}
          <View style={styles.qrContainer}>
            <Text style={styles.qrText}>Scan QR-koden</Text>
            <View style={styles.qrCodeBox}>
              {/* This would be replaced with an actual QR code component */}
              <Ionicons name="qr-code" size={150} color="#000" />
            </View>
          </View>

          {/* Or enter code text */}
          <Text style={styles.orText}>Eller indtast koden</Text>
          
          {/* Code input field */}
          <TextInput
            style={styles.input}
            placeholder="Indtast koden"
            placeholderTextColor="#A0A0A0"
            value={code}
            onChangeText={setCode}
          />

          {/* Instructions section */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Sådan gør du</Text>
            
            <View style={styles.stepContainer}>
              <Text style={styles.stepNumber}>1.</Text>
              <Text style={styles.stepText}>
                Åbn Aldra Display på den skærm, du vil forbinde (f.eks. iPad eller Smart TV)
              </Text>
            </View>
            
            <View style={styles.stepContainer}>
              <Text style={styles.stepNumber}>2.</Text>
              <Text style={styles.stepText}>
                Scan QR-koden eller indtast koden, som vises på skærmen
              </Text>
            </View>
            
            <View style={styles.stepContainer}>
              <Text style={styles.stepNumber}>3.</Text>
              <Text style={styles.stepText}>
                Når forbindelsen er oprettet, kan du sende minder direkte hertil
              </Text>
            </View>
          </View>

          {/* Settings link */}
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => router.push('/display-timestamp')}
          >
            <View style={styles.settingsLeft}>
              <Ionicons name="apps-outline" size={24} color="#333" style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Tid & dato på skærmen</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#000" />
          </TouchableOpacity>

          {/* Connect button */}
          <TouchableOpacity 
            style={styles.connectButton}
            onPress={handleConnect}
          >
            <Text style={styles.connectButtonText}>Forbind Aldra-enhed</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Toast notification */}
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
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 24,
    fontFamily: 'RedHatDisplay_400Regular',
    marginBottom: 12,
    color: '#000',
  },
  description: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
    lineHeight: 30,
    marginBottom: 30,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrText: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#333',
    marginBottom: 20,
  },
  qrCodeBox: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#42865F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  qrCode: {
    width: '100%',
    height: '100%',
  },
  orText: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    marginBottom: 50,
  },
  instructionsContainer: {
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 22,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000',
    marginBottom: 25,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  stepNumber: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
    marginRight: 8,
    width: 16,
  },
  stepText: {
    flex: 1,
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
    lineHeight: 30,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 30,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    marginRight: 12,
  },
  settingsText: {
    fontSize: 20,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
  },
  connectButton: {
    backgroundColor: '#42865F',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'RedHatDisplay_500Medium',
  },
});

export default AldraDisplay;
