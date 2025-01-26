import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function Oversigt() {
    const route = useRoute();
    const { userName } = (route.params && route.params.userName) ? route.params : { userName: 'Bruger' }; // Standard hvis data mangler

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Hej, {userName}!</Text>
            <Text style={styles.subtitle}>Din oversigt</Text>

            {/* Oversigtskort */}
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
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Færdiggør profil</Text>
                </TouchableOpacity>
            </View>

            {/* Kommende besøg */}
            <View style={styles.visits}>
                <Text style={styles.subtitle}>Kommende besøg</Text>
                <View style={styles.visit}>
                    <Text>Besøg mor</Text>
                    <Text>22. november 2024</Text>
                    <TouchableOpacity style={styles.logButton}>
                        <Text style={styles.logButtonText}>Tilføj log</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.visit}>
                    <Text>Snak med overlæge</Text>
                    <Text>29. november 2024</Text>
                    <TouchableOpacity style={styles.logButton}>
                        <Text style={styles.logButtonText}>Tilføj log</Text>
                    </TouchableOpacity>
                </View>
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
        fontSize: 32,
        fontWeight: 'bold',
        color: '#42865F',
    },
    subtitle: {
        fontSize: 18,
        color: '#555',
        marginVertical: 10,
    },
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    card: {
        flex: 1,
        backgroundColor: '#e0f5e9',
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#42865F',
        marginBottom: 10,
    },
    button: {
        marginTop: 10,
        backgroundColor: '#42865F',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
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
