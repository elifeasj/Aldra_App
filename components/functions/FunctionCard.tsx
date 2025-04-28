import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';

interface FunctionCardProps {
  title: string;
  imageUrl?: string;
  onPress: () => void;
}

export const FunctionCard: React.FC<FunctionCardProps> = ({ 
  title, 
  imageUrl, 
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        {imageUrl && (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image}
            resizeMode="contain"
          />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%', // Almost half width to allow for margin
    aspectRatio: 1, // Square aspect ratio
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#42865F',
    fontSize: 18,
    fontFamily: 'RedHatDisplay_700Bold',
    textAlign: 'center',
    marginTop: 12,
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 8,
  }
});
