import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { mockRestaurants, getCertificationLabel, getCertificationColor } from '../../src/lib/mockData';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const topRated = [...mockRestaurants].sort((a, b) => b.rating - a.rating).slice(0, 5);
    const nearYou = mockRestaurants.slice(0, 4);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Hero */}
            <LinearGradient colors={['#10b981', '#059669']} style={styles.hero}>
                <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>HalalSpot</Text>
                    <Text style={styles.heroSubtitle}>Find halal restaurants near you in Philadelphia</Text>
                    <TouchableOpacity style={styles.heroButton} onPress={() => router.push('/(tabs)/explore')}>
                        <Ionicons name="search" size={20} color="#10b981" />
                        <Text style={styles.heroButtonText}>Search Restaurants</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{mockRestaurants.length}</Text>
                    <Text style={styles.statLabel}>Restaurants</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{mockRestaurants.filter(r => r.certificationType === 'halal_certified').length}</Text>
                    <Text style={styles.statLabel}>Certified</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>4.6</Text>
                    <Text style={styles.statLabel}>Avg Rating</Text>
                </View>
            </View>

            {/* Top Rated */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Top Rated</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                    {topRated.map((restaurant) => (
                        <TouchableOpacity key={restaurant.id} style={styles.featuredCard}>
                            <Image source={{ uri: restaurant.imageUrl }} style={styles.featuredImage} />
                            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.featuredOverlay}>
                                <View style={[styles.certBadge, { backgroundColor: getCertificationColor(restaurant.certificationType) }]}>
                                    <Text style={styles.certBadgeText}>{getCertificationLabel(restaurant.certificationType)}</Text>
                                </View>
                                <Text style={styles.featuredName}>{restaurant.name}</Text>
                                <View style={styles.featuredMeta}>
                                    <Ionicons name="star" size={14} color="#fbbf24" />
                                    <Text style={styles.featuredRating}>{restaurant.rating}</Text>
                                    <Text style={styles.featuredCuisine}>• {restaurant.cuisine}</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Near You */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Near You</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>
                {nearYou.map((restaurant) => (
                    <TouchableOpacity key={restaurant.id} style={styles.listCard}>
                        <Image source={{ uri: restaurant.imageUrl }} style={styles.listImage} />
                        <View style={styles.listInfo}>
                            <Text style={styles.listName} numberOfLines={1}>{restaurant.name}</Text>
                            <Text style={styles.listCuisine}>{restaurant.cuisine}</Text>
                            <View style={styles.listMeta}>
                                <Ionicons name="star" size={13} color="#fbbf24" />
                                <Text style={styles.listRating}>{restaurant.rating}</Text>
                                <Text style={styles.listReviews}>({restaurant.reviewCount})</Text>
                            </View>
                            <View style={[styles.listCert, { backgroundColor: getCertificationColor(restaurant.certificationType) + '20' }]}>
                                <Text style={[styles.listCertText, { color: getCertificationColor(restaurant.certificationType) }]}>
                                    {getCertificationLabel(restaurant.certificationType)}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    hero: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    heroContent: { alignItems: 'center' },
    heroTitle: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 8 },
    heroSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 24, maxWidth: 260 },
    heroButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, gap: 8 },
    heroButtonText: { fontSize: 16, fontWeight: '700', color: '#10b981' },
    statsRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: -20, gap: 10 },
    statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
    statNumber: { fontSize: 22, fontWeight: '800', color: '#111827' },
    statLabel: { fontSize: 12, color: '#6b7280', marginTop: 2, fontWeight: '500' },
    section: { marginTop: 28 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
    seeAll: { fontSize: 14, fontWeight: '600', color: '#10b981' },
    horizontalList: { paddingLeft: 20, paddingRight: 8 },
    featuredCard: { width: width * 0.65, height: 200, borderRadius: 18, overflow: 'hidden', marginRight: 14 },
    featuredImage: { width: '100%', height: '100%' },
    featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, paddingTop: 40 },
    certBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6 },
    certBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
    featuredName: { color: '#fff', fontSize: 17, fontWeight: '700' },
    featuredMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    featuredRating: { color: '#fff', fontSize: 13, fontWeight: '600' },
    featuredCuisine: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
    listCard: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    listImage: { width: 100, height: 100 },
    listInfo: { flex: 1, padding: 12, justifyContent: 'center' },
    listName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
    listCuisine: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
    listMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
    listRating: { fontSize: 13, fontWeight: '600', color: '#111827' },
    listReviews: { fontSize: 12, color: '#9ca3af' },
    listCert: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    listCertText: { fontSize: 11, fontWeight: '600' },
});
