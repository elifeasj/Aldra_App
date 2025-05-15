import { Buffer } from 'buffer';
global.Buffer = Buffer;
import React from 'react';
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens();
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { useRouter } from 'expo-router';
import "expo-router/entry";
import Icon from 'react-native-vector-icons/Ionicons';


export default function IntroScreen() {
    const router = useRouter();

    return (
        <ImageBackground
            source={require('../assets/images/baggrund-1.png')} // Sørg for at stien er korrekt
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay} />
            <View style={styles.topContainer}>
                <Image
                    source={require('../assets/images/aldra_logo.png')} // Sørg for at stien er korrekt
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
                <TouchableOpacity onPress={() => router.push('/onboarding/login')}>
                    <Text style={{ color: '#ffff', textAlign: 'center', marginTop: 30, fontSize: 16, }}>Har du allerede en konto?{' '} <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline', fontSize: 16, }} onPress={() => router.push('/onboarding/login')}>Login</Text>
                    </Text>
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
        backgroundColor: 'rgba(70, 109, 82, 0.8)',
    },
    topContainer: {
        flex: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    contentContainer: {
        flex: 0,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        marginTop: 0,
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 50,
        paddingHorizontal: 20,
    },
    logo: {
        width: 250,
        height: 50,
        marginTop: 120,
    },
    title: {
        fontSize: 36,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 22,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#FFFFFF',
        marginBottom: 30,
        textAlign: 'left',
        paddingRight: 30,
        lineHeight: 27,
    },
    description: {
        fontSize: 20,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#FFFFFF',
        textAlign: 'left',
        lineHeight: 27,
    },
    button: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: '100%',
        alignSelf: 'center',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    buttonText: {
        color: '#42865F',
        fontSize: 18,
        fontFamily: 'RedHatDisplay_700Bold',
        flex: 1,
        textAlign: 'center',
        marginLeft: 24, // For at kompensere for ikonet og holde teksten i midten
    },
});
