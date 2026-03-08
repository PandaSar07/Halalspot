import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<{ error: Error | null }>;
    signInWithApple: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => {},
    signInWithGoogle: async () => ({ error: null }),
    signInWithApple: async () => ({ error: null }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check existing session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for auth changes (sign in, sign out, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);

    const signInWithOAuth = useCallback(async (provider: 'google' | 'apple') => {
        try {
            const redirectUrl = 'halalspot://auth/callback';

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                },
            });

            if (error) return { error };
            if (!data.url) return { error: new Error('No auth URL returned') };

            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

            if (result.type === 'success') {
                // Extract the session from the callback URL
                const url = result.url;
                const params = new URL(url);
                const accessToken = params.hash
                    ? Object.fromEntries(new URLSearchParams(params.hash.slice(1)))['access_token']
                    : params.searchParams.get('access_token');
                const refreshToken = params.hash
                    ? Object.fromEntries(new URLSearchParams(params.hash.slice(1)))['refresh_token']
                    : params.searchParams.get('refresh_token');

                if (accessToken && refreshToken) {
                    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
                }
            } else if (result.type === 'cancel') {
                return { error: new Error('Sign in was cancelled') };
            }

            return { error: null };
        } catch (e: any) {
            return { error: e as Error };
        }
    }, []);

    const signInWithGoogle = useCallback(() => signInWithOAuth('google'), [signInWithOAuth]);
    const signInWithApple = useCallback(() => signInWithOAuth('apple'), [signInWithOAuth]);

    return (
        <AuthContext.Provider
            value={{
                session,
                user: session?.user ?? null,
                loading,
                signOut,
                signInWithGoogle,
                signInWithApple,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
