import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, ImageBackground, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { STRAPI_URL } from '../config/api';
import { Ionicons } from '@expo/vector-icons';

interface FAQ {
  id: number;
  attributes: {
    question: string;
    answer: string;
  };
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
        const res = await fetch(`${STRAPI_URL}/api/faqs`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch FAQs');
        }
        
        const json = await res.json();
        
        if (json.data && Array.isArray(json.data)) {
          setFaqs(json.data);
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

  // Banner image - using a static image for the FAQ page
  const bannerImage = 'https://aldra-cms.up.railway.app/uploads/elderly_smiling.jpg';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Custom Header */}
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
            {/* Banner Image with Title */}
            <ImageBackground 
              source={{ uri: bannerImage }} 
              style={styles.bannerImage}
              imageStyle={styles.bannerImageStyle}
            >
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>Ofte stillede spørgsmål</Text>
              </View>
            </ImageBackground>
            
            {/* FAQ Content */}
            <View style={styles.faqContent}>
              <Text style={styles.sectionHeader}>Spørgsmål & Svar</Text>
              <Text style={styles.introText}>
                Få svar på de mest stillede spørgsmål om Aldra, funktionerne og din adgang.
              </Text>
              
              {/* FAQ List */}
              <View style={styles.faqList}>
                {faqs.map((faq, index) => (
                  <View key={faq.id} style={styles.faqItem}>
                    <Text style={styles.question}>
                      {index + 1}. {faq.attributes.question}
                    </Text>
                    <Text style={styles.answer}>
                      {faq.attributes.answer}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
    fontSize: 20,
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
    paddingBottom: 40,
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
    fontSize: 18,
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  bannerTitle: {
    fontSize: 28,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#FFFFFF',
  },
  faqContent: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 22,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#42865F',
    marginBottom: 12,
  },
  introText: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#555555',
    marginBottom: 24,
    lineHeight: 22,
  },
  faqList: {
    marginTop: 8,
  },
  faqItem: {
    marginBottom: 24,
  },
  question: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#42865F',
    marginBottom: 8,
  },
  answer: {
    fontSize: 17,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333333',
    lineHeight: 24,
  },
});
