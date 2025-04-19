import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import { API_URL } from '../../config';

// Type definition for conversation cards
interface ConversationCard {
  id: number;
  attributes: {
    question: string;
    category: string;
    visible: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// Type for the API response
interface ApiResponse {
  data: ConversationCard[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Map category IDs to display names
const categoryDisplayNames: Record<string, string> = {
  'hjemmet': 'Hjemmet',
  'dagligdagen': 'Dagligdagen',
  'ude-i-naturen': 'Ude i naturen',
  'fortiden': 'Fortiden',
  'livet-i-kultur': 'Livet i Kultur',
  'folelser': 'Følelser',
};

export default function CategoryScreen() {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const [cards, setCards] = useState<ConversationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversation cards from Strapi
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        // Construct the query to filter by category and visibility
        const query = `filters[category][$eq]=${category}&filters[visible][$eq]=true`;
        const response = await fetch(`${API_URL}/api/conversation-cards?${query}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch conversation cards');
        }
        
        const data: ApiResponse = await response.json();
        setCards(data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching conversation cards:', err);
        setError('Could not load conversation cards. Please try again later.');
        setLoading(false);
      }
    };

    if (category) {
      fetchCards();
    }
  }, [category]);

  // Get the display name for the category
  const categoryName = categoryDisplayNames[category as string] || 'Category';

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: categoryName,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#5B876C',
          },
          headerTintColor: '#fff',
        }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.replace(`/samtalekort/${category}` as any)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : cards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No conversation cards found for this category.</Text>
        </View>
      ) : (
        <Swiper
          style={styles.wrapper}
          showsButtons={false}
          loop={false}
          dot={<View style={styles.dot} />}
          activeDot={<View style={styles.activeDot} />}
          paginationStyle={styles.pagination}
        >
          {cards.map((card) => (
            <View key={card.id} style={styles.slide}>
              <Text style={styles.questionText}>{card.attributes.question}</Text>
            </View>
          ))}
        </Swiper>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5B876C',
  },
  backButton: {
    padding: 8,
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  questionText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
  },
  pagination: {
    bottom: 50,
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
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
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#5B876C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});
