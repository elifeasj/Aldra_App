import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import './firebase';

const IntroScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.logo}>aldra</Text>
            <View style={styles.content}>
                <Text style={styles.title}>Velkommen til Aldra</Text>
                <Text style={styles.subtitle}>
                    – din støtte som pårørende til en person med demens
                </Text>
                <Text style={styles.description}>
                    Lad os vise dig, hvordan Aldra kan gøre din hverdag lettere.
                </Text>
            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('NextScreen')} // Navigerer til næste skærm
            >
                <Text style={styles.buttonText}>Kom i gang</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3E8E7E', // Baggrundsfarve (grøn)
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 50,
    },
    content: {
        alignItems: 'center',
        marginBottom: 30,
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
        lineHeight: 22,
    },
    button: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginBottom: 40,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3E8E7E',
    },
});

export default IntroScreen;
