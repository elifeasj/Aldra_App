import React, { useState } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,TextInput,ScrollView,Alert} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { ProgressIndicator } from './ProgressIndicator';
import { usePersonalization } from '../../context/PersonalizationContext';

const STEPS = {
  RELATION: 1,
  DEMENTIA_TYPE: 2,
  EXPERIENCE: 3,
  CHALLENGES: 4,
  HELP_NEEDS: 5,
};

export const PersonalizationFlow: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const {
    currentStep,
    setCurrentStep,
    answers,
    updateAnswer,
    saveAnswers,
  } = usePersonalization();

  const [otherText, setOtherText] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  const handleNext = async () => {
    if (!isStepValid()) {
      Alert.alert('Vælg venligst et svar', 'Du skal vælge mindst én mulighed for at fortsætte.');
      return;
    }

    if (currentStep === 5) {
      try {
        await saveAnswers();
        navigation.navigate('oversigt' as never);
      } catch (error) {
        Alert.alert('Fejl', 'Der opstod en fejl ved gem af dine svar. Prøv igen.');
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
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
    if (currentStep === STEPS.CHALLENGES || currentStep === STEPS.HELP_NEEDS) {
      const currentArray = answers[key] as string[];
      const newArray = currentArray.includes(option)
        ? currentArray.filter(item => item !== option)
        : [...currentArray, option];
      updateAnswer(key, newArray);
    } else {
      if (option === 'Andet' || option === 'Andet/Uvist') {
        setShowOtherInput(true);
      } else {
        setShowOtherInput(false);
        updateAnswer(key, option);
      }
    }
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
        options = ['Alzheimers', 'Vaskulær demens', 'Lewy body demens', 'Frontotemporal demens', 'Andet/Uvist'];
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
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              {
                backgroundColor: isOptionSelected(option, answerKey)
                  ? colors.primary
                  : colors.card,
              },
            ]}
            onPress={() => handleOptionSelect(option, answerKey)}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color: isOptionSelected(option, answerKey)
                    ? colors.background
                    : colors.text,
                },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
        {showOtherInput && (
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Skriv dit svar her..."
            placeholderTextColor={colors.text}
            value={otherText}
            onChangeText={(text) => {
              setOtherText(text);
              updateAnswer(answerKey, text);
            }}
          />
        )}
      </>
    );
  };

  const isOptionSelected = (option: string, key: keyof typeof answers) => {
    const value = answers[key];
    if (Array.isArray(value)) {
      return value.includes(option);
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

  if (currentStep > 5) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          Tak for dine svar!
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Vi tilpasser dit dashboard og vejledning, så det passer til dine behov.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('oversigt' as never)}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            Til din oversigt
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProgressIndicator totalSteps={5} currentStep={currentStep} />
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {getStepTitle()}
        </Text>
        <View style={styles.optionsContainer}>
          {renderOptions()}
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={handleBack}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Forrige
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleNext}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            {currentStep === 5 ? 'Afslut' : 'Næste'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  backButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
