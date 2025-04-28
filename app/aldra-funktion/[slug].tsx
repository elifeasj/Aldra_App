import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { STRAPI_URL } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

interface AldraFunction {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  full_description?: any;
  image?: {
    url: string;
  }[];
}

export default function FunctionDetailPage() {
  const { slug } = useLocalSearchParams();
  const [functionData, setFunctionData] = useState<AldraFunction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchFunctionData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${STRAPI_URL}/api/functions?filters[slug][$eq]=${slug}&populate=*`);
        if (!res.ok) {
          throw new Error('Failed to fetch function data');
        }
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setFunctionData(json.data[0]);
        } else {
          setError('Function not found');
        }
      } catch (err) {
        console.error('Error fetching function data:', err);
        setError('Could not load the function information');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchFunctionData();
    }
  }, [slug]);

  const imageUrl = functionData?.image && Array.isArray(functionData.image) && functionData.image.length > 0
    ? functionData.image[0].url
    : null;

  const renderFormattedDescription = (text: string) => {
    if (!text) return null;

    const paragraphs = text.split('\n\n');
    return paragraphs.map((paragraph, index) => {
      const isHeading = paragraph.trim().endsWith(':');
      return (
        <Text
          key={index}
          style={isHeading ? styles.headingText : styles.paragraphText}
        >
          {paragraph.trim()}
        </Text>
      );
    });
  };

  const fullDescription = typeof functionData?.full_description === 'string'
    ? functionData.full_description
    : '';

    const renderRichText = (blocks: any[]) => {
      if (!blocks || !Array.isArray(blocks)) return null;
    
      return blocks.map((block, index) => {
        const text = block.children?.[0]?.text || '';
    
        if (block.type === 'heading') {
          let headingStyle = styles.heading1;
          if (block.level === 2) headingStyle = styles.heading2;
          if (block.level === 3) headingStyle = styles.heading3;
          if (block.level === 4) headingStyle = styles.heading4;
          if (block.level === 5) headingStyle = styles.heading5;
    
          return (
            <Text
              key={index}
              style={headingStyle}
            >
              {text}
            </Text>
          );
        }
    
        if (block.type === 'paragraph') {
          return (
            <Text
              key={index}
              style={styles.paragraphText}
            >
              {text}
            </Text>
          );
        }
    
        return null;
      });
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
            <Text style={styles.headerTitle}>
              {functionData?.title || ''}
            </Text>
            <View style={styles.placeholder} />
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.body}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#42865F" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.contentContainer}>
            {imageUrl && (
              <Image 
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="contain"
              />
            )}
            
            <View>
            {renderRichText(functionData?.full_description)}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#42865F',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    fontFamily: 'RedHatDisplay_500Medium',
    textAlign: 'center',
  },
  contentContainer: {
    paddingBottom: 60,
  },
  image: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    marginBottom: 5,
  },
  paragraphText: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333333',
    marginBottom: 0,
    lineHeight: 32,
  },
  headingText: {
    fontSize: 24,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#42865F',
    marginBottom: 8,
  },
  heading1: {
    fontSize: 28,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#42865F',
    marginTop: 16,
    marginBottom: 16,
  },
  heading2: {
    fontSize: 24,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#42865F',
    marginTop: 14,
    marginBottom: 14,
  },
  heading3: {
    fontSize: 22,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#42865F',
    marginTop: 12,
    marginBottom: 12,
  },
  heading4: {
    fontSize: 20,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#42865F',
    marginTop: 10,
    marginBottom: 10,
  },
  heading5: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#42865F',
    marginTop: 8,
    marginBottom: 8,
  },
});
