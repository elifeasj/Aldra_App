import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Pressable, Share, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Share2, X } from 'lucide-react-native';

export default function GuideDetail() {
  const { id, title, content, image, category, slug } = useLocalSearchParams();
  const router = useRouter();
  const [shareModalVisible, setShareModalVisible] = useState(false);

  let parsedContent: any[] = [];

  try {
    parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
  } catch (error) {
    console.error('❌ Kunne ikke parse content', error);
  }

  const handleBackPress = () => {
    router.push('/vejledning');
  };

  const handleSharePress = () => {
    setShareModalVisible(true);
  };

  const handleShareOption = async (platform: string) => {
    const shareUrl = `https://aldra.com/post/${slug || id}`;
    switch (platform) {
      case 'facebook':
        await Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
        break;
      case 'twitter':
        await Linking.openURL(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'whatsapp':
        await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(shareUrl)}`);
        break;
      case 'linkedin':
        await Linking.openURL(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
        break;
      default:
        await Share.share({
          message: shareUrl,
          url: shareUrl,
        });
    }
    setShareModalVisible(false);
  };

  const handleCopyLink = async () => {
    const shareUrl = `https://aldra.com/post/${slug || id}`;
    await Share.share({
      message: shareUrl,
      url: shareUrl,
    });
    setShareModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={handleBackPress}>
          <ArrowLeft color="#333" size={24} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <TouchableOpacity style={styles.iconButton} onPress={handleSharePress}>
          <Share2 color="#333" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {typeof image === 'string' && image.length > 0 && (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        )}
        <View style={styles.contentCard}>
          {category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          {parsedContent?.map((block, index) => {
            if (block.type === 'paragraph') {
              const paragraphText = block.children?.map((child: any) => child.text).join(' ') || '';
              return (
                <Text key={index} style={styles.text}>
                  {paragraphText}
                </Text>
              );
            }
            return null;
          })}
        </View>
      </ScrollView>

      {/* Share Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={shareModalVisible}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Del denne opslag</Text>
              <TouchableOpacity onPress={() => setShareModalVisible(false)}>
                <X color="#333" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.shareOptions}>
              <TouchableOpacity style={styles.shareOption} onPress={() => handleShareOption('facebook')}>
                <View style={[styles.shareIconCircle, { backgroundColor: '#1877F2' }]}>
                  <Text style={styles.shareIconText}>f</Text>
                </View>
                <Text style={styles.shareOptionText}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={() => handleShareOption('twitter')}>
                <View style={[styles.shareIconCircle, { backgroundColor: '#000000' }]}>
                  <Text style={styles.shareIconText}>X</Text>
                </View>
                <Text style={styles.shareOptionText}>X</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={() => handleShareOption('whatsapp')}>
                <View style={[styles.shareIconCircle, { backgroundColor: '#25D366' }]}>
                  <Text style={styles.shareIconText}>W</Text>
                </View>
                <Text style={styles.shareOptionText}>Whatsapp</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={() => handleShareOption('linkedin')}>
                <View style={[styles.shareIconCircle, { backgroundColor: '#0A66C2' }]}>
                  <Text style={styles.shareIconText}>in</Text>
                </View>
                <Text style={styles.shareOptionText}>LinkedIn</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.linkContainer} onPress={handleCopyLink}>
              <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">
                https://aldra.com/post/{slug || id}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerSpacer: { flex: 1 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: 250,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: -20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryBadge: {
    backgroundColor: '#42865F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: { 
    color: '#fff',
    fontSize: 14,
    fontFamily: 'RedHatDisplay_700Bold'
  },
  title: {
    fontSize: 24,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#333',
    marginBottom: 16
  },
  text: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
    lineHeight: 24,
    marginBottom: 16
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
    },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
},
  modalTitle: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#333',
},
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
},
  shareOption: {
    alignItems: 'center',
    width: '22%',
},
  shareIconCircle: { 
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
},
  shareIconText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'RedHatDisplay_700Bold',
},
  shareOptionText: {
    fontSize: 12,
    fontFamily: 'RedHatDisplay_400Regular',color: '#333',
},
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
     },
  linkText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
},
});
