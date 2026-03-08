import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
    Platform,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withDelay,
    withSequence,
    runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/lib/ThemeContext';
import { useAuth } from '../src/lib/AuthContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LandingScreen() {
    const { theme } = useTheme();
    const { signInWithGoogle, signInWithApple } = useAuth();
    const router = useRouter();

    const [oauthLoading, setOauthLoading] = React.useState<'google' | 'apple' | null>(null);
    const [oauthError, setOauthError] = React.useState<string | null>(null);

    // Animation values
    const pinY = useSharedValue(-200);
    const pinScale = useSharedValue(1);
    const pinOpacity = useSharedValue(0);
    const shadowScale = useSharedValue(0);
    const contentOpacity = useSharedValue(0);
    const contentY = useSharedValue(30);

    useEffect(() => {
        // Step 1: Pin drops in
        pinOpacity.value = withTiming(1, { duration: 100 });
        pinY.value = withSpring(0, {
            damping: 12,
            stiffness: 180,
            mass: 0.8,
        });

        // Step 2: Shadow appears as pin lands
        shadowScale.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 200 }));

        // Step 3: Subtle bounce squish on the pin
        pinScale.value = withDelay(
            500,
            withSequence(
                withSpring(0.88, { damping: 8, stiffness: 400 }),
                withSpring(1, { damping: 10, stiffness: 300 }),
            )
        );

        // Step 4: Content fades + slides in
        contentOpacity.value = withDelay(650, withTiming(1, { duration: 450 }));
        contentY.value = withDelay(650, withSpring(0, { damping: 20, stiffness: 200 }));
    }, []);

    const pinAnimStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: pinY.value },
            { scale: pinScale.value },
        ],
        opacity: pinOpacity.value,
    }));

    const shadowAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scaleX: shadowScale.value }],
        opacity: shadowScale.value * 0.4,
    }));

    const contentAnimStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: contentY.value }],
    }));

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
        <LinearGradient
            colors={['#071A10', '#0D2B1A', '#0F0F0F']}
            style={styles.container}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.7, y: 1 }}
        >
            {/* Subtle radial glow behind pin */}
            <View style={styles.glowContainer} pointerEvents="none">
                <View style={[styles.glow, { backgroundColor: 'rgba(0,201,107,0.12)' }]} />
            </View>

            {/* Pin drop zone */}
            <View style={styles.pinContainer}>
                <Animated.View style={[styles.pinWrapper, pinAnimStyle]}>
                    {/* Custom pin shape using the logo */}
                    <View style={styles.pinBody}>
                        <View style={[styles.pinBg, { backgroundColor: '#00C96B' }]}>
                            <Image
                                source={require('../assets/logo.png')}
                                style={styles.pinLogo}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={[styles.pinTip, { borderTopColor: '#00C96B' }]} />
                    </View>
                </Animated.View>

                {/* Drop shadow ellipse */}
                <Animated.View style={[styles.pinShadow, shadowAnimStyle]} />
            </View>

            {/* Wordmark + tagline + buttons */}
            <Animated.View style={[styles.content, contentAnimStyle]}>
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
                                <Ionicons name="logo-apple" size={20} color="#fff" style={styles.btnIcon} />
                                <Text style={[styles.btnText, { color: '#fff' }]}>Continue with Apple</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Email */}
                    <TouchableOpacity
                        style={[styles.btn, styles.btnEmail, { borderColor: 'rgba(0,201,107,0.5)' }]}
                        onPress={() => handleEmail('signin')}
                        activeOpacity={0.85}
                        disabled={oauthLoading !== null}
                    >
                        <Ionicons name="mail-outline" size={20} color="#00C96B" style={styles.btnIcon} />
                        <Text style={[styles.btnText, { color: '#00C96B' }]}>Continue with Email</Text>
                    </TouchableOpacity>

                    {oauthError ? (
                        <Text style={styles.errorText}>{oauthError}</Text>
                    ) : null}
                </View>

                {/* Sign-up footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account?{' '}</Text>
                    <TouchableOpacity onPress={() => handleEmail('signup')} activeOpacity={0.7}>
                        <Text style={[styles.footerLink, { color: '#00C96B' }]}>Sign up</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        width: 300,
        height: 300,
        borderRadius: 150,
        top: SCREEN_HEIGHT * 0.15,
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
    pinBody: {
        alignItems: 'center',
    },
    pinBg: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#00C96B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 12,
    },
    pinLogo: {
        width: 52,
        height: 52,
    },
    pinTip: {
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 18,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginTop: -2,
    },
    pinShadow: {
        width: 48,
        height: 10,
        borderRadius: 24,
        backgroundColor: '#000',
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
    },
    btnText: {
        fontSize: 15,
        fontFamily: 'Outfit-SemiBold',
        fontWeight: '600',
    },
    btnIcon: {
        // icon spacing handled by gap
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
    },
});
