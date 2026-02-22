import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    useEffect(() => {
        async function loadFonts() {
            try {
                await Font.loadAsync(Ionicons.font);
            } catch (e) {
                console.warn('Error loading fonts:', e);
            } finally {
                await SplashScreen.hideAsync();
            }
        }
        loadFonts();
    }, []);

    return (
        <>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
            </Stack>
        </>
    );
}
