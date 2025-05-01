import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from '@/components/Toast';

// Define the position options as an enum for better type safety
enum TimestampPosition {
  HIDDEN = 'hidden',
  BOTTOM_LEFT = 'bottomLeft',
  TOP_RIGHT = 'topRight',
  BOTTOM_RIGHT = 'bottomRight',
  CENTER = 'center',
  TOP_LEFT = 'topLeft'
}

const DisplayTimestamp = () => {
  const router = useRouter();
  
  // State for the selected position (radio button behavior)
  const [selectedPosition, setSelectedPosition] = useState<TimestampPosition>(TimestampPosition.BOTTOM_LEFT);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Function to handle position selection (radio button behavior)
  const handlePositionChange = (position: TimestampPosition) => {
    setSelectedPosition(position);
  };

  // Save changes handler
  const handleSaveChanges = () => {
    // Here you would typically save the settings to a backend
    // Show a success toast without navigating back
    setToast({ 
      type: 'success', 
      message: 'Ændringer gemt - tid og dato vises som valgt.' 
    });
    
    // Clear the toast after a few seconds
    setTimeout(() => {
      setToast(null);
      // Optionally navigate back
      // router.back();
    }, 3000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Tid & dato på skærmen</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Main title and description */}
          <Text style={styles.mainTitle}>Vælg hvor dato, tid og dag vises</Text>
          
          <Text style={styles.description}>
            Placér klokkeslæt og dato der hvor det passer bedst til skærmen
          </Text>

          {/* Toggle options */}
          <View style={styles.togglesContainer}>
            {/* Option 1: Hide timestamp */}
            <View style={styles.toggleItem}>
              <Text style={styles.toggleText}>Skjul dato, tid og dag</Text>
              <Switch
                value={selectedPosition === TimestampPosition.HIDDEN}
                onValueChange={(value) => {
                  if (value) handlePositionChange(TimestampPosition.HIDDEN);
                }}
                trackColor={{ false: '#E5E5E5', true: '#42865F' }}
                thumbColor={'#FFFFFF'}
              />
            </View>

            {/* Option 2: Bottom left */}
            <View style={styles.toggleItem}>
              <Text style={styles.toggleText}>Nederst til venstre</Text>
              <Switch
                value={selectedPosition === TimestampPosition.BOTTOM_LEFT}
                onValueChange={(value) => {
                  if (value) handlePositionChange(TimestampPosition.BOTTOM_LEFT);
                }}
                trackColor={{ false: '#E5E5E5', true: '#42865F' }}
                thumbColor={'#FFFFFF'}
              />
            </View>

            {/* Option 3: Top right */}
            <View style={styles.toggleItem}>
              <Text style={styles.toggleText}>Øverst til højre</Text>
              <Switch
                value={selectedPosition === TimestampPosition.TOP_RIGHT}
                onValueChange={(value) => {
                  if (value) handlePositionChange(TimestampPosition.TOP_RIGHT);
                }}
                trackColor={{ false: '#E5E5E5', true: '#42865F' }}
                thumbColor={'#FFFFFF'}
              />
            </View>

            {/* Option 4: Bottom right */}
            <View style={styles.toggleItem}>
              <Text style={styles.toggleText}>Nederst til højre</Text>
              <Switch
                value={selectedPosition === TimestampPosition.BOTTOM_RIGHT}
                onValueChange={(value) => {
                  if (value) handlePositionChange(TimestampPosition.BOTTOM_RIGHT);
                }}
                trackColor={{ false: '#E5E5E5', true: '#42865F' }}
                thumbColor={'#FFFFFF'}
              />
            </View>

            {/* Option 5: Center */}
            <View style={styles.toggleItem}>
              <Text style={styles.toggleText}>Midt på skærmen</Text>
              <Switch
                value={selectedPosition === TimestampPosition.CENTER}
                onValueChange={(value) => {
                  if (value) handlePositionChange(TimestampPosition.CENTER);
                }}
                trackColor={{ false: '#E5E5E5', true: '#42865F' }}
                thumbColor={'#FFFFFF'}
              />
            </View>

            {/* Option 6: Top left */}
            <View style={styles.toggleItem}>
              <Text style={styles.toggleText}>Øverst til venstre</Text>
              <Switch
                value={selectedPosition === TimestampPosition.TOP_LEFT}
                onValueChange={(value) => {
                  if (value) handlePositionChange(TimestampPosition.TOP_LEFT);
                }}
                trackColor={{ false: '#E5E5E5', true: '#42865F' }}
                thumbColor={'#FFFFFF'}
              />
            </View>
          </View>

          {/* Save button */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveChanges}
          >
            <Text style={styles.saveButtonText}>Gem ændringerne</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Toast notification */}
      {toast && (
        <Toast type={toast.type} message={toast.message} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 24,
    fontFamily: 'RedHatDisplay_500Medium',
    marginBottom: 12,
    color: '#000',
  },
  description: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
    lineHeight: 22,
    marginBottom: 30,
  },
  togglesContainer: {
    marginBottom: 30,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  toggleText: {
    fontSize: 19,
    color: '#333',
    fontFamily: 'RedHatDisplay_400Regular',
  },
  saveButton: {
    backgroundColor: '#42865F',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'RedHatDisplay_500Medium',
  },
});

export default DisplayTimestamp;
