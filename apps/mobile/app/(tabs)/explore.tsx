import { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TextInput,
    TouchableOpacity, Image, ActivityIndicator, Pressable, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { supabase } from '../../src/lib/supabase';
import { getNearbyRestaurants } from '@halalspot/supabase';
import { Radius, Shadow } from '../../src/lib/theme';
import { useTheme } from '../../src/lib/ThemeContext';
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

export default function ExploreScreen() {
    const { theme } = useTheme();
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
        } catch {} finally { setLoading(false); }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Explore</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Philadelphia Halal Spots</Text>
            </View>

            <View style={[styles.searchBar, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <Ionicons name="search-outline" size={18} color={theme.textMuted} />
                <TextInput
                    style={[styles.searchInput, { color: theme.textPrimary }]}
                    placeholder="Search name, cuisine…"
                    placeholderTextColor={theme.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={theme.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {filters.map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.chip, { backgroundColor: theme.bgCard, borderColor: theme.border }, activeFilter === f && { backgroundColor: theme.primaryDim, borderColor: theme.primary }]}
                        onPress={() => setActiveFilter(f)}
                    >
                        <Text style={[styles.chipText, { color: theme.textSecondary }, activeFilter === f && { color: theme.primary }]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={theme.primary} />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                    <Text style={[styles.count, { color: theme.textMuted }]}>{restaurants.length} restaurants</Text>
                    {restaurants.map(r => <ExploreCard key={r.id} restaurant={r} theme={theme} />)}
                    {restaurants.length === 0 && (
                        <View style={styles.empty}>
                            <Ionicons name="restaurant-outline" size={48} color={theme.textMuted} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No places found</Text>
                        </View>
                    )}
                    <View style={{ height: 30 }} />
                </ScrollView>
            )}
        </View>
    );
}

function ExploreCard({ restaurant, theme }: { restaurant: RestaurantWithDistance; theme: any }) {
    const scale = new Animated.Value(1);
    const certColors: Record<string, string> = { halal_certified: theme.certHalal, muslim_owned: theme.certMuslim, halal_options: theme.certOptions };
    const certColor = certColors[restaurant.certification_type] || theme.primary;
    const certLabel = CERT_LABELS[restaurant.certification_type] || 'Halal';

    return (
        <Pressable
            onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        >
            <Animated.View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border, transform: [{ scale }] }]}>
                <View style={styles.cardImageWrap}>
                    <Image
                        source={{ uri: restaurant.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop' }}
                        style={styles.cardImage}
                    />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={StyleSheet.absoluteFill} />
                    <View style={[styles.certBadge, { backgroundColor: certColor + '22', borderColor: certColor + '55' }]}>
                        <Text style={[styles.certBadgeText, { color: certColor }]}>{certLabel}</Text>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <Text style={[styles.cardName, { color: theme.textPrimary }]} numberOfLines={1}>{restaurant.name}</Text>
                    <Text style={[styles.cardDesc, { color: theme.textSecondary }]} numberOfLines={2}>{restaurant.description || 'Authentic halal dining.'}</Text>
                    <View style={styles.cardFooter}>
                        <View style={[styles.ratingRow, { backgroundColor: theme.goldDim }]}>
                            <Ionicons name="star" size={12} color={theme.gold} />
                            <Text style={[styles.ratingText, { color: theme.gold }]}>{(restaurant.avg_rating || 0).toFixed(1)}</Text>
                        </View>
                        {restaurant.distance_meters ? (
                            <Text style={[styles.distText, { color: theme.textMuted, backgroundColor: theme.bgElevated }]}>{(restaurant.distance_meters * 0.000621371).toFixed(1)} mi</Text>
                        ) : null}
                        <View style={styles.addressRow}>
                            <Ionicons name="location-outline" size={12} color={theme.textMuted} />
                            <Text style={[styles.addressText, { color: theme.textMuted }]} numberOfLines={1}>{restaurant.address}</Text>
                        </View>
                    </View>
                </View>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 62, paddingHorizontal: 20, paddingBottom: 4 },
    title: { fontSize: 30, fontFamily: 'DMSerifDisplay', letterSpacing: -1 },
    subtitle: { fontSize: 13, fontFamily: 'Outfit', marginTop: 2 },
    searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 14, borderRadius: 100, paddingHorizontal: 16, height: 50, borderWidth: 1 },
    searchInput: { flex: 1, fontSize: 14, fontFamily: 'Outfit' },
    filterRow: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
    chipText: { fontSize: 12, fontFamily: 'Outfit-SemiBold' },
    count: { fontSize: 12, fontFamily: 'Outfit', marginBottom: 12, paddingHorizontal: 20 },
    list: { paddingHorizontal: 20 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { fontSize: 16, fontFamily: 'Outfit' },
    card: { borderRadius: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 1, ...Shadow.card },
    cardImageWrap: { height: 180 },
    cardImage: { width: '100%', height: '100%' },
    certBadge: { position: 'absolute', bottom: 10, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
    certBadgeText: { fontSize: 11, fontFamily: 'Outfit-SemiBold' },
    cardBody: { padding: 14 },
    cardName: { fontSize: 18, fontFamily: 'Outfit-SemiBold', fontWeight: '700', marginBottom: 4 },
    cardDesc: { fontSize: 13, fontFamily: 'Outfit', lineHeight: 19, marginBottom: 10 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    ratingText: { fontSize: 12, fontFamily: 'Outfit-SemiBold' },
    distText: { fontSize: 12, fontFamily: 'Outfit', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
    addressText: { fontSize: 12, fontFamily: 'Outfit', flex: 1 },
});
