import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { endpoints } from '../../config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(firestore, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('Brugerdata ikke fundet i databasen');
      }

      const userData = userSnap.data();

      await AsyncStorage.setItem('userData', JSON.stringify({
        uid: user.uid,
        full_name: userData.full_name,
        email: userData.email,
        relation_to_dementia_person: userData.relation_to_dementia_person,
        profile_image: userData.profile_image || '',
        birthday: userData.birthday || '',
      }));

      await AsyncStorage.setItem('personalizationCompleted', 'true');

      router.push({
        pathname: '/(tabs)/oversigt',
        params: { userName: userData.full_name },
      });

    } catch (error) {
      console.error('❌ Login fejl:', error.message);
      Alert.alert('Login-fejl', error.message || 'Noget gik galt. Prøv igen.');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/baggrund-1.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.topContainer}>
            <Image
              source={require('../../assets/images/aldra_logo.png')}
              style={styles.logo}
            />
          </View>
          <View style={styles.centeredContentContainer}>
            <TextInput
              style={styles.emailInput}
              placeholder="Email"
              placeholderTextColor="#A9A9A9"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Adgangskode"
                placeholderTextColor="#A9A9A9"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#A9A9A9"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Log ind</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { /* Tilføj glemt adgangskode senere */ }}>
              <Text style={styles.forgotPassword}>Glemt adgangskode?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(70, 109, 82, 0.8)',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  topContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 250,
    height: 50,
    marginTop: 19,
  },
  emailInput: {
    width: '100%',
    height: 55,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 0.2,
    borderBottomColor: '#A9A9A9',
    paddingHorizontal: 15,
    color: '#000000',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  passwordInput: {
    width: '100%',
    height: 55,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 15,
    color: '#000000',
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  button: {
    backgroundColor: '#42865F',
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'RedHatDisplay_700Bold',
  },
  forgotPassword: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});