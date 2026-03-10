import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/lib/ThemeContext';
import { useAuth } from '../src/lib/AuthContext';
import { supabase } from '../src/lib/supabase';

type Review = {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    restaurant_id: string;
    restaurants: {
        name: string;
        image_url: string | null;
    };
};

export default function MyReviewsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchUserReviews();
        }
    }, [user]);

    const fetchUserReviews = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    id,
                    rating,
                    comment,
                    created_at,
                    restaurant_id,
                    restaurants:restaurants(name, image_url)
                `)
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data as any || []);
        } catch (err) {
            console.error('Error fetching user reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderReviewItem = ({ item }: { item: Review }) => {
        const date = new Date(item.created_at).toLocaleDateString();
        
        return (
            <TouchableOpacity 
                style={[styles.reviewCard, { backgroundColor: theme.bgCard, borderBottomColor: theme.border }]}
                onPress={() => router.push(`/restaurant/${item.restaurant_id}`)}
                activeOpacity={0.7}
            >
                <View style={styles.reviewHeader}>
                    {item.restaurants.image_url ? (
                        <Image source={{ uri: item.restaurants.image_url }} style={styles.restaurantImage} />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: theme.primaryDim }]}>
                            <Ionicons name="restaurant" size={20} color={theme.primary} />
                        </View>
                    )}
                    <View style={styles.headerContent}>
                        <Text style={[styles.restaurantName, { color: theme.textPrimary }]}>{item.restaurants.name}</Text>
                        <View style={styles.ratingRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons 
                                    key={star} 
                                    name={star <= item.rating ? 'star' : 'star-outline'} 
                                    size={14} 
                                    color="#F5C842" 
                                />
                            ))}
                            <Text style={[styles.reviewDate, { color: theme.textMuted }]}>{date}</Text>
                        </View>
                    </View>
                </View>
                {item.comment && (
                    <Text style={[styles.comment, { color: theme.textSecondary }]} numberOfLines={3}>
                        {item.comment}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.loaderContainer, { backgroundColor: theme.bg }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.textPrimary }]}>My Reviews</Text>
            </View>
            
            {reviews.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubble-ellipses-outline" size={64} color={theme.textMuted} />
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>No reviews yet.</Text>
                    <TouchableOpacity 
                        style={[styles.startExploringBtn, { backgroundColor: theme.primary }]}
                        onPress={() => router.push('/(tabs)')}
                    >
                        <Text style={[styles.startExploringText, { color: '#fff' }]}>Start Exploring</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={reviews}
                    renderItem={renderReviewItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 16 },
    backButton: { padding: 4 },
    title: { fontSize: 20, fontFamily: 'DMSerifDisplay' },
    listContainer: { paddingBottom: 24 },
    reviewCard: { padding: 16, borderBottomWidth: 1 },
    reviewHeader: { flexDirection: 'row', gap: 12, marginBottom: 8 },
    restaurantImage: { width: 50, height: 50, borderRadius: 8 },
    imagePlaceholder: { width: 50, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    headerContent: { flex: 1, justifyContent: 'center' },
    restaurantName: { fontSize: 16, fontFamily: 'Outfit-SemiBold', fontWeight: '600' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
    reviewDate: { fontSize: 12, fontFamily: 'Outfit', marginLeft: 8 },
    comment: { fontSize: 14, fontFamily: 'Outfit', lineHeight: 20 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
    emptyText: { fontSize: 16, fontFamily: 'Outfit' },
    startExploringBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100 },
    startExploringText: { fontFamily: 'Outfit-SemiBold', fontWeight: '700' },
});
