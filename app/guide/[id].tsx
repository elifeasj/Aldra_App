import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function GuideDetail() {
    const { title, content, image } = useLocalSearchParams();

    return (
        <ScrollView style={styles.container}>
            {typeof image === 'string' && image.length > 0 && (
                <Image
                    source={{ uri: image }}
                    style={styles.image}
                    resizeMode="cover"
                />
            )}
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.text}>{content}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: 250,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#333',
        marginBottom: 16,
    },
    text: {
        fontSize: 16,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#333',
        lineHeight: 24,
    },
});
