import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, Dimensions, ImageBackground, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const itemWidth = (width - 60) / 2;

export default function SamtalekortScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('https://aldra-cms.up.railway.app/api/categories?populate=*');
        const json = await res.json();
        setCategories(json.data || []);
      } catch (error) {
        console.error('Fejl ved hentning af kategorier:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryPress = (slug: string) => {
    router.push(`/samtalekort/${slug}` as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#42865F" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back-outline" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Samtalekort</Text>
        </View>

        <Text style={styles.description}>
          Find samtaleemner og spørgsmål, der skaber rum for åbne og meningsfulde dialoger.
        </Text>

        <Text style={styles.sectionTitle}>Kategorier</Text>

        <View style={styles.grid}>
        {categories.map((category) => {
          const title = category?.title;
          const slug = category?.slug;

          if (!title || !slug) return null; // skip hvis data mangler

          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategoryPress(slug)}
              activeOpacity={0.9}
            >
              <ImageBackground
                source={require('../assets/images/conversationcardicon-white.png')}
                style={styles.categoryCard}
                imageStyle={styles.cardBackgroundImage}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.categoryTitle}>{title}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          );
        })}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 18,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '400',
    fontFamily: 'RedHatDisplay_400Regular',
  },
  backButton: {
    marginRight: 16,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  description: {
    fontSize: 18,
    fontWeight: '400',
    fontFamily: 'RedHatDisplay_400Regular',
    lineHeight: 30,
    color: '#000000',
    marginBottom: 40,
    paddingRight: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '500',
    fontFamily: 'RedHatDisplay_500Medium',
    marginBottom: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: itemWidth,
    height: itemWidth,
    backgroundColor: '#5B876C',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  categoryTitle: {
    color: '#fff',
    paddingTop: 14,
    fontSize: 22,
    fontWeight: '400',
    fontFamily: 'RedHatDisplay_700Bold',
  },
  cardBackgroundImage: {
    resizeMode: 'contain',
    position: 'absolute',
    left: 50,
    top: 65,
    width: 150,
    height: 150,
    opacity: 0.15,
    transform: [{ rotate: '-10deg' }],
  },
});
