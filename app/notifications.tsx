import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Notifications = () => {
  const router = useRouter();
  
  // Toggle states
  const [allNotifications, setAllNotifications] = useState(true);
  const [plannedReminders, setPlannedReminders] = useState(true);
  const [communication, setCommunication] = useState(true);
  const [system, setSystem] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  // Save changes handler (dummy for now)
  const handleSaveChanges = () => {
    // Here you would typically save the settings to a backend
    // For now, we'll just go back to the previous screen
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifikationer</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Main toggle */}
          <View style={styles.toggleItem}>
            <Text style={styles.toggleText}>Slå alle notifikationer fra</Text>
            <Switch
              value={allNotifications}
              onValueChange={(value) => {
                setAllNotifications(value);
                // If turning off all notifications, disable all other toggles
                if (!value) {
                  setPlannedReminders(false);
                  setCommunication(false);
                  setSystem(false);
                  setPushNotifications(false);
                  setEmailNotifications(false);
                }
              }}
              trackColor={{ false: '#E5E5E5', true: '#42865F' }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          {/* Section: Notification types */}
          <Text style={styles.sectionTitle}>Hvilke notifikationer vil du modtage?</Text>
          
          <View style={styles.toggleItem}>
            <View style={styles.toggleItemContent}>
              <Text style={styles.toggleText}>Planlagte minder & påmindelser</Text>
              <Text style={styles.toggleDescription}>Planlagte minder, kalenderpåmindelser</Text>
            </View>
            <Switch
              value={plannedReminders}
              onValueChange={setPlannedReminders}
              trackColor={{ false: '#E5E5E5', true: '#42865F' }}
              thumbColor={'#FFFFFF'}
              disabled={!allNotifications}
            />
          </View>

          <View style={styles.toggleItem}>
            <View style={styles.toggleItemContent}>
              <Text style={styles.toggleText}>Kommunikation & interaktion</Text>
              <Text style={styles.toggleDescription}>Nye minder delt af din familiemedlemmer</Text>
            </View>
            <Switch
              value={communication}
              onValueChange={setCommunication}
              trackColor={{ false: '#E5E5E5', true: '#42865F' }}
              thumbColor={'#FFFFFF'}
              disabled={!allNotifications}
            />
          </View>

          <View style={styles.toggleItem}>
            <View style={styles.toggleItemContent}>
              <Text style={styles.toggleText}>System & konto</Text>
              <Text style={styles.toggleDescription}>Opdateringer, nye funktioner i appen</Text>
            </View>
            <Switch
              value={system}
              onValueChange={setSystem}
              trackColor={{ false: '#E5E5E5', true: '#42865F' }}
              thumbColor={'#FFFFFF'}
              disabled={!allNotifications}
            />
          </View>

          {/* Section: Notification methods */}
          <Text style={styles.sectionTitle}>Hvordan vil du modtage notifikationer?</Text>
          
          <View style={styles.toggleItem}>
            <View style={styles.toggleItemContent}>
              <Text style={styles.toggleText}>Push-notifikationer</Text>
              <Text style={styles.toggleDescription}>Modtag påmindelser og opdateringer i appen</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#E5E5E5', true: '#42865F' }}
              thumbColor={'#FFFFFF'}
              disabled={!allNotifications}
            />
          </View>

          <View style={styles.toggleItem}>
            <View style={styles.toggleItemContent}>
              <Text style={styles.toggleText}>E-mail notifikationer</Text>
              <Text style={styles.toggleDescription}>Få beskeder og opdateringer via e-mail</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#E5E5E5', true: '#42865F' }}
              thumbColor={'#FFFFFF'}
              disabled={!allNotifications}
            />
          </View>

          {/* Save button */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveChanges}
          >
            <Text style={styles.saveButtonText}>Gem ændringer</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  toggleItemContent: {
    flex: 1,
  },
  toggleText: {
    fontSize: 19,
    color: '#333',
    fontFamily: 'RedHatDisplay_400Regular',
  },
  toggleDescription: {
    fontSize: 16,
    color: '#707070',
    fontFamily: 'RedHatDisplay_400Regular',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'RedHatDisplay_500Medium',
    marginTop: 30,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#42865F',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'RedHatDisplay_500Medium',
  },
});

export default Notifications;
