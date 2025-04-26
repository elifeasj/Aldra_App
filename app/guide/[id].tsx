import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Pressable, Share, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Share2, X, } from 'lucide-react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome6Brands from 'react-native-vector-icons/FontAwesome6';
import Toast from '@/components/Toast';


export default function GuideDetail() {
  const { id, title, content, image, category, slug } = useLocalSearchParams();
  const router = useRouter();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
    const shareUrl = `https://aldra.dk/post/${slug || id}`;
    const message = `Se hvad der står her på Aldra om demens...\n${shareUrl}`;
  
    switch (platform) {
      case 'facebook':
        await Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
        break;
      case 'twitter':
        await Linking.openURL(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`);
        break;
      case 'whatsapp':
        await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
        break;
      case 'linkedin':
        await Linking.openURL(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
        break;
      default:
        await Share.share({
          message: message,
          url: shareUrl,
        });
    }
    setShareModalVisible(false);
  };

  const handleCopyLink = async () => {
    const shareUrl = `https://aldra.dk/post/${slug || id}`;
    await Clipboard.setStringAsync(shareUrl);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000); // Skjul Toast efter 2 sekunder
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
        {/* <TouchableOpacity style={styles.iconButton} onPress={handleSharePress}>
          <Share2 color="#333" size={24} />
        </TouchableOpacity> */}
      </View>

      <ScrollView style={styles.scrollContainer}>
        {typeof image === 'string' && image.length > 0 && (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        )}
        <View style={styles.contentCard}>
          {category && (
            <View style={styles.categoryRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
              <TouchableOpacity style={styles.shareInlineButton} onPress={handleSharePress}>
                <Share2 size={20} color="#333" />
              </TouchableOpacity>
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
        animationType="fade"
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
                  <Icon name="facebook" size={24} color="#fff" />
                </View>
                <Text style={styles.shareOptionText}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={() => handleShareOption('twitter')}>
                <View style={[styles.shareIconCircle, { backgroundColor: '#000000' }]}>
                  <FontAwesome6Brands name="x-twitter" size={24} color="#fff" />
                </View>
                <Text style={styles.shareOptionText}>X</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={() => handleShareOption('whatsapp')}>
                <View style={[styles.shareIconCircle, { backgroundColor: '#25D366' }]}>
                  <Icon name="whatsapp" size={24} color="#fff" />
                </View>
                <Text style={styles.shareOptionText}>Whatsapp</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={() => handleShareOption('linkedin')}>
                <View style={[styles.shareIconCircle, { backgroundColor: '#0A66C2' }]}>
                  <Icon name="linkedin" size={24} color="#fff" />
                </View>
                <Text style={styles.shareOptionText}>LinkedIn</Text>
              </TouchableOpacity>
            </View>


            <TouchableOpacity style={styles.linkContainer} onPress={handleCopyLink}>
              <Share2 size={20} color="#333" style={{ marginRight: 8}} />  
              <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">
                https://aldra.dk/post/{slug}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {showToast && <Toast type="success" message="Link kopieret til udklipsholder" />}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 75,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerSpacer: {
    flex: 1,
},
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
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: 300,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: -20,

  },
  categoryBadge: {
    backgroundColor: '#42865F',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: { 
    color: '#fff',
    fontSize: 16,
    fontFamily: 'RedHatDisplay_700Bold'
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#333',
    marginBottom: 16
  },
  text: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
    lineHeight: 32,
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },  
    modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: '40%',
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
    marginBottom: 36,
    marginTop: 10,
},
  modalTitle: {
    fontSize: 24,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#333',
},
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center',
  },
  shareOption: {
    alignItems: 'center',
    width: '22%',
},
shareInlineButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: '#333',
    borderWidth: 0.1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
shareIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
},
  shareIconText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'RedHatDisplay_500Medium',
},
  shareOptionText: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
},
linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginTop: 16,
  },
  linkText: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
    textAlign: 'center',
  },
});
