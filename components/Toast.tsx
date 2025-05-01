import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ToastProps = {
  type: 'success' | 'error' | 'info';
  message: string;
};

const iconMap = {
  success: 'checkmark-circle-outline',
  error: 'close-circle-outline',
  info: 'information-circle-outline',
} as const;

const colorMap = {
  success: '#42865F',
  error: '#B73C3C',
  info: '#3B82F6',
} as const;

const Toast = ({ type, message }: ToastProps) => {
  return (
    <View style={styles.fullScreenOverlay}>
      <View style={[styles.toastMessage, { borderColor: colorMap[type] }]}>
        <Ionicons
          name={iconMap[type]}
          size={30}
          color={colorMap[type]}
          style={styles.icon}
        />
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 110,                     
    zIndex: 1000,
  },
  toastMessage: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: '90%',
    maxWidth: 400,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
  },
  icon: {
    marginRight: 12,
  },
  toastText: {
    flex: 1,
    fontSize: 18,
    color: '#000',
    fontFamily: 'RedHatDisplay_400Regular',
    lineHeight: 26,
  },
});

export default Toast;
