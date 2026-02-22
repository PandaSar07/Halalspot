import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { supabase } from '../../src/lib/supabase';
import { getNearbyRestaurants } from '@halalspot/supabase';
import { getCertificationLabel, getCertificationColor } from '../../src/lib/utils';
import type { RestaurantWithDistance } from '@halalspot/shared-types';

const { width } = Dimensions.get('window');

// Philadelphia Center
const DEFAULT_COORDS = {
    latitude: 39.9526,
    longitude: -75.1652,
};

export default function HomeScreen() {
    const router = useRouter();
    const [sections, setSections] = useState<{
        topRated: RestaurantWithDistance[];
        nearYou: RestaurantWithDistance[];
        openNow: RestaurantWithDistance[];
        fullyCertified: RestaurantWithDistance[];
        cuisines: Record<string, RestaurantWithDistance[]>;
    }>({
        topRated: [],
        nearYou: [],
        openNow: [],
        fullyCertified: [],
        cuisines: {},
    });
    
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, certified: 0 });
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            let coords = DEFAULT_COORDS;
            
            if (status === 'granted') {
                try {
                    let loc = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    setLocation(loc);
                    coords = {
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude
                    };
                } catch (e) {
                    console.warn('Could not get current location, falling back to default:', e);
                }
            }
            fetchData(coords);
        })();
    }, []);

    const isOpenNow = (hours: any) => {
        if (!hours) return true; // Default to true if no hours specified for now
        try {
            const now = new Date();
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const day = days[now.getDay()];
            const hour = now.getHours();
            const min = now.getMinutes();
            const currentTime = hour * 100 + min;
            
            const schedule = hours[day];
            if (!schedule) return true; // Assume open if day not specified
            
            const open = parseInt(String(schedule.open).replace(':', ''));
            const close = parseInt(String(schedule.close).replace(':', ''));
            
            return currentTime >= open && currentTime <= close;
        } catch (e) {
            return true;
        }
    };

    const fetchData = async (coords: { latitude: number; longitude: number }) => {
        try {
            setLoading(true);

            // 1. Fetch Stats
            const { count: totalCount } = await supabase
                .from('restaurants')
                .select('*', { count: 'exact', head: true });
            
            const { count: certifiedCount } = await supabase
                .from('restaurants')
                .select('*', { count: 'exact', head: true })
                .eq('certification_type', 'halal_certified');

            setStats({
                total: totalCount || 0,
                certified: certifiedCount || 0,
            });

            // 2. Fetch Near You
            let allRestaurants: RestaurantWithDistance[] = [];
            try {
                allRestaurants = await getNearbyRestaurants(supabase, coords, 15000);
            } catch (rpcError) {
                console.error('RPC Error (nearby_restaurants):', rpcError);
                const { data } = await supabase.from('restaurants').select('*').eq('status', 'approved');
                allRestaurants = (data || []) as RestaurantWithDistance[];
            }

            // Categorize Data
            const topRated = [...allRestaurants].sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0)).slice(0, 8);
            const nearYou = allRestaurants.slice(0, 8);
            const fullyCertified = allRestaurants.filter(r => r.certification_type === 'halal_certified').slice(0, 8);
            const openNow = allRestaurants.filter(r => isOpenNow((r as any).opening_hours)).slice(0, 8);
            
            // Cuisine Groups
            const cuisineGroups: Record<string, RestaurantWithDistance[]> = {};
            allRestaurants.forEach(r => {
                const c = (r as any).cuisine || 'Other';
                if (!cuisineGroups[c]) cuisineGroups[c] = [];
                if (cuisineGroups[c].length < 8) cuisineGroups[c].push(r);
            });

            setSections({
                topRated,
                nearYou,
                openNow,
                fullyCertified,
                cuisines: cuisineGroups,
            });

        } catch (error) {
            console.error('[CRITICAL] Global Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Hero */}
            <LinearGradient colors={['#10b981', '#059669']} style={styles.hero}>
                <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>HalalSpot</Text>
                    <Text style={styles.heroSubtitle}>Find the best halal food in Philly</Text>
                    <TouchableOpacity style={styles.heroButton} onPress={() => router.push('/(tabs)/explore')}>
                        <Ionicons name="search" size={18} color="#10b981" />
                        <Text style={styles.heroButtonText}>Explore all cuisines</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.total}</Text>
                    <Text style={styles.statLabel}>Places</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.certified}</Text>
                    <Text style={styles.statLabel}>Certified</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>Philly</Text>
                    <Text style={styles.statLabel}>City</Text>
                </View>
            </View>

            <HorizontalSection title="⭐ Top Rated" data={sections.topRated} />
            <HorizontalSection title="📍 Near You" data={sections.nearYou} showDistance={true} />
            <HorizontalSection title="🕒 Open Now" data={sections.openNow} />
            <HorizontalSection title="🕌 Fully Certified" data={sections.fullyCertified} />
            
            {Object.entries(sections.cuisines).map(([cuisine, data]) => (
                <HorizontalSection key={cuisine} title={cuisine} data={data} />
            ))}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

function HorizontalSection({ title, data, showDistance }: { title: string, data: RestaurantWithDistance[], showDistance?: boolean }) {
    const router = useRouter();
    if (data.length === 0) return null;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                {data.map((restaurant) => (
                    <TouchableOpacity key={restaurant.id} style={styles.card}>
                        <Image 
                            source={{ uri: restaurant.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop' }} 
                            style={styles.cardImage} 
                        />
                        <View style={[styles.certBadgeFloating, { backgroundColor: getCertificationColor(restaurant.certification_type) }]}>
                            <Text style={styles.certBadgeText}>{getCertificationLabel(restaurant.certification_type).split(' ')[0]}</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardName} numberOfLines={1}>{restaurant.name}</Text>
                            <View style={styles.cardMeta}>
                                <Ionicons name="star" size={12} color="#fbbf24" />
                                <Text style={styles.cardRating}>{restaurant.avg_rating?.toFixed(1) || '4.5'}</Text>
                                {showDistance && restaurant.distance_meters && (
                                    <Text style={styles.cardDistance}>
                                        • {(restaurant.distance_meters * 0.000621371).toFixed(1)} mi
                                    </Text>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    hero: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    heroContent: { alignItems: 'center' },
    heroTitle: { fontSize: 38, fontWeight: '900', color: '#fff', letterSpacing: -1 },
    heroSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 20, marginTop: 4 },
    heroButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, gap: 8 },
    heroButtonText: { fontSize: 14, fontWeight: '700', color: '#10b981' },
    statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: -20, gap: 10 },
    statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
    statNumber: { fontSize: 20, fontWeight: '800', color: '#111827' },
    statLabel: { fontSize: 10, color: '#9ca3af', marginTop: 2, fontWeight: '600', textTransform: 'uppercase' },
    section: { marginTop: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
    sectionTitle: { fontSize: 19, fontWeight: '800', color: '#111827' },
    seeAll: { fontSize: 13, fontWeight: '700', color: '#10b981' },
    horizontalList: { paddingLeft: 20, paddingRight: 8 },
    card: { width: 160, backgroundColor: '#fff', borderRadius: 20, marginRight: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    cardImage: { width: '100%', height: 110 },
    certBadgeFloating: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    certBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
    cardContent: { padding: 10 },
    cardName: { fontSize: 14, fontWeight: '700', color: '#111827' },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    cardRating: { fontSize: 12, fontWeight: '700', color: '#111827' },
    cardDistance: { fontSize: 12, color: '#6b7280' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
});
