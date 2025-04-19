import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/samtalekort/${categoryId}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Samtalekort',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.description}>
          Find samtaleemner og spørgsmål, der skaber rum for åbne og meningsfulde dialoger.
        </Text>
        
        <Text style={styles.sectionTitle}>Kategorier</Text>
        
        <View style={styles.grid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category.id)}
            >
              <View style={styles.cardContent}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <View style={styles.cardIconBackground}>
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color="#E9F1EC" style={styles.cardIcon} />
                </View>
              </View>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardIconBackground: {
    alignSelf: 'flex-end',
    opacity: 0.8,
  },
  cardIcon: {
    marginBottom: 8,
  },
});
