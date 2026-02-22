import { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    ScrollView, Dimensions, ActivityIndicator, Animated as RNAnimated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';
import { getRestaurantById, getMenuItems, getMenuCategories, getRestaurantReviews } from '@halalspot/supabase';
import { useTheme } from '../../src/lib/ThemeContext';
import { Radius, Shadow } from '../../src/lib/theme';

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

export default function RestaurantDetailPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [restaurant, setRestaurant] = useState<any>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<string[]>(['Most Ordered', 'Deals']);
    const [activeTab, setActiveTab] = useState('Most Ordered');
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
    const tabIndicator = useRef(new RNAnimated.Value(0)).current;

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [rest, items, cats, revs] = await Promise.all([
                getRestaurantById(supabase, id!),
                getMenuItems(supabase, id!),
                getMenuCategories(supabase, id!),
                getRestaurantReviews(supabase, id!),
            ]);
            setRestaurant(rest);
            setMenuItems(items as MenuItem[]);
            setCategories(cats.length > 0 ? cats : ['Most Ordered', 'Deals']);
            setReviews(revs);
        } catch (e) {
            console.error('Detail page error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab: string, index: number) => {
        setActiveTab(tab);
        RNAnimated.spring(tabIndicator, {
            toValue: index * (width / Math.min(categories.length, 4)),
            useNativeDriver: true,
        }).start();
    };

    const filteredItems = activeTab === 'Deals'
        ? menuItems.filter(i => i.is_deal)
        : activeTab === 'Most Ordered'
            ? menuItems.slice(0, 10)
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
                    {/* Floating action buttons */}
                    <View style={[styles.heroActions, { top: insets.top + 10 }]}>
                        <TouchableOpacity style={styles.heroBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={20} color="#111" />
                        </TouchableOpacity>
                        <View style={styles.heroActionsRight}>
                            <TouchableOpacity style={styles.heroBtn}>
                                <Ionicons name="heart-outline" size={20} color="#111" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.heroBtn}>
                                <Ionicons name="share-outline" size={20} color="#111" />
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
                            <View style={styles.ratingChip}>
                                <Ionicons name="star" size={13} color="#F5C842" />
                                <Text style={[styles.ratingText, { color: theme.textPrimary }]}>{restaurant.avg_rating.toFixed(1)}</Text>
                                <Text style={[styles.ratingCount, { color: theme.textMuted }]}>({reviews.length})</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* ── Info Chips Row ── */}
                <View style={[styles.infoRow, { backgroundColor: theme.bgCard, borderTopColor: theme.border, borderBottomColor: theme.border }]}>
                    {[
                        { icon: 'star-outline', label: `${restaurant.avg_rating?.toFixed(1) || '–'} Rating` },
                        { icon: 'camera-outline', label: 'Photos' },
                        { icon: 'information-circle-outline', label: 'Store Info' },
                    ].map((chip, i) => (
                        <TouchableOpacity key={i} style={styles.infoChip}>
                            <Ionicons name={chip.icon as any} size={18} color="#00C96B" />
                            <Text style={[styles.infoChipText, { color: theme.textPrimary }]}>{chip.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Delivery Toggle ── */}
                <View style={[styles.deliveryToggle, { backgroundColor: theme.bgCard, borderBottomColor: theme.border }]}>
                    {(['delivery', 'pickup'] as const).map(mode => (
                        <TouchableOpacity
                            key={mode}
                            style={[styles.deliveryBtn, deliveryMode === mode && styles.deliveryBtnActive]}
                            onPress={() => setDeliveryMode(mode)}
                        >
                            <Text style={[styles.deliveryBtnText, deliveryMode === mode && { color: '#00C96B', fontFamily: 'Outfit-Bold' }]}>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <View style={[styles.deliveryInfo, { borderLeftColor: theme.border }]}>
                        <Text style={[styles.deliveryInfoText, { color: theme.textSecondary }]}>Free · 25–35 min</Text>
                    </View>
                </View>

                {/* ── Sticky Tab Bar ── */}
                <View style={[styles.tabBar, { backgroundColor: theme.bgCard, borderBottomColor: theme.border }]}>
                    {categories.slice(0, 4).map((tab, i) => (
                        <TouchableOpacity key={tab} style={styles.tab} onPress={() => handleTabChange(tab, i)}>
                            <Text style={[styles.tabText, { color: activeTab === tab ? '#00C96B' : theme.textSecondary }, activeTab === tab && styles.tabTextActive]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <RNAnimated.View style={[styles.tabIndicator, { width: width / Math.min(categories.length, 4), transform: [{ translateX: tabIndicator }] }]} />
                </View>

                {/* ── Menu Items ── */}
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
        </View>
    );
}

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

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    heroWrap: { position: 'relative', height: 280 },
    hero: { width: '100%', height: '100%' },
    heroActions: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
    heroActionsRight: { flexDirection: 'row', gap: 8 },
    heroBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
    headerInfo: { padding: 20, paddingBottom: 14, gap: 8 },
    restaurantName: { fontSize: 26, fontFamily: 'DMSerifDisplay', letterSpacing: -0.5 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    certPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
    certPillText: { fontSize: 12, fontFamily: 'Outfit-SemiBold' },
    ratingChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 14, fontFamily: 'Outfit-SemiBold', fontWeight: '700' },
    ratingCount: { fontSize: 12, fontFamily: 'Outfit' },
    infoRow: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 4 },
    infoChip: { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 4 },
    infoChipText: { fontSize: 11, fontFamily: 'Outfit-SemiBold' },
    deliveryToggle: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 8 },
    deliveryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100 },
    deliveryBtnActive: { backgroundColor: '#00C96B20' },
    deliveryBtnText: { fontSize: 14, fontFamily: 'Outfit-SemiBold', color: '#9CA3AF' },
    deliveryInfo: { flex: 1, alignItems: 'flex-end', borderLeftWidth: 1, paddingLeft: 16 },
    deliveryInfoText: { fontSize: 13, fontFamily: 'Outfit' },
    tabBar: { flexDirection: 'row', borderBottomWidth: 2, position: 'relative' },
    tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
    tabText: { fontSize: 13, fontFamily: 'Outfit-SemiBold' },
    tabTextActive: { fontFamily: 'Outfit-Bold' },
    tabIndicator: { position: 'absolute', bottom: -2, height: 3, backgroundColor: '#00C96B', borderRadius: 2 },
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
});
