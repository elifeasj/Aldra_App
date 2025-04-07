import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { endpoints } from '../../config';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        try {
            const response = await fetch(endpoints.login, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
    
            const responseText = await response.text(); // Hent svaret som tekst først
            console.log('Server response:', responseText); // Debugging
    
            let data;
            try {
                data = JSON.parse(responseText); // Prøv at parse JSON
            } catch (error) {
                console.error('JSON Parse Error:', error, 'Response:', responseText);
                throw new Error('Ugyldigt svar fra serveren');
            }
    
            if (response.ok) {
                console.log('Server response data:', data);
                console.log('Profile image from server:', data.profile_image);
                console.log('Profile image type:', typeof data.profile_image);

                // Create a token from user ID since server doesn't provide one
                const token = `user_${data.id}`;
                console.log('Created token:', token);

                // Save token in AsyncStorage
                await AsyncStorage.setItem('token', token);
                console.log('Token saved to AsyncStorage');

                const userData = {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    relationToDementiaPerson: data.relationToDementiaPerson,
                    profileImage: data.profile_image, // Local URL from Render
                    supabaseImage: data.supabase_image, // Backup URL from Supabase
                    birthday: data.birthday, // Add birthday
                    token: token // Save the authentication token
                };
                
                console.log('Server data:', data);
                console.log('Saving user data:', userData);
                console.log('Profile image being saved:', userData.profileImage);
                
                console.log('Gemmer brugerdata:', userData);
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
                
                router.push({
                    pathname: '/(tabs)/oversigt',
                    params: { userName: data.name }
                });
            } else {
                Alert.alert('Login Fejl', data.error || 'Forkert email eller adgangskode');
            }
        } catch (error) {
            console.error('Fejl under login:', error);
            Alert.alert('Fejl', error.message || 'Noget gik galt. Prøv venligst igen.');
        }
    };
    

    return (
        <ImageBackground
            source={require('../../assets/images/baggrund-1.png')} // Sørg for at stien er korrekt
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
                            source={require('../../assets/images/aldra_logo.png')} // Sørg for at stien er korrekt
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
                        />
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Adgangskode"
                                placeholderTextColor="#A9A9A9"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
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
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleLogin}
                        >
                            <Text style={styles.buttonText}>Log ind</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { /* Glemt adgangskode logik */ }}>
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