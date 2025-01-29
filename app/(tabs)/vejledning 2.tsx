import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Vejledning() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vejledning</Text>
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