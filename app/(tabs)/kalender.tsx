import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Switch, Platform } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Appointment {
    id: number;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    reminder: boolean;
}

interface MarkedDates {
    [date: string]: {
        marked: boolean;
        dotColor: string;
    };
}

export default function Kalender() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState<boolean>(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);
    
    const [newAppointment, setNewAppointment] = useState<Appointment>({
        id: Date.now(),
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        reminder: false
    });

    const [tempDate, setTempDate] = useState<Date>(new Date());
    const [tempTime, setTempTime] = useState<Date>(new Date());

    const handleOpenModal = () => {
        console.log('Opening modal...');
        setIsModalVisible(true);
    };

    // Fetch appointments for selected date
    const fetchAppointments = async (date: string) => {
        try {
            const response = await fetch(`http://192.168.0.234:5001/appointments/${date}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    // Load appointments when selected date changes
    const loadAppointments = () => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        fetchAppointments(dateStr);
    };

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
            startTime: formattedTime
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
            endTime: formattedTime
        }));
        setShowEndTimePicker(false);
    };

    const handleAddAppointment = () => {
        if (!newAppointment.title || !newAppointment.date || !newAppointment.startTime || !newAppointment.endTime) {
            alert('Udfyld venligst alle påkrævede felter');
            return;
        }

        const appointment = {
            ...newAppointment,
            id: Date.now()
        };

        setAppointments(prev => [...prev, appointment]);
        setNewAppointment({
            id: Date.now(),
            title: '',
            description: '',
            date: '',
            startTime: '',
            endTime: '',
            reminder: false
        });
        setIsModalVisible(false);
    };

    const formatTime = (date: Date) => {
        if (!date) return '';
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const formatDate = (date: Date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getMarkedDates = (): MarkedDates => {
        const marked: MarkedDates = {};
        appointments.forEach(appointment => {
            if (appointment.date) {
                marked[appointment.date] = {
                    marked: true,
                    dotColor: '#42865F'
                };
            }
        });
        return marked;
    };

    const renderModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Opret besøg</Text>
                    
                    <Text style={styles.label}>Titel</Text>
                    <TextInput
                        style={styles.input}
                        value={newAppointment.title}
                        onChangeText={(text) => setNewAppointment(prev => ({ ...prev, title: text }))}
                        placeholder="Indtast titel"
                    />

                    <Text style={styles.label}>Beskrivelse</Text>
                    <TextInput
                        style={[styles.input, styles.descriptionInput]}
                        value={newAppointment.description}
                        onChangeText={(text) => {
                            if (text.length <= 50) {
                                setNewAppointment(prev => ({ ...prev, description: text }));
                            }
                        }}
                        placeholder="Skriv beskrivelse her..."
                        multiline
                        maxLength={50}
                    />
                    <Text style={styles.characterCount}>{newAppointment.description.length}/50</Text>

                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.dateButtonText}>
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
                            <Text style={styles.timeButtonText}>
                                {newAppointment.startTime || 'Start tid'}
                            </Text>
                            <View style={styles.timeButtonIcon}>
                                <Ionicons name="time-outline" size={24} color="#000" />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.timeButton, { marginLeft: 8 }]}
                            onPress={() => setShowEndTimePicker(true)}
                        >
                            <Text style={styles.timeButtonText}>
                                {newAppointment.endTime || 'Slut tid'}
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
                        onPress={handleAddAppointment}
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
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Kalender</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity>
                        <Ionicons name="search" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsModalVisible(true)} style={{ marginLeft: 15 }}>
                        <Ionicons name="add" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.content}>
                    {/* Calendar */}
                    <Calendar
                        style={styles.calendar}
                        theme={{
                            todayTextColor: '#42865F',
                            selectedDayBackgroundColor: '#42865F',
                            selectedDayTextColor: '#ffffff',
                            dotColor: '#42865F',
                            textDayFontFamily: 'RedHatDisplay_400Regular',
                            textMonthFontFamily: 'RedHatDisplay_700Bold',
                            textDayHeaderFontFamily: 'RedHatDisplay_400Regular'
                        }}
                        current={selectedDate.toISOString().split('T')[0]}
                        onDayPress={(day: DateData) => {
                            setSelectedDate(new Date(day.timestamp));
                            loadAppointments();
                        }}
                        monthFormat={'yyyy'}
                        enableSwipeMonths={true}
                        markedDates={getMarkedDates()}
                    />

                    {/* Appointments List */}
                    <View style={styles.appointmentsList}>
                        {appointments
                            .filter(appointment => appointment.date === selectedDate.toISOString().split('T')[0])
                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                            .map(appointment => (
                            <View key={appointment.id} style={styles.appointmentItem}>
                                <View style={styles.timeContainer}>
                                    <View style={styles.greenDot} />
                                    <Text style={styles.timeText}>{`${appointment.startTime}-${appointment.endTime}`}</Text>
                                </View>
                                <View style={styles.appointmentContent}>
                                    <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                                    <View style={styles.appointmentActions}>
                                        <TouchableOpacity style={styles.addLogButton}>
                                            <Text style={styles.addLogText}>Tilføj log</Text>
                                            <View style={styles.addIconContainer}>
                                                <Ionicons name="add" size={20} color="#42865F" />
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.menuButton}>
                                            <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {renderModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    content: {
        padding: 20,
        paddingTop: 0,
    },
    title: {
        fontSize: 32,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#42865F',
    },
    appointmentsList: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    appointmentItem: {
        marginBottom: 20,
    },
    timeContainer: {
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
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '95%',
    },
    modalTitle: {
        fontSize: 28,
        fontFamily: 'RedHatDisplay_700Bold',
        color: '#000000',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontFamily: 'RedHatDisplay_400Regular',
        color: '#666666',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        fontFamily: 'RedHatDisplay_400Regular',
        fontSize: 16,
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
        marginBottom: 20,
    },
    reminderText: {
        fontSize: 16,
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
        fontSize: 16,
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
        textAlign: 'right',
        marginBottom: 15,
        fontFamily: 'RedHatDisplay_400Regular',
    },
});
