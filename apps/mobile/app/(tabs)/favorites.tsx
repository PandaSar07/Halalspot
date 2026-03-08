import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Animated, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Radius, Shadow } from '../../src/lib/theme';
import { useTheme } from '../../src/lib/ThemeContext';
import { supabase } from '../../src/lib/supabase';
import { getUserFavorites } from '@halalspot/supabase';
import type { RestaurantWithDistance } from '@halalspot/shared-types';

const CERT_LABELS: Record<string, string> = {
    halal_certified: '☪ Certified', muslim_owned: '✦ Muslim Owned', halal_options: '◉ Halal Options',
};

export default function FavoritesScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchFavorites();
        }, [])
    );

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const data = await getUserFavorites(supabase, user.id);
            setFavorites(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading && favorites.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Saved</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your favorite spots</Text>
            </View>
            
            {favorites.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={[styles.emptyIcon, { backgroundColor: theme.primaryDim, borderColor: theme.primary + '44' }]}>
                        <Ionicons name="heart" size={38} color={theme.primary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No saved spots yet</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                        Tap the heart icon on any restaurant to save it here for quick access.
                    </Text>
                    <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: theme.primary }]} onPress={() => router.push('/(tabs)/explore')}>
                        <Text style={[styles.exploreBtnText, { color: theme.bg }]}>Explore Restaurants</Text>
                        <Ionicons name="arrow-forward" size={16} color={theme.bg} />
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                    {favorites.map((fav) => (
                        <SavedCard 
                            key={fav.id} 
                            restaurant={fav.restaurant} 
                            theme={theme} 
                            onPress={() => router.push(`/restaurant/${fav.restaurant_id}`)} 
                        />
                    ))}
                    <View style={{ height: 30 }} />
                </ScrollView>
            )}
        </View>
    );
}

function SavedCard({ restaurant, theme, onPress }: { restaurant: any; theme: any; onPress: () => void }) {
    const scale = new Animated.Value(1);
    const certColors: Record<string, string> = { halal_certified: theme.certHalal, muslim_owned: theme.certMuslim, halal_options: theme.certOptions };
    const certColor = certColors[restaurant.certification_type] || theme.primary;
    const certLabel = CERT_LABELS[restaurant.certification_type] || 'Halal';

    return (
        <Pressable
            onPress={onPress}
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
                    <View style={styles.heartBadge}>
                        <Ionicons name="heart" size={18} color="#ef4444" />
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <Text style={[styles.cardName, { color: theme.textPrimary }]} numberOfLines={1}>{restaurant.name}</Text>
                    <Text style={[styles.cardDesc, { color: theme.textSecondary }]} numberOfLines={2}>{restaurant.description || 'Authentic halal dining.'}</Text>
                    <View style={styles.cardFooter}>
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
    header: { paddingTop: 62, paddingHorizontal: 20, paddingBottom: 16 },
    title: { fontSize: 30, fontFamily: 'DMSerifDisplay', letterSpacing: -1 },
    subtitle: { fontSize: 13, fontFamily: 'Outfit', marginTop: 2 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 14 },
    emptyIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    emptyTitle: { fontSize: 20, fontFamily: 'Outfit-SemiBold', fontWeight: '700', textAlign: 'center' },
    emptySubtitle: { fontSize: 14, fontFamily: 'Outfit', textAlign: 'center', lineHeight: 20 },
    exploreBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 100, marginTop: 6 },
    exploreBtnText: { fontFamily: 'Outfit-SemiBold', fontSize: 15, fontWeight: '700' },
    list: { paddingHorizontal: 20, paddingTop: 10 },
    card: { borderRadius: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 1, ...Shadow.card },
    cardImageWrap: { height: 180 },
    cardImage: { width: '100%', height: '100%' },
    certBadge: { position: 'absolute', bottom: 10, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
    certBadgeText: { fontSize: 11, fontFamily: 'Outfit-SemiBold' },
    heartBadge: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
    cardBody: { padding: 14 },
    cardName: { fontSize: 18, fontFamily: 'Outfit-SemiBold', fontWeight: '700', marginBottom: 4 },
    cardDesc: { fontSize: 13, fontFamily: 'Outfit', lineHeight: 19, marginBottom: 10 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
    addressText: { fontSize: 12, fontFamily: 'Outfit', flex: 1 },
});
