import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { STRAPI_URL } from '../config/api';
import { Ionicons } from '@expo/vector-icons';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  image: string | null;
}

export default function FAQPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${STRAPI_URL}/api/faqs?populate=*`);

        if (!res.ok) {
          throw new Error('Failed to fetch FAQs');
        }

        const json = await res.json();

        if (json.data && Array.isArray(json.data)) {
          const mappedFaqs = json.data.map((item: any) => ({
            id: item.id,
            question: item.question,
            answer: item.answer,
            image: item.image && item.image.length > 0 ? item.image[0].url : null,
          }));

          setFaqs(mappedFaqs);
        } else {
          setError('No FAQs found');
        }
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError('Could not load FAQs');
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const bannerImage = faqs.length > 0 && faqs[0].image
  ? faqs[0].image
  : '../images/aldra_logo.png';


  const extractText = (content: any) => {
    if (Array.isArray(content)) {
      return content.map(block => block.children?.[0]?.text || '').join('\n\n');
    }
    return typeof content === 'string' ? content : '';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar backgroundColor="#42865F" barStyle="light-content" />
      <SafeAreaView style={{ backgroundColor: '#42865F' }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.backButton}>
              <Ionicons 
                name="chevron-back" 
                size={28} 
                color="#FFFFFF" 
                onPress={() => router.back()}
              />
            </View>
            <Text style={styles.headerTitle}>FAQ</Text>
            <View style={styles.placeholder} />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#42865F" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <ImageBackground 
              source={{ uri: bannerImage }} 
              style={styles.bannerImage}
              imageStyle={styles.bannerImageStyle}
            >
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>Ofte stillede spørgsmål</Text>
              </View>
            </ImageBackground>

            <View style={styles.faqContent}>
              <Text style={styles.sectionHeader}>Velkommen til Aldra</Text>
              <Text style={styles.introText}>
                Her finder du svar på de mest stillede spørgsmål om Aldra, funktionerne og din adgang.
              </Text>

              <View style={styles.faqList}>
                {faqs.map((faq, index) => (
                  <View key={faq.id} style={styles.faqItem}>
                    <Text style={styles.question}>
                      {index + 1}. {extractText(faq.question)}
                    </Text>
                    <Text style={styles.answer}>
                      {extractText(faq.answer)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#42865F',
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    color: '#FF6B6B',
    fontFamily: 'RedHatDisplay_500Medium',
    textAlign: 'center',
  },
  bannerImage: {
    width: '100%',
    height: 200,
  },
  bannerImageStyle: {
    resizeMode: 'cover',
  },
  bannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(66, 134, 95, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bannerTitle: {
    fontSize: 28,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#FFFFFF',
  },
  faqContent: {
    padding: 20,
    paddingTop: 50,
  },
  sectionHeader: {
    fontSize: 26,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#42865F',
    marginBottom: 12,
  },
  introText: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#555555',
    marginBottom: 24,
    lineHeight: 30,
  },
  faqList: {
    marginTop: 8,
  },
  faqItem: {
    marginBottom: 40,
  },
  question: {
    fontSize: 22,
    lineHeight: 34,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#42865F',
    marginBottom: 12,
  },
  answer: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333333',
    lineHeight: 32,
  },
});