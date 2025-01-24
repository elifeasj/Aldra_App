import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RegisterScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Opret Bruger</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
    },
});
