import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { GuideCategory } from '../../components/guides/GuideCategory';
import { Guide, UserProfileAnswers } from '../../types/guides';
import supabase from '../../config/supabase';
import { STRAPI_URL } from '../../config/api';
import { mapGuideData } from '../../utils/guideUtils';

export default function Vejledning() {
    const router = useRouter();
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userAnswers, setUserAnswers] = useState<UserProfileAnswers | null>(null);

    useEffect(() => {
        fetchUserAnswers();
    }, []);

    const fetchUserAnswers = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('userData');
            if (!userDataString) {
                console.log('❌ userData not found in AsyncStorage');
                fetchGuides(null); // ➔ hent alle guides
                return;
            }

            const userData = JSON.parse(userDataString);
            console.log('🔐 Loaded userData:', userData);

            const { data, error } = await supabase
                .from('user_profile_answers')
                .select('*')
                .eq('user_id', userData.id)
                .maybeSingle();

            if (error) {
                console.warn('⚠️ No answers found:', error);
                fetchGuides(null); // ➔ hent alle guides
                return;
            }

            console.log('📋 Supabase answers:', data);
            setUserAnswers(data);
            fetchGuides(data); // ➔ hent guides og filtrér
        } catch (err) {
            console.error('❌ Error fetching user answers:', err);
            setError('Failed to fetch user answers');
            setLoading(false);
        }
    };

    const fetchGuides = async (answers: UserProfileAnswers | null) => {
      try {
        const res = await fetch(`${STRAPI_URL}/api/guides?filters[visible][$eq]=true&populate=*`);
        const json = await res.json();
    
        if (!res.ok) {
          console.error('❌ Failed to fetch guides:', json);
          setError('Failed to fetch guides');
          return;
        }
    
        console.log('🛠️ RAW guides from Strapi:', JSON.stringify(json.data, null, 2));
    
        const rawGuides = json.data.map(mapGuideData);
        console.log('✅ Mapped guides:', rawGuides);
    
        if (answers) {
          const filtered = filterGuides(rawGuides, answers);
          setGuides(filtered);
        } else {
          setGuides(rawGuides);
        }
      } catch (err: any) {
        console.error('❌ Error fetching guides:', err);
        setError(`Failed to fetch guides: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    const filterGuides = (guides: Guide[], answers: UserProfileAnswers) => {
      const userChallenges = answers.main_challenges || [];
      const userHelpNeeds = answers.help_needs || [];
    
      console.log('🧩 Brugers udfordringer:', userChallenges);
      console.log('🧩 Brugers hjælpebehov:', userHelpNeeds);
    
      const matchedGuides = guides.filter(guide => {
        const guideTags = guide.tags || [];
        const guideHelpTags = guide.help_tags || [];
    
        const hasChallengeMatch = guideTags.some(tag => userChallenges.includes(tag));
        const hasHelpNeedMatch = guideHelpTags.some(tag => userHelpNeeds.includes(tag));
    
        return hasChallengeMatch || hasHelpNeedMatch;
      });
    
      if (matchedGuides.length === 0) {
        console.log('⚠️ Ingen guides matcher - viser ALLE guides som fallback');
        return guides; // fallback til alle guides
      }
    
      console.log('✅ Antal matchende guides:', matchedGuides.length);
      return matchedGuides;
    };

    const handleGuidePress = (guide: Guide) => {
      router.push({
        pathname: `/guide/[id]`,
        params: {
          id: String(guide.id),
          title: guide.title,
          content: JSON.stringify(guide.content),
          image: guide.image,
          category: guide.category,
          slug: guide.slug,
        },
      });
    };

    const categorizedGuides = guides.reduce((acc, guide) => {
        const category = guide.category || 'Ukategoriseret';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(guide);
        return acc;
    }, {} as Record<string, Guide[]>);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#42865F" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
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
        paddingTop: 90,
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
    title: {
        fontSize: 36,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#42865F',
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    subtitle: {
        fontSize: 19,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#000000',
        lineHeight: 28,
        marginBottom: 32,
        paddingHorizontal: 20,
    },
});
