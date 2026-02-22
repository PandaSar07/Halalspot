import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        async function loadFonts() {
            try {
                await Font.loadAsync({
                    'DMSerifDisplay': require('../assets/fonts/DMSerifDisplay-Regular.ttf'),
                    'Outfit': require('../assets/fonts/Outfit-Regular.ttf'),
                    'Outfit-SemiBold': require('../assets/fonts/Outfit-SemiBold.ttf'),
                    'Outfit-Bold': require('../assets/fonts/Outfit-Bold.ttf'),
                });
            } catch (e) {
                console.warn('Error loading custom fonts, using system fonts:', e);
            } finally {
                setFontsLoaded(true);
                await SplashScreen.hideAsync();
            }
        }
        loadFonts();
    }, []);

    if (!fontsLoaded) return null;

    return (
        <>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
            </Stack>
        </>
    );
}
