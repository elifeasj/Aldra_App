import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';

type ProgressIndicatorProps = {
  totalSteps: number;
  currentStep: number;
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  totalSteps,
  currentStep,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <View
              style={[
                styles.line,
                {
                  backgroundColor: index < currentStep ? '#FFFFFF' : '#42865F',
                },
              ]}
            />
          )}
          <View
            style={[
              styles.stepCircle,
              index + 1 === currentStep && styles.currentStep,
              index + 1 < currentStep && styles.completedStep,
              index + 1 > currentStep && styles.futureStep,
            ]}
          >
            <Text style={[
              styles.stepNumber,
              index + 1 === currentStep && styles.currentStepNumber,
              index + 1 < currentStep && styles.completedStepNumber,
              index + 1 > currentStep && styles.futureStepNumber,
            ]}>{index + 1}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  stepCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  currentStep: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  completedStep: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  futureStep: {
    backgroundColor: 'rgba(255,255,255,0.50)',
    borderColor: 'rgba(255, 255, 255, 0.44)',
  },
  stepNumber: {
    fontSize: 24,
    fontFamily: 'RedHatDisplay_700Bold',
  },
  currentStepNumber: {
    color: '#42865F',
  },
  completedStepNumber: {
    color: '#42865F',
  },
  futureStepNumber: {
    color: '#42865F',
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 0,
  },
});
