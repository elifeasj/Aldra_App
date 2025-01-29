import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Kalender() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Kalender</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#42865F',
    },
});