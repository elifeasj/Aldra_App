import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Pressable, Share, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome6Brands from 'react-native-vector-icons/FontAwesome6';
import Toast from '../../components/Toast';


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
    router.back();
  };

  const handleSharePress = () => {
    setShareModalVisible(true);
  };

  const handleShareOption = async (platform: string) => {
    const shareUrl = `https://aldra.dk/post/${slug || id}`;
    const message = `Se hvad Aldra deler om livet, minder og demens: "${title}"\n${shareUrl}`;
  
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

  const handleSystemShare = async () => {
    const safeTitle = Array.isArray(title) ? title[0] : title;
    const safeSlug = Array.isArray(slug) ? slug[0] : slug;
    const shareUrl = `https://aldra.dk/post/${safeSlug || id}`;
    const message = `Se hvad Aldra deler om livet, minder og demens: "${safeTitle}"\n${shareUrl}`;
  
    try {
      const result = await Share.share({
        message: message,
        url: shareUrl,
        title: safeTitle,
      });
  
      if (result.action === Share.sharedAction) {
        // Hvis brugeren har valgt at kopiere linket
        if (result.activityType === 'com.apple.UIKit.activity.CopyToPasteboard') {
          setShowToast(true); // Vis Toast
          setTimeout(() => setShowToast(false), 2000);
        }
        setShareModalVisible(false); // Luk modal altid hvis delt
      }
      // Hvis dismissed, gør intet
    } catch (error) {
      console.error('❌ Fejl ved deling:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={handleBackPress}>
          <Icon name="arrow-back-outline" color="#333" size={24} />
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
                <Icon name="share-outline" color="#333" size={24} />
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
                <Icon name="x" color="#333" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shareOptions}
              style={styles.shareScroll}
            >
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

              <TouchableOpacity style={styles.shareOption} onPress={() => handleShareOption('instagram')}>
                <View style={[styles.shareIconCircle, { backgroundColor: '#E1306C' }]}>
                  <Icon name="instagram" size={24} color="#fff" />
                </View>
                <Text style={styles.shareOptionText}>Instagram</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={handleSystemShare}>
                <View style={[styles.shareIconCircle, { backgroundColor: '#ffffff', borderColor: '#333', borderWidth: 0.1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2, }]}>
                  <Icon name="share-outline" size={24} color="#333" />
                </View>
                <Text style={styles.shareOptionText}>Del via enhed</Text>
              </TouchableOpacity>
            </ScrollView>


            <TouchableOpacity style={styles.linkContainer} onPress={handleCopyLink}>
              <Icon name="share-outline" size={20} color="#333" style={{ marginRight: 8}} />  
              <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">
                https://aldra.dk/post/{slug}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {showToast && <Toast type="success" message="Linket er kopieret til din enhed" />}

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
    marginBottom: 20,
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
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
    marginBottom: 10,
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
    marginBottom: 0,
    alignItems: 'center',
  },
  shareOption: {
    alignItems: 'center',
    marginRight: 28,
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
shareScroll: {
    marginHorizontal: -24,
    paddingLeft: 24,
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
    marginBottom: 30,
  },
  linkText: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
    textAlign: 'center',
  },
});
