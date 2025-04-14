import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { GuideCategory } from '../../components/guides/GuideCategory';
import { Guide, UserProfileAnswers } from '../../types/guides';
import supabase from '../../config/supabase';
import { API_URL, STRAPI_URL } from '../../config/api';

export default function Vejledning() {
    const router = useRouter();
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [userAnswers, setUserAnswers] = useState<UserProfileAnswers | null>(null);

    useEffect(() => {
        console.log('🔥 useEffect in vejledning.tsx kører');
        fetchUserAnswers();
    }, []);

    const fetchUserAnswers = async () => {
        try {
          const userDataString = await AsyncStorage.getItem('userData');
          if (!userDataString) {
            console.log('❌ userData not found in AsyncStorage');
            setLoading(false);
            return;
          }
      
          const userData = JSON.parse(userDataString);
          console.log('🔐 Loaded userData:', userData);
      
          const { data, error } = await supabase
            .from('user_profile_answers')
            .select('*')
            .eq('user_id', userData.id)
            .maybeSingle();
      
          if (error || !data) {
            console.warn('⚠️ No answers found');
            setLoading(false);
            return;
          }
      
          console.log('📋 Supabase answers:', data);
          setUserAnswers(data);
      
          // Hent matchende guides
          const response = await fetch(`${API_URL}/match-guides`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userData.id }),
          });

          // Kald backend for at få relevante guides:
          fetchMatchedGuides(userData.id);
        } catch (err) {
          console.error('❌ Error fetching user answers:', err);
          setLoading(false);
        }
      };

      const fetchMatchedGuides = async (userId: number) => {
        try {
          const response = await fetch(`${API_URL}/match-guides`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId }),
          });
      
          const result = await response.json();
      
          if (!response.ok) {
            console.error('❌ Failed to fetch matched guides:', result.error);
            return;
          }
      
          console.log('✅ Matchede guides:', result.guides);
          setGuides(result.guides);
        } catch (err) {
          console.error('❌ Fejl i fetchMatchedGuides:', err);
        } finally {
          setLoading(false);
        }
      };
      

    const handleGuidePress = (guide: Guide) => {
        router.push(`/guide/${guide.id}`);
    };

    const categorizedGuides = guides.reduce((acc, guide) => {
        if (!acc[guide.category]) {
            acc[guide.category] = [];
        }
        acc[guide.category].push(guide);
        return acc;
    }, {} as Record<string, Guide[]>);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#42865F" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Vejledning</Text>
                <Text style={styles.subtitle}>
                    Find vejledning og råd til at forstå demens og støtte din kære i hverdagen.
                </Text>

                {Object.entries(categorizedGuides).map(([category, categoryGuides]) => (
                    <GuideCategory
                        key={category}
                        title={category}
                        guides={categoryGuides}
                        onGuidePress={handleGuidePress}
                    />
                ))}
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
        flex: 1,
        paddingTop: 60,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#42865F',
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#333',
        lineHeight: 24,
        marginBottom: 32,
        paddingHorizontal: 20,
    },
});
