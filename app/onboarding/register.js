import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [relation, setRelation] = useState('');

    const registerUser = async () => {
        const userData = {
            name,
            email,
            password,
            relationToDementiaPerson: relation,
        };

        try {
            const response = await fetch('http://localhost:5001/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            console.log(data);
            router.push('/onboarding'); // Example navigation after successful registration
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmit = () => {
        registerUser(); // Send data to the backend
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Velkommen!</Text>
            <Text style={styles.subtitle}>Opret dig som ny bruger på Aldra og få adgang til personlig vejledning og ressourcer.</Text>

            <TextInput
                style={styles.input}
                placeholder="Indtast dit navn"
                value={name}
                onChangeText={(text) => setName(text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Indtast din e-mail"
                value={email}
                onChangeText={(text) => setEmail(text)}
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Indtast en adgangskode"
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry
            />

            <TextInput
                style={styles.input}
                placeholder="Relation til personen med demens"
                value={relation}
                onChangeText={(text) => setRelation(text)}
            />

            <View style={styles.checkboxContainer}>
                <Text style={styles.checkboxText}>Jeg har læst og accepterer vilkår og betingelser</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Opret ny bruger</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingBottom: 30, // Adds space at the bottom of the form
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#42865F', // Grøn farve
        marginTop: 40,
        marginBottom: 15,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 30,
        width: '80%', // Control width for text wrapping
    },
    input: {
        width: '100%',
        padding: 15,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        fontSize: 16,
        backgroundColor: '#f7f7f7',
        color: '#333',
    },
    checkboxContainer: {
        marginBottom: 30,
        width: '100%',
    },
    checkboxText: {
        color: '#555',
        fontSize: 14,
        textAlign: 'left',
    },
    button: {
        backgroundColor: '#42865F',  // Grøn knapfarve
        paddingVertical: 16,
        paddingHorizontal: 45,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
