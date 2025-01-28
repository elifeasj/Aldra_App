import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Switch, Platform, Animated, KeyboardAvoidingView } from 'react-native';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

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
    const [tempTime, setTempTime] = useState<Date>(new Date());

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

    const handleOpenModal = () => {
        console.log('Opening modal...');
        setIsModalVisible(true);
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
            setTempTime(selectedTime);
        }
    };

    const onEndTimeChange = (event: any, selectedTime?: Date) => {
        if (selectedTime) {
            setTempTime(selectedTime);
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
        const formattedTime = tempTime.toLocaleTimeString('da-DK', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        setNewAppointment(prev => ({
            ...prev,
            start_time: formattedTime
        }));
        setShowStartTimePicker(false);
    };

    const handleConfirmEndTime = () => {
        const formattedTime = tempTime.toLocaleTimeString('da-DK', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        setNewAppointment(prev => ({
            ...prev,
            end_time: formattedTime
        }));
        setShowEndTimePicker(false);
    };

    const handleCreateAppointment = async () => {
        try {
            if (!newAppointment.title || !newAppointment.date || !newAppointment.start_time || !newAppointment.end_time) {
                alert('Udfyld venligst alle påkrævede felter');
                return;
            }

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
            
        } catch (error) {
            console.error('Error adding appointment:', error);
            alert('Der opstod en fejl ved oprettelse af aftalen');
        }
    };

    const renderModal = () => (
        <Modal
            transparent={true}
            visible={isModalVisible}
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
                                        if (text.length <= 50) {
                                            setNewAppointment(prev => ({ ...prev, description: text }));
                                        }
                                    }}
                                    placeholder="Skriv beskrivelse her..."
                                    placeholderTextColor="#8F9BB3"
                                    multiline
                                    maxLength={50}
                                />
                                <Text style={styles.characterCount}>{newAppointment.description?.length || 0}/50</Text>
                            </View>
                        </KeyboardAvoidingView>

                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={[styles.dateButtonText, !newAppointment.date && { color: '#8F9BB3' }]}>
                                {newAppointment.date 
                                    ? new Date(newAppointment.date).toLocaleDateString('da-DK')
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
                                            <Text style={[styles.buttonText, { color: '#42865F' }]}>OK</Text>
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
                                            <Text style={[styles.buttonText, { color: '#42865F' }]}>OK</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <DateTimePicker
                                        value={tempTime}
                                        mode="time"
                                        is24Hour={true}
                                        display="spinner"
                                        onChange={onStartTimeChange}
                                        textColor="black"
                                        themeVariant="light"
                                    />
                                </View>
                            )}

                            {showEndTimePicker && (
                                <View style={styles.dateTimePickerContainer}>
                                    <View style={styles.pickerHeader}>
                                        <TouchableOpacity 
                                            style={styles.pickerButton}
                                            onPress={handleConfirmEndTime}
                                        >
                                            <Text style={[styles.buttonText, { color: '#42865F' }]}>OK</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <DateTimePicker
                                        value={tempTime}
                                        mode="time"
                                        is24Hour={true}
                                        display="spinner"
                                        onChange={onEndTimeChange}
                                        textColor="black"
                                        themeVariant="light"
                                    />
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
                                    display="default"
                                    onChange={onDateChange}
                                />
                            )}

                            {showStartTimePicker && (
                                <DateTimePicker
                                    value={tempTime}
                                    mode="time"
                                    is24Hour={true}
                                    display="default"
                                    onChange={onStartTimeChange}
                                />
                            )}

                            {showEndTimePicker && (
                                <DateTimePicker
                                    value={tempTime}
                                    mode="time"
                                    is24Hour={true}
                                    display="default"
                                    onChange={onEndTimeChange}
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
                    <View style={styles.appointmentTimeContainer}>
                        <View style={styles.greenDot} />
                        <Text style={styles.timeText}>
                            {`${appointment.start_time.substring(0, 5)}-${appointment.end_time.substring(0, 5)}`}
                        </Text>
                    </View>
                    <View style={styles.appointmentContent}>
                        <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                        <View style={styles.appointmentActions}>
                            <TouchableOpacity style={styles.addLogButton}>
                                <Text style={styles.addLogText}>Tilføj log</Text>
                                <View style={styles.addIconContainer}>
                                    <Ionicons name="add" size={16} color="#42865F" />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuButton}>
                                <Ionicons name="ellipsis-vertical" size={20} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ));
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Kalender</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.createButton}>
                        <Text style={styles.createButtonText}>Opret besøg</Text>
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.dateText}>
                {currentDate.toLocaleDateString('da-DK', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }).toLowerCase()}
            </Text>
            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    {/* Calendar */}
                    <Calendar
                        style={styles.calendar}
                        theme={{
                            calendarBackground: '#fff',
                            selectedDayBackgroundColor: '#42865F',
                            selectedDayTextColor: '#fff',
                            todayTextColor: '#42865F',
                            dayTextColor: '#000',
                            textDisabledColor: '#d9e1e8',
                            monthTextColor: '#000',
                            textMonthFontFamily: 'RedHatDisplay_700Bold',
                            textDayHeaderFontFamily: 'RedHatDisplay_400Regular',
                            dotColor: '#42865F',
                            selectedDotColor: '#ffffff'
                        }}
                        current={selectedDate}
                        onDayPress={onDayPress}
                        enableSwipeMonths={true}
                        markedDates={getMarkedDates()}
                        firstDay={1}
                        locale="da"
                        renderHeader={(date: Date) => {
                            const monthNames = [
                                'januar', 'februar', 'marts', 'april', 'maj', 'juni',
                                'juli', 'august', 'september', 'oktober', 'november', 'december'
                            ];
                            const month = monthNames[date.getMonth()];
                            const year = date.getFullYear();
                            return (
                                <Text style={styles.calendarHeader}>
                                    {month} {year}
                                </Text>
                            );
                        }}
                        dayNamesShort={['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør']}
                    />

                    {/* Appointments List */}
                    <View style={styles.appointmentsContainer}>
                        {renderAppointments()}
                    </View>
                </View>
            </ScrollView>

            {/* Add Visit Modal */}
            {renderModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    dateText: {
        fontSize: 18,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#42865F',
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 80,
    },
    content: {
        padding: 20,
        paddingTop: 0,
    },
    title: {
        fontSize: 36,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#42865F',
    },
    appointmentsContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    appointmentItem: {
        marginBottom: 20,
    },
    appointmentTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    greenDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#42865F',
        marginRight: 8,
    },
    timeText: {
        color: '#42865F',
        fontFamily: 'RedHatDisplay_400Regular',
        fontSize: 14,
    },
    appointmentContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 10,
        minHeight: 50,
    },
    appointmentTitle: {
        fontSize: 16,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#000',
        flex: 1,
    },
    appointmentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    addLogButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    addLogText: {
        color: '#42865F',
        marginRight: 5,
        fontFamily: 'RedHatDisplay_400Regular',
        fontSize: 14,
    },
    addIconContainer: {
        backgroundColor: '#E8F0EB',
        borderRadius: 12,
        padding: 2,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuButton: {
        padding: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        width: '100%',
        backgroundColor: 'transparent',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '100%',
        paddingBottom: 50,

    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingRight: 10,
    },
    closeButton: {
        marginLeft: 'auto',
    },
    modalTitle: {
        fontSize: 28,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#42865F',
        paddingLeft: 0,
        paddingTop: 10,
        paddingBottom: 10,
    },
    label: {
        fontSize: 18,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#000',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        fontFamily: 'RedHatDisplay_400Regular',
        fontSize: 16,
    },
    descriptionContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    descriptionInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    dateButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    dateButtonText: {
        fontSize: 16,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#000000',
    },
    dateButtonIcon: {
        width: 24,
        height: 24,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    timeButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 10,
        padding: 15,
    },
    timeButtonText: {
        fontSize: 16,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#000000',
    },
    timeButtonIcon: {
        width: 24,
        height: 24,
    },
    reminderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    reminderText: {
        fontSize: 18,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#000000',
    },
    addButton: {
        backgroundColor: '#42865F',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 18,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#FFFFFF',
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 0,
    },
    pickerButton: {
        paddingRight: 10,
    },
    buttonText: {
        fontSize: 20,
        fontFamily: 'RedHatDisplay_700Bold',
    },
    calendar: {
        height: 350,
    },
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
    },
    characterCount: {
        fontSize: 12,
        color: '#666666',
        position: 'absolute',
        bottom: 20,
        right: 10,
        fontFamily: 'RedHatDisplay_400Regular',
    },
    scrollView: {
        flex: 1,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#42865F',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    createButtonText: {
        fontSize: 16,
        fontFamily: 'RedHatDisplay_500Medium',
        color: '#fff',
    },
    calendarHeader: {
        fontSize: 18,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#000000',
        margin: 10,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});
