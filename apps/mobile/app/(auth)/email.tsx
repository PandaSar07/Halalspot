import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/lib/ThemeContext';
import { supabase } from '../../src/lib/supabase';

type Mode = 'signin' | 'signup';

export default function EmailAuthScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { mode: initialMode } = useLocalSearchParams<{ mode: Mode }>();

    const [mode, setMode] = useState<Mode>(initialMode ?? 'signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const validate = () => {
        if (!email.trim()) return 'Please enter your email.';
        if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email.';
        if (password.length < 6) return 'Password must be at least 6 characters.';
        if (mode === 'signup' && password !== confirmPassword) return 'Passwords do not match.';
        return null;
    };

    const handleSubmit = async () => {
        setError(null);
        setSuccessMsg(null);
        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        setLoading(true);
        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({ email: email.trim(), password });
                if (error) throw error;
                setSuccessMsg('Check your email for a confirmation link, then come back and sign in!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
                if (error) throw error;
                // AuthContext will detect the session change and _layout.tsx will redirect automatically
            }
        } catch (e: any) {
            const msg: string = e?.message ?? 'Something went wrong.';
            if (msg.toLowerCase().includes('invalid login')) {
                setError('Incorrect email or password.');
            } else if (msg.toLowerCase().includes('already registered')) {
                setError('An account with this email already exists. Try signing in.');
            } else if (msg.toLowerCase().includes('email not confirmed')) {
                setError('Please confirm your email before signing in.');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const isSignUp = mode === 'signup';

    return (
        <LinearGradient colors={['#071A10', '#0D2B1A', '#0F0F0F']} style={styles.gradient}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Back */}
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>

                    {/* Header */}
                    <Text style={styles.title}>{isSignUp ? 'Create account' : 'Welcome back'}</Text>
                    <Text style={styles.subtitle}>
                        {isSignUp
                            ? 'Sign up with your email to get started'
                            : 'Sign in to your Halal Spot account'}
                    </Text>

                    {/* Mode toggle tabs */}
                    <View style={styles.tabRow}>
                        <TouchableOpacity
                            style={[styles.tab, !isSignUp && styles.tabActive]}
                            onPress={() => { setMode('signin'); setError(null); setSuccessMsg(null); }}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>Sign In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, isSignUp && styles.tabActive]}
                            onPress={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Fields */}
                    <View style={styles.form}>
                        <View style={styles.field}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputWrap}>
                                <Ionicons name="mail-outline" size={18} color="rgba(255,255,255,0.35)" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoComplete="email"
                                    returnKeyType="next"
                                />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrap}>
                                <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.35)" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, styles.inputFlex]}
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    placeholder="Min. 6 characters"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPass}
                                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                    returnKeyType={isSignUp ? 'next' : 'done'}
                                    onSubmitEditing={isSignUp ? undefined : handleSubmit}
                                />
                                <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn} activeOpacity={0.7}>
                                    <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,255,255,0.4)" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {isSignUp && (
                            <View style={styles.field}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <View style={styles.inputWrap}>
                                    <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.35)" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, styles.inputFlex]}
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        placeholder="Repeat password"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirm}
                                        autoComplete="new-password"
                                        returnKeyType="done"
                                        onSubmitEditing={handleSubmit}
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirm(p => !p)} style={styles.eyeBtn} activeOpacity={0.7}>
                                        <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,255,255,0.4)" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                        {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

                        <TouchableOpacity
                            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                            onPress={handleSubmit}
                            activeOpacity={0.85}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator size="small" color="#000" />
                                : <Text style={styles.submitBtnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    flex: { flex: 1 },
    scroll: { paddingHorizontal: 28, paddingTop: 64, paddingBottom: 40 },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    title: {
        fontSize: 32,
        color: '#FFFFFF',
        fontFamily: 'DMSerifDisplay',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Outfit',
        marginBottom: 28,
        lineHeight: 20,
    },
    tabRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14,
        padding: 4,
        marginBottom: 28,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 11,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#00C96B',
    },
    tabText: {
        fontFamily: 'Outfit-SemiBold',
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
    },
    tabTextActive: {
        color: '#000',
    },
    form: { gap: 16 },
    field: { gap: 6 },
    label: {
        fontFamily: 'Outfit-SemiBold',
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 0.3,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.10)',
        paddingHorizontal: 14,
        height: 52,
    },
    inputIcon: { marginRight: 10 },
    input: {
        flex: 1,
        color: '#FFFFFF',
        fontFamily: 'Outfit',
        fontSize: 15,
    },
    inputFlex: { flex: 1 },
    eyeBtn: { padding: 4 },
    errorText: {
        color: '#FF6B6B',
        fontFamily: 'Outfit',
        fontSize: 13,
        textAlign: 'center',
    },
    successText: {
        color: '#00C96B',
        fontFamily: 'Outfit',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },
    submitBtn: {
        height: 54,
        backgroundColor: '#00C96B',
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#00C96B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    submitBtnText: {
        color: '#000',
        fontFamily: 'Outfit-SemiBold',
        fontSize: 16,
        fontWeight: '700',
    },
});
