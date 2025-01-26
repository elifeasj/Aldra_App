import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

export default function Register() {
    const router = useRouter();
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [relation, setRelation] = useState('');
    const [customRelation, setCustomRelation] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const relations = ["Ægtefælle/Partner", "Barn", "Søskende", "Forældre", "Andet"];

    const registerUser = async () => {
        if (!termsAccepted) {
            alert('Du skal acceptere vilkår og betingelser for at fortsætte.');
            return;
        }

        const userData = {
            name,
            email,
            password,
            relationToDementiaPerson: relation || customRelation,
            termsAccepted,
        };

        try {
            const response = await fetch('http://localhost:5001/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Registration failed:', errorText);
                alert(`Registration failed: ${errorText}`);
                return;
            }

            const data = await response.json();
            navigation.navigate('oversigt', { userName: data.name });
        } catch (error) {
            console.error('Network request failed:', error);
            alert(`Network request failed: ${error.message}`);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.logo}>aldra</Text>
                <Text style={styles.title}>Velkommen!</Text>
                <Text style={styles.subtitle}>
                    Opret dig som ny bruger på Aldra og få adgang til personlig vejledning og ressourcer.
                </Text>

                <Text style={styles.label}>Navn</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Indtast dit navn"
                    value={name}
                    onChangeText={(text) => setName(text)}
                />

                <Text style={styles.label}>E-mail</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Indtast din e-mail"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                    keyboardType="email-address"
                />

                <Text style={styles.label}>Adgangkode</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Indtast en adgangskode"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    secureTextEntry
                />

                <Text style={styles.label}>Relation til personen med demens</Text>
                <View style={styles.dropdownWrapper}>
                    <SelectDropdown
                        data={relations}
                        defaultButtonText="Vælg relation"
                        onSelect={(selectedItem) => {
                            setRelation(selectedItem);
                            if (selectedItem !== "Andet") {
                                setCustomRelation('');
                            }
                        }}
                        buttonStyle={styles.dropdownButton}
                        buttonTextStyle={styles.dropdownButtonText}
                        dropdownStyle={styles.dropdownStyle}
                        rowTextStyle={styles.dropdownRowText}
                    />
                </View>

                {relation === 'Andet' && (
                    <TextInput
                        style={styles.input}
                        placeholder="Indtast din relation"
                        value={customRelation}
                        onChangeText={(text) => setCustomRelation(text)}
                    />
                )}

                <View style={styles.checkboxContainer}>
                    <Pressable
                        onPress={() => setTermsAccepted(!termsAccepted)}
                        style={[
                            styles.checkbox,
                            termsAccepted && styles.checkboxChecked,
                        ]}
                    >
                        {termsAccepted && <Text style={styles.checkboxText}>✔</Text>}
                    </Pressable>
                    <Text style={styles.checkboxLabel}>
                        Jeg har læst og accepterer vilkår og betingelser
                    </Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={registerUser}>
                    <Text style={styles.buttonText}>Opret ny bruger</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        zIndex: 0, // Sørger for, at dropdown ikke bliver skjult
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 30,
        justifyContent: 'flex-start',
        backgroundColor: '#ffffff',
    },
    logo: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#42865F',
        marginBottom: 30,
        textAlign: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#42865F',
        marginBottom: 15,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        fontSize: 16,
        backgroundColor: '#f7f7f7',
        color: '#333',
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    dropdownWrapper: {
        width: '100%',
        zIndex: 1000, // Sikrer, at dropdown vises korrekt
    },
    dropdownButton: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        marginBottom: 20,
        backgroundColor: '#f7f7f7',
    },
    dropdownButtonText: {
        fontSize: 16,
        color: '#333',
    },
    dropdownStyle: {
        borderRadius: 10,
        zIndex: 1000, // Forhindrer dropdown i at blive skjult
    },
    dropdownRowText: {
        fontSize: 16,
        color: '#555',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: '#42865F',
        borderColor: '#42865F',
    },
    checkboxText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#555',
    },
    button: {
        backgroundColor: '#42865F',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
