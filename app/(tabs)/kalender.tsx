import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Switch, Platform, Animated, KeyboardAvoidingView, ViewStyle, TextStyle, Alert, LayoutChangeEvent, Button, TouchableWithoutFeedback } from 'react-native';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { TimeIntervalTriggerInput, SchedulableTriggerInputTypes } from 'expo-notifications';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

interface Appointment {
    id: number;
    title: string;
    description: string;
    date: string;
    start_time: string;
    end_time: string;
    reminder: boolean;
}

interface MarkedDates {
    [date: string]: {
        marked: boolean;
        dotColor: string;
    };
}

// API base URL
const API_URL = 'http://192.168.0.234:5001';

const dayNames = {
    'mon': 'man',
    'tue': 'tir',
    'wed': 'ons',
    'thu': 'tor',
    'fri': 'fre',
    'sat': 'lør',
    'sun': 'søn'
};

// Set up Danish locale
LocaleConfig.locales['da'] = {
    monthNames: ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'],
    monthNamesShort: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'Maj', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dec.'],
    dayNames: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
    dayNamesShort: ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'],
    today: 'I dag'
};
LocaleConfig.defaultLocale = 'da';

export default function Kalender() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [datesWithAppointments, setDatesWithAppointments] = useState<string[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState<boolean>(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);
    
    const [newAppointment, setNewAppointment] = useState<Appointment>({
        id: Date.now(),
        title: '',
        description: '',
        date: '',
        start_time: '',
        end_time: '',
        reminder: false
    });

    const [tempDate, setTempDate] = useState<Date>(new Date());
    const [tempStartTime, setTempStartTime] = useState<Date>(new Date());
    const [tempEndTime, setTempEndTime] = useState<Date>(new Date());

    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(1000));

    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDate(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (isModalVisible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    mass: 1,
                    stiffness: 100,
                })
            ]).start();
        } else {
            fadeAnim.setValue(0);
            slideAnim.setValue(1000);
        }
    }, [isModalVisible]);

    // Notification handler
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });

    useEffect(() => {
        registerForPushNotificationsAsync();

        // Lytter til notifikationer når appen er åben
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('Modtog notifikation:', notification);
        });

        // Lytter til når bruger trykker på en notifikation
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notifikation response:', response);
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener);
            Notifications.removeNotificationSubscription(responseListener);
        };
    }, []);

    // Funktion til at registrere for notifikationer
    async function registerForPushNotificationsAsync() {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            
            if (finalStatus !== 'granted') {
                alert('Du skal give tilladelse til notifikationer for at modtage påmindelser!');
                return;
            }

            // Få token
            const token = await Notifications.getExpoPushTokenAsync();
            console.log('Push token:', token);

            // Gem token i databasen
            const response = await fetch(`${API_URL}/push-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token.data,
                    platform: Platform.OS
                }),
            });

            if (!response.ok) {
                console.error('Fejl ved gemning af push token:', await response.text());
            }
        } catch (error) {
            console.error('Fejl ved registrering til notifikationer:', error);
        }
    }

    // Funktion til at planlægge notifikationer
    const scheduleNotification = async (date: string, time: string, title: string) => {
        try {
            // Parse dato og tid
            const [year, month, day] = date.split('-').map(Number);
            const [hours, minutes] = time.split(':').map(Number);
            
            // Opret dato objekter
            const now = new Date();
            const appointmentDate = new Date(year, month - 1, day, hours, minutes);
            const reminderDate = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
            
            // Beregn sekunder til påmindelse
            const secondsUntilReminder = Math.floor((reminderDate.getTime() - now.getTime()) / 1000);
            
            console.log('Tidspunkter:', {
                nu: now.toLocaleString('da-DK'),
                aftale: appointmentDate.toLocaleString('da-DK'),
                påmindelse: reminderDate.toLocaleString('da-DK'),
                sekunderTil: secondsUntilReminder
            });

            // Tjek om påmindelsen er i fremtiden
            if (secondsUntilReminder <= 0) {
                console.log('Kan ikke planlægge notifikation - påmindelsestidspunktet er i fortiden');
                return;
            }

            const trigger: TimeIntervalTriggerInput = {
                seconds: secondsUntilReminder,
                repeats: false,
                type: SchedulableTriggerInputTypes.TIME_INTERVAL
            };

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Påmindelse om aftale',
                    body: `Du har en aftale om 30 minutter: ${title}\nTidspunkt: ${time}`,
                },
                trigger
            });
        } catch (error) {
            console.error('Fejl ved planlægning af notifikation:', error);
            if (error instanceof Error) {
                console.error('Fejl detaljer:', error.message);
                console.error('Fejl stack:', error.stack);
            }
        }
    };

    // Fetch appointments for selected date
    const fetchAppointments = async (date: string) => {
        try {
            console.log('Fetching appointments for date:', date);
            const response = await fetch(`${API_URL}/appointments/${date}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', errorText);
                return;
            }

            const data = await response.json();
            console.log('Received appointments:', data);
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    // Fetch all dates with appointments
    const fetchDatesWithAppointments = async () => {
        try {
            console.log('Fetching all dates with appointments');
            const response = await fetch(`${API_URL}/appointments/dates/all`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', errorText);
                return;
            }

            const dates = await response.json();
            console.log('Received dates with appointments:', dates);
            setDatesWithAppointments(dates);
        } catch (error) {
            console.error('Error fetching dates with appointments:', error);
        }
    };

    // Format date to match server format
    const formatDate = (date: string | Date) => {
        const d = new Date(date);
        // Use local date components
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Get marked dates for calendar
    const getMarkedDates = () => {
        const markedDates: { [key: string]: any } = {};
        
        // Mark all dates that have appointments
        datesWithAppointments.forEach(date => {
            const formattedDate = formatDate(date);
            markedDates[formattedDate] = {
                marked: true,
                dotColor: '#42865F'
            };
        });

        // Mark selected date
        if (selectedDate) {
            const formattedSelectedDate = formatDate(selectedDate);
            markedDates[formattedSelectedDate] = {
                ...markedDates[formattedSelectedDate],
                selected: true,
                selectedColor: '#42865F'
            };
        }

        return markedDates;
    };

    // Handle date selection in calendar
    const onDayPress = (day: DateData) => {
        console.log('Selected date:', day.dateString);
        setSelectedDate(day.dateString);
        fetchAppointments(day.dateString);
    };

    // Load appointments and dates when component mounts
    useEffect(() => {
        const loadInitialData = async () => {
            const today = new Date().toISOString().split('T')[0];
            setSelectedDate(today);
            await Promise.all([
                fetchAppointments(today),
                fetchDatesWithAppointments()
            ]);
        };
        
        loadInitialData();
    }, []);

    // Refresh dates with appointments when appointments change
    useEffect(() => {
        fetchDatesWithAppointments();
    }, [appointments]);

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setTempDate(selectedDate);
        }
    };

    const onStartTimeChange = (event: any, selectedTime?: Date) => {
        if (selectedTime) {
            setTempStartTime(selectedTime);
            // Opdater visningen i realtid
            const formattedTime = selectedTime.toLocaleTimeString('da-DK', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            setNewAppointment(prev => ({
                ...prev,
                start_time: formattedTime
            }));
        }
    };

    const onEndTimeChange = (event: any, selectedTime?: Date) => {
        if (selectedTime) {
            setTempEndTime(selectedTime);
            // Opdater visningen i realtid
            const formattedTime = selectedTime.toLocaleTimeString('da-DK', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            setNewAppointment(prev => ({
                ...prev,
                end_time: formattedTime
            }));
        }
    };

    const handleConfirmDate = () => {
        const formattedDate = tempDate.toISOString().split('T')[0];
        setNewAppointment(prev => ({
            ...prev,
            date: formattedDate
        }));
        setShowDatePicker(false);
    };

    const handleConfirmStartTime = () => {
        const formattedTime = tempStartTime.toLocaleTimeString('da-DK', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        // Tjek om starttiden er den samme som sluttiden
        if (formattedTime === newAppointment.end_time) {
            Alert.alert(
                "Ugyldig tid",
                "Starttidspunktet kan ikke være det samme som sluttidspunktet. Prøv venligst igen.",
                [{ text: "OK" }]
            );
            return;
        }

        setNewAppointment(prev => ({
            ...prev,
            start_time: formattedTime
        }));
        setShowStartTimePicker(false);
    };

    const handleConfirmEndTime = () => {
        const formattedTime = tempEndTime.toLocaleTimeString('da-DK', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        // Tjek om sluttiden er den samme som starttiden
        if (formattedTime === newAppointment.start_time) {
            Alert.alert(
                "Ugyldig tid",
                "Sluttidspunktet kan ikke være det samme som starttidspunktet. Prøv venligst igen.",
                [{ text: "OK" }]
            );
            return;
        }

        setNewAppointment(prev => ({
            ...prev,
            end_time: formattedTime
        }));
        setShowEndTimePicker(false);
    };

    const handleCreateAppointment = async () => {
        if (!newAppointment.title || !newAppointment.date || !newAppointment.start_time || !newAppointment.end_time) {
            alert('Udfyld venligst alle påkrævede felter');
            return;
        }

        try {
            console.log('Creating appointment with data:', {
                title: newAppointment.title,
                description: newAppointment.description,
                date: newAppointment.date,
                startTime: newAppointment.start_time,
                endTime: newAppointment.end_time,
                reminder: newAppointment.reminder
            });

            const response = await fetch(`${API_URL}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newAppointment.title,
                    description: newAppointment.description,
                    date: newAppointment.date,
                    startTime: newAppointment.start_time,
                    endTime: newAppointment.end_time,
                    reminder: newAppointment.reminder
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', errorText);
                alert('Der opstod en fejl: ' + (errorText || 'Ukendt fejl'));
                return;
            }

            const data = await response.json();
            console.log('Appointment created:', data);
            
            // Update appointments list and close modal
            setAppointments(prev => [...prev, data]);
            setIsModalVisible(false);
            
            // Set the selected date to the appointment date and fetch appointments
            setSelectedDate(newAppointment.date);
            await fetchAppointments(newAppointment.date);
            
            // Reset form
            setNewAppointment({
                id: Date.now(),
                title: '',
                description: '',
                date: '',
                start_time: '',
                end_time: '',
                reminder: false,
            });
            
            // Fetch updated appointments for the selected date
            await fetchAppointments(newAppointment.date);
            
            // Fetch all dates with appointments to update calendar dots
            await fetchDatesWithAppointments();
            
            if (newAppointment.reminder) {
                await scheduleNotification(
                    newAppointment.date,
                    newAppointment.start_time,
                    newAppointment.title
                );
            }
        } catch (error) {
            console.error('Error adding appointment:', error);
            alert('Der opstod en fejl ved oprettelse af aftalen');
        }
    };

    const handleDeleteAppointment = async (id: number) => {
        try {
            console.log('Attempting to delete appointment with ID:', id);
            const response = await fetch(`${API_URL}/appointments/${id}`, {
                method: 'DELETE',
            });

            console.log('Delete response status:', response.status);
            const responseData = await response.json();
            console.log('Delete response data:', responseData);

            if (!response.ok) {
                throw new Error('Failed to delete appointment');
            }

            // Opdater listen af aftaler efter sletning
            setAppointments(prevAppointments => {
                console.log('Current appointments:', prevAppointments);
                const newAppointments = prevAppointments.filter(appointment => appointment.id !== id);
                console.log('Appointments after deletion:', newAppointments);
                return newAppointments;
            });

            // Opdater kalenderen
            fetchDatesWithAppointments();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('Der opstod en fejl ved sletning af aftalen');
        }
    };

    const renderModal = () => (
        <Modal
            visible={isModalVisible}
            transparent={true}
            onRequestClose={() => setIsModalVisible(false)}
            animationType="none"
        >
            <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
                <Animated.View 
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Opret besøg</Text>
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#42865F" />
                            </TouchableOpacity>
                        </View>
                        
                        <KeyboardAvoidingView 
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={{ width: '100%' }}
                        >
                            <Text style={styles.label}>Titel</Text>
                            <TextInput
                                style={{
                                    ...styles.input,
                                    fontFamily: 'RedHatDisplay_400Regular',
                                    fontSize: 16
                                }}
                                value={newAppointment.title}
                                onChangeText={(text) => setNewAppointment(prev => ({ ...prev, title: text }))}
                                placeholder="Skriv titel her..."
                                placeholderTextColor="#8F9BB3"
                            />

                            <Text style={styles.label}>Beskrivelse</Text>
                            <View style={styles.descriptionContainer}>
                                <TextInput
                                    style={[styles.input, styles.descriptionInput]}
                                    value={newAppointment.description}
                                    onChangeText={(text) => {
                                        if (text.length <= 20) {
                                            setNewAppointment(prev => ({ ...prev, description: text }));
                                        }
                                    }}
                                    placeholder="Skriv beskrivelse her..."
                                    placeholderTextColor="#8F9BB3"
                                    multiline
                                    maxLength={20}
                                />
                                <Text style={styles.characterCount}>{newAppointment.description?.length || 0}/20</Text>
                            </View>
                        </KeyboardAvoidingView>

                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={[styles.dateButtonText, !newAppointment.date && { color: '#8F9BB3' }]}>
                                {newAppointment.date 
                                    ? new Date(newAppointment.date).toLocaleDateString('da-DK', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        formatMatcher: 'basic'
                                    }).replace(/\//g, '. ')
                                    : 'Dato'}
                            </Text>
                            <View style={styles.dateButtonIcon}>
                                <Ionicons name="calendar-outline" size={24} color="#000" />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.timeContainer}>
                            <TouchableOpacity
                                style={[styles.timeButton, { marginRight: 8 }]}
                                onPress={() => setShowStartTimePicker(true)}
                            >
                                <Text style={[styles.timeButtonText, !newAppointment.start_time && { color: '#8F9BB3' }]}>
                                    {newAppointment.start_time || 'Start tid'}
                                </Text>
                                <View style={styles.timeButtonIcon}>
                                    <Ionicons name="time-outline" size={24} color="#000" />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.timeButton, { marginLeft: 8 }]}
                                onPress={() => setShowEndTimePicker(true)}
                            >
                                <Text style={[styles.timeButtonText, !newAppointment.end_time && { color: '#8F9BB3' }]}>
                                    {newAppointment.end_time || 'Slut tid'}
                                </Text>
                                <View style={styles.timeButtonIcon}>
                                    <Ionicons name="time-outline" size={24} color="#000" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.reminderContainer}>
                            <Text style={styles.reminderText}>Påmind mig</Text>
                            <Switch
                                value={newAppointment.reminder}
                                onValueChange={(value) => setNewAppointment(prev => ({ ...prev, reminder: value }))}
                                trackColor={{ false: "#E5E5E5", true: "#42865F" }}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleCreateAppointment}
                        >
                            <Text style={styles.addButtonText}>Tilføj til kalender</Text>
                        </TouchableOpacity>
                    </View>

                    {Platform.OS === 'ios' ? (
                        <>
                            {showDatePicker && (
                                <View style={styles.dateTimePickerContainer}>
                                    <View style={styles.pickerHeader}>
                                        <TouchableOpacity 
                                            style={styles.pickerButton}
                                            onPress={handleConfirmDate}
                                        >
                                            <Text style={[styles.modalButtonText, { color: '#42865F' }]}>Bekræft</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <DateTimePicker
                                        value={tempDate}
                                        mode="date"
                                        is24Hour={true}
                                        display="spinner"
                                        onChange={onDateChange}
                                        textColor="black"
                                        themeVariant="light"
                                        style={{ width: '100%' }}
                                        locale="da-DK"
                                        accessibilityRole="adjustable"
                                    />
                                </View>
                            )}

                            {showStartTimePicker && (
                                <View style={styles.dateTimePickerContainer}>
                                    <View style={styles.pickerHeader}>
                                        <TouchableOpacity 
                                            style={styles.pickerButton}
                                            onPress={handleConfirmStartTime}
                                        >
                                            <Text style={[styles.modalButtonText, { color: '#42865F' }]}>Bekræft</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableWithoutFeedback>
                                        <View>
                                            <DateTimePicker
                                                value={tempStartTime}
                                                mode="time"
                                                is24Hour={true}
                                                display="spinner"
                                                onChange={onStartTimeChange}
                                                textColor="black"
                                                themeVariant="light"
                                                style={{ width: '100%' }}
                                                locale="da-DK"
                                            />
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            )}

                            {showEndTimePicker && (
                                <View style={styles.dateTimePickerContainer}>
                                    <View style={styles.pickerHeader}>
                                        <TouchableOpacity 
                                            style={styles.pickerButton}
                                            onPress={handleConfirmEndTime}
                                        >
                                            <Text style={[styles.modalButtonText, { color: '#42865F' }]}>Bekræft</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableWithoutFeedback>
                                        <View>
                                            <DateTimePicker
                                                value={tempEndTime}
                                                mode="time"
                                                is24Hour={true}
                                                display="spinner"
                                                onChange={onEndTimeChange}
                                                textColor="black"
                                                themeVariant="light"
                                                style={{ width: '100%' }}
                                                locale="da-DK"
                                            />
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            )}
                        </>
                    ) : (
                        <>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    is24Hour={true}
                                    display="spinner"
                                    onChange={onDateChange}
                                    textColor="black"
                                    themeVariant="light"
                                    style={{ width: '100%' }}
                                    locale="da-DK"
                                    accessibilityRole="adjustable"
                                />
                            )}

                            {showStartTimePicker && (
                                <DateTimePicker
                                    value={tempStartTime}
                                    mode="time"
                                    is24Hour={true}
                                    display="spinner"
                                    onChange={onStartTimeChange}
                                    textColor="black"
                                    themeVariant="light"
                                    style={{ width: '100%' }}
                                    locale="da-DK"
                                />
                            )}

                            {showEndTimePicker && (
                                <DateTimePicker
                                    value={tempEndTime}
                                    mode="time"
                                    is24Hour={true}
                                    display="spinner"
                                    onChange={onEndTimeChange}
                                    textColor="black"
                                    themeVariant="light"
                                    style={{ width: '100%' }}
                                    locale="da-DK"
                                />
                            )}
                        </>
                    )}
                </Animated.View>
            </Animated.View>
        </Modal>
    );

    const renderAppointments = () => {
        console.log('Rendering appointments:', appointments);
        return appointments
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
            .map(appointment => (
                <View key={appointment.id} style={styles.appointmentItem}>
                    <View style={styles.appointmentContent}>
                        <View style={styles.topRow}>
                            <View style={styles.leftContent}>
                                <View style={styles.timeWrapper}>
                                    <View style={styles.greenDot} />
                                    <Text style={styles.timeText} numberOfLines={1}>
                                        {`${appointment.start_time.substring(0, 5)}-${appointment.end_time.substring(0, 5)}`}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity 
                                style={styles.menuButton}
                                onPress={() => {
                                    Alert.alert(
                                        "Slet aftale",
                                        "Er du sikker på, at du vil slette denne aftale?",
                                        [
                                            {
                                                text: "Annuller",
                                                style: "cancel"
                                            },
                                            {
                                                text: "Slet",
                                                onPress: () => handleDeleteAppointment(appointment.id),
                                                style: "destructive"
                                            }
                                        ]
                                    );
                                }}
                            >
                                <Ionicons name="ellipsis-horizontal" size={20} color="#42865F" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.titleRow}>
                            <View style={styles.titleAndDescription}>
                                <Text style={styles.appointmentTitle} numberOfLines={1}>
                                    {appointment.title}
                                </Text>
                                {appointment.description && (
                                    <Text style={styles.appointmentDescription} numberOfLines={2}>
                                        {appointment.description}
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity 
                                style={styles.addLogButton}
                                onPress={() => router.push('/ny-log')}
                            >
                                <Text style={styles.addLogText}>Tilføj log</Text>
                                <View style={styles.addIconContainer}>
                                    <Ionicons name="add" size={20} color="#FFFFFF" weight="bold" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.bottomBorder} />
                </View>
            ));
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fff',
        } as ViewStyle,
        dateText: {
            fontSize: 18,
            fontFamily: 'RedHatDisplay_400Regular',
            color: '#42865F',
            paddingHorizontal: 20,
            paddingBottom: 10,
        } as TextStyle,
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginTop: 90,
        } as ViewStyle,
        content: {
            padding: 20,
            paddingTop: 0,
            flex: 1,
        } as ViewStyle,
        title: {
            fontSize: 36,
            fontFamily: 'RedHatDisplay_700Bold',
            color: '#42865F',
        } as TextStyle,
        appointmentsContainer: {
            marginTop: 0,
            marginHorizontal: -20,
        } as ViewStyle,
        appointmentItem: {
            paddingVertical: 15,
            paddingHorizontal: 15,
            position: 'relative',
            height: 115,
        } as ViewStyle,
        appointmentContent: {
            flexDirection: 'column',
            gap: 8,
            height: '100%',
            justifyContent: 'space-between',
        } as ViewStyle,
        bottomBorder: {
            position: 'absolute',
            bottom: 0,
            left: 20,
            right: 20,
            height: 1,
            backgroundColor: '#E5E5E5',
        } as ViewStyle,
        topRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 10,
            height: 30,
        } as ViewStyle,
        titleRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingHorizontal: 10,
            paddingBottom: 10,
            height: 60,
        } as ViewStyle,
        leftContent: {
            flexDirection: 'row',
            alignItems: 'center',
            height: 30,
        } as ViewStyle,
        timeWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            height: 30,
        } as ViewStyle,
        titleAndDescription: {
            flex: 1,
            marginRight: 10,
            maxWidth: '70%',
            height: '100%',
        } as ViewStyle,
        timeText: {
            color: '#42865F',
            fontFamily: 'RedHatDisplay_500Medium',
            fontSize: 14,
        } as TextStyle,
        appointmentTitle: {
            fontSize: 20,
            fontFamily: 'RedHatDisplay_500Medium',
            color: '#000',
            marginTop: -2,
        } as TextStyle,
        appointmentDescription: {
            fontSize: 16,
            fontFamily: 'RedHatDisplay_400Regular',
            color: '#666666',
            marginTop: 2,
        } as TextStyle,
        greenDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#42865F',
            marginRight: 0,
        } as ViewStyle,
        menuButton: {
            padding: 5,
        } as ViewStyle,
        addLogButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#42865F',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
        } as ViewStyle,
        addLogText: {
            color: '#FFFFFF',
            marginRight: 5,
            fontFamily: 'RedHatDisplay_700Bold',
            fontSize: 16,
        } as TextStyle,
        addIconContainer: {
            borderRadius: 12,
            padding: 2,
            width: 26,
            height: 26,
            justifyContent: 'center',
            alignItems: 'center',
        } as ViewStyle,
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        } as ViewStyle,
        modalContainer: {
            width: '100%',
            backgroundColor: 'transparent',
        } as ViewStyle,
        modalContent: {
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: '100%',
            paddingBottom: 50,

        } as ViewStyle,
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingRight: 10,
        } as ViewStyle,
        closeButton: {
            marginLeft: 'auto',
        } as ViewStyle,
        modalTitle: {
            fontSize: 28,
            fontFamily: 'RedHatDisplay_700Bold',
            color: '#42865F',
            paddingLeft: 0,
            paddingTop: 10,
            paddingBottom: 10,
        } as TextStyle,
        label: {
            fontSize: 18,
            fontFamily: 'RedHatDisplay_400Regular',
            color: '#000',
            marginBottom: 8,
        } as TextStyle,
        input: {
            borderWidth: 1,
            borderColor: '#E5E5E5',
            borderRadius: 10,
            padding: 15,
            marginBottom: 10,
            fontFamily: 'RedHatDisplay_400Regular',
            fontSize: 16,
        } as TextStyle,
        descriptionContainer: {
            position: 'relative',
            marginBottom: 10,
        } as ViewStyle,
        descriptionInput: {
            height: 80,
            textAlignVertical: 'top',
        } as TextStyle,
        dateButton: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#E5E5E5',
            borderRadius: 10,
            padding: 15,
            marginBottom: 20,
        } as ViewStyle,
        dateButtonText: {
            fontSize: 16,
            fontFamily: 'RedHatDisplay_400Regular',
            color: '#000000',
        } as TextStyle,
        dateButtonIcon: {
            width: 24,
            height: 24,
            justifyContent: 'center',
            alignItems: 'center',
        } as ViewStyle,
        timeContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
        } as ViewStyle,
        timeButton: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#E5E5E5',
            borderRadius: 10,
            padding: 15,
        } as ViewStyle,
        timeButtonText: {
            fontSize: 16,
            fontFamily: 'RedHatDisplay_400Regular',
            color: '#000000',
        } as TextStyle,
        timeButtonIcon: {
            width: 24,
            height: 24,
            justifyContent: 'center',
            alignItems: 'center',
        } as ViewStyle,
        reminderContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 30,
            marginTop: 10,
        } as ViewStyle,
        reminderText: {
            fontSize: 18,
            fontFamily: 'RedHatDisplay_400Regular',
            color: '#000000',
        } as TextStyle,
        addButton: {
            backgroundColor: '#42865F',
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
            marginTop: 20,
        } as ViewStyle,
        addButtonText: {
            color: '#FFFFFF',
            fontSize: 20,
            fontFamily: 'RedHatDisplay_500Medium',
        },
        pickerHeader: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            padding: 0,
            width: '100%',
        } as ViewStyle,
        pickerButton: {
            paddingRight: 10,
        } as ViewStyle,
        modalButtonText: {
            fontSize: 20,
            fontFamily: 'RedHatDisplay_700Bold',
        } as TextStyle,
        calendar: {
            height: 400,
            paddingBottom: 10,
            backgroundColor: '#fff',
            marginHorizontal: -20,
        } as ViewStyle,
        dateTimePickerContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            zIndex: 1000,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: -2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            alignItems: 'center',
            justifyContent: 'center',
        } as ViewStyle,
        characterCount: {
            fontSize: 12,
            color: '#666666',
            position: 'absolute',
            bottom: 20,
            right: 10,
            fontFamily: 'RedHatDisplay_400Regular',
        } as TextStyle,
        scrollView: {
            flex: 1,
        } as ViewStyle,
        buttonContainer: {
            padding: 10,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e1e1e1',
            alignItems: 'center',
            width: '100%',
        } as ViewStyle,
        button: {
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 5,
            alignItems: 'center',
            justifyContent: 'center',
            width: '80%'
        } as ViewStyle,
        createButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: '#42865F',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
        } as ViewStyle,
        createButtonText: {
            fontSize: 16,
            fontFamily: 'RedHatDisplay_500Medium',
            color: '#fff',
        } as TextStyle,
        customHeader: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
        } as ViewStyle,
        monthText: {
            fontSize: 24,
            fontFamily: 'RedHatDisplay_500Medium',
            color: '#000000',
            marginBottom: 2,
            textTransform: 'capitalize',
        } as TextStyle,
        yearText: {
            fontSize: 16,
            fontFamily: 'RedHatDisplay_400Regular',
            color: '#666666',
            marginTop: 2,
        } as TextStyle,
        calendarHeader: {
            fontSize: 18,
            fontFamily: 'RedHatDisplay_700Bold',
            color: '#000000',
            margin: 10,
        } as TextStyle,
        headerButtons: {
            flexDirection: 'row',
            alignItems: 'center',
        } as ViewStyle,
        appointmentsScrollView: {
            flex: 1,
        } as ViewStyle,
        separator: {
            height: 1,
            backgroundColor: '#E5E5E5',
            marginVertical: 15,
            marginHorizontal: -20,
        } as ViewStyle,
        appointmentsHeader: {
            marginTop: 20,
            paddingBottom: 0,
        } as ViewStyle,
        appointmentsTitleContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
            marginTop: 20,
        } as ViewStyle,
        appointmentsTitle: {
            fontSize: 22,
            fontFamily: 'RedHatDisplay_500Medium',
            color: '#000000',
            marginBottom: 20,
        } as TextStyle,
        appointmentsSeparator: {
            height: 1,
            backgroundColor: '#E5E5E5',
            width: '100%',
        } as ViewStyle,
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Kalender</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.createButton}>
                    <Text style={styles.createButtonText}>Opret besøg</Text>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <Text style={styles.dateText}>
                {currentDate.toLocaleDateString('da-DK', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }).toLowerCase()}
            </Text>
            
            <View style={styles.content}>
                {/* Calendar */}
                <Calendar
                    style={styles.calendar}
                    current={selectedDate}
                    renderArrow={(direction: 'left' | 'right') => (
                        <View style={{ 
                            paddingHorizontal: direction === 'left' ? 0 : 0,
                            marginLeft: direction === 'left' ? -10 : 0,
                            marginRight: direction === 'right' ? -10 : 0,
                            width: 40,
                            height: 40,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderRadius: 12,
                            borderColor: 'rgba(0, 0, 0, 0.2)',
                            padding: 5,
                        }}>
                            <Ionicons 
                                name={direction === 'left' ? 'chevron-back' : 'chevron-forward'} 
                                size={25} 
                                color="#000000"
                            />
                        </View>
                    )}
                    renderHeader={(date: Date) => {
                        const dateObj = new Date(date);
                        const month = dateObj.toLocaleString('da-DK', { month: 'long' });
                        const year = dateObj.getFullYear().toString();
                        return (
                            <View style={styles.customHeader}>
                                <Text style={styles.monthText}>{month}</Text>
                                <Text style={styles.yearText}>{year}</Text>
                            </View>
                        );
                    }}
                    theme={{
                        calendarBackground: '#fff',
                        selectedDayBackgroundColor: '#42865F',
                        selectedDayTextColor: '#fff',
                        todayTextColor: '#42865F',
                        todayFontWeight: '700',
                        dayTextColor: '#000',
                        textDisabledColor: '#d9e1e8',
                        monthTextColor: '#000',
                        textMonthFontFamily: 'RedHatDisplay_500Medium',
                        textDayHeaderFontFamily: 'RedHatDisplay_400Regular',
                        dotColor: '#42865F',
                        selectedDotColor: '#ffffff',
                        arrowColor: '#42865F'
                    }}
                    onDayPress={onDayPress}
                    enableSwipeMonths={true}
                    markedDates={getMarkedDates()}
                    firstDay={1}
                    locale="da"
                    dayNamesShort={['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør']}
                />

                {/* Appointments List */}
                <View style={styles.appointmentsSeparator} />
                <ScrollView style={styles.appointmentsScrollView}>
                    <View style={styles.appointmentsContainer}>
                        {renderAppointments()}
                    </View>
                </ScrollView>
            </View>

            {/* Add Visit Modal */}
            {renderModal()}
        </View>
    );
}
