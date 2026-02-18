import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mockRestaurants, getCertificationLabel, getCertificationColor, Restaurant } from '../../src/lib/mockData';

const filters = ['All', 'Halal Certified', 'Muslim Owned', 'Halal Options'];
const filterMap: Record<string, string> = {
    'All': 'all',
    'Halal Certified': 'halal_certified',
    'Muslim Owned': 'muslim_owned',
    'Halal Options': 'halal_options',
};

export default function ExploreScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filtered = mockRestaurants.filter((r) => {
        const matchesSearch =
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All' || r.certificationType === filterMap[activeFilter];
        return matchesSearch && matchesFilter;
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Explore</Text>
                <Text style={styles.subtitle}>Discover halal restaurants in Philly</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search name, cuisine, address..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {filters.map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                        onPress={() => setActiveFilter(f)}
                    >
                        <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Results */}
            <Text style={styles.resultCount}>{filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} found</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
                {filtered.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
                {filtered.length === 0 && (
                    <View style={styles.empty}>
                        <Ionicons name="restaurant-outline" size={48} color="#d1d5db" />
                        <Text style={styles.emptyText}>No restaurants found</Text>
                        <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
                    </View>
                )}
                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
    return (
        <TouchableOpacity style={styles.card}>
            <Image source={{ uri: restaurant.imageUrl }} style={styles.cardImage} />
            <View style={[styles.cardBadge, { backgroundColor: getCertificationColor(restaurant.certificationType) }]}>
                <Text style={styles.cardBadgeText}>{getCertificationLabel(restaurant.certificationType)}</Text>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.cardRow}>
                    <Text style={styles.cardName} numberOfLines={1}>{restaurant.name}</Text>
                    <View style={styles.cardRating}>
                        <Ionicons name="star" size={13} color="#fbbf24" />
                        <Text style={styles.cardRatingText}>{restaurant.rating}</Text>
                    </View>
                </View>
                <Text style={styles.cardCuisine}>{restaurant.cuisine}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{restaurant.description}</Text>
                <View style={styles.cardFooter}>
                    <Ionicons name="location-outline" size={14} color="#6b7280" />
                    <Text style={styles.cardAddress} numberOfLines={1}>{restaurant.address}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 4 },
    title: { fontSize: 30, fontWeight: '800', color: '#111827' },
    subtitle: { fontSize: 15, color: '#6b7280', marginTop: 2 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, marginTop: 16, borderRadius: 14, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: '#e5e7eb' },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 15, color: '#111827' },
    filterRow: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
    filterChipActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
    filterText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
    filterTextActive: { color: '#fff' },
    resultCount: { paddingHorizontal: 20, fontSize: 13, color: '#9ca3af', marginBottom: 10 },
    listContainer: { paddingHorizontal: 20 },
    card: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
    cardImage: { width: '100%', height: 180 },
    cardBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    cardBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    cardContent: { padding: 14 },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardName: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
    cardRating: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    cardRatingText: { fontSize: 13, fontWeight: '700', color: '#92400e' },
    cardCuisine: { fontSize: 13, color: '#10b981', fontWeight: '600', marginTop: 2 },
    cardDesc: { fontSize: 13, color: '#6b7280', marginTop: 6, lineHeight: 18 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 4 },
    cardAddress: { fontSize: 12, color: '#6b7280', flex: 1 },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 17, fontWeight: '600', color: '#6b7280', marginTop: 12 },
    emptySubtext: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
});
