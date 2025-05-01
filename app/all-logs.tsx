import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

interface LogData {
  id: number;
  title: string;
  description: string;
  date: string;
  created_at: string;
}

const AllLogs = () => {
  const router = useRouter();
  const [userLogs, setUserLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user logs
  useEffect(() => {
    loadUserLogs();
  }, []);

  // Function to load user logs
  const loadUserLogs = async () => {
    try {
      setLoading(true);
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) return;
      
      const userData = JSON.parse(userDataString);
      const response = await fetch(`${API_URL}/user-logs/${userData.id}`);
      
      if (!response.ok) throw new Error('Failed to fetch user logs');
      
      const data = await response.json();
      
      // Sort logs by created_at descending (newest first)
      const sortedLogs = data.sort((a: LogData, b: LogData) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setUserLogs(sortedLogs);
    } catch (error) {
      console.error('Error fetching user logs:', error);
      // Use dummy data if API fails
      setUserLogs(getDummyLogs());
    } finally {
      setLoading(false);
    }
  };

  // Function to handle viewing a log
  const handleViewLog = (log: LogData) => {
    router.push({ pathname: '/ny-log', params: { date: log.created_at, logId: log.id } });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}. ${date.toLocaleString('da-DK', { month: 'long' })} ${date.getFullYear()}`;
  };

  // Get dummy logs if API fails
  const getDummyLogs = (): LogData[] => {
    return [
      {
        id: 1,
        title: 'Besøg hos lægen',
        description: 'Mor havde en god dag hos lægen. Blodtrykket var normalt.',
        date: '2025-04-28',
        created_at: '2025-04-28T14:30:00Z'
      },
      {
        id: 2,
        title: 'Gåtur i parken',
        description: 'Vi gik en lang tur i parken og nød det gode vejr. Mor var i godt humør.',
        date: '2025-04-25',
        created_at: '2025-04-25T16:45:00Z'
      },
      {
        id: 3,
        title: 'Familiemiddag',
        description: 'Hele familien var samlet til middag. Mor genkendte alle og var glad.',
        date: '2025-04-20',
        created_at: '2025-04-20T18:15:00Z'
      },
      {
        id: 4,
        title: 'Besøg af fysioterapeut',
        description: 'Fysioterapeuten kom på besøg og lavede øvelser med mor.',
        date: '2025-04-15',
        created_at: '2025-04-15T11:00:00Z'
      },
      {
        id: 5,
        title: 'Medicinændring',
        description: 'Lægen har justeret mors medicin. Ny dosis starter i morgen.',
        date: '2025-04-10',
        created_at: '2025-04-10T09:30:00Z'
      },
      {
        id: 6,
        title: 'Frisørbesøg',
        description: 'Mor fik klippet hår og var meget tilfreds med resultatet.',
        date: '2025-04-05',
        created_at: '2025-04-05T13:45:00Z'
      },
      {
        id: 7,
        title: 'Tandlægebesøg',
        description: 'Rutineundersøgelse hos tandlægen. Alt så fint ud.',
        date: '2025-03-28',
        created_at: '2025-03-28T10:15:00Z'
      }
    ];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Alle logs</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#42865F" />
          <Text style={styles.loadingText}>Indlæser logs...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {userLogs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Ingen logs fundet</Text>
                <TouchableOpacity 
                  style={styles.createLogButton}
                  onPress={() => router.push('/ny-log')}
                >
                  <Text style={styles.createLogButtonText}>Opret ny log</Text>
                </TouchableOpacity>
              </View>
            ) : (
              userLogs.map((log) => (
                <View key={log.id} style={styles.logItem}>
                  <View style={styles.titleRow}>
                    <View style={styles.titleAndDescription}>
                      <Text style={styles.logTitle} numberOfLines={1}>{log.title}</Text>
                      <Text style={styles.dateText} numberOfLines={1}>
                        {formatDate(log.created_at)}
                      </Text>
                    </View>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity 
                        style={styles.viewLogButton} 
                        onPress={() => handleViewLog(log)}
                      >
                        <Ionicons name="eye-outline" size={18} color="#fff" />
                        <Text style={styles.viewLogButtonText}>Se log</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
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
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#666',
    marginBottom: 20,
  },
  createLogButton: {
    backgroundColor: '#42865F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createLogButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'RedHatDisplay_500Medium',
  },
  logItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleAndDescription: {
    flex: 1,
    marginRight: 16,
  },
  logTitle: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#000',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  viewLogButton: {
    backgroundColor: '#42865F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  viewLogButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'RedHatDisplay_500Medium',
    marginLeft: 4,
  },
});

export default AllLogs;
