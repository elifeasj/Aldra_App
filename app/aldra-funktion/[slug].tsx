import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { STRAPI_URL } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

interface AldraFunction {
  id: number;
  attributes: {
    title: string;
    slug: string;
    short_description: string;
    full_description: string;
    image: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
  };
}

export default function FunctionDetailPage() {
  const { slug } = useLocalSearchParams();
  const [functionData, setFunctionData] = useState<AldraFunction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const imageUrl = functionData?.attributes?.image?.data?.attributes?.url 
    ? `${STRAPI_URL}${functionData.attributes.image.data.attributes.url}`
    : null;

  const router = useRouter();
  
  // Function to render formatted description with section headlines
  const renderFormattedDescription = (text: string) => {
    if (!text) return null;
    
    // Split text by double newlines to identify paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if paragraph is a section headline (ends with a colon)
      const isSectionHeadline = paragraph.trim().endsWith(':');
      
      return (
        <Text 
          key={index} 
          style={[styles.paragraph, isSectionHeadline ? styles.sectionHeadline : null]}
        >
          {paragraph}
        </Text>
      );
    });
  };
  
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
          <Text style={styles.headerTitle}>
            {functionData?.attributes?.title || 'Aldra Funktion'}
          </Text>
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
            {imageUrl && (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.image}
                resizeMode="contain"
              />
            )}
            
            {/* Formatted description with section headlines */}
            {renderFormattedDescription(functionData?.attributes?.full_description || '')}
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
    padding: 20,
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
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    fontFamily: 'RedHatDisplay_500Medium',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
  },
  paragraph: {
    fontSize: 17,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333333',
    marginBottom: 16,
    lineHeight: 24,
  },
  sectionHeadline: {
    fontSize: 22,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#42865F',
    marginTop: 8,
    marginBottom: 16,
  },
});
