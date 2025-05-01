import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

// Define types for schedule data
type ScheduleData = {
  date: Date;
  startTime: Date;
  endTime: Date;
  repeatOption: 'once' | 'weekly' | 'monthly' | 'yearly';
  selectedWeekdays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  reminderEnabled: boolean;
};

export default function ScheduleViewing() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Extract memory type from params if provided
  const memoryType = params.memoryType as string || 'generic';
  
  // Date and time state
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000)); // Default to 1 hour later
  
  // UI state for pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  // Repeat options state
  const [repeatOption, setRepeatOption] = useState<'once' | 'weekly' | 'monthly' | 'yearly'>('once');
  
  // Weekday selection state
  const [selectedWeekdays, setSelectedWeekdays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });
  
  // Reminder toggle state
  const [reminderEnabled, setReminderEnabled] = useState(false);
  
  // Format date for display
  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleString('da-DK', { month: 'long' });
    const year = date.getFullYear();
    return `${day}. ${month} ${year}`;
  };
  
  // Format time for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  
  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };
  
  // Handle start time change
  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || startTime;
    setShowStartTimePicker(Platform.OS === 'ios');
    setStartTime(currentTime);
    
    // If end time is earlier than start time, adjust it
    if (currentTime > endTime) {
      const newEndTime = new Date(currentTime);
      newEndTime.setHours(newEndTime.getHours() + 1);
      setEndTime(newEndTime);
    }
  };
  
  // Handle end time change
  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || endTime;
    setShowEndTimePicker(Platform.OS === 'ios');
    setEndTime(currentTime);
  };
  
  // Toggle weekday selection
  const toggleWeekday = (weekday: keyof typeof selectedWeekdays) => {
    setSelectedWeekdays({
      ...selectedWeekdays,
      [weekday]: !selectedWeekdays[weekday],
    });
  };
  
  // Prepare schedule data object
  const prepareScheduleData = (): ScheduleData => {
    return {
      date,
      startTime,
      endTime,
      repeatOption,
      selectedWeekdays,
      reminderEnabled,
    };
  };
  
  // Handle save button press
  const handleSave = () => {
    // Prepare the schedule data
    const scheduleData = prepareScheduleData();
    
    // Log the data for debugging
    console.log('Schedule data:', scheduleData);
    console.log('Memory type:', memoryType);
    
    // Return to the previous screen
    // In a real implementation, we would pass the schedule data back
    // or save it to a context/store for later use
    router.back();
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Planlæg visning</Text>
          {/* We could display memory type here if needed */}
          {/* <Text style={styles.memoryTypeLabel}>{memoryType}</Text> */}
        </View>
        
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructions}>
            Vælg tidspunkt for visning – nu eller planlagt.
          </Text>
          <Text style={styles.subInstructions}>
            Kort og roligt – tilpasset deres hverdag.
          </Text>
        </View>
        
        {/* Date and Time Pickers */}
        <View style={styles.dateTimeSection}>
          {/* Date Picker */}
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.inputLabel}>Dato</Text>
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            <Ionicons name="calendar-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
        
        {/* Time Pickers */}
        <View style={styles.timePickersContainer}>
          {/* Start Time */}
          <TouchableOpacity 
            style={styles.timePickerButton}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Text style={styles.inputLabel}>fra</Text>
            <Text style={styles.timeText}>{formatTime(startTime)}</Text>
            <Ionicons name="time-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
          
          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display="default"
              onChange={onStartTimeChange}
              is24Hour={true}
            />
          )}
          
          {/* End Time */}
          <TouchableOpacity 
            style={styles.timePickerButton}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Text style={styles.inputLabel}>til</Text>
            <Text style={styles.timeText}>{formatTime(endTime)}</Text>
            <Ionicons name="time-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
          
          {showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display="default"
              onChange={onEndTimeChange}
              is24Hour={true}
            />
          )}
        </View>
        
        {/* Repeat Options */}
        <View style={styles.repeatSection}>
          <View style={styles.repeatIconRow}>
            <Ionicons name="repeat" size={20} color="#42865F" />
            <Text style={styles.repeatLabel}>Gentag</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.repeatOptionsScrollView}
          >
            <View style={styles.repeatOptionsContainer}>
              <TouchableOpacity 
                style={[
                  styles.repeatOption, 
                  repeatOption === 'once' && styles.repeatOptionSelected
                ]}
                onPress={() => setRepeatOption('once')}
              >
                <Text style={[
                  styles.repeatOptionText,
                  repeatOption === 'once' && styles.repeatOptionTextSelected
                ]}>
                  Vis én gang
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.repeatOption, 
                  repeatOption === 'weekly' && styles.repeatOptionSelected
                ]}
                onPress={() => setRepeatOption('weekly')}
              >
                <Text style={[
                  styles.repeatOptionText,
                  repeatOption === 'weekly' && styles.repeatOptionTextSelected
                ]}>
                  Hver uge
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.repeatOption, 
                  repeatOption === 'monthly' && styles.repeatOptionSelected
                ]}
                onPress={() => setRepeatOption('monthly')}
              >
                <Text style={[
                  styles.repeatOptionText,
                  repeatOption === 'monthly' && styles.repeatOptionTextSelected
                ]}>
                  Hver måned
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.repeatOption, 
                  repeatOption === 'yearly' && styles.repeatOptionSelected
                ]}
                onPress={() => setRepeatOption('yearly')}
              >
                <Text style={[
                  styles.repeatOptionText,
                  repeatOption === 'yearly' && styles.repeatOptionTextSelected
                ]}>
                  Hvert år
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
        
        {/* Weekday Selection - Only show if weekly, monthly, or yearly is selected */}
        {(repeatOption === 'weekly' || repeatOption === 'monthly' || repeatOption === 'yearly') && (
          <View style={styles.weekdaySection}>
            <Text style={styles.weekdayLabel}>Vælg ugedag</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.weekdayScrollView}
            >
              <View style={styles.weekdayContainer}>
                <TouchableOpacity 
                  style={[
                    styles.weekdayButton,
                    selectedWeekdays.monday && styles.weekdayButtonSelected
                  ]}
                  onPress={() => toggleWeekday('monday')}
                >
                  <Text style={[
                    styles.weekdayText,
                    selectedWeekdays.monday && styles.weekdayTextSelected
                  ]}>
                    Mandag
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.weekdayButton,
                    selectedWeekdays.tuesday && styles.weekdayButtonSelected
                  ]}
                  onPress={() => toggleWeekday('tuesday')}
                >
                  <Text style={[
                    styles.weekdayText,
                    selectedWeekdays.tuesday && styles.weekdayTextSelected
                  ]}>
                    Tirsdag
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.weekdayButton,
                    selectedWeekdays.wednesday && styles.weekdayButtonSelected
                  ]}
                  onPress={() => toggleWeekday('wednesday')}
                >
                  <Text style={[
                    styles.weekdayText,
                    selectedWeekdays.wednesday && styles.weekdayTextSelected
                  ]}>
                    Onsdag
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.weekdayButton,
                    selectedWeekdays.thursday && styles.weekdayButtonSelected
                  ]}
                  onPress={() => toggleWeekday('thursday')}
                >
                  <Text style={[
                    styles.weekdayText,
                    selectedWeekdays.thursday && styles.weekdayTextSelected
                  ]}>
                    Torsdag
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.weekdayButton,
                    selectedWeekdays.friday && styles.weekdayButtonSelected
                  ]}
                  onPress={() => toggleWeekday('friday')}
                >
                  <Text style={[
                    styles.weekdayText,
                    selectedWeekdays.friday && styles.weekdayTextSelected
                  ]}>
                    Fredag
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.weekdayButton,
                    selectedWeekdays.saturday && styles.weekdayButtonSelected
                  ]}
                  onPress={() => toggleWeekday('saturday')}
                >
                  <Text style={[
                    styles.weekdayText,
                    selectedWeekdays.saturday && styles.weekdayTextSelected
                  ]}>
                    Lørdag
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.weekdayButton,
                    selectedWeekdays.sunday && styles.weekdayButtonSelected
                  ]}
                  onPress={() => toggleWeekday('sunday')}
                >
                  <Text style={[
                    styles.weekdayText,
                    selectedWeekdays.sunday && styles.weekdayTextSelected
                  ]}>
                    Søndag
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
        
        {/* Reminder Toggle */}
        <View style={styles.reminderSection}>
          <Text style={styles.reminderText}>Påmind mig ved visning</Text>
          <Switch
            trackColor={{ false: "#E5E7E6", true: "#42865F" }}
            thumbColor={reminderEnabled ? "#FFFFFF" : "#FFFFFF"}
            ios_backgroundColor="#E5E7E6"
            onValueChange={() => setReminderEnabled(!reminderEnabled)}
            value={reminderEnabled}
          />
        </View>
        
        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Gem planlægning</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingTop: 90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 2,
    marginRight: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000000',
    marginLeft: 4,
  },
  instructionsContainer: {
    marginBottom: 38,
  },
  instructions: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000000',
    marginBottom: 6,
    lineHeight: 30,
  },
  subInstructions: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  dateTimeSection: {
    marginBottom: 0,
  },
  inputLabel: {
    fontSize: 17,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#8E8E93',
    marginRight: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#42865F',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  dateText: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000000',
    textAlign: 'center',
    marginLeft: -160, // Offset for the label to center the text
  },
  timePickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  timePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#42865F',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    width: '48%',
  },
  timeText: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000000',
    textAlign: 'center',
    marginLeft: -10,
  },
  repeatSection: {
    marginBottom: 24,
  },
  repeatIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  repeatLabel: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000000',
    marginLeft: 8,
  },
  repeatOptionsScrollView: {
    marginBottom: 8,
  },
  repeatOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 18,
    paddingRight: 8,
  },
  repeatOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7E6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatOptionSelected: {
    backgroundColor: '#42865F',
    borderColor: '#42865F',
  },
  repeatOptionText: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#333333',
  },
  repeatOptionTextSelected: {
    color: '#FFFFFF',
  },
  weekdaySection: {
    marginBottom: 24,
  },
  weekdayLabel: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000000',
    marginBottom: 16,
  },
  weekdayScrollView: {
    marginBottom: 8,
  },
  weekdayContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 18,
    paddingRight: 8,
  },
  weekdayButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7E6',
    borderRadius: 8,
  },
  weekdayButtonSelected: {
    backgroundColor: '#42865F',
    borderColor: '#42865F',
  },
  weekdayText: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333333',
  },
  weekdayTextSelected: {
    color: '#FFFFFF',
  },
  weekdayInfoText: {
    fontSize: 14,
    fontFamily: 'RedHatDisplay_400Regular',
    fontStyle: 'italic',
    color: '#666666',
    marginTop: 8,
  },
  reminderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7E6',
  },
  reminderText: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000000',
  },
  saveButton: {
    backgroundColor: '#42865F',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  saveButtonText: {
    fontSize: 19,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#FFFFFF',
  },
});
