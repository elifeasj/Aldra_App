import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Oversigt() {
    const { userName } = useLocalSearchParams();
    const displayName = userName || 'Bruger';

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Hej, {displayName}!</Text>
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
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#42865F',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 20,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#333',
        marginBottom: 30,
    },
    cardContainer: {
        gap: 20,
    },
    card: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 20,
    },
    cardTitle: {
        fontSize: 20,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#42865F',
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#42865F',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'RedHatDisplay_700Bold',
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
