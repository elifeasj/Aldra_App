import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Minder() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Minder</Text>
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