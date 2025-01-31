import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

export default function NyLog() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    const handleSave = () => {
        // Her implementerer vi gem funktionaliteten
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ny log</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Titel</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Skriv titel her..."
                        maxLength={20}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Beskrivelse</Text>
                    <TextInput
                        style={[styles.input, styles.descriptionInput]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Beskriv om dit besøg her..."
                        multiline
                        maxLength={20}
                    />
                </View>

                <View style={styles.calendarContainer}>
                    <Text style={styles.label}>Vælg dato</Text>
                    <Calendar
                        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                        markedDates={{
                            [selectedDate]: { selected: true, selectedColor: '#42865F' }
                        }}
                        theme={{
                            selectedDayBackgroundColor: '#42865F',
                            selectedDayTextColor: '#fff',
                            todayTextColor: '#42865F',
                            arrowColor: '#42865F',
                        }}
                    />
                </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
            >
                <Text style={styles.saveButtonText}>Gem log</Text>
            </TouchableOpacity>
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
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    backButton: {
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: 'RedHatDisplay_500Medium',
    },
    form: {
        flex: 1,
        padding: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontFamily: 'RedHatDisplay_500Medium',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        fontFamily: 'RedHatDisplay_400Regular',
    },
    descriptionInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    calendarContainer: {
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#42865F',
        margin: 20,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'RedHatDisplay_500Medium',
    },
});
