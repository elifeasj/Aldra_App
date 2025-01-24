import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OnboardingScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Onboarding-skærm</Text>
            <Text style={styles.description}>
                Her vil du vise onboarding-trinene.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
});

export default OnboardingScreen;
