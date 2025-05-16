import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/auth';
import Toast from '../components/Toast';
import { API_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FeedbackScreen() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();
  const { user, isLoading } = useAuth();

  type UserWithUid = {
    uid: string;
    [key: string]: any;
  };

  function hasUid(user: any): user is { uid: string } {
    return user && typeof user.uid === 'string';
  }

  useEffect(() => {
    console.log('👀 Bruger i feedback:', user);
  }, [user]);

  
  const handleSubmit = async () => {
    if (isLoading || !user || !hasUid(user)) {
      console.warn('⛔ Brugerdata ikke klar endnu eller UID mangler');
      return;
    }
  
    const userId = user.uid;
  
    console.log('🟡 Feedback payload:', {
      user_id: userId,
      rating,
      comment,
    });
  
    try {
      const response = await fetch(`${API_URL}/submit-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          rating,
          comment,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
  
      setShowToast(true);
      setRating(0);
      setComment('');
  
      setTimeout(() => {
        setShowToast(false);
        router.back();
      }, 4000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Giv os feedback</Text>
      </View>

      <ScrollView style={styles.scrollView} bounces={false}>
        <View style={styles.content}>
          <Text style={styles.question}>Hvad synes du om Aldra?</Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={rating >= star ? 'star' : 'star-outline'}
                  size={48}
                  color="#42865F"
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Fortæl os mere om din oplevelse</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={comment}
              onChangeText={setComment}
              placeholder="Har du ris, ros eller forslag? Skriv det her..."
              placeholderTextColor="#A0A0A0"
              multiline
              maxLength={150}
            />
          </View>
          <Text style={styles.characterCount}>{comment.length}/150</Text>

          <TouchableOpacity
            style={[styles.submitButton, (!rating || !comment) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!rating || !comment}
          >
            <Text style={styles.submitButtonText}>Indsend feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showToast && (
        <Toast
          type="success"
          message="Vi har modtaget din feedback – tak for din tid!"
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 90,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  question: {
    fontSize: 24,
    fontFamily: 'RedHatDisplay_400Regular',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'left',
    color: '#000',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 50,
    backgroundColor: '#fff',
    padding: 0,
  },
  starButton: {
    padding: 12,
  },
  label: {
    fontSize: 20,
    color: '#000',
    marginBottom:18,
    marginLeft: 0,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    minHeight: 150,
    backgroundColor: '#FAFAFA',
  },
  input: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    textAlign: 'left',
    padding: 0,
    height: 150,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    color: '#8F9BB3',
    marginTop: 8,
    marginBottom: 32,
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  submitButton: {
    backgroundColor: '#42865F',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'RedHatDisplay_500Medium',
  },
});
