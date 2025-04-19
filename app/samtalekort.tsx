import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImageBackground } from 'react-native';

// Define categories with their titles
const categories = [
  { id: 'hjemmet', title: 'Hjemmet' },
  { id: 'dagligdagen', title: 'Dagligdagen' },
  { id: 'ude-i-naturen', title: 'Ude i naturen' },
  { id: 'fortiden', title: 'Fortiden' },
  { id: 'livet-i-kultur', title: 'Livet i Kultur' },
  { id: 'folelser', title: 'Følelser' },
];

// Calculate dimensions for the grid items
const { width } = Dimensions.get('window');
const itemWidth = (width - 60) / 2; // 2 columns with 20px padding on sides and 20px between

export default function SamtalekortScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/samtalekort/${categoryId}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.header]}>
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
          {categories.map((category) => (
            <TouchableOpacity
            key={category.id}
            onPress={() => handleCategoryPress(category.id)}
            activeOpacity={0.9}
          >
            <ImageBackground
              source={require('../assets/images/conversationcardicon-white.png')}
              style={styles.categoryCard}
              imageStyle={styles.cardBackgroundImage}
            >
              <View style={styles.cardContent}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
          ))}
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
