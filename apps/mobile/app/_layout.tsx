import { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
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
import { AuthProvider, useAuth } from '../src/lib/AuthContext';
import AnimatedSplash from '../src/components/AnimatedSplash';

SplashScreen.preventAutoHideAsync();

function AuthGate() {
    const { theme } = useTheme();
    const { session, loading, isGuest } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const navigationState = useRootNavigationState();
    const [showSplash, setShowSplash] = useState(true);

    const onSplashFinish = useCallback(() => {
        setShowSplash(false);
    }, []);

    // Route protection: redirect based on auth state
    useEffect(() => {
        // Wait until splash is done, auth is loaded, and navigator is ready
        if (showSplash) return;
        if (loading) return;
        if (!navigationState?.key) return;

        const isAuthenticated = !!session || isGuest;
        const inLogin = segments[0] === 'login';

        console.log('[AuthGate]', {
            isAuthenticated,
            isGuest,
            hasSession: !!session,
            inLogin,
            segments: segments.join('/'),
        });

        if (!isAuthenticated && !inLogin) {
            console.log('[AuthGate] → Redirecting to /login');
            router.replace('/login');
        } else if (isAuthenticated && inLogin) {
            console.log('[AuthGate] → Redirecting to /(tabs)');
            router.replace('/(tabs)');
        }
    }, [session, isGuest, loading, showSplash, segments, navigationState?.key]);

    // While splash is running, show only splash
    if (showSplash) {
        return (
            <View style={{ flex: 1, backgroundColor: '#041A0E' }}>
                <StatusBar style="light" />
                <AnimatedSplash onFinish={onSplashFinish} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#041A0E' }}>
            <StatusBar style={theme.statusBar} />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="login" options={{ animation: 'fade' }} />
                <Stack.Screen name="restaurant/[id]" options={{ animation: 'slide_from_bottom' }} />
            </Stack>
        </View>
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
                <AuthProvider>
                    <AuthGate />
                </AuthProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
