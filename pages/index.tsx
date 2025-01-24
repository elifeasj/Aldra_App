import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const IntroScreen = () => {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>aldra</Text>
            <Text style={styles.title}>Velkommen til Aldra</Text>
            <Text style={styles.subtitle}>
                – din støtte som pårørende til en person med demens
            </Text>
            <Text style={styles.description}>
                Lad os vise dig, hvordan Aldra kan gøre din hverdag lettere.
            </Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/onboardingScreen')}
            >
                <Text style={styles.buttonText}>Kom i gang</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#3E8E7E',
        padding: 20,
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        fontStyle: 'italic',
        color: '#FFFFFF',
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    button: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    buttonText: {
        color: '#3E8E7E',
        fontWeight: 'bold',
    },
});

export default IntroScreen;
