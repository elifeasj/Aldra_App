import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://192.168.0.234:5001';

export default function NyLog() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Convert params to string
    const date = Array.isArray(params.date) ? params.date[0] : params.date;
    const logId = params.logId ? (Array.isArray(params.logId) ? params.logId[0] : params.logId) : undefined;
    const appointment_id = params.appointment_id ? 
        (Array.isArray(params.appointment_id) ? parseInt(params.appointment_id[0]) : parseInt(params.appointment_id)) 
        : undefined;

    useEffect(() => {
        const fetchExistingLog = async () => {
            if (logId) {
                try {
                    const response = await fetch(`${API_URL}/logs/${logId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch log');
                    }
                    const log = await response.json();
                    console.log('Fetched existing log:', log);
                    
                    // Opdater form med eksisterende data
                    setTitle(log.title || '');
                    setDescription(log.description || '');
                } catch (error) {
                    console.error('Error fetching log:', error);
                }
            }
        };

        fetchExistingLog();
    }, [logId]);

    const handleSubmit = async () => {
        try {
            const method = logId ? 'PUT' : 'POST';
            const url = logId ? `${API_URL}/logs/${logId}` : `${API_URL}/logs`;
            
            console.log('Sending log with data:', {
                title,
                description,
                date,
                appointment_id
            });

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    date,
                    appointment_id
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            console.log('Server response:', result);

            router.back();
        } catch (error) {
            console.error('Error saving log:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const days = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
        const months = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'];
        
        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${dayName} ${day}. ${month} ${year}`;
    };

    return (
        <KeyboardAvoidingView 
            behavior="position" 
            style={{ flex: 1 }}
            contentContainerStyle={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? -150 : -100}
            enabled
        >
            <ScrollView 
                style={styles.container}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.title}>{logId ? 'Rediger log' : 'Ny log'}</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.dateText}>{formatDate(date)}</Text>

                    <Text style={styles.label}>Titel</Text>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Skriv titel her..."
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor="#999"
                    />

                    <Text style={styles.label}>Beskrivelse</Text>
                    <View style={styles.descriptionContainer}>
                        <TextInput
                            style={styles.descriptionInput}
                            placeholder="Beskriv om dit besøg her..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            textAlignVertical="top"
                            placeholderTextColor="#999"
                            maxLength={250}
                        />
                        <Text style={styles.characterCount}>
                            {description ? description.length : 0}/250 tegn
                        </Text>
                    </View>

                    <TouchableOpacity 
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitButtonText}>Gem loggen</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 100,
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 5,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        marginRight: 15,
        marginLeft: -5,
    },
    title: {
        fontSize: 32,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#42865F',
        marginLeft: 5,
    },
    content: {
        padding: 20,
    },
    dateText: {
        fontSize: 18,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#42865F',
        marginBottom: 35,
    },
    label: {
        fontSize: 24,
        fontFamily: 'RedHatDisplay_500Medium',
        color: '#000',
        marginBottom: 10,
    },
    titleInput: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        padding: 15,
        marginBottom: 40,
        fontSize: 16,
        fontFamily: 'RedHatDisplay_400Regular',
    },
    descriptionContainer: {
        position: 'relative',
        marginBottom: 40,
    },
    descriptionInput: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        padding: 15,
        paddingBottom: 35,
        fontSize: 16,
        minHeight: 320,
        fontFamily: 'RedHatDisplay_400Regular',
    },
    characterCount: {
        fontSize: 14,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#666',
        position: 'absolute',
        bottom: 10,
        right: 15,
    },
    submitButton: {
        backgroundColor: '#42865F',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'RedHatDisplay_700Bold',
    },
});
