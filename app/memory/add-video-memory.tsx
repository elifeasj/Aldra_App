import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Alert, Modal, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { storage, db } from '../../firebase';
import * as FileSystem from 'expo-file-system';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ActivityIndicator } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

export default function AddVideoMemory() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showToast = () => {
    setToastVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToastVisible(false));
    }, 3000);
  };

  const openVideoActionSheet = () => {
    setModalVisible(true);
  };

  const pickVideoFromGallery = async () => {
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Tilladelse påkrævet', 'Vi har brug for adgang til dit galleri for at vælge videoer.');
      return;
    }

    // Launch video picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
      videoMaxDuration: 15, // 15 seconds max duration
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setVideoUri(result.assets[0].uri);
    }
    
    setModalVisible(false);
  };

  const recordVideo = async () => {
    // Ask for camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Tilladelse påkrævet', 'Vi har brug for adgang til dit kamera for at optage video.');
      return;
    }

    // Launch camera for video recording
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
      videoMaxDuration: 15, // 15 seconds max duration
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setVideoUri(result.assets[0].uri);
    }
    
    setModalVisible(false);
  };
  
  // Upload memory video
  const uploadMemoryVideo = async (uri: string) => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'video.mp4';
  
    formData.append('video', {
      uri,
      name: filename,
      type: 'video/mp4',
    } as any);
  
    const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/upload-memory-video`;
    console.log("📤 Uploading to:", apiUrl);
  
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
    
      const text = await response.text();
    
      if (!response.ok) {
        console.error("❌ Upload failed - Status:", response.status);
        console.error("❌ Upload failed - Body:", text);
        throw new Error('Upload via backend fejlede');
      }
    
      const data = JSON.parse(text);
      return data.url;
    } catch (error) {
      console.error("❌ Error during upload:", error);
      // Fallback to direct Firebase upload if backend fails
      return uploadToFirebaseDirectly(uri);
    }
  };

  // Fallback direct upload to Firebase if backend fails
  const uploadToFirebaseDirectly = async (uri: string) => {
    const filename = `videos/${uuidv4()}`;
    const storageRef = ref(storage, filename);
    
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const uploadTask = uploadBytesResumable(storageRef, blob);
    
    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress tracking if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error('❌ Error uploading to Firebase:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleSendMemory = async () => {
    if (!title.trim()) {
      Alert.alert('Manglende titel', 'Indtast venligst en titel til dit minde.');
      return;
    }

    if (!videoUri) {
      Alert.alert('Ingen video valgt', 'Vælg venligst en video til dit minde.');
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload video
      const videoUrl = await uploadMemoryVideo(videoUri);
      
      // Save to Firestore
      await addDoc(collection(db, 'memories'), {
        title: title.trim(),
        type: 'video',
        videoUrl,
        createdAt: serverTimestamp(),
        userId: 'current-user-id', // Replace with actual user ID
      });
      
      console.log("✅ Dokument gemt i Firestore");
      showToast();
      
      setTimeout(() => {
        setTitle('');
        setVideoUri(null);
        router.back();
      }, 3500);
      
    } catch (error: any) {
      console.error('❌ FEJL:', error);
      Alert.alert('Fejl', error.message || 'Ukendt fejl ved upload.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Check if form is valid for submission
  const isFormValid = title.trim().length > 0 && videoUri;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tilføj videobesked</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructions}>
            Del en lille hilsen med din kære.
          </Text>
          <Text style={styles.subInstructions}>
            Vælg en video fra dit galleri eller optag en ny video.
          </Text>
          <Text style={styles.subInstructions}>
            Din videobesked kan være op til 15 sekunder.
          </Text>
        </View>

        {/* Title Input */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidContainer}
        >
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.inputLabel}>Titel på minde</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Skriv titel på din minde her..."
                maxLength={20}
                placeholderTextColor="#AAAAAA"
              />
              <Text style={styles.charCounter}>{title.length}/20</Text>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Video Slot */}
        <View style={styles.videoContainer}>
          <TouchableOpacity 
            style={styles.videoSlot}
            onPress={openVideoActionSheet}
          >
            {videoUri ? (
              <Image
                source={{ uri: videoUri }}
                style={styles.selectedVideo}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.emptySlot}>
                <Ionicons name="film-outline" size={40} color="#CCCCCC" />
                <View style={styles.addIconContainer}>
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                </View>
              </View>
            )}
            {videoUri && (
              <View style={styles.playIconOverlay}>
                <Ionicons name="play" size={40} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.scheduleButton}
            onPress={() => router.push({
              pathname: '/memory/schedule-memory',
              params: { memoryType: 'video' }
            })}
          >
            <Ionicons name="time-outline" size={18} color="#42865F" />
            <Text style={styles.scheduleButtonText}>Planlæg visning</Text>
          </TouchableOpacity>
          
          {!isUploading && (
            <TouchableOpacity 
              style={[styles.sendButton, !isFormValid && styles.sendButtonDisabled]}
              disabled={!isFormValid}
              onPress={handleSendMemory}
            >
              <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.sendButtonText}>Send minde</Text>
            </TouchableOpacity>
          )}
          
          {isUploading && (
            <View style={styles.sendButton}>
              <ActivityIndicator color="#FFFFFF" size="small" />
            </View>
          )}
        </View>
      </View>
      
      {/* Video Picker Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={pickVideoFromGallery}
            >
              <Ionicons name="images-outline" size={24} color="#42865F" />
              <Text style={styles.modalOptionText}>Vælg fra galleri</Text>
            </TouchableOpacity>
            
            <View style={styles.modalDivider} />
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={recordVideo}
            >
              <Ionicons name="videocam-outline" size={24} color="#42865F" />
              <Text style={styles.modalOptionText}>Optag video</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Success Toast */}
      {toastVisible && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <View style={styles.toastContent}>
            <Ionicons name="checkmark-circle" size={24} color="#42865F" />
            <Text style={styles.toastText}>Dit minde er sendt – det vises automatisk på skærmen.</Text>
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingTop: 90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 2,
    marginRight: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000000',
    marginLeft: 4,
  },
  instructionsContainer: {
    marginBottom: 38,
  },
  instructions: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000000',
    marginBottom: 6,
    lineHeight: 30,
  },
  subInstructions: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  keyboardAvoidContainer: {
    width: '100%',
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000000',
  },
  requiredStar: {
    fontSize: 20,
    color: '#42865F',
    marginLeft: 2,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7E6',
    paddingBottom: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000000',
    padding: 0,
  },
  charCounter: {
    fontSize: 15,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#999999',
  },
  videoContainer: {
    marginBottom: 32,
    marginTop: 8,
    padding: 8,
  },
  videoSlot: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: '#EEEEEE',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  emptySlot: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedVideo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  addIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#42865F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 40,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#42865F',
    borderRadius: 8,
    width: '48%',
  },
  scheduleButtonText: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#42865F',
    marginLeft: 8,
  },
  sendButton: {
    backgroundColor: '#42865F',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#FFFFFF',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 40,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginLeft: 8,
    marginTop: 8,

  },
  modalOptionText: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333333',
    marginLeft: 14,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E5E7E6',
  },
  
  // Toast Styles
  toast: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#42865F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  toastText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333333',
  },
});
