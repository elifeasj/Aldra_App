import React from 'react';
import { PersonalizationFlow } from '../components/personalization/PersonalizationFlow';
import { PersonalizationProvider } from '../context/PersonalizationContext';

export default function PersonalizationScreen() {
  return (
    <PersonalizationProvider>
      <PersonalizationFlow />
    </PersonalizationProvider>
  );
}
