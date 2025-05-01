import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Membership = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Medlemskab</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Membership section */}
          <Text style={styles.sectionTitle}>Dit medlemskab</Text>
          
          {/* Membership card */}
          <View style={styles.membershipCard}>
            <View style={styles.membershipCardHeader}>
              <Text style={styles.membershipTitle}>Aldra+ medlem</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>AKTIV</Text>
              </View>
            </View>
            
            <Text style={styles.renewalText}>Fornyes den 9. juni 2025</Text>
            <Text style={styles.priceText}>199 kr./md. inkl. Aldra Display</Text>
            
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={() => router.push('/membership-manage')}
            >
              <Text style={styles.adminButtonText}>Administrer medlemskab</Text>
            </TouchableOpacity>
          </View>
          
          {/* Menu items */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/payment-methods')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="card-outline" size={24} color="#000" style={styles.menuIcon} />
              <Text style={styles.menuText}>Betalingsoplysninger</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#707070" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/cancel-membership')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="close-circle-outline" size={24} color="#000" style={styles.menuIcon} />
              <Text style={styles.menuText}>Afmeld medlemskab</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#707070" />
          </TouchableOpacity>
          
          {/* Help section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Brug for hjælp?</Text>
            <Text style={styles.helpText}>
              Skriv endelig til os, hvis du er i tvivl om noget – uanset om 
              det handler om betaling, adgang eller opsigelse.
            </Text>
            <Text style={styles.helpText}>
              Vi er her for at hjælpe dig, og vi bestræber os på at svare 
              så hurtigt og venligt som muligt.
            </Text>
            <TouchableOpacity>
              <Text style={styles.supportEmail}>support@aldra.dk</Text>
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
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'RedHatDisplay_500Medium',
    marginBottom: 20,
    color: '#000',
  },
  membershipCard: {
    backgroundColor: '#42865F',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
  },
  membershipCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  membershipTitle: {
    fontSize: 24,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#fff',
  },
  statusBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#42865F',
  },
  renewalText: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#fff',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#fff',
    marginBottom: 24,
  },
  adminButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  adminButtonText: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#42865F',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000',
  },
  helpSection: {
    marginTop: 40,
  },
  helpTitle: {
    fontSize: 22,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#42865F',
    marginBottom: 16,
  },
  helpText: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  supportEmail: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#42865F',
    marginTop: 8,
  },
});

export default Membership;
