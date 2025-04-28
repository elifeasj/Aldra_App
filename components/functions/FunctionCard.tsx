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
      <Text style={styles.title}>{title}</Text>
        {imageUrl && (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image}
            resizeMode="contain"
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 26,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderWidth: 0.10,
    borderColor: '#42865F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  title: {
    color: '#42865F',
    fontSize: 24,
    fontFamily: 'RedHatDisplay_700Bold',
    textAlign: 'left',
    marginTop: 12,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 8,
  }
});
