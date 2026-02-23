import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../src/lib/AuthContext';

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const { signInWithGoogle, continueAsGuest } = useAuth();

    const brandOpacity = useRef(new Animated.Value(0)).current;
    const brandTranslateY = useRef(new Animated.Value(-20)).current;
    const buttonsOpacity = useRef(new Animated.Value(0)).current;
    const buttonsTranslateY = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        // Brand section fades in from top
        Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
                Animated.timing(brandOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(brandTranslateY, {
                    toValue: 0,
                    duration: 600,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // Buttons section fades in from bottom
        Animated.sequence([
            Animated.delay(500),
            Animated.parallel([
                Animated.timing(buttonsOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonsTranslateY, {
                    toValue: 0,
                    duration: 600,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#041A0E', '#0A2F1A', '#062113', '#041A0E']}
                locations={[0, 0.35, 0.7, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative elements */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            {/* Top branding */}
            <Animated.View
                style={[styles.brandSection, {
                    paddingTop: insets.top + 80,
                    opacity: brandOpacity,
                    transform: [{ translateY: brandTranslateY }],
                }]}
            >
                <Text style={styles.logoIcon}>☪</Text>
                <Text style={styles.logoText}>HalalSpot</Text>
                <Text style={styles.tagline}>Discover the finest halal{'\n'}dining near you</Text>
            </Animated.View>

            {/* Auth buttons */}
            <Animated.View
                style={[styles.buttonSection, {
                    paddingBottom: insets.bottom + 20,
                    opacity: buttonsOpacity,
                    transform: [{ translateY: buttonsTranslateY }],
                }]}
            >
                {/* Google */}
                <TouchableOpacity
                    style={styles.googleBtn}
                    activeOpacity={0.85}
                    onPress={signInWithGoogle}
                >
                    <View style={styles.googleIconWrap}>
                        <Text style={styles.googleIcon}>G</Text>
                    </View>
                    <Text style={styles.googleText}>Continue with Google</Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Guest */}
                <TouchableOpacity
                    style={styles.guestBtn}
                    activeOpacity={0.75}
                    onPress={continueAsGuest}
                >
                    <Ionicons name="arrow-forward-outline" size={18} color="#00C96B" />
                    <Text style={styles.guestText}>Continue as Guest</Text>
                </TouchableOpacity>

                {/* Legal footer */}
                <Text style={styles.legalText}>
                    By continuing, you agree to our{' '}
                    <Text style={styles.legalLink}>Terms of Service</Text>
                    {' & '}
                    <Text style={styles.legalLink}>Privacy Policy</Text>
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    decorCircle1: {
        position: 'absolute',
        top: -60,
        right: -60,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(0, 201, 107, 0.06)',
    },
    decorCircle2: {
        position: 'absolute',
        bottom: 120,
        left: -80,
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: 'rgba(0, 201, 107, 0.04)',
    },
    brandSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    logoIcon: {
        fontSize: 52,
        color: '#00C96B',
        marginBottom: 8,
    },
    logoText: {
        fontSize: 46,
        color: '#FFFFFF',
        fontFamily: 'DMSerifDisplay',
        letterSpacing: -1.5,
        marginBottom: 12,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        fontFamily: 'Outfit',
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonSection: {
        paddingHorizontal: 24,
        gap: 12,
    },
    googleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 12,
    },
    googleIconWrap: {
        width: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleIcon: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4285F4',
    },
    googleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        fontFamily: 'Outfit-SemiBold',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginVertical: 4,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    dividerText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.35)',
        fontFamily: 'Outfit',
    },
    guestBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 201, 107, 0.35)',
        backgroundColor: 'rgba(0, 201, 107, 0.08)',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    guestText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#00C96B',
        fontFamily: 'Outfit-SemiBold',
    },
    legalText: {
        textAlign: 'center',
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'Outfit',
        marginTop: 8,
        lineHeight: 18,
    },
    legalLink: {
        color: 'rgba(0, 201, 107, 0.5)',
    },
});
