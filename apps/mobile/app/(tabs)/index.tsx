import { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    Image, Dimensions, ActivityIndicator, Animated, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from '../../src/lib/supabase';
import { getNearbyRestaurants } from '@halalspot/supabase';
import { Radius, Shadow } from '../../src/lib/theme';
import { useTheme } from '../../src/lib/ThemeContext';
import RestaurantBottomSheet from '../../src/components/RestaurantBottomSheet';
import type { RestaurantWithDistance } from '@halalspot/shared-types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.62;
const DEFAULT_COORDS = { latitude: 39.9526, longitude: -75.1652 };

const CERT_LABELS: Record<string, string> = {
    halal_certified: '☪ Halal Certified',
    muslim_owned: '✦ Muslim Owned',
    halal_options: '◉ Halal Options',
};

export default function HomeScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const [sections, setSections] = useState<{
        topRated: RestaurantWithDistance[];
        nearYou: RestaurantWithDistance[];
        openNow: RestaurantWithDistance[];
        fullyCertified: RestaurantWithDistance[];
        cuisines: Record<string, RestaurantWithDistance[]>;
    }>({ topRated: [], nearYou: [], openNow: [], fullyCertified: [], cuisines: {} });
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, certified: 0 });
    const scrollY = useRef(new Animated.Value(0)).current;
    const [searchActive, setSearchActive] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantWithDistance | null>(null);

    const STICK_AT = 320; // px scrolled before search bar appears
    const stickyOpacity = scrollY.interpolate({
        inputRange: [STICK_AT - 40, STICK_AT],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: true,
            listener: (e: any) => setSearchActive(e.nativeEvent.contentOffset.y > STICK_AT - 20),
        }
    );

    useEffect(() => {
        (async () => {
            let coords = DEFAULT_COORDS;
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
                }
            } catch {}
            fetchData(coords);
        })();
    }, []);

    const isOpenNow = (hours: any) => {
        if (!hours) return true;
        try {
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const now = new Date();
            const schedule = hours[days[now.getDay()]];
            if (!schedule) return true;
            const cur = now.getHours() * 100 + now.getMinutes();
            return cur >= parseInt(String(schedule.open).replace(':', '')) && cur <= parseInt(String(schedule.close).replace(':', ''));
        } catch { return true; }
    };

    const fetchData = async (coords: { latitude: number; longitude: number }) => {
        try {
            setLoading(true);
            const [{ count: total }, { count: certified }] = await Promise.all([
                supabase.from('restaurants').select('*', { count: 'exact', head: true }),
                supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('certification_type', 'halal_certified'),
            ]);
            setStats({ total: total || 0, certified: certified || 0 });
            let all: RestaurantWithDistance[] = [];
            try {
                all = await getNearbyRestaurants(supabase, coords, 15000);
            } catch {
                const { data } = await supabase.from('restaurants').select('*').eq('status', 'approved');
                all = (data || []) as RestaurantWithDistance[];
            }
            const cuisineGroups: Record<string, RestaurantWithDistance[]> = {};
            all.forEach(r => {
                const c = (r as any).cuisine || 'Other';
                if (!cuisineGroups[c]) cuisineGroups[c] = [];
                if (cuisineGroups[c].length < 8) cuisineGroups[c].push(r);
            });
            setSections({
                topRated: [...all].sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0)).slice(0, 10),
                nearYou: all.slice(0, 10),
                openNow: all.filter(r => isOpenNow((r as any).opening_hours)).slice(0, 10),
                fullyCertified: all.filter(r => r.certification_type === 'halal_certified').slice(0, 10),
                cuisines: cuisineGroups,
            });
        } catch (e) {
            console.error('Error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCardPress = useCallback((restaurant: RestaurantWithDistance) => {
        setSelectedRestaurant(restaurant);
    }, []);

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Finding spots near you…</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>

            {/* Floating search bar — fades in from top once hero is scrolled past */}
            <Animated.View
                pointerEvents={searchActive ? 'auto' : 'none'}
                style={[
                    styles.floatingSearch,
                    { opacity: stickyOpacity },
                ]}
            >
                <TouchableOpacity
                    style={[styles.heroSearch, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
                    activeOpacity={0.85}
                    onPress={() => router.push('/(tabs)/explore')}
                >
                    <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
                    <Text style={[styles.heroSearchText, { color: theme.textMuted }]}>Restaurants, cuisines…</Text>
                    <View style={[styles.heroSearchFilter, { backgroundColor: theme.primaryDim }]}>
                        <Ionicons name="options-outline" size={16} color={theme.primary} />
                    </View>
                </TouchableOpacity>
            </Animated.View>

            <Animated.ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Hero */}
                <LinearGradient colors={theme.heroBg} style={styles.hero}>
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                        <IslamicPattern />
                    </View>
                    <View style={styles.heroPill}>
                        <View style={[styles.heroPillDot, { backgroundColor: theme.primary }]} />
                        <Text style={[styles.heroPillText, { color: theme.primary }]}>{stats.total} Spots in Philly</Text>
                    </View>
                    <View style={styles.heroLogoLockup}>
                        <Image source={require('../../assets/logo.png')} style={styles.heroLogoImg} resizeMode="contain" />
                        <Text style={styles.heroLogo}>HalalSpot</Text>
                        <Text style={styles.heroTagline}>The finest halal dining in Philadelphia</Text>
                    </View>
                    {/* In-hero search bar (visible when at top) */}
                    <TouchableOpacity
                        style={[styles.heroSearch, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
                        activeOpacity={0.85}
                        onPress={() => router.push('/(tabs)/explore')}
                    >
                        <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
                        <Text style={[styles.heroSearchText, { color: theme.textMuted }]}>Restaurants, cuisines…</Text>
                        <View style={[styles.heroSearchFilter, { backgroundColor: theme.primaryDim }]}>
                            <Ionicons name="options-outline" size={16} color={theme.primary} />
                        </View>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <StatCard icon="storefront-outline" value={String(stats.total)} label="Places" theme={theme} />
                    <StatCard icon="shield-checkmark-outline" value={String(stats.certified)} label="Certified" color={theme.primary} theme={theme} />
                    <StatCard icon="location-outline" value="Philly" label="City" color={theme.gold} theme={theme} />
                </View>

                {/* Sections */}
                <Section title="⭐  Top Rated" data={sections.topRated} router={router} theme={theme} onPress={handleCardPress} />
                <Section title="📍  Near You" data={sections.nearYou} router={router} theme={theme} showDistance onPress={handleCardPress} />
                <Section title="🕒  Open Now" data={sections.openNow} router={router} theme={theme} onPress={handleCardPress} />
                <Section title="🕌  Halal Certified" data={sections.fullyCertified} router={router} theme={theme} onPress={handleCardPress} />
                {Object.entries(sections.cuisines).map(([cuisine, data]) => (
                    data.length >= 3 && <Section key={cuisine} title={`🍽  ${cuisine}`} data={data} router={router} theme={theme} onPress={handleCardPress} />
                ))}
            </Animated.ScrollView>

            {/* Bottom Sheet */}
            {selectedRestaurant && (
                <RestaurantBottomSheet
                    restaurant={selectedRestaurant}
                    onClose={() => setSelectedRestaurant(null)}
                />
            )}
        </View>
    );
}

function StatCard({ icon, value, label, color, theme }: { icon: any; value: string; label: string; color?: string; theme: any }) {
    return (
        <View style={[styles.statCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Ionicons name={icon} size={20} color={color || theme.textSecondary} />
            <Text style={[styles.statValue, { color: color || theme.textPrimary }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
        </View>
    );
}

function Section({ title, data, router, theme, showDistance, onPress }: { title: string; data: RestaurantWithDistance[]; router: any; theme: any; showDistance?: boolean; onPress: (r: RestaurantWithDistance) => void }) {
    if (data.length === 0) return null;
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                    <View style={[styles.sectionAccent, { backgroundColor: theme.primary }]} />
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                    <Text style={[styles.seeAll, { color: theme.primary }]}>See all →</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                {data.map(r => <RestaurantCard key={r.id} restaurant={r} theme={theme} showDistance={showDistance} onPress={() => onPress(r)} />)}
            </ScrollView>
        </View>
    );
}

function RestaurantCard({ restaurant, theme, showDistance, onPress }: { restaurant: RestaurantWithDistance; theme: any; showDistance?: boolean; onPress: () => void }) {
    const scale = new Animated.Value(1);
    const certColors: Record<string, string> = { halal_certified: theme.certHalal, muslim_owned: theme.certMuslim, halal_options: theme.certOptions };
    const certColor = certColors[restaurant.certification_type] || theme.primary;
    const certLabel = CERT_LABELS[restaurant.certification_type] || 'Halal';

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        >
            <Animated.View style={[styles.card, { backgroundColor: theme.bgCard, transform: [{ scale }] }]}>
                <Image
                    source={{ uri: restaurant.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop' }}
                    style={styles.cardImage}
                />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.82)']} style={styles.cardScrim}>
                    <View style={[styles.certBadge, { borderColor: certColor + '55', backgroundColor: certColor + '22' }]}>
                        <Text style={[styles.certBadgeText, { color: certColor }]}>{certLabel}</Text>
                    </View>
                    <Text style={styles.cardName} numberOfLines={1}>{restaurant.name}</Text>
                    <View style={styles.cardMeta}>
                        <Ionicons name="star" size={12} color={theme.gold} />
                        <Text style={[styles.cardRating, { color: theme.gold }]}>{(restaurant.avg_rating || 0).toFixed(1)}</Text>
                        {showDistance && restaurant.distance_meters ? (
                            <Text style={styles.cardDistance}>· {(restaurant.distance_meters * 0.000621371).toFixed(1)} mi</Text>
                        ) : null}
                    </View>
                </LinearGradient>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
    loadingText: { fontSize: 14, fontFamily: 'Outfit' },
    hero: { paddingTop: 72, paddingBottom: 36, paddingHorizontal: 20, gap: 14, alignItems: 'center', overflow: 'hidden' },
    heroPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: 'rgba(0,201,107,0.15)', borderRadius: 100, borderWidth: 1, borderColor: 'rgba(0,201,107,0.4)', marginBottom: 2 },
    heroPillDot: { width: 7, height: 7, borderRadius: 4 },
    heroPillText: { fontSize: 12, fontFamily: 'Outfit-SemiBold' },
    /* logo lockup */
    heroLogoLockup: { alignItems: 'center', gap: 6 },
    heroLogoImg: { width: 92, height: 92, marginBottom: 4 },
    heroGlow: { position: 'absolute', top: -24, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(0,201,107,0.22)', shadowColor: '#00C96B', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 40, elevation: 0 },
    heroLogo: { fontSize: 46, color: '#fff', fontFamily: 'DMSerifDisplay', letterSpacing: -1.5, lineHeight: 52, textAlign: 'center' },
    heroTagline: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Outfit', textAlign: 'center', marginTop: 2 },
    heroSearch: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 100, borderWidth: 1, gap: 10, width: '100%', ...Shadow.card },
    floatingSearch: { position: 'absolute', top: 56, left: 0, right: 0, zIndex: 100, paddingHorizontal: 20 },
    heroSearchText: { flex: 1, fontSize: 14, fontFamily: 'Outfit' },
    heroSearchFilter: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: -20, gap: 10 },
    statCard: { flex: 1, borderRadius: 20, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center', gap: 4, borderWidth: 1, ...Shadow.card },
    statValue: { fontSize: 17, fontWeight: '800', fontFamily: 'Outfit' },
    statLabel: { fontSize: 10, fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5 },
    section: { marginTop: 30 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionAccent: { width: 3, height: 20, borderRadius: 2 },
    sectionTitle: { fontSize: 18, fontWeight: '800', fontFamily: 'Outfit-SemiBold' },
    seeAll: { fontSize: 13, fontFamily: 'Outfit-SemiBold' },
    horizontalList: { paddingLeft: 20, paddingRight: 8, gap: 14 },
    card: { width: CARD_WIDTH, height: CARD_WIDTH * 0.72, borderRadius: 28, overflow: 'hidden', ...Shadow.card },
    cardImage: { width: '100%', height: '100%', position: 'absolute' },
    cardScrim: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, paddingTop: 30, gap: 4 },
    certBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, borderWidth: 1, marginBottom: 4 },
    certBadgeText: { fontSize: 10, fontFamily: 'Outfit-SemiBold' },
    cardName: { color: '#fff', fontSize: 15, fontFamily: 'Outfit-SemiBold', fontWeight: '700' },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardRating: { fontSize: 12, fontFamily: 'Outfit-SemiBold' },
    cardDistance: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'Outfit' },
});
