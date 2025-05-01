import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TouchableWithoutFeedback 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface CancellationModalProps {
  visible: boolean;
  onClose: () => void;
  onGoToOverview: () => void;
  onReactivate: () => void;
}

const CancellationModal: React.FC<CancellationModalProps> = ({
  visible,
  onClose,
  onGoToOverview,
  onReactivate
}) => {
  const router = useRouter();
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.checkmarkContainer}>
                <Ionicons name="checkmark-circle" size={32} color="#42865F" />
              </View>
              
              <Text style={styles.modalMessage}>
                Du har nu adgang til Aldras gratis funktioner. Minder og Display er gemt og klar, hvis du vender tilbage.
              </Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.outlineButton} 
                  onPress={onGoToOverview}
                >
                  <Text style={styles.outlineButtonText}>Til oversigten</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.filledButton} 
                  onPress={onReactivate}
                >
                  <Text style={styles.filledButtonText}>Genaktiver</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  checkmarkContainer: {
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#000',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#42865F',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 10,
  },
  outlineButtonText: {
    color: '#42865F',
    fontSize: 18,
    fontFamily: 'RedHatDisplay_500Medium',
  },
  filledButton: {
    flex: 1,
    backgroundColor: '#42865F',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 10,
  },
  filledButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'RedHatDisplay_500Medium',
  },
});

export default CancellationModal;
