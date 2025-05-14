import React, { createContext, useContext, useState } from 'react';
import supabase from '../config/supabase';

type PersonalizationAnswer = {
  relation_to_person: string;
  diagnosed_dementia_type: string;
  experience_level: string;
  main_challenges: string[];
  help_needs: string[];
};

type PersonalizationContextType = {
  currentStep: number;
  answers: PersonalizationAnswer;
  setCurrentStep: (step: number) => void;
  updateAnswer: (key: keyof PersonalizationAnswer, value: any) => void;
  saveAnswers: () => Promise<void>;
};

const defaultAnswers: PersonalizationAnswer = {
  relation_to_person: '',
  diagnosed_dementia_type: '',
  experience_level: '',
  main_challenges: [],
  help_needs: [],
};

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export const PersonalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<PersonalizationAnswer>(defaultAnswers);

  const updateAnswer = (key: keyof PersonalizationAnswer, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveAnswers = async () => {
    const user = supabase.auth.user();
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('user_profile_answers')
      .upsert({
        user_id: user.id,
        ...answers,
        completed_at: new Date().toISOString(),
      });

    if (error) throw error;
  };

  return (
    <PersonalizationContext.Provider
      value={{
        currentStep,
        answers,
        setCurrentStep,
        updateAnswer,
        saveAnswers,
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
};

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
};
