import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function Minder() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Minder</Text>
                <Text style={styles.text}>
                    Her kan du gemme dine minder og oplevelser med din kære.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
        paddingTop: 60,
        marginTop: 35, 
    },
    title: {
        fontSize: 32,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#42865F',
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#333',
        lineHeight: 24,
    },
});
