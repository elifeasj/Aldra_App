import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, ImageBackground } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Carousel from 'react-native-reanimated-carousel';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { endpoints } from '../../config';

// Type definition for conversation cards
interface ConversationCard {
  id: number;
  text: string;
  category: any;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
};

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
  const [activeIndex, setActiveIndex] = useState(0);

  const [categoryTitle, setCategoryTitle] = useState<string>('Kategori');

  useEffect(() => {
    const fetchCategoryTitle = async () => {
      try {
        const res = await fetch(`https://aldra-cms.up.railway.app/api/categories?filters[slug][$eq]=${category}`);
      const json = await res.json();
      const title = json?.data?.[0]?.title || 'Kategori';
      setCategoryTitle(title);
    } catch (err) {
      console.warn('Kunne ikke hente kategorititel:', err);
      setCategoryTitle('Kategori');
    }
  };

  if (category) fetchCategoryTitle();
}, [category]);

  // Fetch conversation cards from Strapi
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        // Construct the query to filter by category and visibility
        const query = `filters[category][slug][$eq]=${category}&filters[visible][$eq]=true&populate=category`;
        const response = await fetch(`${endpoints.questions}?${query}`);

        
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

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.push('/samtalekort')} style={styles.backButton}>
          <Ionicons name="chevron-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>{categoryTitle}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.push(`/samtalekort/${category}` as any)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : cards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No conversation cards found for this category.</Text>
        </View>
      ) : (
        <View style={styles.carouselContainer}>
          <ImageBackground
            source={require('../../assets/images/conversationcardicon-white.png')}
            style={StyleSheet.absoluteFill}
            imageStyle={styles.fixedBackgroundImage}
          />
          
          <Carousel
            width={width}
            height={height * 0.6}
            data={cards}
            loop={false}
            mode="parallax"
            scrollAnimationDuration={800}
            onSnapToItem={(index) => setActiveIndex(index)}
            renderItem={({ item }) => (
              <View style={styles.slide}>
                <Text style={styles.questionText}>{item.text}</Text>
              </View>
            )}
          />
  
          <View style={styles.pagination}>
            {cards.map((_, index) => (
              <View 
                key={index}
                style={[styles.dot, index === activeIndex ? styles.activeDot : null]}
              />
            ))}
          </View>
        </View>
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  customHeaderTitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 10,
  },  
  carouselContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B876C',
    position: 'relative',
  },
  fixedBackgroundImage: {
    resizeMode: 'contain',
    position: 'absolute',
    width: 370,
    height: 370,
    top: '70%',
    left: '30%',
    opacity: 0.15,
    transform: [{ translateX: -90 }, { rotate: '-10deg' }],
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  questionText: {
    color: '#fff',
    fontSize: 44,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 55,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 300,
    width: '100%',
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
