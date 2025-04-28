import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, FlatList, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { STRAPI_URL } from '../config/api';
import { FunctionCard } from '../components/functions/FunctionCard';
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
  };

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
    if (!item?.title) {
      console.warn('Missing title for function:', item);
      return null;
    }
  
    const imageUrl = item?.image && Array.isArray(item.image) && item.image.length > 0
      ? item.image[0].url
      : undefined;
  
    return (
      <FunctionCard
        title={item.title}
        imageUrl={imageUrl}
        onPress={() => handleFunctionPress(item.slug)}
      />
    );
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
          <Text style={styles.headerTitle}>Aldras funktioner</Text>
          <View style={styles.placeholder} />
        </View>
      </View>
      
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
          />
        )}
      </View>
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
    paddingTop: 8,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  }
});
