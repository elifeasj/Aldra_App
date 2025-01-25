import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';


    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/onboarding_1" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/onboarding_2" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/onboarding_3" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/onboarding_4" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/onboarding_5" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/register" options={{ headerShown: false }} />
    </Stack>

