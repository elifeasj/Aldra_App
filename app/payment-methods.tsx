import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Dummy payment method data
const PAYMENT_METHODS = [
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    icon: require('../assets/images/apple-pay.png'), // You'll need to add this image
    last4: '',
    type: 'apple-pay'
  },
  {
    id: 'visa-2589',
    name: 'Visa',
    icon: require('../assets/images/visa.png'), // You'll need to add this image
    last4: '2589',
    type: 'card'
  }
];

const PaymentMethods = () => {
  const router = useRouter();
  // State for the selected payment method (Apple Pay by default)
  const [selectedMethodId, setSelectedMethodId] = useState('apple-pay');

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScrollView style={styles.scrollView}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Betalingsoplysninger</Text>
      </View>

        <View style={styles.content}>
          {/* Payment methods section */}
          <Text style={styles.sectionTitle}>Din betalingsmetode</Text>
          
          {/* Payment methods list */}
          <View style={styles.paymentMethodsList}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity 
                key={method.id}
                style={styles.paymentMethodItem}
                onPress={() => setSelectedMethodId(method.id)}
              >
                <View style={styles.paymentMethodLeft}>
                  {/* Payment method icon */}
                  <View style={styles.paymentMethodIcon}>
                    {method.type === 'apple-pay' ? (
                      <Ionicons name="logo-apple" size={24} color="#000" />
                    ) : (
                      <View style={styles.visaLogoContainer}>
                        <Text style={styles.visaLogo}>VISA</Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Payment method details */}
                  <View style={styles.paymentMethodDetails}>
                    <Text style={styles.paymentMethodName}>
                      {method.name}
                      {method.type === 'card' && method.last4 && (
                        <Text style={styles.paymentMethodLast4}>
                          {' •••• •••• •••• ' + method.last4}
                        </Text>
                      )}
                    </Text>
                  </View>
                </View>
                
                {/* Selected indicator */}
                {selectedMethodId === method.id && (
                  <Ionicons name="checkmark" size={24} color="#42865F" />
                )}
              </TouchableOpacity>
            ))}
            
            {/* Add payment method */}
            <TouchableOpacity 
              style={styles.addPaymentMethod}
              onPress={() => router.push('/add-payment-method')}
            >
              <View style={styles.addPaymentMethodLeft}>
                <View style={styles.addIcon}>
                  <Ionicons name="add" size={24} color="#000" />
                </View>
                <Text style={styles.addPaymentMethodText}>Tilføj betalingsmetode</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    fontFamily: 'RedHatDisplay_500Medium',
    marginBottom: 20,
    color: '#000',
  },
  paymentMethodsList: {
    marginBottom: 30,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    width: 40,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  visaLogoContainer: {
    backgroundColor: '#1A1F71', // Visa blue
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  visaLogo: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'RedHatDisplay_700Bold',
    letterSpacing: 1,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000',
  },
  paymentMethodLast4: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#666',
  },
  addPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  addPaymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addIcon: {
    width: 40,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addPaymentMethodText: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000',
  },
});

export default PaymentMethods;
