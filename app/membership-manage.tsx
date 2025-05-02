import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '@/components/Toast';

// Define subscription plan types
type SubscriptionPlan = 'monthly' | 'quarterly' | 'yearly';

const MembershipManage = () => {
  const router = useRouter();
  // State for the selected plan (monthly by default)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly');
  // State for modal visibility
  const [modalVisible, setModalVisible] = useState(false);
  // State for toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScrollView style={styles.scrollView}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Administrer medlemskab</Text>
      </View>

        <View style={styles.content}>
          {/* Membership section */}
          <Text style={styles.sectionTitle}>Dit medlemskab</Text>
          
          {/* Monthly plan card */}
          <TouchableOpacity 
            style={[
              styles.planCard, 
              selectedPlan === 'monthly' && styles.selectedPlanCard
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={styles.planCardContent}>
              <View style={styles.planCardHeader}>
                <Text style={styles.planTitle}>Månedlig</Text>
                {selectedPlan === 'monthly' && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#42865F" />
                  </View>
                )}
              </View>
              
              <Text style={styles.trialText}>7 dages gratis prøveperiode</Text>
              <Text style={styles.priceText}>derefter 199 kr./måned</Text>
            </View>
          </TouchableOpacity>
          
          {/* Quarterly plan card */}
          <TouchableOpacity 
            style={[
              styles.planCard, 
              selectedPlan === 'quarterly' && styles.selectedPlanCard
            ]}
            onPress={() => setSelectedPlan('quarterly')}
          >
            <View style={styles.planCardContent}>
              <View style={styles.planCardHeader}>
                <Text style={styles.planTitle}>Kvartal</Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>Spar 10%</Text>
                </View>
                {selectedPlan === 'quarterly' && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#42865F" />
                  </View>
                )}
              </View>
              
              <Text style={styles.trialText}>7 dages gratis prøveperiode</Text>
              <Text style={styles.priceText}>derefter 566,55 kr./kvartal (189 kr/md)</Text>
            </View>
          </TouchableOpacity>
          
          {/* Yearly plan card */}
          <TouchableOpacity 
            style={[
              styles.planCard, 
              selectedPlan === 'yearly' && styles.selectedPlanCard
            ]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <View style={styles.planCardContent}>
              <View style={styles.planCardHeader}>
                <Text style={styles.planTitle}>Årligt</Text>
                <View style={[styles.saveBadge, styles.saveBadgeYearly]}>
                  <Text style={styles.saveBadgeText}>Spar 20%</Text>
                </View>
                {selectedPlan === 'yearly' && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#42865F" />
                  </View>
                )}
              </View>
              
              <Text style={styles.trialText}>7 dages gratis prøveperiode</Text>
              <Text style={styles.priceText}>derefter 2.143,70 kr./år (179 kr/md)</Text>
            </View>
          </TouchableOpacity>
          
          {/* Description text */}
          <Text style={styles.descriptionText}>
            Dit abonnement fornys månedligt efter 7 dages prøveperiode – indtil du opsiger.
          </Text>
          
          {/* Keep membership button */}
          <TouchableOpacity 
            style={styles.keepButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.keepButtonText}>Skift medlemskab</Text>
          </TouchableOpacity>
          
          {/* Confirmation Modal */}
          <ConfirmationModal
            visible={modalVisible}
            message="Du er ved at ændre din nuværende medlemskab. Ændringen træder i kraft ved næste fornyelse, og du beholder resten af din nuværende periode."
            onConfirm={() => {
              setModalVisible(false);
              // Show success toast
              setToast({ 
                type: 'success', 
                message: 'Din medlemskab er blevet ændret' 
              });
              
              // Clear toast after a few seconds
              setTimeout(() => {
                setToast(null);
                // Navigate back to membership screen
                router.back();
              }, 2000);
            }}
            onCancel={() => setModalVisible(false)}
          />
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
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'RedHatDisplay_400Regular',
    marginBottom: 30,
    color: '#000',
  },
  planCard: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    marginBottom: 26,
    backgroundColor: '#fff',
  },
  selectedPlanCard: {
    borderColor: '#42865F',
    borderWidth: 2,
  },
  planCardContent: {
    padding: 20,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 22,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#000',
    marginRight: 12,
  },
  saveBadge: {
    backgroundColor: '#42865F',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  saveBadgeYearly: {
    backgroundColor: '#42865F',
  },
  saveBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'RedHatDisplay_500Medium',
  },
  checkmarkContainer: {
    marginLeft: 'auto',
  },
  trialText: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#666',
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#666',
    lineHeight: 24,
    marginTop: 8,
    marginBottom: 30,
  },
  keepButton: {
    backgroundColor: '#42865F',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  keepButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'RedHatDisplay_500Medium',
  },
});

export default MembershipManage;
