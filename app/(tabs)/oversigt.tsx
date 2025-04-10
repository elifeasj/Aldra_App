import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../config';
import supabase from '../../config/supabase';
import * as Progress from 'react-native-progress';

export default function Oversigt() {
    const { userName } = useLocalSearchParams();
    const router = useRouter();
    const [hasCompletedPersonalization, setHasCompletedPersonalization] = useState(false);
    const [userId, setUserId] = useState('');

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

    // ⬇️ State for kommende besøg
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

    // ⬇️ Effekt ved load
    useEffect(() => {
        const fetchUpcomingAppointments = async () => {
            try {
                const userDataString = await AsyncStorage.getItem('userData');
                if (!userDataString) return;

                const userData = JSON.parse(userDataString);
                console.log("🔐 Bruger-ID:", userData.id);
                console.log("📡 Fetch URL:", `${API_URL}/appointments/all?user_id=${userData.id}`);

                const response = await fetch(`${API_URL}/appointments/all?user_id=${userData.id}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ Server-fejl:', errorText);
                    return;
                }

                const allAppointments: Appointment[] = await response.json();
                const today = new Date().toISOString().split('T')[0];

                console.log("📆 today:", today);
                console.log("📋 Alle aftaler fra server:", allAppointments);
                console.log("🔎 Sammenligningsgrundlag:", allAppointments.map((a) => ({
                    raw: a.date,
                    parsed: new Date(a.date).toISOString().split('T')[0],
                    sammenlignesMed: today
                })));

                const upcoming = allAppointments
                    .filter((a) => {
                        const appointmentDate = new Date(a.date).toISOString().split('T')[0];
                        return appointmentDate >= today;
                    })
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 2);

                setUpcomingAppointments(upcoming);
                console.log("✅ upcomingAppointments sat til:", upcoming);
            } catch (err) {
                console.error('Fejl ved hentning af kommende besøg:', err);
            }
        };

        fetchUpcomingAppointments();
    }, []);

      
    const [displayName, setDisplayName] = useState('Bruger');

    useEffect(() => {
        const checkPersonalization = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data } = await supabase
                        .from('user_profile_answers')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();
                    
                    setHasCompletedPersonalization(!!data);
                    setUserId(user.id);
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

                {/* Færdiggør profil kort */}
                {!hasCompletedPersonalization && (
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
                )}

                {/* Kommende besøg sektion */}
                <View style={styles.visitsSection}>
                    <Text style={styles.sectionTitle}>Kommende besøg</Text>
                    <Text style={{ color: 'blue' }}>
                        {JSON.stringify(upcomingAppointments, null, 2)}
                    </Text>

                    {upcomingAppointments.length === 0 ? (
                        <Text style={styles.noVisitsText}>Ingen kommende besøg</Text>
                    ) : (
                        upcomingAppointments.map((appointment, index) => {
                            console.log("VISER appointment:", appointment);
                            return (
                                <View key={`${appointment.id}-${index}`} style={styles.visitCard}>
                                    <View style={styles.visitInfo}>
                                        <Text style={{ color: '#000' }}>{appointment.title}</Text>
                                        <Text style={{ color: '#000' }}>
                                            {new Date(appointment.date).toLocaleDateString('da-DK', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.addLogButton}
                                        onPress={() => {
                                            router.push({
                                                pathname: '/ny-log',
                                                params: {
                                                    date: appointment.date,
                                                    appointment_id: appointment.id
                                                }
                                            });
                                        }}
                                    >
                                        <Text style={styles.addLogButtonText}>Tilføj log</Text>
                                        <View style={styles.addIconContainer}>
                                            <Ionicons name="add" size={20} color="#42865F" />
                                           </View>
                                    </TouchableOpacity>
                                </View>
                            );
                        })
                    )}
                </View>


                {/* Vejledninger sektion */}
                <View style={styles.guidanceSection}>
                    <Text style={styles.sectionTitle}>Vejledninger</Text>
                    <Text style={styles.guidanceSubtitle}>Effektiv Kommunikation</Text>
                    
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
                        <TouchableOpacity style={styles.guidanceCard}>
                            <Image 
                                source={require('../../assets/images/frame_1.png')} 
                                style={styles.guidanceImage}
                            />
                            <View style={styles.guidanceOverlay}>
                                <Text style={styles.guidanceCardText}>Tal Langsomt og Klar</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.guidanceCard}>
                            <Image 
                                source={require('../../assets/images/frame_1.png')} 
                                style={styles.guidanceImage}
                            />
                            <View style={styles.guidanceOverlay}>
                                <Text style={styles.guidanceCardText}>Ikke Afbryd</Text>
                            </View>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
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
    },
    title: {
        fontSize: 32,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#42865F',
        marginBottom: 25,
    },
    subtitle: {
        fontSize: 20,
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
        height: 132,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#fff',
        letterSpacing: 0.1,
    },
    cardSubtext: {
        color: '#fff',
        fontSize: 14,
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
        fontSize: 14,
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
        marginTop: 32,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#333',
        marginBottom: 16,
        letterSpacing: 0,
    },
    visitCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
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
    addLogButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F7F7F7',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    addLogButtonText: {
        fontSize: 16,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#42865F',
        letterSpacing: 0.1,
    },
    addIconContainer: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    guidanceSection: {
        marginTop: 24,
    },
    guidanceSubtitle: {
        fontSize: 14,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#666',
        marginBottom: 12,
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
