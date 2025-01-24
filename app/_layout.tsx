import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = { fontFamily: 'RedHatDisplay_400Regular' };

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.style = { fontFamily: 'RedHatDisplay_400Regular' };
import { useFonts, RedHatDisplay_400Regular, RedHatDisplay_700Bold } from '@expo-google-fonts/red-hat-display';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        RedHatDisplay_400Regular,
        RedHatDisplay_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null; // Vent med at renderere indtil fontene er indlæst
    }
    

    return (
        <Stack initialRouteName="index">
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/onboarding_1" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/onboarding_2" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/onboarding_3" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/onboarding_4" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/onboarding_5" options={{ headerShown: false }} />
        </Stack>
    );
}
