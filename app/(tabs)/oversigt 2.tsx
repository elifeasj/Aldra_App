import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Oversigt() {
    const params = useLocalSearchParams();
    const userName = (params.userName as string) || 'Bruger';

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Hej, {userName}!</Text>
            <Text style={styles.subtitle}>Din oversigt</Text>

            <View style={styles.cardContainer}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Familie</Text>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Opret Aldra-link</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Minder</Text>
                    <Text>5 minder tilføjet</Text>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Tilføj nyt minde</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Færdiggør din profil</Text>
                <Text>Udfyld din profil for at tilpasse appen til dine behov.</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#ffffff',
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
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    card: {
        flex: 1,
        padding: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#f7f7f7',
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#42865F',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    visits: {
        marginTop: 20,
    },
    visit: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f7f7f7',
        borderRadius: 8,
        marginBottom: 10,
    },
    logButton: {
        backgroundColor: '#42865F',
        padding: 8,
        borderRadius: 8,
    },
    logButtonText: {
        color: '#ffffff',
        fontSize: 14,
    },
});