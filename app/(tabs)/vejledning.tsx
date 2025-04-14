import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { GuideCategory } from '../../components/guides/GuideCategory';
import { Guide, UserProfileAnswers } from '../../types/guides';
import { STRAPI_URL } from '../../config/api';

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
            setLoading(false); // 🛠 tilføj denne linje!
            return;
          }
          
          const userData = JSON.parse(userDataString);
          console.log('🔐 Loaded userData:', userData);
      
          const response = await fetch(`${STRAPI_URL}/user-profile-answers/${userData.id}`);
          if (!response.ok) throw new Error('Failed to fetch user answers');
      
          const answers = await response.json();
          console.log('📋 Fetched user answers:', answers);
      
          setUserAnswers(answers);
          fetchGuides(answers);
        } catch (error) {
          console.error('❌ Error fetching user answers:', error);
          setLoading(false); // <== vigtigt!
        }
      };

    const fetchGuides = async (answers: UserProfileAnswers) => {
        console.log('📡 Fetching guides with filters:', answers);
        try {
            const relation = answers.relation_to_person;
            const tags = answers.main_challenges.map(tag => `filters[tags][$in]=${encodeURIComponent(tag)}`).join('&');
            const helpTags = answers.help_needs.map(tag => `filters[help_tags][$in]=${encodeURIComponent(tag)}`).join('&');
            const visible = 'filters[visible][$eq]=true';
    
            const queryString = `${tags}&${helpTags}&${visible}&filters[relation][$eq]=${encodeURIComponent(relation)}&populate=*`;
    
            const response = await fetch(`${STRAPI_URL}/guides?${queryString}`);
            if (!response.ok) throw new Error('Failed to fetch guides');
    
            const guidesData = await response.json();
            const formattedGuides = guidesData.data.map((item: any) => ({
                id: item.id,
                ...item.attributes,
            }));

            console.log("Query:", queryString);
            console.log("Fetched guides:", formattedGuides);
    
            setGuides(formattedGuides);
        } catch (error) {
            console.error('Error fetching guides:', error);
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
