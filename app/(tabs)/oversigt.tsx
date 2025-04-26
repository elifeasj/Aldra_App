import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform, Keyboard, ViewStyle, TextStyle } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../config';
import supabase from '../../config/supabase';
import * as Progress from 'react-native-progress';
import { useIsFocused } from '@react-navigation/native';
import { Guide } from '../../types/guides';
import { STRAPI_URL } from '../../config/api';
import { mapGuideData } from '../../utils/guideUtils';
import { GuideCard } from '../../components/guides/GuideCard';


export default function Oversigt() {
    const { userName } = useLocalSearchParams();
    const router = useRouter();
    const [userId, setUserId] = useState('');
    const isFocused = useIsFocused();

    //vejledning cards visning
    const [guides, setGuides] = useState<Guide[]>([]);

    useEffect(() => {
      const fetchGuides = async () => {
        try {
          const res = await fetch(`${STRAPI_URL}/api/guides?filters[visible][$eq]=true&populate=*`);
          const json = await res.json();
    
          if (!res.ok) {
            console.error('❌ Failed to fetch guides:', json);
            return;
          }
    
          const rawGuides = json.data.map(mapGuideData);
          setGuides(rawGuides);
        } catch (err) {
          console.error('❌ Error fetching guides:', err);
        }
      };
    
      fetchGuides();
    }, []);
    
    
    
    // Handler for Samtalekort card tap
    const handleSamtalekortPress = () => {
        router.push('/samtalekort' as any);
    };

    // State for personalization completion check
    const [hasCompletedPersonalization, setHasCompletedPersonalization] = useState(false);

    useEffect(() => {
        const check = async () => {
            const completed = await AsyncStorage.getItem('personalizationCompleted');
            setHasCompletedPersonalization(completed === 'true');
          };
          check();
    }, []);

      
    // Funktion til at formatere navn med stort første bogstav
    const formatName = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };


    // Kommende besøg
    interface Appointment {
        id: number;
        title: string;
        date: string;
        description?: string;
        start_time?: string;
        end_time?: string;
        reminder?: boolean;
    }

    // State for kommende besøg
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

    // State for logs
    const [appointmentsWithLogs, setAppointmentsWithLogs] = useState<Record<number, number>>({});


    // ⬇️ Effekt ved load
    useEffect(() => {
        const fetchUpcomingAppointments = async () => {
          try {
            const userDataString = await AsyncStorage.getItem('userData');
            if (!userDataString) return;
      
            const userData = JSON.parse(userDataString);
            console.log("🔐 Bruger-ID:", userData.id);
      
            // Fetch aftaler
            const response = await fetch(`${API_URL}/appointments/all?user_id=${userData.id}`);
            if (!response.ok) {
              const errorText = await response.text();
              console.error('❌ Server-fejl:', errorText);
              return;
            }
      
            const allAppointments: Appointment[] = await response.json();
            const today = new Date().toISOString().split('T')[0];
      
            const upcoming = allAppointments
              .filter((a) => {
                const appointmentDate = new Date(a.date).toISOString().split('T')[0];
                return appointmentDate >= today;
              })
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 2);
      
            setUpcomingAppointments(upcoming);
            console.log("✅ upcomingAppointments sat til:", upcoming);
      
            // Fetch logs bagefter
            const logsResponse = await fetch(`${API_URL}/logs/user/${userData.id}`);
            const logs = await logsResponse.json();
      
            const mapping: Record<number, number> = {};
            logs.forEach((log: any) => {
              if (log.appointment_id) {
                mapping[log.appointment_id] = log.id;
              }
            });
      
            setAppointmentsWithLogs(mapping);
            console.log("📚 Logs mapping:", mapping);
      
          } catch (err) {
            console.error('Fejl ved hentning:', err);
          }
        };
      
        if (isFocused) {
          fetchUpcomingAppointments();
        }
      }, [isFocused]);
      
    const ProfileCompletion = () => {
        if (!hasCompletedPersonalization) {
          return (
            <TouchableOpacity 
              style={[styles.card, styles.progressCard]}
              onPress={() => router.push('/personalization')}
            >
              <View style={styles.progressContainer}>
                <View style={styles.progressCircle}>
                  <Progress.Circle
                    progress={0.2}
                    size={60}
                    thickness={8}
                    color="#FFFF"
                    unfilledColor="#D1D5DB"
                    borderWidth={0}
                    strokeCap="round"
                    style={styles.progressRing}
                  />
                  <Text style={styles.progressText}>20%</Text>
                </View>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressTitle}>Færdiggør din profil</Text>
                  <Text style={styles.progressSubtext}>Udfyld din profil for at tilpasse appen til dine behov.</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" style={styles.progressArrow} />
              </View>
            </TouchableOpacity>
          );
        }
        return null;
    };

   // Personalization   
    const [displayName, setDisplayName] = useState('Bruger');

    useEffect(() => {
        const checkPersonalization = async () => {
            try {
              const userDataString = await AsyncStorage.getItem('userData');
              if (userDataString) {
                const { id } = JSON.parse(userDataString); 
                const { data } = await supabase
                  .from('user_profile_answers')
                  .select('*')
                  .eq('user_id', id)
                  .single();
                setHasCompletedPersonalization(!!data);
                setUserId(id);
              }
            } catch (error) {
                console.error('Error checking personalization:', error);
            }
        };

        checkPersonalization();
        const getUserName = async () => {
            try {
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    const { name } = JSON.parse(userData);
                    setDisplayName(formatName(name));
                }
            } catch (error) {
                console.error('Error getting user name:', error);
            }
        };
        getUserName();
    }, []);


    return (
        <ScrollView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Hej, {displayName}!</Text>
            <Text style={styles.subtitle}>Din oversigt</Text>
      
            {/* Top kort række */}
            <View style={styles.cardRow}>
              {/* Familie kort */}
              <View style={[styles.card, styles.halfCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Familie</Text>
                  <Ionicons name="people" size={22} color="white" />
                </View>
                <TouchableOpacity style={styles.cardButton}>
                  <Text style={styles.cardButtonText}>Opret Aldra-link</Text>
                  <Ionicons name="chevron-forward" size={16} color="#42865F" />
                </TouchableOpacity>
              </View>
      
              {/* Minder kort */}
              <View style={[styles.card, styles.halfCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Minder</Text>
                  <Ionicons name="images" size={22} color="white" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardSubtext}>5 minder tilføjet</Text>
                  <Text style={styles.cardSubtext}>Se eller tilføj flere.</Text>
                </View>
                <TouchableOpacity style={styles.cardButton}>
                  <Text style={styles.cardButtonText}>Tilføj ny minde</Text>
                  <Ionicons name="chevron-forward" size={16} color="#42865F" />
                </TouchableOpacity>
              </View>
            </View>
      
            <ProfileCompletion />

            {/* Samtalekort Card */}
            <TouchableOpacity
                style={styles.samtalekortCard}
                activeOpacity={0.8}
                onPress={handleSamtalekortPress}
            >
                {/* Background Image */}
                <Image
                    source={require('../../assets/images/conversationcardicon-white.png')}
                    style={styles.cardBackgroundImage}
                    resizeMode="contain"
                />

                <View style={styles.cardContent}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.samtalekortTitle}>Samtalekort</Text>
                        <Text style={styles.samtalekortSubtitle}>
                            Spørgsmål, der åbner op for samtaler om livets oplevelser.
                        </Text>
                    </View>
                    <View style={styles.cardIconWrapper}>
                        <Ionicons name="chevron-forward" size={20} color="#fff" />
                    </View>
                </View>
            </TouchableOpacity>

    
            {/* Kommende besøg sektion */}
            <View style={styles.visitsSection}>
              <Text style={styles.sectionTitle}>Kommende besøg</Text>
      
              {upcomingAppointments.map((appointment, index) => (
                <View key={`${appointment.id}-${index}`} style={styles.appointmentItem}>
                  <View style={styles.appointmentContent}>
                  <View style={styles.topRow} />
                    <View style={styles.titleRow}>
                      <View style={styles.titleAndDescription}>
                        <Text style={styles.appointmentTitle} numberOfLines={1}>
                          {appointment.title}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                          <Text style={styles.appointmentDescription}>
                            {new Date(appointment.date).toLocaleDateString('da-DK', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </Text>
                          <View style={{ width: 8 }} />
                          <View style={styles.greenDot} />
                          <View style={{ width: 8 }} />
                          <Text style={styles.timeText}>
                            {`${appointment.start_time?.substring(0, 5)}–${appointment.end_time?.substring(0, 5)}`}
                          </Text>
                        </View>
                      </View>
      
                      <TouchableOpacity style={[styles.addLogButton,appointmentsWithLogs[appointment.id] ? styles.editLogButton : styles.addLogButton]}
                        onPress={() => {
                            if (appointmentsWithLogs[appointment.id]) {
                              router.push({
                                pathname: '/ny-log',
                                params: { 
                                  date: appointment.date,
                                  appointment_id: appointment.id,
                                  logId: appointmentsWithLogs[appointment.id]
                                }
                              });
                            } else {
                              router.push({
                                pathname: '/ny-log',
                                params: { 
                                  date: appointment.date,
                                  appointment_id: appointment.id
                                }
                              });
                            }
                          }}
                        >
                          {appointmentsWithLogs[appointment.id] ? (
                            <>
                              <Ionicons name="pencil" size={12} color="#42865F" />
                              <Text style={styles.editLogText}>Rediger</Text>
                            </>
                          ) : (
                            <>
                              <Ionicons name="add" size={12} color="#FFFFFF" />
                              <Text style={styles.addLogText}>Tilføj log</Text>
                            </>
                          )}
                    </TouchableOpacity>
                    </View>
      
                  </View>
                </View>
              ))}
            </View>

            
            {/* Vejledninger sektion */}
            <View style={styles.guidanceSection}>
              <Text style={styles.sectionTitle}>Vejledninger</Text>
              <Text style={styles.guidanceSubtitle}>Din hjælp til at navigere i hverdagen</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
                {guides.slice(0, 3).map((guide) => (
                  <GuideCard
                    key={guide.id}
                    title={guide.title}
                    imageUrl={guide.image}
                    onPress={() =>
                      router.push({
                        pathname: '/guide/[id]', // <-- skriv [id] ikke slug direkte
                        params: {
                          id: guide.slug || guide.id, // <-- slug eller id sendes som param
                          slug: guide.slug,
                          title: guide.title,
                          image: guide.image,
                          category: guide.category,
                          content: JSON.stringify(guide.content),
                        },
                      })
                    }
                  />
                ))}
              </ScrollView>
            </View>

          </View>
        </ScrollView>
      );
    };


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        padding: 20,
        paddingTop: 90,
    },
    samtalekortCard: {
      backgroundColor: '#42865F',
      borderRadius: 16,
      marginVertical: 4,
      marginHorizontal: 4,
      paddingVertical: 16,
      paddingHorizontal: 16,
      height: 100,
      marginTop: 12, 
      position: 'relative',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardBackgroundImage: {
      position: 'absolute',
      right: 6,
      top: 6,
      width: 150,
      height: 150,
      opacity: 0.15,
      zIndex: 0,
    },    
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        zIndex: 1,
    },
    samtalekortTitle: {
      color: '#fff',
      fontSize: 24,
      fontFamily: 'RedHatDisplay_700Bold',
      marginBottom: 4,
    },
    samtalekortSubtitle: {
      color: '#FFFFFF',
      fontSize: 17,
      fontFamily: 'RedHatDisplay_400Regular',
      lineHeight: 22,
      marginRight: 56,
    },
    cardIconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 'auto',
        paddingLeft: 8,
        position: 'relative',
    },
    title: {
        fontSize: 36,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#42865F',
        marginBottom: 25,
    },
    subtitle: {
        fontSize: 22,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#333',
        marginBottom: 24,
    },
    cardRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    card: {
        backgroundColor: '#42865F',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    halfCard: {
        flex: 1,
        height: 160,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardContentSection: {
        flex: 1,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 24,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#fff',
        letterSpacing: 0.1,
    },
    cardSubtext: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'RedHatDisplay_400Regular',
        lineHeight: 18,
        opacity: 0.9,
    },
    cardButton: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    cardButtonText: {
        color: '#42865F',
        fontSize: 16,
        fontFamily: 'RedHatDisplay_700Bold',
        letterSpacing: 0.1,
    },
    progressCard: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#42865F',
        borderRadius: 16,
        marginVertical: 4,
        marginHorizontal: 4,
        height: 100,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        flex: 1,
    },
    progressCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#42865F',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        position: 'relative',
    },
    progressRing: {
        position: 'absolute',
        transform: [{ rotate: '-90deg' }],
    },
    progressText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'RedHatDisplay_700Bold',
    },
    progressTextContainer: {
        flex: 1,
        paddingRight: 16,
    },
    progressTitle: {
        color: '#fff',
        fontSize: 24,
        fontFamily: 'RedHatDisplay_700Bold',
        marginBottom: 6,
        letterSpacing: 0.1,
    },
    progressSubtext: {
        color: '#fff',
        fontSize: 17,
        fontFamily: 'RedHatDisplay_400Regular',
        opacity: 1,
        lineHeight: 22,
    },
    progressArrow: {
        marginLeft: 'auto',
        paddingLeft: 8,
    },
    visitsSection: {
        marginTop: 30,
        paddingHorizontal: 0,
    },
    sectionTitle: {
        fontSize: 22,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#333',
        marginBottom: 20,
        letterSpacing: 0,
    },
    visitInfo: {
        flex: 1,
    },
    visitTitle: {
        fontSize: 18,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#333',
        marginBottom: 4,
        letterSpacing: 0.1,
    },
    visitDate: {
        fontSize: 14,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#666',
    },
    noVisitsText: {
        fontSize: 16,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#666',
        textAlign: 'center',
        marginTop: 16,
    },
    appointmentItem: {
        position: 'relative',
        height: 90,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 0.3,
        borderRadius: 12,
        borderColor: '#D6D6D6',
        marginBottom: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    appointmentContent: {
        flexDirection: 'column',
        gap: 10,
        height: '100%',
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 0,
        height: 0,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 30,
    },
    timeWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        height: 30,
    },
    greenDot: {
        width: 5,
        height: 5,
        borderRadius: 4,
        backgroundColor: '#42865F',
    },
    timeText: {
        color: '#42865F',
        fontFamily: 'RedHatDisplay_500Medium',
        fontSize: 14,
    },
    menuButton: {
        padding: 5,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 6,
        paddingBottom: 20,
        height: 60,
    },
    titleAndDescription: {
        flex: 1,
        marginRight: 10,
        maxWidth: '70%',
        height: '100%',
        justifyContent: 'center',
    },
    appointmentTitle: {
        fontSize: 20,
        fontFamily: 'RedHatDisplay_500Medium',
        color: '#000',
        marginTop: 0,
    },
    appointmentDescription: {
        fontSize: 16,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#666666',
        marginTop: 0,
      },
    addLogButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#42865F',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    addLogButtonText: {
        fontSize: 16,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#42865F',
        letterSpacing: 0.1,
    },
    addLogText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'RedHatDisplay_500Medium',
        marginLeft: 4,
      },
      editLogButton: {
        backgroundColor: '#FFFFFF',
        borderColor: '#42865F',
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
      },
      
      editLogText: {
        fontSize: 16,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#42865F',
        letterSpacing: 0.1,
        marginLeft: 4,
      },
    addIconContainer: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    guidanceSection: {
        marginTop: 24,
        marginBottom: 140,
    },
    guidanceSubtitle: {
        fontSize: 18,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#666',
        marginBottom: 24,
    },
    cardScroll: {
        marginLeft: -20,
        paddingLeft: 20,
    },
    guidanceCard: {
        width: 260,
        height: 140,
        marginRight: 12,
        borderRadius: 12,
        backgroundColor: '#42865F',
        overflow: 'hidden',
    },
    guidanceImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    guidanceOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingTop: 40,
        backgroundColor: 'rgba(0,0,0,0.2)',
        backgroundImage: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%)',
    },
    guidanceCardText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'RedHatDisplay_700Bold',
    },
    
});
