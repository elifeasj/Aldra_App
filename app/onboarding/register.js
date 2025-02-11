import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, Pressable, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Register() {
    const router = useRouter();
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [relation, setRelation] = useState('');
    const [showRelationPicker, setShowRelationPicker] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [familyCode, setFamilyCode] = useState('');

    const relations = ["Ægtefælle/Partner", "Barn", "Søskende", "Forældre", "Andet"];

    // Check for family code in URL when component mounts
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('familyCode');
        if (code) {
            setFamilyCode(code);
        }
    }, []);

    const registerUser = async () => {
        if (!name || !email || !password || !relation || !termsAccepted) {
            alert('Alle felter skal udfyldes.');
            return;
        }

        const userData = {
            name,
            email,
            password,
            relationToDementiaPerson: relation,
            termsAccepted,
            familyCode: familyCode || undefined // Only include if present
        };

        try {
            // Gem brugerdata i AsyncStorage
            await AsyncStorage.setItem('userData', JSON.stringify({
                name,
                relationToDementiaPerson: relation
            }));

            console.log('Sending request to server with data:', userData);
            
            // Tjek om serveren er tilgængelig først
            try {
                const serverCheck = await fetch('http://192.168.0.215:5001/');
                if (!serverCheck.ok) {
                    throw new Error('Server ikke tilgængelig');
                }
            } catch (error) {
                console.error('Server connection error:', error);
                alert('Kunne ikke forbinde til serveren. Kontroller din internetforbindelse og prøv igen.');
                return;
            }

            const response = await fetch('http://192.168.0.215:5001/register', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            console.log('Server response status:', response.status);
            const responseText = await response.text();
            console.log('Server response:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (error) {
                console.error('Error parsing response:', error);
                throw new Error('Uventet svar fra serveren');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Registrering mislykkedes');
            }

            // Send brugernavnet med i navigationen
            router.push({
                pathname: '/(tabs)/oversigt',
                params: { userName: data.name }
            });
        } catch (error) {
            console.error('Error during registration:', error);
            if (error.message.includes('Network request failed')) {
                alert('Kunne ikke forbinde til serveren. Kontroller din internetforbindelse.');
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
