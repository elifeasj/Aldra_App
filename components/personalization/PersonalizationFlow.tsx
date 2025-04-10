import React, { useState } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,TextInput,ScrollView,Alert,Image,KeyboardAvoidingView,Platform, TouchableWithoutFeedback, Keyboard} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressIndicator } from './ProgressIndicator';
import { usePersonalization } from '../../context/PersonalizationContext';
import supabase from '../../config/supabase';
import { API_URL } from '../../config';
import { useAuth } from '../../context/auth';

const STEPS = {
  WELCOME: 0,
  RELATION: 1,
  DEMENTIA_TYPE: 2,
  EXPERIENCE: 3,
  CHALLENGES: 4,
  HELP_NEEDS: 5,
};

export const PersonalizationFlow: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { currentStep, setCurrentStep, answers, updateAnswer } = usePersonalization();
  const { user } = useAuth(); 
  console.log('AUTH USER:', user);



  const saveAnswers = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
  
    if (sessionError || !session?.user?.id) {
      throw new Error('Bruger ikke fundet');
    }
  
    const user_id = session.user.id;
  
    console.log('Gemmer til Supabase:', { user_id, ...answers });
  
    const { data, error } = await supabase
      .from('user_profile_answers')
      .insert([{ user_id, ...answers }])
      .single();
  
    if (error) {
      console.error('Fejl i saveAnswers:', error);
      throw new Error(error.message || 'Fejl ved gem af svar');
    }
  };
  
  if (currentStep > 5) {
    return (
      <View style={styles.container}>
        <Text style={styles.welcomeTitle}>Tak for dine svar!</Text>
        <Text style={styles.welcomeText}>
          Vi tilpasser dit dashboard og vejledning, så det passer til dine behov.
        </Text>
        <TouchableOpacity
          style={[styles.navigationButton, styles.nextButton]}
          onPress={() => navigation.navigate('oversigt' as never)}
        >
          <Text style={[styles.navigationButtonText, styles.nextButtonText]}>
            Til din oversigt
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderWelcomeScreen = () => (
    <View style={styles.welcomeContainer}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/aldra_logo.png')}
          style={styles.headerLogo}
        />
      </View>

      <View style={styles.introWrapper}>
        <Text style={styles.welcomeTitle}>Velkommen til Aldra</Text>
        <Text style={styles.welcomeText}>
          Vi vil gerne sikre, at din oplevelse på Aldra bliver personlig og relevant for dine behov. 
          Svar på et par korte spørgsmål, så vi kan tilpasse appen til dig.
        </Text>
      </View>

      <TouchableOpacity style={styles.getStartedButton} onPress={() => setCurrentStep(STEPS.RELATION)}>
        <Text style={styles.getStartedButtonText}>Kom i gang</Text>
      </TouchableOpacity>
    </View>

  );

  const [currentFieldMap, setCurrentFieldMap] = useState<Record<number, keyof typeof answers | null>>({});
  const [otherInputMap, setOtherInputMap] = useState<Record<number, boolean>>({});


  const getOtherInputState = (step: number): boolean => !!otherInputMap[step];
  const getCurrentField = (step: number): keyof typeof answers | null => currentFieldMap[step] || null;


  const openOtherInput = (step: number, field: keyof typeof answers) => {
    setOtherInputMap(prev => ({ ...prev, [step]: true }));
    setCurrentFieldMap(prev => ({ ...prev, [step]: field }));
  };

const closeOtherInput = (step: number) => {
  setOtherInputMap(prev => ({ ...prev, [step]: false }));
  setCurrentFieldMap(prev => ({ ...prev, [step]: null }));
};



  const handleNext = async () => {
    if (!isStepValid()) {
      Alert.alert('Vælg venligst et svar', 'Du skal vælge mindst én mulighed for at fortsætte.');
      return;
    }

    if (currentStep === 5) {
      try {
        await saveAnswers();
      setCurrentStep(6);
      } catch (error) {
        Alert.alert('Fejl', 'Der opstod en fejl ved gem af dine svar. Prøv igen.');
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
    if (currentStep === 5) {
      try {
        console.log('Gemmer svar:', answers); // 👀 Se hvad du prøver at gemme
        await saveAnswers();
        setCurrentStep(6);
      } catch (error) {
        console.error('Fejl i saveAnswers:', error); // 👈 Viser fejl i terminalen
        Alert.alert('Fejl', 'Der opstod en fejl ved gem af dine svar. Prøv igen.');
      }
    }
  };

  const handleBack = () => {
    if (currentStep >= 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case STEPS.RELATION:
        return answers.relation_to_person !== '';
      case STEPS.DEMENTIA_TYPE:
        return answers.diagnosed_dementia_type !== '';
      case STEPS.EXPERIENCE:
        return answers.experience_level !== '';
      case STEPS.CHALLENGES:
        return answers.main_challenges.length > 0;
      case STEPS.HELP_NEEDS:
        return answers.help_needs.length > 0;
      default:
        return true;
    }
  };

  const handleOptionSelect = (option: string, key: keyof typeof answers) => {
    const multiSelect = key === 'main_challenges' || key === 'help_needs';
  
    if (option === 'Andet') {
      openOtherInput(currentStep, key);
  
      // ✅ markér "Andet" som valgt – ligesom de andre
      if (multiSelect) {
        const current = answers[key] as string[];
        if (!current.includes('Andet')) {
          updateAnswer(key, [...current, 'Andet']);
        }
      } else {
        updateAnswer(key, 'Andet');
      }
  
      return;
    }
  
    // Hvis man vælger noget andet, luk inputfelt
    closeOtherInput(currentStep);
  
    if (multiSelect) {
      const currentValues = answers[key] as string[];
      const isSelected = currentValues.includes(option);
      const updated = isSelected
        ? currentValues.filter(val => val !== option)
        : [...currentValues, option];
      updateAnswer(key, updated);
    } else {
      updateAnswer(key, option);
    }
  };
  

  const handleOtherTextChange = (text: string) => {
    if (!currentFieldMap[currentStep]) return;
  
    const formatted = text.trim() ? `Andet: ${text.trim()}` : 'Andet';
  
    if (currentFieldMap[currentStep] === 'main_challenges' || currentFieldMap[currentStep] === 'help_needs') {
      const current = answers[currentFieldMap[currentStep]] as string[];
      const filtered = current.filter(item => !item.startsWith('Andet'));
      updateAnswer(currentFieldMap[currentStep], [...filtered, formatted]);
    } else {
      updateAnswer(currentFieldMap[currentStep], formatted);
    }
  };
  

  const getOtherValue = () => {
    if (!currentFieldMap[currentStep]) return '';
    const value = answers[currentFieldMap[currentStep]];
    if (Array.isArray(value)) {
      const other = value.find(v => v.startsWith('Andet: '));
      return other ? other.replace('Andet: ', '') : '';
    } else if (typeof value === 'string' && value.startsWith('Andet: ')) {
      return value.replace('Andet: ', '');
    }
    return '';
  };

  const renderOptions = () => {
    let options: string[] = [];
    let answerKey: keyof typeof answers;

    switch (currentStep) {
      case STEPS.RELATION:
        options = ['Ægtefælle/Partner', 'Barn', 'Søskende', 'Forælder', 'Andet'];
        answerKey = 'relation_to_person';
        break;
      case STEPS.DEMENTIA_TYPE:
        options = ['Alzheimers', 'Vaskulær demens', 'Lewy body demens', 'Frontotemporal demens', 'Andet'];
        answerKey = 'diagnosed_dementia_type';
        break;
      case STEPS.EXPERIENCE:
        options = ['Jeg er ny som pårørende', 'Jeg har erfaring som pårørende'];
        answerKey = 'experience_level';
        break;
      case STEPS.CHALLENGES:
        options = [
          'At skabe struktur i dagligdagen',
          'At kommunikere tydeligt',
          'At finde tid og balancere rollerne',
          'At håndtere uforudsete situationer',
          'Følelsesmæssig støtte og tilknytning'
        ];
        answerKey = 'main_challenges';
        break;
      case STEPS.HELP_NEEDS:
        options = [
          'At få praktisk vejledning og tips',
          'At dele minder og musik',
          'At finde tid og balancere rollerne',
          'At håndtere uforudsete situationer',
          'Følelsesmæssig støtte og tilknytning'
        ];
        answerKey = 'help_needs';
        break;
      default:
        return null;
    }

    return (
      <>
        {options.map((option, index) => {
          const isSelected = isOptionSelected(option, answerKey);
          const isOtherSelected = option === 'Andet' && getOtherInputState(currentStep) && getCurrentField(currentStep) === answerKey;
          const isOtherValue = option === 'Andet' && isSelected && !isOtherSelected;
          const otherTextValue = getOtherValue();

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={1}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? '#2D6B4F' : '#FFFFFF',
                  borderColor: isSelected ? '#2D6B4F' : '#FFFFFF',
                  borderWidth: 1,
                },
              ]}
              onPress={() => handleOptionSelect(option, answerKey)}
              disabled={isOtherSelected}
            >
              {/* Hvis man er i gang med at skrive i "Andet" */}
              {isOtherSelected ? (
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={{
                      color: '#FFFFFF',
                      fontSize: 18,
                      fontFamily: 'RedHatDisplay_500Medium',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      paddingVertical: 0,
                    }}
                    placeholder="Indtast dit svar"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={otherTextValue}
                    onChangeText={handleOtherTextChange}
                    autoFocus
                  />
                </View>
              ) : isOtherValue ? (
                // Hvis "Andet" er valgt og der allerede er skrevet noget
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: '#FFFFFF',
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  {otherTextValue}
                </Text>
              ) : (
                // Normale valgmuligheder (inkl. "Andet" før man har valgt det)
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: isSelected ? '#FFFFFF' : '#2D6B4F',
                      fontWeight: isSelected ? 'bold' : 'normal',
                    },
                    ]}
                >
                  {option}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </>
    );
  };

  const isOptionSelected = (option: string, key: keyof typeof answers) => {
    const value = answers[key];
  
    if (Array.isArray(value)) {
      // Gælder for multi-select
      if (option === 'Andet') {
        return value.some(v => v.startsWith('Andet'));
      }
      return value.includes(option);
    }
  
    // Gælder for single-select
    if (option === 'Andet') {
      return typeof value === 'string' && value.startsWith('Andet');
    }
  
    return value === option;
  };
  

  const getStepTitle = () => {
    switch (currentStep) {
      case STEPS.RELATION:
        return 'Hvad er din relation til personen med demens?';
      case STEPS.DEMENTIA_TYPE:
        return 'Hvilken type demens er diagnosticeret?';
      case STEPS.EXPERIENCE:
        return 'Hvor erfaren er du som pårørende?';
      case STEPS.CHALLENGES:
        return 'Hvad oplever du som din største udfordring?';
      case STEPS.HELP_NEEDS:
        return 'Hvad ønsker du mest hjælp til i Aldra?';
      default:
        return '';
    }
  };

  if (currentStep === STEPS.WELCOME) {
    return renderWelcomeScreen();
  }
    

  const marginBottomForTitle = currentStep === STEPS.CHALLENGES || currentStep === STEPS.HELP_NEEDS ? 10 : 30;
  const marginBottomForSubtext = currentStep === STEPS.CHALLENGES || currentStep === STEPS.HELP_NEEDS ? 20 : 10;
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/aldra_logo.png')}
              style={styles.headerLogo}
            />
            <ProgressIndicator totalSteps={5} currentStep={currentStep} />
          </View>
          
          <View style={styles.mainContent}>
            <Text style={[styles.questionTitle, { marginBottom: marginBottomForTitle }]}>{getStepTitle()}</Text>
            {(currentStep === STEPS.CHALLENGES || currentStep === STEPS.HELP_NEEDS) && (
              <Text style={[styles.optionSubtext, { marginBottom: marginBottomForSubtext }]}>
                Vælg én eller flere muligheder.
              </Text>
            )}
            <ScrollView 
              style={styles.optionsScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"  
            >
              <View style={styles.optionsContainer}>
                {renderOptions()}
              </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.navigationButton, styles.backButton]}
                onPress={handleBack}
              >
                <View style={styles.backButtonContent}>
                  <Ionicons name="chevron-back-outline" size={20} color="#FFFFFF" />
                  <Text style={[styles.navigationButtonText, { color: '#FFFFFF' }]}>Forrige</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navigationButton, styles.nextButton]}
                onPress={handleNext}
              >
                <View style={styles.nextButtonContent}>
                  <Text style={[styles.navigationButtonText, styles.nextButtonText]}>
                    {currentStep === 5 ? 'Afslut' : 'Næste'}
                  </Text>
                  <Ionicons name="chevron-forward-outline" size={20} color="#42865F" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // Base container styles
  container: {
    flex: 1,
    backgroundColor: '#42865F',
  },
  
  // Header styles
  header: {
    paddingTop: 90,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerLogo: {
    width: 150,
    height: 40,
    marginBottom: 10,
  },
  
  // Main content styles
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 90,
  },
  questionTitle: {
    fontSize: 30,
    fontFamily: 'RedHatDisplay_700Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
  },
  
  optionSubtext: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_400Regular',
    color: '#FFFFFF', // En blød gråfarve for underteksten
    marginBottom: 20, // Lidt afstand fra spørgsmålstitlen
    textAlign: 'center',
  },
  
  // Options styles
  optionsScroll: {
    flex: 1,
  },
  optionsContainer: {
    gap: 12,
    paddingBottom: 24,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    minHeight: 54,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#42865F',
  },
  optionText: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#42865F',
    textAlign: 'center',
  },
  
  // Navigation button styles
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 24,
    gap: 78,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navigationButton: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginRight: 8,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
    marginLeft: 8,
  },
  navigationButtonText: {
    fontSize: 18,
    fontFamily: 'RedHatDisplay_700Bold',
  },
  nextButtonText: {
    color: '#42865F',
  },
  
  // Welcome screen styles
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#42865F',
    padding: 24,
    justifyContent: 'space-between',
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: 'RedHatDisplay_700Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RedHatDisplay_400Regular',
    textAlign: 'center',
    lineHeight: 28,
  },
  introWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  getStartedButtonText: {
    color: '#42865F',
    fontSize: 18,
    fontFamily: 'RedHatDisplay_700Bold',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#42865F',
    borderWidth: 2,
    borderRadius: 14,
    padding: 16,
    fontSize: 18,
    fontFamily: 'RedHatDisplay_500Medium',
    color: '#42865F',
    textAlign: 'left',
    minHeight: 54,
    marginTop: 8,
  },
});
