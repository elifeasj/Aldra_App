import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { STRAPI_URL } from '../../config/api';

interface InfoCard {
  id: number;
  attributes: {
    title: string;
    short_description: string;
    content: string;
    slug: string;
    image: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
  };
}

export default function InfoPage() {
  const { slug } = useLocalSearchParams();
  const [infoCard, setInfoCard] = useState<InfoCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInfoCard = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${STRAPI_URL}/api/info-cards?filters[slug][$eq]=${slug}&populate=*`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch info card');
        }
        
        const json = await res.json();
        
        if (json.data && json.data.length > 0) {
          setInfoCard(json.data[0]);
        } else {
          setError('Info card not found');
        }
      } catch (err) {
        console.error('Error fetching info card:', err);
        setError('Could not load the information');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchInfoCard();
    }
  }, [slug]);

  const imageUrl = infoCard?.attributes?.image?.data?.attributes?.url 
    ? `${STRAPI_URL}${infoCard.attributes.image.data.attributes.url}`
    : null;

  return (
    <>
      <Stack.Screen
        options={{
          title: infoCard?.attributes?.title || 'Information',
          headerBackTitle: 'Tilbage',
        }}
      />
      
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
                resizeMode="cover"
              />
            )}
            
            <Text style={styles.title}>{infoCard?.attributes?.title}</Text>
            
            <Text style={styles.description}>
              {infoCard?.attributes?.content}
            </Text>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#333333',
    marginBottom: 16,
  },
  description: {
    fontSize: 17,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#555555',
    lineHeight: 24,
  },
});
