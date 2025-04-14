import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Guide } from '../../types/guides';
import { STRAPI_URL } from '../../config/api';
import { mapGuideData } from '../../utils/guideUtils';

export default function GuideDetail() {
    const { id } = useLocalSearchParams();
    const [guide, setGuide] = useState<Guide | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGuide();
    }, [id]);

    const fetchGuide = async () => {
        try {
            const response = await fetch(`${STRAPI_URL}/guides/${id}?populate=*`);
            if (!response.ok) throw new Error('Failed to fetch guide');
    
            const result = await response.json();
            const formatted = mapGuideData({
                id: result.data.id,
                ...result.data.attributes,
            });
    
            setGuide(formatted);
        } catch (error) {
            console.error('Error fetching guide:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#42865F" />
            </View>
        );
    }

    if (!guide) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Guide ikke fundet</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Image 
                source={{ uri: guide.image }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <Text style={styles.title}>{guide.title}</Text>
                <Text style={styles.text}>{guide.content}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorText: {
        fontSize: 18,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#333',
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
