import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const GUEST_KEY = '@halalspot/guest_mode';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    loading: boolean;
    isGuest: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithApple: () => Promise<void>;
    continueAsGuest: () => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    isGuest: false,
    signInWithGoogle: async () => { },
    signInWithApple: async () => { },
    continueAsGuest: async () => { },
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'halalspot',
        path: 'auth/callback',
    });

    useEffect(() => {
        // Check for existing session or guest mode
        const init = async () => {
            try {
                const [{ data: { session: existingSession } }, guestFlag] = await Promise.all([
                    supabase.auth.getSession(),
                    AsyncStorage.getItem(GUEST_KEY),
                ]);

                if (existingSession) {
                    setSession(existingSession);
                } else if (guestFlag === 'true') {
                    setIsGuest(true);
                }
            } catch (e) {
                console.error('Auth init error:', e);
            } finally {
                setLoading(false);
            }
        };

        init();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
            if (newSession) {
                setIsGuest(false);
                AsyncStorage.removeItem(GUEST_KEY);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithOAuth = async (provider: 'google' | 'apple') => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectUri,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;
            if (!data.url) throw new Error('No auth URL returned');

            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

            if (result.type === 'success') {
                const url = result.url;
                // Extract tokens from the URL fragment
                const params = new URL(url);
                const fragment = params.hash?.substring(1);
                if (fragment) {
                    const urlParams = new URLSearchParams(fragment);
                    const accessToken = urlParams.get('access_token');
                    const refreshToken = urlParams.get('refresh_token');

                    if (accessToken && refreshToken) {
                        await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });
                    }
                }
            }
        } catch (error: any) {
            console.error(`${provider} sign-in error:`, error);
            Alert.alert('Sign-in Error', error.message || 'Something went wrong. Please try again.');
        }
    };

    const signInWithGoogle = () => signInWithOAuth('google');
    const signInWithApple = () => signInWithOAuth('apple');

    const continueAsGuest = async () => {
        await AsyncStorage.setItem(GUEST_KEY, 'true');
        setIsGuest(true);
    };

    const signOut = async () => {
        try {
            if (!isGuest) {
                await supabase.auth.signOut();
            }
            await AsyncStorage.removeItem(GUEST_KEY);
            setSession(null);
            setIsGuest(false);
        } catch (error: any) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{
            session,
            user: session?.user ?? null,
            loading,
            isGuest,
            signInWithGoogle,
            signInWithApple,
            continueAsGuest,
            signOut,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
