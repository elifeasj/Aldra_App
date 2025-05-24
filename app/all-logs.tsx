import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, firestore } from '../firebase';

interface LogData {
  id: string;
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
      const user = auth.currentUser;
      if (!user) throw new Error('Bruger ikke logget ind');
  
      const q = query(
        collection(firestore, 'user_logs'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );
  
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          date: data.date || '',
          created_at: data.created_at?.toDate().toISOString() || '',
        };
      });
  
      setUserLogs(logs);
    } catch (error) {
      console.error('❌ Fejl ved hentning af logs:', error);
      setUserLogs([]);
    } finally {
      setLoading(false);
    }
  };  

  // Function to handle viewing a log
  const handleViewLog = (log: LogData) => {
    router.push({ pathname: '/ny-log', params: { date: log.date, logId: log.id } });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}. ${date.toLocaleString('da-DK', { month: 'long' })} ${date.getFullYear()}`;
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
                        {formatDate(log.date)}
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
    paddingTop: 80,
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
    paddingVertical: 20,
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
    fontSize: 20,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
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
    fontSize: 16,
    fontFamily: 'RedHatDisplay_500Medium',
    marginLeft: 4,
  },
});

export default AllLogs;
