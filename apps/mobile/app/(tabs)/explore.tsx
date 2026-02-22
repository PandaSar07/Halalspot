import { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TextInput,
    TouchableOpacity, Image, ActivityIndicator, Pressable, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { supabase } from '../../src/lib/supabase';
import { getNearbyRestaurants } from '@halalspot/supabase';
import { getCertificationColor } from '../../src/lib/utils';
import { Colors, Radius, Shadow } from '../../src/lib/theme';
import type { RestaurantWithDistance } from '@halalspot/shared-types';
import { LinearGradient } from 'expo-linear-gradient';

const filters = ['All', 'Halal Certified', 'Muslim Owned', 'Halal Options'];
const filterMap: Record<string, string> = {
    'All': 'all', 'Halal Certified': 'halal_certified',
    'Muslim Owned': 'muslim_owned', 'Halal Options': 'halal_options',
};
const CERT_LABELS: Record<string, string> = {
    halal_certified: '☪ Certified', muslim_owned: '✦ Muslim Owned', halal_options: '◉ Halal Options',
};
const CERT_COLORS: Record<string, string> = {
    halal_certified: Colors.certHalal, muslim_owned: Colors.certMuslim, halal_options: Colors.certOptions,
};

export default function ExploreScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [restaurants, setRestaurants] = useState<RestaurantWithDistance[]>([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({});
                    setLocation(loc);
                }
            } catch {}
        })();
    }, []);

    useEffect(() => { fetchRestaurants(); }, [searchQuery, activeFilter, location]);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            let data: RestaurantWithDistance[] = [];
            if (location && !searchQuery) {
                data = await getNearbyRestaurants(supabase, {
                    latitude: location.coords.latitude, longitude: location.coords.longitude,
                }, 10000);
                if (activeFilter !== 'All') {
                    data = data.filter(r => r.certification_type === (filterMap[activeFilter] as RestaurantWithDistance['certification_type']));
                }
            } else {
                let q = supabase.from('restaurants').select('*').eq('status', 'approved');
                if (searchQuery) q = q.ilike('name', `%${searchQuery}%`);
                if (activeFilter !== 'All') q = q.eq('certification_type', filterMap[activeFilter]);
                const { data: res } = await q;
                data = (res || []) as RestaurantWithDistance[];
            }
            setRestaurants(data);
        } catch { } finally { setLoading(false); }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Explore</Text>
                <Text style={styles.subtitle}>Philadelphia Halal Spots</Text>
            </View>

            {/* Search */}
            <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search name, cuisine…"
                    placeholderTextColor={Colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {filters.map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.chip, activeFilter === f && styles.chipActive]}
                        onPress={() => setActiveFilter(f)}
                    >
                        <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Results */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={Colors.primary} />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                    <Text style={styles.count}>{restaurants.length} restaurants</Text>
                    {restaurants.map(r => <ExploreCard key={r.id} restaurant={r} />)}
                    {restaurants.length === 0 && (
                        <View style={styles.empty}>
                            <Ionicons name="restaurant-outline" size={48} color={Colors.textMuted} />
                            <Text style={styles.emptyText}>No places found</Text>
                        </View>
                    )}
                    <View style={{ height: 30 }} />
                </ScrollView>
            )}
        </View>
    );
}

function ExploreCard({ restaurant }: { restaurant: RestaurantWithDistance }) {
    const scale = new Animated.Value(1);
    const certColor = CERT_COLORS[restaurant.certification_type] || Colors.primary;
    const certLabel = CERT_LABELS[restaurant.certification_type] || 'Halal';
    return (
        <Pressable
            onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        >
            <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
                <View style={styles.cardImageWrap}>
                    <Image
                        source={{ uri: restaurant.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop' }}
                        style={styles.cardImage}
                    />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.cardImageGrad} />
                    <View style={[styles.certBadge, { backgroundColor: certColor + '22', borderColor: certColor + '55' }]}>
                        <Text style={[styles.certBadgeText, { color: certColor }]}>{certLabel}</Text>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.cardName} numberOfLines={1}>{restaurant.name}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>{restaurant.description || 'Authentic halal dining experience.'}</Text>
                    <View style={styles.cardFooter}>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={12} color={Colors.gold} />
                            <Text style={styles.ratingText}>{(restaurant.avg_rating || 0).toFixed(1)}</Text>
                        </View>
                        {restaurant.distance_meters ? (
                            <Text style={styles.distText}>{(restaurant.distance_meters * 0.000621371).toFixed(1)} mi</Text>
                        ) : null}
                        <View style={styles.addressRow}>
                            <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                            <Text style={styles.addressText} numberOfLines={1}>{restaurant.address}</Text>
                        </View>
                    </View>
                </View>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: { paddingTop: 62, paddingHorizontal: 20, paddingBottom: 4 },
    title: { fontSize: 30, color: Colors.textPrimary, fontFamily: 'DMSerifDisplay', letterSpacing: -1 },
    subtitle: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'Outfit', marginTop: 2 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: Colors.bgCard, marginHorizontal: 20, marginTop: 14,
        borderRadius: Radius.pill, paddingHorizontal: 16, height: 50,
        borderWidth: 1, borderColor: Colors.border,
    },
    searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 14, fontFamily: 'Outfit' },
    filterRow: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill,
        backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    },
    chipActive: { backgroundColor: Colors.primaryDim, borderColor: Colors.primary },
    chipText: { fontSize: 12, fontFamily: 'Outfit-SemiBold', color: Colors.textSecondary },
    chipTextActive: { color: Colors.primary },
    count: { color: Colors.textMuted, fontSize: 12, fontFamily: 'Outfit', marginBottom: 12, paddingHorizontal: 20 },
    list: { paddingHorizontal: 20 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { color: Colors.textSecondary, fontSize: 16, fontFamily: 'Outfit' },
    card: {
        backgroundColor: Colors.bgCard, borderRadius: Radius.xl, marginBottom: 16,
        overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, ...Shadow.card,
    },
    cardImageWrap: { position: 'relative', height: 180 },
    cardImage: { width: '100%', height: '100%' },
    cardImageGrad: { ...StyleSheet.absoluteFillObject },
    certBadge: {
        position: 'absolute', bottom: 10, left: 12,
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, borderWidth: 1,
    },
    certBadgeText: { fontSize: 11, fontFamily: 'Outfit-SemiBold' },
    cardBody: { padding: 14 },
    cardName: { fontSize: 18, fontFamily: 'Outfit-SemiBold', color: Colors.textPrimary, fontWeight: '700', marginBottom: 4 },
    cardDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'Outfit', lineHeight: 19, marginBottom: 10 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.goldDim, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm },
    ratingText: { fontSize: 12, color: Colors.gold, fontFamily: 'Outfit-SemiBold' },
    distText: { fontSize: 12, color: Colors.textMuted, fontFamily: 'Outfit', backgroundColor: Colors.bgElevated, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm },
    addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
    addressText: { fontSize: 12, color: Colors.textMuted, fontFamily: 'Outfit', flex: 1 },
});
