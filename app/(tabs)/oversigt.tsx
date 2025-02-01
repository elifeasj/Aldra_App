import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Oversigt() {
    const { userName } = useLocalSearchParams();
    const displayName = userName || 'Bruger';

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
                <View style={[styles.card, styles.progressCard]}>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressCircle}>
                            <Text style={styles.progressText}>20%</Text>
                        </View>
                        <View style={styles.progressTextContainer}>
                            <Text style={styles.progressTitle}>Færdiggør din profil</Text>
                            <Text style={styles.progressSubtext}>Udfyld din profil for at tilpasse appen til dine behov.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="white" style={styles.progressArrow} />
                    </View>
                </View>

                {/* Kommende besøg sektion */}
                <View style={styles.visitsSection}>
                    <Text style={styles.sectionTitle}>Kommende besøg</Text>
                    
                    <View style={styles.visitCard}>
                        <View style={styles.visitInfo}>
                            <Text style={styles.visitTitle}>Besøg mor</Text>
                            <Text style={styles.visitDate}>22. november 2024</Text>
                        </View>
                        <TouchableOpacity style={styles.addLogButton}>
                            <Text style={styles.addLogButtonText}>Tilføj log</Text>
                            <View style={styles.addIconContainer}>
                                <Ionicons name="add" size={20} color="#42865F" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.visitCard}>
                        <View style={styles.visitInfo}>
                            <Text style={styles.visitTitle}>Snak med overlæge</Text>
                            <Text style={styles.visitDate}>29. november 2024</Text>
                        </View>
                        <TouchableOpacity style={styles.addLogButton}>
                            <Text style={styles.addLogButtonText}>Tilføj log</Text>
                            <View style={styles.addIconContainer}>
                                <Ionicons name="add" size={20} color="#42865F" />
                            </View>
                        </TouchableOpacity>
                    </View>
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
        fontFamily: 'RedHatDisplay_700Bold',
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
        flexDirection: 'row',
        alignItems: 'center',
        height: 80,
        marginHorizontal: 4,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    progressCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
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
    progressText: {
        color: '#42865F',
        fontSize: 16,
        fontFamily: 'RedHatDisplay_700Bold',
    },
    progressTextContainer: {
        flex: 1,
        paddingRight: 12,
    },
    progressTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'RedHatDisplay_700Bold',
        marginBottom: 4,
        letterSpacing: 0.1,
    },
    progressSubtext: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'RedHatDisplay_400Regular',
        opacity: 0.9,
        lineHeight: 16,
    },
    progressArrow: {
        marginLeft: 'auto',
    },
    visitsSection: {
        marginTop: 32,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#333',
        marginBottom: 16,
        letterSpacing: 0.1,
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
        fontSize: 16,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#333',
        marginBottom: 4,
        letterSpacing: 0.1,
    },
    visitDate: {
        fontSize: 14,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#666',
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
