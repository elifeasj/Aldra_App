import React from 'react';
import { TouchableOpacity, ImageBackground, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GuideCardProps {
  title: string;
  imageUrl: string;
  onPress: () => void;
}

const fallbackImage = 'https://aldra-cms.up.railway.app/uploads/image2.png'; // <-- du kan uploade denne til Strapi Media

export const GuideCard: React.FC<GuideCardProps> = ({ title, imageUrl, onPress }) => {
  const finalImage = imageUrl && imageUrl.startsWith('http') ? imageUrl : fallbackImage;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <ImageBackground 
        source={{ uri: finalImage }} 
        style={styles.background}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={['transparent', 'rgba(31, 101, 15, 0.86)']}
          style={styles.gradient}
        >
          <Text style={styles.title}>{title}</Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    height: 180,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  background: {
    width: '100%',
    height: '100%',
  },
  image: {
    borderRadius: 12,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'RedHatDisplay_700Bold',
    lineHeight: 24,
  },
});
