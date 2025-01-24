import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function IntroScreen() {
    const router = useRouter();

    return (
        <ImageBackground
            source={require('../assets/images/baggrund-1.png')} // Baggrundsbilledet
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.container}>
                {/* Logo */}
                <Image
                    source={require('../assets/images/Aldra.svg')} // Din logo-fil
                    style={styles.logo}
                />
                {/* Velkomsttekst */}
                <Text style={styles.title}>Velkommen til Aldra</Text>
                <Text style={styles.subtitle}>
                    – din støtte som pårørende til en person med demens
                </Text>
                {/* Kom i gang-knap */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/onboarding')}
                >
                    <Text style={styles.buttonText}>Kom i gang</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(70, 109, 82, 0.6)', // Valgfri overlay for baggrunden
    },
    logo: {
        width: 100, // Logoets bredde
        height: 100, // Logoets højde
        marginBottom: 20, // Giver afstand til teksten
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
