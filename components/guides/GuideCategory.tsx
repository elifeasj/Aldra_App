import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { GuideCard } from './GuideCard';
import { Guide } from '../../types/guides';
import { mapGuideData } from '../../utils/guideUtils';

interface GuideCategoryProps {
  title: string;
  guides: Guide[];
  onGuidePress: (guide: Guide) => void;
}

export const GuideCategory: React.FC<GuideCategoryProps> = ({ 
  title, 
  guides,
  onGuidePress,
}) => {
  if (guides.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {guides.map((guide) => (
          <GuideCard
            key={guide.id}
            title={guide.title}
            imageUrl={guide.image}
            onPress={() => onGuidePress(guide)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#333333',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
});
