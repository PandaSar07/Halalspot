import { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, Image
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, MapMarker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { getNearbyRestaurants } from '@halalspot/supabase';
import { useTheme } from '../../src/lib/ThemeContext';
import { useMapContext } from '../../src/lib/MapContext';
import RestaurantBottomSheet from '../../src/components/RestaurantBottomSheet';
import type { RestaurantWithDistance } from '@halalspot/shared-types';

const { height } = Dimensions.get('window');
const PHILLY = { latitude: 39.9526, longitude: -75.1652 };

// Google Maps Dark Night style JSON (condensed)
const DARK_MAP_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#64779e' }] },
    { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
    { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
    { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
    { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3C7680' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
    { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0d5ce' }] },
    { featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{ color: '#023e58' }] },
    { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
    { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
    { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: '#283d6a' }] },
    { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#3a4762' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
];

export default function MapScreen() {
    const { theme, isDark } = useTheme();
    const { highlightedRestaurantId, setHighlightedRestaurantId } = useMapContext();
    const mapRef = useRef<MapView>(null);
    const markerRefs = useRef<Record<string, MapMarker | null>>({});

    const [restaurants, setRestaurants] = useState<RestaurantWithDistance[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantWithDistance | null>(null);
    const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number }>(PHILLY);

    // Fetch restaurants once
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                let coords = PHILLY;
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
                    setUserCoords(coords);
                }
                let data: RestaurantWithDistance[] = [];
                try {
                    data = await getNearbyRestaurants(supabase, coords, 50000);
                } catch {
                    // Fallback: fetch all approved restaurants with coordinates extracted from PostGIS
                    const { data: fallback } = await (supabase as any)
                        .from('restaurants')
                        .select('*, ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude')
                        .eq('status', 'approved');
                    data = (fallback || []) as RestaurantWithDistance[];
                }
                setRestaurants(data);
            } catch (e) {
                console.error('Map fetch error:', e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Handle "Show on Map" navigation — fires each time screen comes into focus
    useFocusEffect(useCallback(() => {
        if (!highlightedRestaurantId || restaurants.length === 0) return;
        const target = restaurants.find(r => r.id === highlightedRestaurantId);
        if (!target) return;

        // Center map on the restaurant
        if (target.latitude && target.longitude) {
            mapRef.current?.animateToRegion({
                latitude: Number(target.latitude),
                longitude: Number(target.longitude),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 600);
        }
        // Auto-open bottom sheet
        setSelectedRestaurant(target);
        setHighlightedRestaurantId(null);
    }, [highlightedRestaurantId, restaurants]));

    const handleMarkerPress = useCallback((r: RestaurantWithDistance) => {
        setSelectedRestaurant(r);
    }, []);

    return (
        <View style={styles.container}>
            {loading && (
                <View style={[styles.loadingOverlay, { backgroundColor: theme.bg }]}>
                    <ActivityIndicator color={theme.primary} size="large" />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading Halal Spots…</Text>
                </View>
            )}

            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                showsUserLocation
                showsMyLocationButton={false}
                initialRegion={{
                    ...userCoords,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                customMapStyle={isDark ? DARK_MAP_STYLE : []}
            >
                {restaurants.map(r => {
                    const lat = Number((r as any).latitude);
                    const lng = Number((r as any).longitude);
                    if (!lat || !lng) return null;
                    return (
                        <Marker
                            key={r.id}
                            ref={(ref: MapMarker | null) => { markerRefs.current[r.id] = ref; }}
                            coordinate={{ latitude: lat, longitude: lng }}
                            onPress={() => handleMarkerPress(r)}
                            tracksViewChanges={false}
                            anchor={{ x: 0.5, y: 1 }}
                        >
                            <MapPin selected={selectedRestaurant?.id === r.id} />
                        </Marker>
                    );
                })}
            </MapView>

            {/* Top count badge */}
            {!loading && (
                <View style={[styles.badge, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                    <View style={[styles.badgeDot, { backgroundColor: theme.primary }]} />
                    <Text style={[styles.badgeText, { color: theme.textPrimary }]}>
                        {restaurants.length} Halal Spots
                    </Text>
                </View>
            )}

            {/* Location recenter button */}
            <TouchableOpacity
                style={[styles.myLocationBtn, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
                onPress={() => {
                    mapRef.current?.animateToRegion({ ...userCoords, latitudeDelta: 0.03, longitudeDelta: 0.03 }, 500);
                }}
            >
                <Ionicons name="locate" size={20} color={theme.primary} />
            </TouchableOpacity>

            {/* Bottom Sheet */}
            {selectedRestaurant && (
                <RestaurantBottomSheet
                    restaurant={selectedRestaurant}
                    onClose={() => setSelectedRestaurant(null)}
                    snapHeight={height * 0.52}
                />
            )}
        </View>
    );
}

/** Custom map pin */
function MapPin({ selected }: { selected: boolean }) {
    return (
        <View style={styles.pinWrapper}>
            {selected && <View style={styles.pinPulse} />}
            <View style={[styles.pin, selected && styles.pinSelected]}>
                <Image 
                    source={require('../../assets/logo.png')} 
                    style={[styles.pinImage, selected && styles.pinImageSelected]}
                    resizeMode="contain"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 14,
    },
    loadingText: { fontSize: 14, fontFamily: 'Outfit' },
    badge: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 100,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    badgeDot: { width: 7, height: 7, borderRadius: 4 },
    badgeText: { fontSize: 13, fontFamily: 'Outfit-SemiBold' },
    myLocationBtn: {
        position: 'absolute',
        bottom: 36,
        right: 20,
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.14,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 5,
    },
    pinWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
    },
    pin: {
        width: 32,
        height: 32,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 5,
        backgroundColor: '#00C96B',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#00C96B',
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
        transform: [{ rotate: '45deg' }],
        overflow: 'hidden',
    },
    pinSelected: {
        width: 40,
        height: 40,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 6,
        borderColor: '#00A855',
        shadowOpacity: 0.7,
        shadowRadius: 8,
    },
    pinImage: {
        width: 28,
        height: 28,
        transform: [{ rotate: '-45deg' }, { scale: 1.15 }],
    },
    pinImageSelected: {
        width: 36,
        height: 36,
        transform: [{ rotate: '-45deg' }, { scale: 1.25 }],
    },
    pinPulse: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: 'rgba(0, 201, 107, 0.4)',
    },
});
