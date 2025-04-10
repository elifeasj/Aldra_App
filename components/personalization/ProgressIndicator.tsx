import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

type ProgressIndicatorProps = {
  totalSteps: number;
  currentStep: number;
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  totalSteps,
  currentStep,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <View
              style={[
                styles.line,
                {
                  backgroundColor: index < currentStep ? colors.primary : colors.border,
                },
              ]}
            />
          )}
          <View
            style={[
              styles.dot,
              {
                backgroundColor: index < currentStep ? colors.primary : colors.border,
              },
            ]}
          />
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
    paddingVertical: 20,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
});
