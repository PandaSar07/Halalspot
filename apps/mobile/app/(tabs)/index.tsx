import { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    Image, Dimensions, ActivityIndicator, Animated,
    Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { supabase } from '../../src/lib/supabase';
import { getNearbyRestaurants } from '@halalspot/supabase';
import { getCertificationColor } from '../../src/lib/utils';
import { Colors, Radius, Shadow } from '../../src/lib/theme';
import type { RestaurantWithDistance } from '@halalspot/shared-types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.62;

const DEFAULT_COORDS = { latitude: 39.9526, longitude: -75.1652 };

const CERT_LABELS: Record<string, string> = {
    halal_certified: '☪ Halal Certified',
    muslim_owned: '✦ Muslim Owned',
    halal_options: '◉ Halal Options',
};

const CERT_COLORS: Record<string, string> = {
    halal_certified: Colors.certHalal,
    muslim_owned: Colors.certMuslim,
    halal_options: Colors.certOptions,
};

export default function HomeScreen() {
    const router = useRouter();
    const [sections, setSections] = useState<{
        topRated: RestaurantWithDistance[];
        nearYou: RestaurantWithDistance[];
        openNow: RestaurantWithDistance[];
        fullyCertified: RestaurantWithDistance[];
        cuisines: Record<string, RestaurantWithDistance[]>;
    }>({ topRated: [], nearYou: [], openNow: [], fullyCertified: [], cuisines: {} });
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, certified: 0 });

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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Finding spots near you…</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
            {/* ─── Hero ─── */}
            <LinearGradient
                colors={['#0F2018', '#0F0F0F']}
                style={styles.hero}
            >
                {/* Mesh dots overlay */}
                <View style={styles.meshOverlay} pointerEvents="none" />

                <View style={styles.heroPill}>
                    <View style={styles.heroPillDot} />
                    <Text style={styles.heroPillText}>{stats.total} Spots in Philly</Text>
                </View>
                <Text style={styles.heroLogo}>HalalSpot</Text>
                <Text style={styles.heroTagline}>The finest halal dining in Philadelphia</Text>

                <TouchableOpacity
                    style={styles.heroSearch}
                    activeOpacity={0.85}
                    onPress={() => router.push('/(tabs)/explore')}
                >
                    <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
                    <Text style={styles.heroSearchText}>Restaurants, cuisines…</Text>
                    <View style={styles.heroSearchFilter}>
                        <Ionicons name="options-outline" size={16} color={Colors.primary} />
                    </View>
                </TouchableOpacity>
            </LinearGradient>

            {/* ─── Stats ─── */}
            <View style={styles.statsRow}>
                <StatCard icon="storefront-outline" value={String(stats.total)} label="Places" />
                <StatCard icon="shield-checkmark-outline" value={String(stats.certified)} label="Certified" color={Colors.primary} />
                <StatCard icon="location-outline" value="Philly" label="City" color={Colors.gold} />
            </View>

            {/* ─── Sections ─── */}
            <Section title="⭐  Top Rated" data={sections.topRated} router={router} />
            <Section title="📍  Near You" data={sections.nearYou} router={router} showDistance />
            <Section title="🕒  Open Now" data={sections.openNow} router={router} />
            <Section title="🕌  Halal Certified" data={sections.fullyCertified} router={router} />
            {Object.entries(sections.cuisines).map(([cuisine, data]) => (
                data.length >= 3 && <Section key={cuisine} title={`🍽  ${cuisine}`} data={data} router={router} />
            ))}
        </ScrollView>
    );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StatCard({ icon, value, label, color }: { icon: any; value: string; label: string; color?: string }) {
    return (
        <View style={styles.statCard}>
            <Ionicons name={icon} size={20} color={color || Colors.textSecondary} />
            <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function Section({ title, data, router, showDistance }: { title: string; data: RestaurantWithDistance[]; router: any; showDistance?: boolean }) {
    if (data.length === 0) return null;
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                    <View style={styles.sectionAccent} />
                    <Text style={styles.sectionTitle}>{title}</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                    <Text style={styles.seeAll}>See all →</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                {data.map(r => <RestaurantCard key={r.id} restaurant={r} showDistance={showDistance} />)}
            </ScrollView>
        </View>
    );
}

function RestaurantCard({ restaurant, showDistance }: { restaurant: RestaurantWithDistance; showDistance?: boolean }) {
    const scale = new Animated.Value(1);
    const certColor = CERT_COLORS[restaurant.certification_type] || Colors.primary;
    const certLabel = CERT_LABELS[restaurant.certification_type] || 'Halal';

    return (
        <Pressable
            onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        >
            <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
                <Image
                    source={{ uri: restaurant.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop' }}
                    style={styles.cardImage}
                />
                {/* Gradient scrim */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.82)']}
                    style={styles.cardScrim}
                >
                    {/* Cert badge */}
                    <View style={[styles.certBadge, { borderColor: certColor + '55', backgroundColor: certColor + '22' }]}>
                        <Text style={[styles.certBadgeText, { color: certColor }]}>{certLabel}</Text>
                    </View>
                    <Text style={styles.cardName} numberOfLines={1}>{restaurant.name}</Text>
                    <View style={styles.cardMeta}>
                        <Ionicons name="star" size={12} color={Colors.gold} />
                        <Text style={styles.cardRating}>{(restaurant.avg_rating || 0).toFixed(1)}</Text>
                        {showDistance && restaurant.distance_meters ? (
                            <Text style={styles.cardDistance}>
                                · {(restaurant.distance_meters * 0.000621371).toFixed(1)} mi
                            </Text>
                        ) : null}
                    </View>
                </LinearGradient>
            </Animated.View>
        </Pressable>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    loadingContainer: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center', gap: 14 },
    loadingText: { color: Colors.textSecondary, fontSize: 14, fontFamily: 'Outfit' },

    // Hero
    hero: {
        paddingTop: 70,
        paddingBottom: 36,
        paddingHorizontal: 20,
        gap: 10,
    },
    meshOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.04,
    },
    heroPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: Colors.primaryDim,
        borderRadius: Radius.pill,
        borderWidth: 1,
        borderColor: Colors.primary + '44',
        marginBottom: 4,
    },
    heroPillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
    heroPillText: { color: Colors.primary, fontSize: 12, fontFamily: 'Outfit-SemiBold' },
    heroLogo: {
        fontSize: 44,
        color: Colors.textPrimary,
        fontFamily: 'DMSerifDisplay',
        letterSpacing: -1.5,
        lineHeight: 50,
    },
    heroTagline: { color: Colors.textSecondary, fontSize: 14, fontFamily: 'Outfit', marginBottom: 8 },
    heroSearch: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bgElevated,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: Radius.pill,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 10,
        marginTop: 6,
    },
    heroSearchText: { flex: 1, color: Colors.textMuted, fontSize: 14, fontFamily: 'Outfit' },
    heroSearchFilter: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primaryDim,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: -20,
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.card,
    },
    statValue: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, fontFamily: 'Outfit' },
    statLabel: { fontSize: 10, color: Colors.textMuted, fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5 },

    // Section
    section: { marginTop: 30 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionAccent: { width: 3, height: 20, backgroundColor: Colors.primary, borderRadius: 2 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, fontFamily: 'Outfit-SemiBold' },
    seeAll: { fontSize: 13, color: Colors.primary, fontFamily: 'Outfit-SemiBold' },
    horizontalList: { paddingLeft: 20, paddingRight: 8, gap: 14 },

    // Card
    card: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 0.72,
        borderRadius: Radius.xl,
        overflow: 'hidden',
        backgroundColor: Colors.bgCard,
        ...Shadow.card,
    },
    cardImage: { width: '100%', height: '100%', position: 'absolute' },
    cardScrim: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        padding: 12,
        paddingTop: 30,
        gap: 4,
    },
    certBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: Radius.pill,
        borderWidth: 1,
        marginBottom: 4,
    },
    certBadgeText: { fontSize: 10, fontFamily: 'Outfit-SemiBold' },
    cardName: { color: '#fff', fontSize: 15, fontFamily: 'Outfit-SemiBold', fontWeight: '700' },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardRating: { color: Colors.gold, fontSize: 12, fontFamily: 'Outfit-SemiBold' },
    cardDistance: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'Outfit' },
});
