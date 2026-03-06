import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import {
    DMSerifDisplay_400Regular,
} from '@expo-google-fonts/dm-serif-display';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '../src/lib/ThemeContext';
import { MapProvider } from '../src/lib/MapContext';

SplashScreen.preventAutoHideAsync();

function AppNavigator() {
    const { theme } = useTheme();
    return (
        <>
            <StatusBar style={theme.statusBar} />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="restaurant/[id]" options={{ animation: 'slide_from_bottom' }} />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        'Outfit': Outfit_400Regular,
        'Outfit-SemiBold': Outfit_600SemiBold,
        'Outfit-Bold': Outfit_700Bold,
        'DMSerifDisplay': DMSerifDisplay_400Regular,
    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <MapProvider>
                    <AppNavigator />
                </MapProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
