import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

export default function IntroScreen() {
    const router = useRouter();

    return (
        <ImageBackground
            source={require('../assets/images/baggrund-1.png')} // Baggrundsbilledet
            style={styles.background}
            resizeMode="cover"
        >

            <View style={styles.overlay} />

            <View style={styles.topContainer}>
                <Image
                    source={require('../assets/images/aldra_logo.png')} // Logo
                    style={styles.logo}
                />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>Velkommen til Aldra</Text>
                <Text style={styles.subtitle}>
                    – din støtte som pårørende til en person med demens
                </Text>
                <Text style={styles.description}>
                    Lad os vise dig, hvordan Aldra kan gøre din hverdag lettere.
                </Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/onboarding/onboarding_1')}
                    >
                    <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Kom i gang</Text>
                    <Icon name="chevron-forward-outline" size={25} color="#42865F" />
                    </View>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(70, 109, 82, 0.6)',
    },
    topContainer: {
        flex: 1.5, // Mindsket flex for mindre afstand
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10, // Mindsket afstand mellem logo og tekst
    },
    contentContainer: {
        flex: 0, // Mindsket flex for tættere layout
        justifyContent: 'flex-start',
        alignItems: 'flex-start', 
        paddingHorizontal: 20,
        marginTop: 0, // Flytter teksten tættere på logoet
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 50,
        paddingHorizontal: 20,
    },
    logo: {
        width: 250, // Logoets bredde
        height: 50, // Logoets højde
        marginTop: 120,
    },
    title: {
        fontSize: 36, 
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 30,
        textAlign: 'left',
        paddingRight: 30,
        lineHeight: 27,
    },
    description: {
        fontSize: 20,
        color: '#FFFFFF',
        textAlign: 'left',
        lineHeight: 27,
    },

    button: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        borderRadius: 8,
        width: '100%',
        alignSelf: 'center',
    },
    
    buttonContent: {
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
    },
    
    buttonText: {
        color: '#3E8E7E',
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center', 
    },

    buttonIcon: {
        width: 16, 
        height: 16,
    },
});
