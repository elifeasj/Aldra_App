import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { STRAPI_URL } from '../config/api';
import { FunctionCard } from '../components/functions/FunctionCard';
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

export default function AldraFunktioner() {
  const router = useRouter();
  const [functions, setFunctions] = useState<AldraFunction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFunctions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${STRAPI_URL}/api/functions?populate=*`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch functions');
        }
        
        const json = await res.json();
        
        if (json.data && Array.isArray(json.data)) {
          setFunctions(json.data);
        } else {
          setError('No functions found');
        }
      } catch (err) {
        console.error('Error fetching functions:', err);
        setError('Could not load functions');
      } finally {
        setLoading(false);
      }
    };

    fetchFunctions();
  }, []);

  const handleFunctionPress = (slug: string) => {
    router.push(`/aldra-funktion/${slug}` as any);
  };

  const renderItem = ({ item }: { item: AldraFunction }) => {
    const imageUrl = item.attributes.image?.data?.attributes?.url 
      ? `${STRAPI_URL}${item.attributes.image.data.attributes.url}`
      : undefined;

    return (
      <FunctionCard
        title={item.attributes.title}
        imageUrl={imageUrl}
        onPress={() => handleFunctionPress(item.attributes.slug)}
      />
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Aldras funktioner',
          headerBackTitle: 'Tilbage',
        }}
      />
      
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#42865F" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={functions}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.description}>
                Udforsk Aldras forskellige funktioner og lær hvordan de kan hjælpe dig i hverdagen.
              </Text>
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  description: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#666666',
    marginBottom: 24,
    lineHeight: 22,
  }
});
