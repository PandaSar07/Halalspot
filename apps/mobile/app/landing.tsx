import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
    Animated,
    Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/lib/ThemeContext';
import { useAuth } from '../src/lib/AuthContext';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LandingScreen() {
    const { theme } = useTheme();
    const { signInWithGoogle, signInWithApple } = useAuth();
    const router = useRouter();

    const [oauthLoading, setOauthLoading] = React.useState<'google' | 'apple' | null>(null);
    const [oauthError, setOauthError] = React.useState<string | null>(null);

    // ── Animation values (all plain RN Animated) ─────────────────────────────
    const pinY = useRef(new Animated.Value(-220)).current;
    const pinScale = useRef(new Animated.Value(1)).current;
    const shadowScale = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentY = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        // Step 1: pin drops with spring (overshoot = bounce)
        Animated.spring(pinY, {
            toValue: 0,
            tension: 60,
            friction: 7,
            useNativeDriver: true,
        }).start();

        // Step 2: shadow appears as pin lands
        Animated.sequence([
            Animated.delay(380),
            Animated.spring(shadowScale, {
                toValue: 1,
                tension: 80,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Step 3: pin squish on land
        Animated.sequence([
            Animated.delay(480),
            Animated.spring(pinScale, {
                toValue: 0.88,
                tension: 300,
                friction: 5,
                useNativeDriver: true,
            }),
            Animated.spring(pinScale, {
                toValue: 1,
                tension: 200,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Step 4: content fades + slides up
        Animated.sequence([
            Animated.delay(640),
            Animated.parallel([
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 420,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.spring(contentY, {
                    toValue: 0,
                    tension: 80,
                    friction: 12,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    const handleGoogle = async () => {
        setOauthError(null);
        setOauthLoading('google');
        const { error } = await signInWithGoogle();
        setOauthLoading(null);
        if (error && error.message !== 'Sign in was cancelled') {
            setOauthError('Google sign-in failed. Please try again.');
        }
    };

    const handleApple = async () => {
        setOauthError(null);
        setOauthLoading('apple');
        const { error } = await signInWithApple();
        setOauthLoading(null);
        if (error && error.message !== 'Sign in was cancelled') {
            setOauthError('Apple sign-in failed. Please try again.');
        }
    };

    const handleEmail = (mode: 'signin' | 'signup') => {
        router.push({ pathname: '/(auth)/email', params: { mode } });
    };

    return (
        <View style={styles.container}>
            {/* Islamic pattern background */}
            <Image
                source={require('../assets/islamic_hero_bg.png')}
                style={styles.bgPattern}
                resizeMode="cover"
            />
            {/* Dark gradient overlay */}
            <LinearGradient
                colors={['rgba(7,26,16,0.82)', 'rgba(13,43,26,0.90)', 'rgba(15,15,15,0.97)']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0.3, y: 0 }}
                end={{ x: 0.7, y: 1 }}
            />

            {/* Pin drop zone */}
            <View style={styles.pinContainer}>
                <Animated.View
                    style={[
                        styles.pinWrapper,
                        {
                            transform: [
                                { translateY: pinY },
                                { scale: pinScale },
                            ],
                        },
                    ]}
                >
                    <Image
                            source={require('../assets/logo.png')}
                            style={styles.pinLogo}
                            resizeMode="contain"
                        />
                </Animated.View>

                {/* Drop shadow */}
                <Animated.View
                    style={[
                        styles.pinShadow,
                        {
                            transform: [{ scaleX: shadowScale }],
                            opacity: shadowScale,
                        },
                    ]}
                />
            </View>

            {/* Wordmark + tagline + buttons */}
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: contentOpacity,
                        transform: [{ translateY: contentY }],
                    },
                ]}
            >
                <Text style={styles.wordmark}>Halal Spot</Text>
                <Text style={styles.tagline}>Find halal food near you</Text>

                <View style={styles.buttonGroup}>
                    {/* Google */}
                    <TouchableOpacity
                        style={[styles.btn, styles.btnGoogle]}
                        onPress={handleGoogle}
                        activeOpacity={0.85}
                        disabled={oauthLoading !== null}
                    >
                        {oauthLoading === 'google' ? (
                            <ActivityIndicator size="small" color="#111" />
                        ) : (
                            <>
                                <Text style={styles.googleG}>G</Text>
                                <Text style={[styles.btnText, { color: '#111' }]}>Continue with Google</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Apple */}
                    <TouchableOpacity
                        style={[styles.btn, styles.btnApple]}
                        onPress={handleApple}
                        activeOpacity={0.85}
                        disabled={oauthLoading !== null}
                    >
                        {oauthLoading === 'apple' ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="logo-apple" size={20} color="#fff" />
                                <Text style={[styles.btnText, { color: '#fff' }]}>Continue with Apple</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Email */}
                    <TouchableOpacity
                        style={[styles.btn, styles.btnEmail]}
                        onPress={() => handleEmail('signin')}
                        activeOpacity={0.85}
                        disabled={oauthLoading !== null}
                    >
                        <Ionicons name="mail-outline" size={20} color="#00C96B" />
                        <Text style={[styles.btnText, { color: '#00C96B' }]}>Continue with Email</Text>
                    </TouchableOpacity>

                    {oauthError ? (
                        <Text style={styles.errorText}>{oauthError}</Text>
                    ) : null}
                </View>

                {/* Sign-up footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => handleEmail('signup')} activeOpacity={0.7}>
                        <Text style={styles.footerLink}>Sign up</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bgPattern: {
        position: 'absolute',
        width: SCREEN_WIDTH * 1.5,
        height: SCREEN_WIDTH * 1.5,
        top: -SCREEN_WIDTH * 0.1,
        left: -SCREEN_WIDTH * 0.25,
        opacity: 0.25,
    },
    pinContainer: {
        alignItems: 'center',
        marginBottom: 32,
        height: 130,
        justifyContent: 'flex-end',
    },
    pinWrapper: {
        alignItems: 'center',
    },
    pinLogo: {
        width: 90,
        height: 90,
    },

    pinShadow: {
        width: 48,
        height: 10,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.5)',
        marginTop: 4,
    },
    content: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 28,
    },
    wordmark: {
        fontSize: 40,
        color: '#FFFFFF',
        fontFamily: 'DMSerifDisplay',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.60)',
        fontFamily: 'Outfit',
        marginBottom: 44,
        letterSpacing: 0.2,
    },
    buttonGroup: {
        width: '100%',
        gap: 12,
    },
    btn: {
        height: 54,
        borderRadius: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    btnGoogle: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    btnApple: {
        backgroundColor: '#000000',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    btnEmail: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: 'rgba(0,201,107,0.5)',
    },
    btnText: {
        fontSize: 15,
        fontFamily: 'Outfit-SemiBold',
        fontWeight: '600',
    },
    googleG: {
        fontSize: 17,
        fontFamily: 'Outfit-Bold',
        color: '#4285F4',
        fontWeight: '700',
    },
    errorText: {
        color: '#FF6B6B',
        fontFamily: 'Outfit',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 4,
    },
    footer: {
        flexDirection: 'row',
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Outfit',
        fontSize: 14,
    },
    footerLink: {
        fontFamily: 'Outfit-SemiBold',
        fontSize: 14,
        color: '#00C96B',
    },
});
