import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
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
import { AuthProvider, useAuth } from '../src/lib/AuthContext';

SplashScreen.preventAutoHideAsync();

/** Redirects between (tabs) and landing based on session state */
function SessionGate() {
    const { session, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const onLanding = segments[0] === 'landing';

        if (session && (onLanding || inAuthGroup)) {
            // Signed in → go to app
            router.replace('/(tabs)');
        } else if (!session && !onLanding && !inAuthGroup) {
            // Not signed in → go to landing
            router.replace('/landing');
        }
    }, [session, loading, segments]);

    return null;
}

function AppNavigator() {
    const { theme } = useTheme();
    const { loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#071A10', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#00C96B" />
            </View>
        );
    }

    return (
        <>
            <StatusBar style={theme.statusBar} />
            <SessionGate />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="landing" />
                <Stack.Screen name="(auth)/email" />
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
                    <AuthProvider>
                        <AppNavigator />
                    </AuthProvider>
                </MapProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
