import { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    ScrollView, Dimensions, ActivityIndicator, Animated as RNAnimated,
    Modal, TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';
import {
    getRestaurantById, getMenuItems, getMenuCategories,
    getRestaurantReviews, isRestaurantFavorited, toggleFavorite,
    submitReview, getUserReview,
} from '@halalspot/supabase';
import { useTheme } from '../../src/lib/ThemeContext';
import { useMapContext } from '../../src/lib/MapContext';

const { width } = Dimensions.get('window');

const CERT_LABELS: Record<string, string> = {
    halal_certified: '☪ Halal Certified', muslim_owned: '✦ Muslim Owned', halal_options: '◉ Halal Options',
};
const CERT_COLORS: Record<string, string> = {
    halal_certified: '#00C96B', muslim_owned: '#818CF8', halal_options: '#F59E0B',
};

type MenuItem = {
    id: string; name: string; description: string | null; price: number;
    image_url: string | null; category: string; is_deal: boolean; deal_text: string | null;
};

type Review = {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    user: { id: string; full_name: string | null; avatar_url: string | null } | null;
};

export default function RestaurantDetailPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { setHighlightedRestaurantId } = useMapContext();
    const [restaurant, setRestaurant] = useState<any>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<string[]>(['Menu', 'Deals']);
    const [activeTab, setActiveTab] = useState('Menu');
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userExistingReview, setUserExistingReview] = useState<any>(null);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const tabIndicator = useRef(new RNAnimated.Value(0)).current;

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);

            const [rest, items, cats, revs, favorited, existingReview] = await Promise.all([
                getRestaurantById(supabase, id!),
                getMenuItems(supabase, id!),
                getMenuCategories(supabase, id!),
                getRestaurantReviews(supabase, id!),
                user ? isRestaurantFavorited(supabase, user.id, id!) : false,
                user ? getUserReview(supabase, user.id, id!) : null,
            ]);
            setRestaurant(rest);
            setMenuItems(items as MenuItem[]);
            const tabList = cats.length > 0 ? cats : ['Menu', 'Deals'];
            // Reviews never go in the tab bar — accessible via rating chip
            setCategories(tabList);
            setReviews(revs as Review[]);
            setIsFavorite(favorited);
            setUserExistingReview(existingReview);
        } catch (e) {
            console.error('Detail page error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleFavorite = async () => {
        if (!userId) return;
        try {
            setIsFavorite(!isFavorite);
            const newValue = await toggleFavorite(supabase, userId, id!);
            setIsFavorite(newValue);
        } catch (e) {
            setIsFavorite(!isFavorite);
            console.error('Failed to toggle favorite:', e);
        }
    };

    const handleTabChange = (tab: string, index: number) => {
        setActiveTab(tab);
        RNAnimated.spring(tabIndicator, {
            toValue: index * (width / Math.min(categories.length, 4)),
            useNativeDriver: true,
        }).start();
    };

    const handleReviewSubmitted = async (newReview: { rating: number; comment: string }) => {
        if (!userId) return;
        try {
            await submitReview(supabase, {
                restaurantId: id!,
                userId,
                rating: newReview.rating,
                comment: newReview.comment,
            });
            // Refetch reviews and rating
            const [revs, rest, existingReview] = await Promise.all([
                getRestaurantReviews(supabase, id!),
                getRestaurantById(supabase, id!),
                getUserReview(supabase, userId, id!),
            ]);
            setReviews(revs as Review[]);
            setRestaurant(rest);
            setUserExistingReview(existingReview);
            setReviewModalVisible(false);
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to submit review. Please try again.');
        }
    };

    const filteredItems = activeTab === 'Deals'
        ? menuItems.filter(i => i.is_deal)
        : activeTab === 'Menu'
            ? menuItems
            : activeTab === 'Reviews'
                ? []
                : menuItems.filter(i => i.category === activeTab);

    if (loading) {
        return (
            <View style={[styles.loading, { backgroundColor: theme.bg }]}>
                <ActivityIndicator size="large" color="#00C96B" />
            </View>
        );
    }
    if (!restaurant) {
        return (
            <View style={[styles.loading, { backgroundColor: theme.bg }]}>
                <Text style={{ color: theme.textSecondary }}>Restaurant not found.</Text>
            </View>
        );
    }

    const certColor = CERT_COLORS[restaurant.certification_type] || '#00C96B';
    const certLabel = CERT_LABELS[restaurant.certification_type] || 'Halal';

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[3]}>
                {/* ── Hero ── */}
                <View style={styles.heroWrap}>
                    <Image
                        source={{ uri: restaurant.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop' }}
                        style={styles.hero}
                    />
                    <LinearGradient colors={['rgba(0,0,0,0.45)', 'transparent', 'transparent']} style={StyleSheet.absoluteFill} />
                    <View style={[styles.heroActions, { top: insets.top + 10 }]}>
                        <TouchableOpacity style={styles.heroBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={20} color="#111" />
                        </TouchableOpacity>
                        <View style={styles.heroActionsRight}>
                            <TouchableOpacity style={styles.heroBtn} onPress={handleFavorite}>
                                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#ef4444" : "#111"} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.heroBtn}>
                                <Ionicons name="share-outline" size={20} color="#111" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.heroBtn}
                                onPress={() => {
                                    setHighlightedRestaurantId(id!);
                                    router.push('/(tabs)/explore');
                                }}
                                accessibilityLabel="Show on Map"
                            >
                                <Ionicons name="location" size={20} color="#00C96B" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.heroBtn}>
                                <Ionicons name="ellipsis-horizontal" size={20} color="#111" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* ── Header Info ── */}
                <View style={[styles.headerInfo, { backgroundColor: theme.bgCard }]}>
                    <Text style={[styles.restaurantName, { color: theme.textPrimary }]}>{restaurant.name}</Text>
                    <View style={styles.metaRow}>
                        <View style={[styles.certPill, { backgroundColor: certColor + '20', borderColor: certColor + '55' }]}>
                            <Text style={[styles.certPillText, { color: certColor }]}>{certLabel}</Text>
                        </View>
                        {restaurant.avg_rating > 0 && (
                            <TouchableOpacity
                                style={styles.ratingChip}
                                onPress={() => setReviewModalVisible(true)}
                            >
                                <Ionicons name="star" size={13} color="#F5C842" />
                                <Text style={[styles.ratingText, { color: theme.textPrimary }]}>{restaurant.avg_rating.toFixed(1)}</Text>
                                <Text style={[styles.ratingCount, { color: theme.textMuted }]}>({reviews.length} reviews)</Text>
                                <Ionicons name="chevron-forward" size={13} color={theme.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* ── Info Chips Row ── */}
                <View style={[styles.infoRow, { backgroundColor: theme.bgCard, borderTopColor: theme.border, borderBottomColor: theme.border }]}>
                    {[
                        { icon: 'star-outline', label: `${restaurant.avg_rating?.toFixed(1) || '–'} Rating`, onPress: undefined as (() => void) | undefined },
                        { icon: 'camera-outline', label: 'Photos', onPress: undefined as (() => void) | undefined },
                        { icon: 'information-circle-outline', label: 'Store Info', onPress: undefined as (() => void) | undefined },
                    ].map((chip, i) => (
                        <TouchableOpacity key={i} style={styles.infoChip} onPress={chip.onPress}>
                            <Ionicons name={chip.icon as any} size={18} color="#00C96B" />
                            <Text style={[styles.infoChipText, { color: theme.textPrimary }]}>{chip.label}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={styles.infoChip}
                        onPress={() => {
                            setHighlightedRestaurantId(id!);
                            router.push('/(tabs)/explore');
                        }}
                    >
                        <Ionicons name="location-outline" size={18} color="#00C96B" />
                        <Text style={[styles.infoChipText, { color: theme.textPrimary }]}>
                            {restaurant.distance_meters
                                ? `${(restaurant.distance_meters * 0.000621371).toFixed(1)} mi`
                                : 'Map'}
                        </Text>
                    </TouchableOpacity>
                </View>


                {/* ── Sticky Tab Bar ── */}
                <View style={[styles.tabBar, { backgroundColor: theme.bgCard, borderBottomColor: theme.border }]}>
                    <View style={styles.tabRow}>
                        {categories.slice(0, 4).map((tab, i) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, { width: width / Math.min(categories.length, 4) }]}
                                onPress={() => handleTabChange(tab, i)}
                            >
                                <Text style={[styles.tabText, { color: activeTab === tab ? '#00C96B' : theme.textSecondary }, activeTab === tab && styles.tabTextActive]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <RNAnimated.View style={[styles.tabIndicator, { width: width / Math.min(categories.length, 4), transform: [{ translateX: tabIndicator }] }]} />
                </View>

                {/* ── Content: Menu or Deals ── */}
                <View style={styles.menuList}>
                    {filteredItems.length === 0 ? (
                        <View style={styles.menuEmpty}>
                            <Ionicons name="restaurant-outline" size={40} color={theme.textMuted} />
                            <Text style={[styles.menuEmptyText, { color: theme.textMuted }]}>
                                {activeTab === 'Deals' ? 'No active deals right now' : 'Menu items coming soon'}
                            </Text>
                        </View>
                    ) : (
                        filteredItems.map(item => (
                            <FullMenuItemCard key={item.id} item={item} theme={theme} />
                        ))
                    )}
                    <View style={{ height: 40 + insets.bottom }} />
                </View>
            </ScrollView>

            {/* ── Write Review Modal ── */}
            <WriteReviewModal
                visible={reviewModalVisible}
                onClose={() => setReviewModalVisible(false)}
                onSubmit={handleReviewSubmitted}
                existingReview={userExistingReview}
                theme={theme}
            />
        </View>
    );
}

// ─── Reviews Section ──────────────────────────────────────────────────────────

function ReviewsSection({ reviews, theme, userId, userExistingReview, onWriteReview, avgRating, insets }: {
    reviews: Review[];
    theme: any;
    userId: string | null;
    userExistingReview: any;
    onWriteReview: () => void;
    avgRating: number;
    insets: any;
}) {
    const starCounts = [5, 4, 3, 2, 1].map(n => ({
        star: n,
        count: reviews.filter(r => r.rating === n).length,
    }));
    const total = reviews.length;

    return (
        <View style={{ paddingBottom: 40 + insets.bottom }}>
            {/* ── Summary Card ── */}
            {total > 0 && (
                <View style={[styles.ratingCard, { backgroundColor: theme.bgCard, borderBottomColor: theme.border }]}>
                    <View style={styles.ratingBig}>
                        <Text style={[styles.ratingBigNum, { color: theme.textPrimary }]}>
                            {avgRating > 0 ? avgRating.toFixed(1) : '–'}
                        </Text>
                        <StarRow rating={avgRating} size={22} />
                        <Text style={[styles.ratingBigSub, { color: theme.textSecondary }]}>
                            {total} review{total !== 1 ? 's' : ''}
                        </Text>
                    </View>
                    <View style={styles.ratingBars}>
                        {starCounts.map(({ star, count }) => (
                            <View key={star} style={styles.ratingBarRow}>
                                <Text style={[styles.ratingBarLabel, { color: theme.textSecondary }]}>{star}</Text>
                                <Ionicons name="star" size={11} color="#F5C842" />
                                <View style={[styles.ratingBarBg, { backgroundColor: theme.border }]}>
                                    <View
                                        style={[
                                            styles.ratingBarFill,
                                            { width: total > 0 ? `${(count / total) * 100}%` : '0%', backgroundColor: '#00C96B' },
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.ratingBarCount, { color: theme.textMuted }]}>{count}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* ── Write a Review Button ── */}
            {userId ? (
                <TouchableOpacity
                    style={[styles.writeReviewBtn, { backgroundColor: userExistingReview ? theme.bgElevated : '#00C96B' }]}
                    onPress={onWriteReview}
                    activeOpacity={0.85}
                >
                    <Ionicons
                        name={userExistingReview ? 'create-outline' : 'pencil-outline'}
                        size={18}
                        color={userExistingReview ? theme.textPrimary : '#fff'}
                    />
                    <Text style={[styles.writeReviewBtnText, { color: userExistingReview ? theme.textPrimary : '#fff' }]}>
                        {userExistingReview ? 'Edit Your Review' : 'Write a Review'}
                    </Text>
                </TouchableOpacity>
            ) : (
                <View style={[styles.writeReviewBtn, { backgroundColor: theme.bgElevated }]}>
                    <Ionicons name="lock-closed-outline" size={16} color={theme.textMuted} />
                    <Text style={[styles.writeReviewBtnText, { color: theme.textMuted }]}>Sign in to write a review</Text>
                </View>
            )}

            {/* ── Review List ── */}
            {reviews.length === 0 ? (
                <View style={styles.noReviews}>
                    <Ionicons name="chatbubble-outline" size={42} color={theme.textMuted} />
                    <Text style={[styles.noReviewsTitle, { color: theme.textPrimary }]}>No reviews yet</Text>
                    <Text style={[styles.noReviewsSub, { color: theme.textSecondary }]}>Be the first to share your experience!</Text>
                </View>
            ) : (
                reviews.map(review => (
                    <ReviewCard key={review.id} review={review} theme={theme} />
                ))
            )}
        </View>
    );
}

function ReviewCard({ review, theme }: { review: Review; theme: any }) {
    const name = review.user?.full_name || 'Anonymous';
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    const date = new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <View style={[styles.reviewCard, { backgroundColor: theme.bgCard, borderBottomColor: theme.border }]}>
            <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                    {review.user?.avatar_url ? (
                        <Image source={{ uri: review.user.avatar_url }} style={styles.reviewAvatarImg} />
                    ) : (
                        <View style={[styles.reviewAvatarFallback, { backgroundColor: '#00C96B22' }]}>
                            <Text style={[styles.reviewAvatarInitials, { color: '#00C96B' }]}>{initials}</Text>
                        </View>
                    )}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.reviewName, { color: theme.textPrimary }]}>{name}</Text>
                    <View style={styles.reviewMeta}>
                        <StarRow rating={review.rating} size={13} />
                        <Text style={[styles.reviewDate, { color: theme.textMuted }]}> · {date}</Text>
                    </View>
                </View>
            </View>
            {review.comment ? (
                <Text style={[styles.reviewComment, { color: theme.textSecondary }]}>{review.comment}</Text>
            ) : null}
        </View>
    );
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
    return (
        <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(n => (
                <Ionicons
                    key={n}
                    name={n <= Math.round(rating) ? 'star' : 'star-outline'}
                    size={size}
                    color="#F5C842"
                />
            ))}
        </View>
    );
}

// ─── Write Review Modal ───────────────────────────────────────────────────────

function WriteReviewModal({ visible, onClose, onSubmit, existingReview, theme }: {
    visible: boolean;
    onClose: () => void;
    onSubmit: (r: { rating: number; comment: string }) => void;
    existingReview: any;
    theme: any;
}) {
    const [rating, setRating] = useState(existingReview?.rating ?? 0);
    const [comment, setComment] = useState(existingReview?.comment ?? '');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (visible) {
            setRating(existingReview?.rating ?? 0);
            setComment(existingReview?.comment ?? '');
        }
    }, [visible, existingReview]);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a star rating before submitting.');
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit({ rating, comment: comment.trim() });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
                <View style={[styles.modalSheet, { backgroundColor: theme.bgCard }]}>
                    {/* Handle */}
                    <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />

                    <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                        {existingReview ? 'Edit Your Review' : 'Write a Review'}
                    </Text>
                    <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                        How was your experience?
                    </Text>

                    {/* Star Selector */}
                    <View style={styles.starSelector}>
                        {[1, 2, 3, 4, 5].map(n => (
                            <TouchableOpacity key={n} onPress={() => setRating(n)} activeOpacity={0.7}>
                                <Ionicons
                                    name={n <= rating ? 'star' : 'star-outline'}
                                    size={40}
                                    color={n <= rating ? '#F5C842' : theme.border}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={[styles.ratingLabel, { color: theme.textSecondary }]}>
                        {rating === 0 ? 'Tap to rate' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                    </Text>

                    {/* Comment Input */}
                    <TextInput
                        style={[styles.commentInput, { backgroundColor: theme.bgElevated, color: theme.textPrimary, borderColor: theme.border }]}
                        placeholder="Share your experience (optional)..."
                        placeholderTextColor={theme.textMuted}
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                        textAlignVertical="top"
                    />
                    <Text style={[styles.charCount, { color: theme.textMuted }]}>{comment.length}/500</Text>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: rating > 0 ? '#00C96B' : theme.border }]}
                        onPress={handleSubmit}
                        disabled={submitting || rating === 0}
                        activeOpacity={0.85}
                    >
                        {submitting
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.submitBtnText}>{existingReview ? 'Update Review' : 'Submit Review'}</Text>
                        }
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ─── Menu Card ────────────────────────────────────────────────────────────────

function FullMenuItemCard({ item, theme }: { item: MenuItem; theme: any }) {
    return (
        <View style={[styles.menuCard, { backgroundColor: theme.bgCard, borderBottomColor: theme.border }]}>
            <View style={styles.menuCardBody}>
                {item.is_deal && item.deal_text && (
                    <View style={styles.dealBadge}>
                        <Ionicons name="pricetag" size={10} color="#fff" />
                        <Text style={styles.dealBadgeText}>{item.deal_text}</Text>
                    </View>
                )}
                <Text style={[styles.menuName, { color: theme.textPrimary }]}>{item.name}</Text>
                {item.description ? (
                    <Text style={[styles.menuDesc, { color: theme.textSecondary }]} numberOfLines={2}>{item.description}</Text>
                ) : null}
                <View style={styles.menuBottom}>
                    <Text style={[styles.menuPrice, { color: theme.textPrimary }]}>${item.price.toFixed(2)}</Text>
                    <TouchableOpacity style={styles.addBtn}>
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
            {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.menuThumb} />
            ) : (
                <View style={[styles.menuThumbEmpty, { backgroundColor: theme.bgElevated }]}>
                    <Ionicons name="restaurant-outline" size={24} color={theme.textMuted} />
                </View>
            )}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Hero
    heroWrap: { position: 'relative', height: 280 },
    hero: { width: '100%', height: '100%' },
    heroActions: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
    heroActionsRight: { flexDirection: 'row', gap: 8 },
    heroBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },

    // Header info
    headerInfo: { padding: 20, paddingBottom: 14, gap: 8 },
    restaurantName: { fontSize: 26, fontFamily: 'DMSerifDisplay', letterSpacing: -0.5 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    certPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
    certPillText: { fontSize: 12, fontFamily: 'Outfit-SemiBold' },
    ratingChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 14, fontFamily: 'Outfit-SemiBold', fontWeight: '700' },
    ratingCount: { fontSize: 12, fontFamily: 'Outfit' },

    // Info chips
    infoRow: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 4 },
    infoChip: { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 4 },
    infoChipText: { fontSize: 11, fontFamily: 'Outfit-SemiBold' },


    // Tab bar
    tabBar: { borderBottomWidth: 2, position: 'relative', width: '100%' },
    tabRow: { flexDirection: 'row' },
    tab: { paddingVertical: 14, alignItems: 'center' },
    tabText: { fontSize: 13, fontFamily: 'Outfit-SemiBold' },
    tabTextActive: { fontFamily: 'Outfit-Bold' },
    tabIndicator: { position: 'absolute', bottom: -2, height: 3, backgroundColor: '#00C96B', borderRadius: 2 },

    // Menu
    menuList: { paddingTop: 8 },
    menuEmpty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
    menuEmptyText: { fontSize: 14, fontFamily: 'Outfit' },
    menuCard: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, gap: 12 },
    menuCardBody: { flex: 1, gap: 4 },
    dealBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
    dealBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'Outfit-SemiBold' },
    menuName: { fontSize: 16, fontFamily: 'Outfit-SemiBold', fontWeight: '700' },
    menuDesc: { fontSize: 13, fontFamily: 'Outfit', lineHeight: 18 },
    menuBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
    menuPrice: { fontSize: 15, fontFamily: 'Outfit-SemiBold', fontWeight: '800' },
    addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#00C96B', alignItems: 'center', justifyContent: 'center' },
    menuThumb: { width: 90, height: 90, borderRadius: 12 },
    menuThumbEmpty: { width: 90, height: 90, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

    // Reviews section
    ratingCard: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 20, borderBottomWidth: 1 },
    ratingBig: { alignItems: 'center', gap: 6, minWidth: 80 },
    ratingBigNum: { fontSize: 48, fontFamily: 'DMSerifDisplay', letterSpacing: -2, lineHeight: 52 },
    ratingBigSub: { fontSize: 12, fontFamily: 'Outfit' },
    ratingBars: { flex: 1, gap: 5 },
    ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    ratingBarLabel: { fontSize: 12, fontFamily: 'Outfit-SemiBold', width: 10, textAlign: 'right' },
    ratingBarBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
    ratingBarFill: { height: '100%', borderRadius: 3 },
    ratingBarCount: { fontSize: 11, fontFamily: 'Outfit', width: 18, textAlign: 'right' },
    writeReviewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, borderRadius: 14, paddingVertical: 14 },
    writeReviewBtnText: { fontSize: 15, fontFamily: 'Outfit-SemiBold', fontWeight: '700' },
    noReviews: { alignItems: 'center', paddingVertical: 60, gap: 10, paddingHorizontal: 30 },
    noReviewsTitle: { fontSize: 18, fontFamily: 'Outfit-SemiBold', fontWeight: '700' },
    noReviewsSub: { fontSize: 14, fontFamily: 'Outfit', textAlign: 'center' },

    // Review card
    reviewCard: { padding: 18, borderBottomWidth: 1 },
    reviewHeader: { flexDirection: 'row', gap: 12, marginBottom: 10 },
    reviewAvatar: { width: 42, height: 42 },
    reviewAvatarImg: { width: 42, height: 42, borderRadius: 21 },
    reviewAvatarFallback: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
    reviewAvatarInitials: { fontSize: 16, fontFamily: 'Outfit-SemiBold', fontWeight: '700' },
    reviewName: { fontSize: 14, fontFamily: 'Outfit-SemiBold', fontWeight: '700', marginBottom: 3 },
    reviewMeta: { flexDirection: 'row', alignItems: 'center' },
    reviewDate: { fontSize: 12, fontFamily: 'Outfit' },
    reviewComment: { fontSize: 14, fontFamily: 'Outfit', lineHeight: 20 },

    // Write review modal
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 12 },
    modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontFamily: 'DMSerifDisplay', letterSpacing: -0.5, marginBottom: 4 },
    modalSub: { fontSize: 14, fontFamily: 'Outfit', marginBottom: 20 },
    starSelector: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 8 },
    ratingLabel: { textAlign: 'center', fontSize: 14, fontFamily: 'Outfit-SemiBold', marginBottom: 20 },
    commentInput: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 14, fontFamily: 'Outfit', minHeight: 110, marginBottom: 6 },
    charCount: { textAlign: 'right', fontSize: 11, fontFamily: 'Outfit', marginBottom: 20 },
    submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    submitBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Outfit-SemiBold', fontWeight: '700' },
});
