import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const OnboardingScreen = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        { title: 'Velkommen', description: 'Intro til appen.' },
        { title: 'Funktion 1', description: 'Beskrivelse af funktion 1.' },
        { title: 'Funktion 2', description: 'Beskrivelse af funktion 2.' },
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Når onboarding er færdig, naviger til register
            router.push('/register');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{steps[currentStep].title}</Text>
            <Text style={styles.description}>{steps[currentStep].description}</Text>
            <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>
                    {currentStep === steps.length - 1 ? 'Afslut' : 'Næste'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold' },
    description: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
    button: { padding: 10, backgroundColor: '#007BFF', borderRadius: 5 },
    buttonText: { color: 'white', fontWeight: 'bold' },
});

export default OnboardingScreen;
