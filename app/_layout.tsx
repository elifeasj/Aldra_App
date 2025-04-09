import { AuthProvider } from '../context/auth';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, TextInput, View, StatusBar, Appearance } from 'react-native';
import { 
    useFonts,
    RedHatDisplay_400Regular,
    RedHatDisplay_500Medium,
    RedHatDisplay_700Bold,
} from '@expo-google-fonts/red-hat-display';

// Hold splash screen synlig mens vi loader resourcer
SplashScreen.preventAutoHideAsync();

export default function Layout() {
    const [fontsLoaded] = useFonts({
        RedHatDisplay_400Regular,
        RedHatDisplay_500Medium,
        RedHatDisplay_700Bold,
    });

    const colorScheme = Appearance.getColorScheme();
    const isDarkMode = colorScheme === 'dark';

    useEffect(() => {
        if (fontsLoaded) {
            // Skjul splash screen når fonts er loaded
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

        return (
            <AuthProvider>
              <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={isDarkMode ? '#000000' : '#FFFFFF'}
              />
              <Stack screenOptions={{ headerShown: false }}>
        
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/onboarding_1" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/onboarding_2" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/onboarding_3" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/onboarding_4" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/onboarding_5" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/register" options={{ headerShown: false }} />
        </Stack>
        </AuthProvider>
    );
}

