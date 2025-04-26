import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data for current user
const currentUser = {
  name: 'Lone',
};

// Define types
interface Memory {
  id: string;
  title: string;
  type: string;
  startTime?: string;
  endTime?: string;
  isPlaying?: boolean;
  date?: string;
  addedBy?: string;
  profileImage?: string;
}

// Mock data for currently playing memories
const currentPlayingMemories: Memory[] = [
  {
    id: '1',
    title: 'Danmark 1974 - ErindringsBio',
    type: 'Kortfilm',
    startTime: '10:00',
    endTime: '10:30',
    isPlaying: true,
  },
  {
    id: '2',
    title: 'Sommerferien 1986',
    type: 'Billeder',
    startTime: '11:00',
    endTime: '11:30',
    isPlaying: false,
  },
  {
    id: '3',
    title: 'Musik fra 60erne',
    type: 'Musik',
    startTime: '14:00',
    endTime: '14:45',
    isPlaying: false,
  },
];

// Mock data for recently added memories
const recentMemories: Memory[] = [
  {
    id: '1',
    title: 'Danmark 1974',
    type: 'Billeder',
    date: '21. november',
    addedBy: 'Lena',
    profileImage: 'https://randomuser.me/api/portraits/women/43.jpg',
  },
  {
    id: '2',
    title: 'Familiebilleder',
    type: 'Billeder',
    date: '22. november',
    addedBy: 'Morten',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '3',
    title: 'Wonderwall (1995)',
    type: 'Musik',
    date: '19. november',
    addedBy: 'Lena',
    profileImage: 'https://randomuser.me/api/portraits/women/43.jpg',
  },
  {
    id: '4',
    title: 'Billede af mor',
    type: 'Billeder',
    date: '16. november',
    addedBy: 'Pia',
    profileImage: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
];

// Components
const DisplayStatusCard = ({ isConnected = false }) => {
  return (
    <View style={styles.displayCard}>
      <Image 
        source={require('../../assets/images/aldra_logo.png')} 
        style={styles.displayImage} 
        resizeMode="cover"
      />
      <View style={styles.displayOverlay}>
        <View style={styles.displayStatus}>
          <Text style={styles.displayTitle}>Aldra Display</Text>
          {isConnected ? (
            <View style={styles.connectedContainer}>
              <Text style={styles.connectedText}>Forbundet</Text>
              <Ionicons name="checkmark-circle" size={16} color="#42865F" />
            </View>
          ) : (
            <TouchableOpacity style={styles.connectButton}>
              <Text style={styles.connectButtonText}>Forbind</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const CurrentPlayingSection = ({ memories }: { memories: Memory[] }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Aktuel visning på enheden</Text>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.currentPlayingScrollContainer}
      >
        {/* Currently playing memory */}
        {memories.length > 0 && (
          <View key={memories[0].id} style={styles.playingCard}>
            <View style={styles.playingHeader}>
              <View style={styles.playIconContainer}>
                <Ionicons name="play" size={20} color="#42865F" />
              </View>
              <View style={styles.playingTitleContainer}>
                <Text style={styles.playingTitle}>{memories[0].title}</Text>
                <Text style={styles.playingType}>{memories[0].type}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.playingTimeRow}>
              <Ionicons name="time-outline" size={16} color="#42865F" />
              <Text style={styles.playingTime}>{memories[0].startTime} - {memories[0].endTime}</Text>
              
              <TouchableOpacity style={styles.playNowButton}>
                <Text style={styles.playNowText}>Afspilles nu</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Upcoming memories */}
        {memories.slice(1).map((memory: Memory) => (
          <View key={memory.id} style={styles.playingCard}>
            <View style={styles.playingHeader}>
              <View style={styles.playIconContainer}>
                <Ionicons name="image-outline" size={20} color="#42865F" />
              </View>
              <View style={styles.playingTitleContainer}>
                <Text style={styles.playingTitle}>{memory.title}</Text>
                <Text style={styles.playingType}>{memory.type}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.playingTimeRow}>
              <Ionicons name="time-outline" size={16} color="#42865F" />
              <Text style={styles.playingTime}>{memory.startTime} - {memory.endTime}</Text>
              
              <TouchableOpacity style={styles.planlagtButton}>
                <Text style={styles.planlagtButtonText}>Planlagt</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const AddMemoryButtons = () => {
  const memoryTypes = [
    { id: '1', title: 'Billede', icon: 'image-outline' as const },
    { id: '2', title: 'Musik', icon: 'musical-notes-outline' as const },
    { id: '3', title: 'Video', icon: 'film-outline' as const },
    { id: '4', title: 'Kortfilm', icon: 'play-circle-outline' as const },
  ];

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Tilføj minder</Text>
      <View style={styles.memoryButtonsContainer}>
        {memoryTypes.map((type) => (
          <TouchableOpacity key={type.id} style={styles.memoryButton}>
            <View style={styles.iconCircle}>
              <Ionicons name={type.icon as any} size={28} color="#42865F" />
            </View>
            <Text style={styles.memoryButtonText}>{type.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const RecentMemoriesList = ({ memories }: { memories: Memory[] }) => {
  // Only show the 5 most recent memories
  const recentFiveMemories = memories.slice(0, 5);
  
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Seneste tilføjede minder</Text>
      <View style={styles.recentMemoriesContainer}>
        {recentFiveMemories.map((memory: Memory) => (
          <View key={memory.id} style={styles.recentMemoryItem}>
            <View style={styles.recentMemoryContent}>
              <View style={styles.memoryTypeIconContainer}>
                <Ionicons 
                  name={memory.type === 'Billeder' ? 'image-outline' as const : 
                        memory.type === 'Musik' ? 'musical-notes-outline' as const : 
                        memory.type === 'Videobesked' ? 'videocam-outline' as const : 'play-circle-outline' as const} 
                  size={24} 
                  color="#42865F" 
                />
              </View>
              <View style={styles.memoryDetails}>
                <Text style={styles.recentMemoryTitle}>{memory.title}</Text>
                <Text style={styles.recentMemoryMeta}>Tilføjet af {memory.addedBy} · {memory.date}</Text>
              </View>
            </View>
            <Image 
              source={{ uri: memory.profileImage }} 
              style={styles.profileImage} 
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default function Minder() {
  const [isDisplayConnected, setIsDisplayConnected] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Minder</Text>
        <Text style={styles.subtitle}>{currentUser.name}'s minder</Text>
        
        {/* Aldra Display Status */}
        <DisplayStatusCard isConnected={isDisplayConnected} />
        
        {/* Currently Playing Memories */}
        <CurrentPlayingSection memories={currentPlayingMemories} />
        
        {/* Add Memory Buttons */}
        <AddMemoryButtons />
        
        {/* Recent Memories List */}
        <RecentMemoriesList memories={recentMemories} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    marginTop: 35,
    marginBottom: 100,
  },
  title: {
    fontSize: 36,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#42865F',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#666',
    marginBottom: 20,
  },
  sectionContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
    marginBottom: 20,
  },
  
  // Display Card Styles
  displayCard: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
  },
  displayImage: {
    width: '100%',
    height: '100%',
  },
  displayOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
  },
  displayStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  displayTitle: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#333',
  },
  connectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedText: {
    fontSize: 17,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#42865F',
    marginRight: 4,
  },
  connectButton: {
    backgroundColor: '#42865F',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'RedHatDisplay_700Bold',
  },
  
  // Current Playing Styles
  currentPlayingScrollContainer: {
    paddingRight: 16,
  },
  playingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7E6',
    padding: 0,
    marginRight: 12,
    marginBottom: 8,
    width: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  planlagtButton: {
    backgroundColor: '#666',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  planlagtButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'RedHatDisplay_700Bold',
  },
  playingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  playIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 0.2,
    borderColor: '#42865F',
    backgroundColor: '#F5F7F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  playingTitleContainer: {
    flex: 1,
  },
  playingTitle: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#333',
    marginBottom: 4,
  },
  playingType: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7E6',
    marginHorizontal: 10,
  },
  playingTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  playingTime: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#42865F',
    marginLeft: 8,
    flex: 1,
  },
  playNowButton: {
    backgroundColor: '#42865F',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  playNowText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'RedHatDisplay_700Bold',
  },
  
  // Memory Buttons Styles
  memoryButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  memoryButton: {
    width: '48%',
    backgroundColor: '#42865F',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  memoryButtonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'RedHatDisplay_500Medium',
  },
  
  // Recent Memories Styles
  recentMemoriesContainer: {
    backgroundColor: '#FFFFFF',
  },
  recentMemoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7E6',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7E6',
  },
  recentMemoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memoryTypeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F7F6',
    borderWidth: 0.2,
    borderColor: '#42865F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  memoryDetails: {
    flex: 1,
  },
  recentMemoryTitle: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#333',
    marginBottom: 4,
  },
  recentMemoryMeta: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#666',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7E6',
  },
});
