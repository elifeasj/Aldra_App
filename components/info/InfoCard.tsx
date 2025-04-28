import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image, ImageSourcePropType} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InfoCardProps {
  title: string;
  shortDescription: string;
  slug: string;
  imageUrl?: string;
  onPress: (slug: string) => void;
}

export const InfoCard: React.FC<InfoCardProps> = ({ 
  title, 
  shortDescription, 
  slug, 
  imageUrl, 
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(slug)}
      activeOpacity={0.8}
    >
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{shortDescription}</Text>
        </View>
        
        {imageUrl && (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.backgroundImage}
            resizeMode="contain"
          />
        )}
        
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    height: 160,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#42865F',
    padding: 16,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: '80%',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'RedHatDisplay_700Bold',
    marginBottom: 8,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 160,
    height: 60,
    opacity: 0.8,
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  }
});
