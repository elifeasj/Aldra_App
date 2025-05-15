import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import CancellationModal from '../components/CancellationModal';

const { width } = Dimensions.get('window');
const cardWidth = width - 40; // Full width minus padding

const CancelMembership = () => {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeCard, setActiveCard] = useState(0);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [cancellationModalVisible, setCancellationModalVisible] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Handle scroll events to update active card
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newActiveCard = Math.round(contentOffsetX / cardWidth);
    if (newActiveCard !== activeCard) {
      setActiveCard(newActiveCard);
    }
  };

  // Scroll to specific card
  const scrollToCard = (index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * cardWidth, animated: true });
    setActiveCard(index);
  };

  // Handle confirmation of cancellation
  const handleConfirmCancel = () => {
    setConfirmModalVisible(false);
    
    // Show cancellation modal instead of toast
    setCancellationModalVisible(true);
  };
  
  // Handle reactivation of membership
  const handleReactivate = () => {
    setCancellationModalVisible(false);
    
    // Show welcome back toast
    setToast({ 
      type: 'success', 
      message: 'Velkommen tilbage! Dit medlemskab er aktivt – alt er som før.' 
    });
    
    // Clear toast after a few seconds
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };
  
  // Navigate to overview screen
  const navigateToOverview = () => {
    router.push('/oversigt');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScrollView style={styles.scrollView}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Afmeld medlemskab</Text>
      </View>

        <View style={styles.content}>
          {/* Main heading */}
          <Text style={styles.greenHeading}>Vi håber, vi har gjort en forskel💚</Text>
          
          {/* Description text */}
          <Text style={styles.descriptionText}>
            Vi forstår, at behov kan ændre sig.
          </Text>
          <Text style={styles.descriptionText}>
            Her er en oversigt over, hvad du stadig har adgang til:
          </Text>
          <Text style={styles.descriptionText}>
            Skub for at se dine muligheder uden medlemskab.
          </Text>
          
          {/* Horizontally scrollable cards */}
          <View style={styles.cardsContainer}>
            <ScrollView 
              ref={scrollViewRef}
              horizontal 
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.cardsScrollContent}
            >
              {/* Card 1: What you lose */}
              <View style={[styles.card, styles.loseCard]}>
                <View style={styles.cardItem}>
                  <View style={styles.cardItemHeader}>
                    <Ionicons name="close" size={20} color="#B73C3C" />
                    <Text style={styles.cardItemTitle}>Minder</Text>
                  </View>
                  <Text style={styles.cardItemDescription}>
                    Din personlige samling af billeder, lyd og historier – skabt til at bevare det nære.
                  </Text>
                </View>
                
                <View style={styles.cardItem}>
                  <View style={styles.cardItemHeader}>
                    <Ionicons name="close" size={20} color="#B73C3C" />
                    <Text style={styles.cardItemTitle}>Aldra Display</Text>
                  </View>
                  <Text style={styles.cardItemDescription}>
                    Skærmen, der viser minder og bringer genkendelse og ro i hverdagen, vil ikke længere være aktiv.
                  </Text>
                </View>
                
                <View style={styles.cardItem}>
                  <View style={styles.cardItemHeader}>
                    <Ionicons name="close" size={20} color="#B73C3C" />
                    <Text style={styles.cardItemTitle}>Aldra familie</Text>
                  </View>
                  <Text style={styles.cardItemDescription}>
                    Fælles adgang for familien – og muligheden for at bygge videre på jeres fortælling sammen.
                  </Text>
                </View>
              </View>
              
              {/* Card 2: What you keep */}
              <View style={[styles.card, styles.keepCard]}>
                <View style={styles.cardItem}>
                  <View style={styles.cardItemHeader}>
                    <Ionicons name="checkmark" size={20} color="#42865F" />
                    <Text style={[styles.cardItemTitle, styles.keepCardTitle]}>Vejledninger og støtte</Text>
                  </View>
                  <Text style={styles.cardItemDescription}>
                    Praktiske råd og støtte til hverdagen som pårørende.
                  </Text>
                </View>
                
                <View style={styles.cardItem}>
                  <View style={styles.cardItemHeader}>
                    <Ionicons name="checkmark" size={20} color="#42865F" />
                    <Text style={[styles.cardItemTitle, styles.keepCardTitle]}>Kalender og påmindelser</Text>
                  </View>
                  <Text style={styles.cardItemDescription}>
                    Hold styr på vigtige datoer og få ro i hverdagen.
                  </Text>
                </View>
                
                <View style={styles.cardItem}>
                  <View style={styles.cardItemHeader}>
                    <Ionicons name="checkmark" size={20} color="#42865F" />
                    <Text style={[styles.cardItemTitle, styles.keepCardTitle]}>Samtalekort og inspiration</Text>
                  </View>
                  <Text style={styles.cardItemDescription}>
                    Skab nærværende samtaler – også uden medlemskab.
                  </Text>
                </View>
              </View>
            </ScrollView>
            
            {/* Pagination dots */}
            <View style={styles.paginationContainer}>
              <TouchableOpacity 
                style={[styles.paginationDot, activeCard === 0 && styles.activeDot]} 
                onPress={() => scrollToCard(0)}
              />
              <TouchableOpacity 
                style={[styles.paginationDot, activeCard === 1 && styles.activeDot]} 
                onPress={() => scrollToCard(1)}
              />
            </View>
          </View>
          
          {/* Action buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setConfirmModalVisible(true)}
            >
              <Text style={styles.cancelButtonText}>Bekræft afmelding</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.keepButton}
              onPress={() => {
                // Show success toast
                setToast({ 
                  type: 'success', 
                  message: 'Velkommen tilbage! Dit medlemskab er aktivt – alt er som før.' 
                });
                
                // Clear toast after a few seconds and navigate back
                setTimeout(() => {
                  setToast(null);
                  router.back();
                }, 3000);
              }}
            >
              <Text style={styles.keepButtonText}>Behold medlemskab</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmModalVisible}
        message="Er du sikker på, at du vil afmelde dit medlemskab? Du mister adgang til alle premium-funktioner ved udgangen af din nuværende periode."
        confirmText="Ja, afmeld"
        cancelText="Nej, behold"
        onConfirm={handleConfirmCancel}
        onCancel={() => setConfirmModalVisible(false)}
      />
      
      {/* Cancellation Modal */}
      <CancellationModal
        visible={cancellationModalVisible}
        onClose={() => setCancellationModalVisible(false)}
        onGoToOverview={navigateToOverview}
        onReactivate={handleReactivate}
      />
      
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  greenHeading: {
    fontSize: 24,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#42865F',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
    lineHeight: 30,
    marginBottom: 8,
  },
  cardsContainer: {
    marginTop: 24,
    marginBottom: 30,
  },
  cardsScrollContent: {
    paddingRight: 20, // Add padding for the last card
  },
  card: {
    width: cardWidth,
    borderRadius: 16,
    padding: 20,
    marginRight: 20,
  },
  loseCard: {
    borderWidth: 1,
    borderColor: '#B73C3C',
  },
  keepCard: {
    borderWidth: 1,
    borderColor: '#42865F',
  },
  cardItem: {
    marginBottom: 16,
  },
  cardItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardItemTitle: {
    fontSize: 22,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#B73C3C',
    marginLeft: 8,
  },
  keepCardTitle: {
    color: '#42865F',
  },
  cardItemDescription: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
    lineHeight: 30,
    paddingLeft: 28,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#42865F',
  },
  buttonsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  cancelButtonText: {
    fontSize: 20,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#B73C3C',
  },
  keepButton: {
    backgroundColor: '#42865F',
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
  },
  keepButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'RedHatDisplay_500Medium',
  },
});

export default CancelMembership;
