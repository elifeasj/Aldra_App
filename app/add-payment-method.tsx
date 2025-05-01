import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from '@/components/Toast';

interface FormData {
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  cardholderName: string;
}

interface FormErrors {
  cardNumber?: string;
  expiryDate?: string;
  cvc?: string;
  cardholderName?: string;
}

const AddPaymentMethod = () => {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: ''
  });
  
  // Error state
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Touched fields state (to show errors only after user interaction)
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Handle input changes
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [field]: formatted }));
    }
    
    // Format expiry date with slash
    if (field === 'expiryDate') {
      let formatted = value.replace(/\D/g, '');
      if (formatted.length > 2) {
        formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 4);
      }
      setFormData(prev => ({ ...prev, [field]: formatted }));
    }
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Mark field as touched when user finishes editing
  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  // Validate a single field
  const validateField = (field: keyof FormData, value: string) => {
    let error: string | undefined;
    
    switch (field) {
      case 'cardNumber':
        if (!value) {
          error = 'Ugyldigt kortnummer';
        } else if (value.replace(/\s/g, '').length !== 16) {
          error = 'Ugyldigt kortnummer';
        }
        break;
        
      case 'expiryDate':
        if (!value) {
          error = 'Indtast udløbsdato';
        } else {
          const [month, year] = value.split('/');
          if (!month || !year || month.length !== 2 || year.length !== 2) {
            error = 'Indtast udløbsdato';
          } else if (parseInt(month) < 1 || parseInt(month) > 12) {
            error = 'Indtast udløbsdato';
          }
        }
        break;
        
      case 'cvc':
        if (!value) {
          error = 'Indtast CVC';
        } else if (value.length !== 3 || !/^\d{3}$/.test(value)) {
          error = 'Indtast CVC';
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;
    
    // Mark all fields as touched
    const newTouched = {
      cardNumber: true,
      expiryDate: true,
      cvc: true,
      cardholderName: true
    };
    setTouched(newTouched);
    
    // Validate each field
    Object.keys(formData).forEach(key => {
      const field = key as keyof FormData;
      const value = formData[field];
      
      if (!validateField(field, value)) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      // Show success toast
      setToast({ 
        type: 'success', 
        message: 'Betalingsmetode tilføjet  Din betalingsoplysning er nu gemt.' 
      });
      
      // Navigate back after a delay
      setTimeout(() => {
        router.back();
      }, 2000);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Tilføj betalingsmetode</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Card information section */}
          <Text style={styles.sectionTitle}>Kortoplysninger</Text>
          <Text style={styles.requiredText}>*Disse felter skal udfyldes</Text>
          
          {/* Card number field */}
          <View style={styles.inputGroup}>
            <Text style={[
              styles.inputLabel, 
              touched.cardNumber && errors.cardNumber ? styles.errorLabel : null
            ]}>
              Kortnummer*
            </Text>
            <View style={[
              styles.inputContainer,
              touched.cardNumber && errors.cardNumber ? styles.errorInput : null
            ]}>
              <Ionicons name="card-outline" size={24} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="XXXX XXXX XXXX XXXX"
                placeholderTextColor="#A0A0A0"
                value={formData.cardNumber}
                onChangeText={(value) => handleChange('cardNumber', value)}
                onBlur={() => handleBlur('cardNumber')}
                keyboardType="number-pad"
                maxLength={19} // 16 digits + 3 spaces
              />
            </View>
            {touched.cardNumber && errors.cardNumber && (
              <Text style={styles.errorText}>{errors.cardNumber}</Text>
            )}
          </View>
          
          {/* Expiry date and CVC fields */}
          <View style={styles.rowInputs}>
            {/* Expiry date field */}
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={[
                styles.inputLabel,
                touched.expiryDate && errors.expiryDate ? styles.errorLabel : null
              ]}>
                Udløbsdato*
              </Text>
              <View style={[
                styles.inputContainer,
                touched.expiryDate && errors.expiryDate ? styles.errorInput : null
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="MM/ÅÅ"
                  placeholderTextColor="#A0A0A0"
                  value={formData.expiryDate}
                  onChangeText={(value) => handleChange('expiryDate', value)}
                  onBlur={() => handleBlur('expiryDate')}
                  keyboardType="number-pad"
                  maxLength={5} // MM/YY
                />
              </View>
              {touched.expiryDate && errors.expiryDate && (
                <Text style={styles.errorText}>{errors.expiryDate}</Text>
              )}
            </View>
            
            {/* CVC field */}
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={[
                styles.inputLabel,
                touched.cvc && errors.cvc ? styles.errorLabel : null
              ]}>
                CVC*
              </Text>
              <View style={[
                styles.inputContainer,
                touched.cvc && errors.cvc ? styles.errorInput : null
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="3 cifre"
                  placeholderTextColor="#A0A0A0"
                  value={formData.cvc}
                  onChangeText={(value) => handleChange('cvc', value)}
                  onBlur={() => handleBlur('cvc')}
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIconRight} />
              </View>
              {touched.cvc && errors.cvc && (
                <Text style={styles.errorText}>{errors.cvc}</Text>
              )}
            </View>
          </View>
          
          {/* Cardholder name field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kortholders fulde navn</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Dit fulde navn"
                placeholderTextColor="#A0A0A0"
                value={formData.cardholderName}
                onChangeText={(value) => handleChange('cardholderName', value)}
              />
            </View>
          </View>
          
          {/* Security info */}
          <View style={styles.securityInfo}>
            <Ionicons name="shield-checkmark" size={20} color="#42865F" style={styles.securityIcon} />
            <Text style={styles.securityText}>Din betaling håndteres sikkert med kryptering</Text>
          </View>
          
          {/* Privacy info */}
          <View style={styles.privacyInfo}>
            <Text style={styles.privacyText}>
              Vil du vide mere om, hvordan vi håndterer dine data, beskytter din privatliv og hvilke vilkår der gælder?
            </Text>
            <View style={styles.privacyLinks}>
              <TouchableOpacity>
                <Text style={styles.linkText}>Persondatapolitik</Text>
              </TouchableOpacity>
              <Text style={styles.privacyText}> og </Text>
              <TouchableOpacity>
                <Text style={styles.linkText}>Vilkår & Betingelser</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Submit button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Gem betalingsmetode</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Toast notification */}
      {toast && (
        <Toast type={toast.type} message={toast.message} />
      )}
    </KeyboardAvoidingView>
  );
};

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
    marginRight: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'RedHatDisplay_500Medium',
    marginBottom: 8,
    color: '#000',
  },
  requiredText: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#666',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#42865F',
    marginBottom: 8,
  },
  errorLabel: {
    color: '#B73C3C',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
  },
  errorInput: {
    borderColor: '#B73C3C',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'RedHatDisplay_400Regular',
  },
  inputIcon: {
    marginRight: 10,
  },
  inputIconRight: {
    marginLeft: 10,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#B73C3C',
    marginTop: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  securityIcon: {
    marginRight: 8,
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#42865F',
  },
  privacyInfo: {
    marginBottom: 30,
  },
  privacyText: {
    fontSize: 14,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#333',
    lineHeight: 20,
  },
  privacyLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#42865F',
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: '#42865F',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'RedHatDisplay_500Medium',
  },
});

export default AddPaymentMethod;
