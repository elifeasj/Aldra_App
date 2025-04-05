import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, Pressable, SafeAreaView, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { endpoints } from '../../config';
import { Ionicons } from '@expo/vector-icons';

export default function Register() {
    const router = useRouter();
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [relation, setRelation] = useState('');
    const [showRelationPicker, setShowRelationPicker] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isAldraLink, setIsAldraLink] = useState(false);
    const [aldraCode, setAldraCode] = useState('');
    const [isValidatingCode, setIsValidatingCode] = useState(false);
    const [isValidCode, setIsValidCode] = useState(false);

    const relations = ["Ægtefælle/Partner", "Barn", "Søskende", "Forældre", "Andet"];

    // Check for Aldra link code from navigation params when component mounts
    useEffect(() => {
        const checkForAldraCode = async () => {
            const code = router.params?.aldraCode;
            if (code) {
                setIsAldraLink(true);
                setAldraCode(code);
                await validateAldraCode(code);
            }
        };
        
        checkForAldraCode();
    }, [router.params?.aldraCode]);

    // Validate Aldra code
    const validateAldraCode = async (code) => {
        setIsValidatingCode(true);
        try {
            const response = await fetch(`${endpoints.checkServer}/aldra-link/validate/${code}`);
            const data = await response.json();
            
            if (response.ok && data.valid) {
                setIsValidCode(true);
                // Pre-fill relation if provided in the Aldra link data
                if (data.relation) {
                    setRelation(data.relation);
                }
            } else {
                alert('Ugyldigt Aldra-link. Prøv igen eller registrer dig uden link.');
                setIsAldraLink(false);
                setAldraCode('');
                setIsValidCode(false);
            }
        } catch (error) {
            console.error('Error validating Aldra code:', error);
            alert('Kunne ikke validere Aldra-link. Prøv igen senere.');
            setIsAldraLink(false);
            setAldraCode('');
            setIsValidCode(false);
        } finally {
            setIsValidatingCode(false);
        }
    };

    const registerUser = async () => {
        if (!name || !email || !password || !relation || !termsAccepted) {
            alert('Alle felter skal udfyldes.');
            return;
        }

        // Create base user data
        const userData = {
            name,
            email,
            password,
            relationToDementiaPerson: relation,
            termsAccepted
        };

        // Add Aldra code if registering via Aldra link
        if (isAldraLink && aldraCode) {
            userData.aldraCode = aldraCode;
        }

        try {
            // Gem brugerdata i AsyncStorage
            await AsyncStorage.setItem('userData', JSON.stringify({
                name,
                relationToDementiaPerson: relation
            }));

            console.log('Sending request to server with data:', userData);
            
            console.log('Attempting to connect to:', endpoints.register);
            
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            };

            console.log('Request options:', requestOptions);

            const response = await fetch(endpoints.register, requestOptions);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error response:', errorText);
                throw new Error(`Server fejl: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Registration successful:', data);

            // Store user data in AsyncStorage
            await AsyncStorage.setItem('userData', JSON.stringify({
                id: data.id,
                name: data.name,
                email: data.email,
                relationToDementiaPerson: data.relationToDementiaPerson,
                familyId: data.familyId
            }));

            // Navigate to overview
            router.push('/(tabs)/oversigt');
        } catch (error) {
            console.error('Detailed error:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            
            if (error.message.includes('Network request failed')) {
                alert('Netværksfejl: Kunne ikke forbinde til serveren. Kontroller at:\n\n1. Din enhed er forbundet til internettet\n2. Du er på samme netværk som serveren\n3. Serveren kører på ' + endpoints.register);
            } else {
                alert('Der opstod en fejl under registreringen: ' + error.message);
            }
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior="position" 
            style={{ flex: 1 }}
            contentContainerStyle={{ flex: 1 }}
            keyboardVerticalOffset={-200}
            enabled
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.headerContainer}>
                    <Image
                        source={require('../../assets/images/aldra_logo.png')}
                        style={styles.logo}
                    />
                </View>
                <View style={styles.contentContainer}>
                    <ScrollView style={styles.scrollView}>
                        {isAldraLink && (
                            <View style={styles.aldraLinkContainer}>
                                <View style={styles.aldraLinkHeader}>
                                    <Ionicons name="link" size={24} color="#42865F" />
                                    <Text style={styles.aldraLinkTitle}>Aldra-link Registration</Text>
                                </View>
                                {isValidatingCode ? (
                                    <ActivityIndicator color="#42865F" />
                                ) : isValidCode ? (
                                    <View style={styles.validCodeContainer}>
                                        <Ionicons name="checkmark-circle" size={24} color="#42865F" />
                                        <Text style={styles.validCodeText}>Gyldigt Aldra-link</Text>
                                    </View>
                                ) : (
                                    <View style={styles.invalidCodeContainer}>
                                        <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
                                        <Text style={styles.invalidCodeText}>Ugyldigt Aldra-link</Text>
                                    </View>
                                )}
                            </View>
                        )}
                        <Text style={styles.title}>Velkommen!</Text>
                        <Text style={styles.subtitle}>
                            Opret dig som ny bruger på Aldra og få adgang{'\n'}til personlig vejledning og ressourcer.
                        </Text>

                        <Text style={styles.label}>Navn</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Indtast dit navn"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="#666"
                        />

                        <Text style={styles.label}>E-mail</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Indtast din e-mail"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            placeholderTextColor="#666"
                        />

                        <Text style={styles.label}>Adgangskode</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Indtast en adgangskode"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#666"
                        />

                        <Text style={styles.label}>Relation til personen med demens</Text>
                        <TouchableOpacity 
                            style={styles.dropdownButton}
                            onPress={() => setShowRelationPicker(!showRelationPicker)}
                        >
                            <Text style={[styles.dropdownButtonText, !relation && styles.placeholder]}>
                                {relation || "Vælg relation"}
                            </Text>
                            <Text style={styles.dropdownArrow}>{showRelationPicker ? '▲' : '▼'}</Text>
                        </TouchableOpacity>
                        
                        {showRelationPicker && (
                            <View style={styles.dropdownList}>
                                {relations.map((item) => (
                                    <TouchableOpacity
                                        key={item}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setRelation(item);
                                            setShowRelationPicker(false);
                                        }}
                                    >
                                        <Text style={styles.dropdownItemText}>{item}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <View style={styles.termsContainer}>
                            <Pressable
                                onPress={() => setTermsAccepted(!termsAccepted)}
                                style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}
                            >
                                {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
                            </Pressable>
                            <Text style={styles.termsText}>
                                Jeg har læst og accepterer vilkår og betingelser
                            </Text>
                        </View>

                        <TouchableOpacity 
                            style={styles.button} 
                            onPress={registerUser}
                        >
                            <Text style={styles.buttonText}>Opret ny bruger</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    aldraLinkContainer: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    aldraLinkHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    aldraLinkTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#42865F',
        marginLeft: 10,
    },
    validCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 10,
        borderRadius: 5,
    },
    validCodeText: {
        marginLeft: 10,
        color: '#42865F',
        fontWeight: '500',
    },
    invalidCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE8E8',
        padding: 10,
        borderRadius: 5,
    },
    invalidCodeText: {
        marginLeft: 10,
        color: '#FF6B6B',
        fontWeight: '500',
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#42865F',
    },
    headerContainer: {
        backgroundColor: '#42865F',
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 30,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        paddingBottom: 0,
        marginBottom: -50,
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    logo: {
        width: 150,
        height: 40,
        marginTop: 0,
    },
    title: {
        fontSize: 38,
        fontFamily: 'RedHatDisplay_700Bold',
        marginBottom: 10,
        marginTop: 15,
        color: '#42865F',
    },
    subtitle: {
        fontSize: 18,
        color: '#333',
        marginBottom: 20,
        lineHeight: 27,
        fontFamily: 'RedHatDisplay_400Regular',
    },
    label: {
        fontSize: 18,
        marginBottom: 8,
        color: '#000',
        fontFamily: 'RedHatDisplay_500Medium',
    },
    input: {
        width: '100%',
        height: 48,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: '#fff',
        fontFamily: 'RedHatDisplay_400Regular',
    },
    dropdownButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginBottom: 20,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownButtonText: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'RedHatDisplay_400Regular',
    },
    dropdownList: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        marginTop: -20,
        marginBottom: 20,
        zIndex: 1000,
        elevation: 5,
    },
    dropdownItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#000',
        fontFamily: 'RedHatDisplay_400Regular',
    },
    dropdownArrow: {
        fontSize: 16,
        color: '#666',
    },
    placeholder: {
        color: '#666',
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: '#42865F',
        borderRadius: 4,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#42865F',
    },
    checkmark: {
        color: '#fff',
        fontSize: 16,
    },
    termsText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
        fontFamily: 'RedHatDisplay_400Regular',
    },
    button: {
        backgroundColor: '#42865F',
        borderRadius: 8,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'RedHatDisplay_700Bold',
    },
});
