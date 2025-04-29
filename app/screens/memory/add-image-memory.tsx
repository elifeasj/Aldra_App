import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Alert, Modal, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { storage, db } from '../../../firebase';
import * as FileSystem from 'expo-file-system';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';



export default function AddImageMemory() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
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

  const openImageActionSheet = (index: number) => {
    setSelectedSlotIndex(index);
    setModalVisible(true);
  };

  const pickImageFromGallery = async () => {
    if (selectedSlotIndex === null) return;
    
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Tilladelse påkrævet', 'Vi har brug for adgang til dit galleri for at vælge billeder.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = [...images];
      newImages[selectedSlotIndex] = result.assets[0].uri;
      setImages(newImages);
    }
    
    setModalVisible(false);
  };

  const takePhoto = async () => {
    if (selectedSlotIndex === null) return;
    
    // Ask for camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Tilladelse påkrævet', 'Vi har brug for adgang til dit kamera for at tage billeder.');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = [...images];
      newImages[selectedSlotIndex] = result.assets[0].uri;
      setImages(newImages);
    }
    
    setModalVisible(false);
  };
  
  
  const handleSendMemory = async () => {
    if (!images.some(img => img)) {
      Alert.alert('Fejl', 'Vælg mindst ét billede for at fortsætte.');
      return;
    }
  
    if (!title.trim()) {
      Alert.alert('Fejl', 'Indtast venligst en titel for dit minde.');
      return;
    }
  
    try {
      const imageUri = images[0];
      const filename = `memories/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
  
      // Læs billedet som base64
      const base64Data = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      // Upload base64 uden metadata
      await uploadString(storageRef, base64Data, 'base64');
  
      // Få download URL
      const downloadURL = await getDownloadURL(storageRef);
  
      // Gem metadata i Firestore
      await addDoc(collection(db, 'moments'), {
        title: title,
        url: downloadURL,
        type: 'image',
        createdAt: serverTimestamp(),
      });
  
      showToast();
  
      setTimeout(() => {
        setTitle('');
        setImages([]);
        router.back();
      }, 3500);
  
    } catch (error) {
      console.error('Error uploading image or saving document:', error);
      Alert.alert('Fejl', 'Der opstod en fejl under upload af dit minde. Prøv igen senere.');
    }
  };
  
  

  // Create an array of 4 empty slots for images
  const imageSlots = Array(4).fill(null);

  // Check if form is valid for submission
  const isFormValid = title.trim().length > 0 && images.some(img => img);

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
          <Text style={styles.headerTitle}>Tilføj billede</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructions}>
            Vælg et billede fra dit galleri eller tag et nyt med kameraet for at oprette et minde.
          </Text>
          <Text style={styles.subInstructions}>
            Du kan vælge op til 4 billeder.
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
                maxLength={10}
                placeholderTextColor="#AAAAAA"
              />
              <Text style={styles.charCounter}>{title.length}/10</Text>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Image Grid */}
        <View style={styles.imageGrid}>
          {imageSlots.map((_, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.imageSlot}
              onPress={() => openImageActionSheet(index)}
            >
              {images[index] ? (
                <Image source={{ uri: images[index] }} style={styles.selectedImage} />
              ) : (
                <View style={styles.emptySlot}>
                  <Ionicons name="image-outline" size={24} color="#CCCCCC" />
                  <View style={styles.addIconContainer}>
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.scheduleButton}>
            <Ionicons name="time-outline" size={18} color="#42865F" />
            <Text style={styles.scheduleButtonText}>Planlæg visning</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.sendButton, !isFormValid && styles.sendButtonDisabled]}
            disabled={!isFormValid}
            onPress={handleSendMemory}
          >
            <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.sendButtonText}>Send minde</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Image Picker Modal */}
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
              onPress={pickImageFromGallery}
            >
              <Ionicons name="image-outline" size={24} color="#42865F" />
              <Text style={styles.modalOptionText}>Vælg et billede</Text>
            </TouchableOpacity>
            
            <View style={styles.modalDivider} />
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={takePhoto}
            >
              <Ionicons name="camera-outline" size={24} color="#42865F" />
              <Text style={styles.modalOptionText}>Tag et billede</Text>
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
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    marginTop: 8,
    padding: 8,
  },
  imageSlot: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: '#EEEEEE',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  emptySlot: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
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
