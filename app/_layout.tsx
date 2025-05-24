import { AuthProvider } from '../context/auth';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Text, TextInput, View, StatusBar, Appearance } from 'react-native';
import {
    useFonts,
    RedHatDisplay_400Regular,
    RedHatDisplay_500Medium,
    RedHatDisplay_700Bold,
} from '@expo-google-fonts/red-hat-display';
import { auth } from '../firebase';
import { User } from 'firebase/auth';

// Simple in-memory storage alternative
const memoryStorage = {
    user: null as User | null,
    setUser: (user: User | null) => {
        memoryStorage.user = user;
    },
    getUser: () => memoryStorage.user,
};

// Hold splash screen synlig mens vi loader resourcer
SplashScreen.preventAutoHideAsync();

export default function Layout() {
    const [fontsLoaded] = useFonts({
        RedHatDisplay_400Regular,
        RedHatDisplay_500Medium,
        RedHatDisplay_700Bold,
    });
    const [authLoaded, setAuthLoaded] = useState(false);
    
    const colorScheme = Appearance.getColorScheme();
    const isDarkMode = colorScheme === 'dark';

    useEffect(() => {
        const loadAuth = async () => {
            try {
                // Check memory storage first
                const savedUser = memoryStorage.getUser();
                if (savedUser) {
                    setAuthLoaded(true);
                    return;
                }

                // Wait for auth state change
                await new Promise<User | null>((resolve) => {
                    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
                        unsubscribe();
                        // Save to memory storage
                        memoryStorage.setUser(user);
                        setAuthLoaded(true);
                        resolve(user);
                    });
                });
            } catch (error) {
                console.error('Error loading auth:', error);
                setAuthLoaded(true);
            }
        };

        loadAuth();
    }, []);

    useEffect(() => {
        if (fontsLoaded && authLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, authLoaded]);

    if (!fontsLoaded || !authLoaded) {
        return null;
    }

    return (
        <AuthProvider>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={isDarkMode ? '#000000' : '#FFFFFF'}
            />
            <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
    );
}