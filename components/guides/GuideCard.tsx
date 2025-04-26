import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';

interface GuideCardProps {
  title: string;
  imageUrl: string;
  onPress: () => void;
}

export const GuideCard: React.FC<GuideCardProps> = ({ title, imageUrl, onPress }) => {
  const hasImage = !!imageUrl;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {hasImage ? (
        <ImageBackground source={{ uri: imageUrl }} style={styles.image} resizeMode="cover">
          <View style={styles.overlay}>
            <Text style={styles.title}>{title}</Text>
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <View style={styles.overlay}>
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#42865F', // fallback grøn farve
  },
  overlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'RedHatDisplay_700Bold',
  },
});
