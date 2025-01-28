import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Pressable, Modal } from 'react-native';
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
    const [showRelationPicker, setShowRelationPicker] = useState(false);

    const relations = ["Ægtefælle/Partner", "Barn", "Søskende", "Forældre", "Andet"];

    const registerUser = async () => {
        if (!name || !email || !password || (!relation && !customRelation) || !termsAccepted) {
            alert('Alle felter skal udfyldes.');
            return;
        }

        const userData = {
            name,
            email,
            password,
            relationToDementiaPerson: relation === 'Andet' ? customRelation : relation,
            termsAccepted,
        };

        try {
            console.log('Sending request to server with data:', userData);
            const response = await fetch('http://192.168.0.234:5001/register', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            navigation.navigate('oversigt', { userName: data.name });
        } catch (error) {
            console.error('Error during registration:', error);
            alert(error.message || 'Noget gik galt under registreringen');
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
                    onChangeText={setName}
                />

                <Text style={styles.label}>E-mail</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Indtast din e-mail"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />

                <Text style={styles.label}>Adgangskode</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Indtast en adgangskode"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Text style={styles.label}>Relation til personen med demens</Text>
                <View style={styles.dropdownContainer}>
                    <TouchableOpacity 
                        style={styles.dropdownButton}
                        onPress={() => setShowRelationPicker(!showRelationPicker)}
                    >
                        <Text style={styles.dropdownButtonText}>
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
                                        if (item !== "Andet") {
                                            setCustomRelation('');
                                        }
                                        setShowRelationPicker(false);
                                    }}
                                >
                                    <Text style={styles.dropdownItemText}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {relation === "Andet" && (
                    <TextInput
                        style={styles.input}
                        placeholder="Angiv relation"
                        value={customRelation}
                        onChangeText={setCustomRelation}
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
    dropdownContainer: {
        width: '100%',
        marginBottom: 20,
        zIndex: 1000,
    },
    dropdownButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#f7f7f7',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownButtonText: {
        fontSize: 16,
        color: '#333',
    },
    dropdownArrow: {
        fontSize: 16,
        color: '#666',
    },
    dropdownList: {
        position: 'absolute',
        top: 55,
        width: '100%',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
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
