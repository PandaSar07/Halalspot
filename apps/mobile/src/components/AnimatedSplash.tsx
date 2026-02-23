import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashProps {
    onFinish: () => void;
}

export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.7)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const taglineTranslateY = useRef(new Animated.Value(10)).current;
    const ringScale = useRef(new Animated.Value(0.6)).current;
    const ringOpacity = useRef(new Animated.Value(0)).current;
    const fadeOut = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Phase 1: Logo fade-in + scale (0-600ms)
        Animated.parallel([
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(logoScale, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            // Tagline fades in slightly after
            Animated.sequence([
                Animated.delay(300),
                Animated.parallel([
                    Animated.timing(taglineOpacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(taglineTranslateY, {
                        toValue: 0,
                        duration: 400,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ]).start();

        // Phase 2: Ring pulse (500-1200ms)
        Animated.sequence([
            Animated.delay(500),
            Animated.parallel([
                Animated.timing(ringOpacity, {
                    toValue: 0.4,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.timing(ringScale, {
                        toValue: 1.2,
                        duration: 400,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(ringScale, {
                        toValue: 1.0,
                        duration: 300,
                        easing: Easing.inOut(Easing.cubic),
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ]).start();

        // Phase 3: Fade out (1600-2100ms)
        Animated.sequence([
            Animated.delay(1600),
            Animated.timing(fadeOut, {
                toValue: 0,
                duration: 500,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start(() => {
            onFinish();
        });
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: fadeOut }]}>
            <LinearGradient
                colors={['#041A0E', '#0A2F1A', '#041A0E']}
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative ring */}
            <Animated.View style={[styles.ring, {
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
            }]} />

            {/* Glow effect behind logo */}
            <Animated.View style={[styles.glow, {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
            }]} />

            {/* Logo */}
            <Animated.View style={[styles.logoWrap, {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
            }]}>
                <Text style={styles.logoIcon}>☪</Text>
                <Text style={styles.logoText}>HalalSpot</Text>
            </Animated.View>

            {/* Tagline */}
            <Animated.View style={{
                opacity: taglineOpacity,
                transform: [{ translateY: taglineTranslateY }],
            }}>
                <Text style={styles.tagline}>Discover halal dining near you</Text>
            </Animated.View>

            {/* Bottom dots */}
            <Animated.View style={[styles.dotsRow, { opacity: taglineOpacity }]}>
                <View style={[styles.dot, { backgroundColor: '#00C96B' }]} />
                <View style={[styles.dot, { backgroundColor: '#00C96B', opacity: 0.5 }]} />
                <View style={[styles.dot, { backgroundColor: '#00C96B', opacity: 0.25 }]} />
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    ring: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        borderWidth: 2,
        borderColor: '#00C96B',
    },
    glow: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#00C96B',
        opacity: 0.08,
    },
    logoWrap: {
        alignItems: 'center',
        gap: 8,
    },
    logoIcon: {
        fontSize: 48,
        color: '#00C96B',
        marginBottom: 4,
    },
    logoText: {
        fontSize: 42,
        color: '#FFFFFF',
        fontFamily: 'DMSerifDisplay',
        letterSpacing: -1.5,
    },
    tagline: {
        marginTop: 12,
        fontSize: 15,
        color: 'rgba(255,255,255,0.65)',
        fontFamily: 'Outfit',
        letterSpacing: 0.3,
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 32,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});
