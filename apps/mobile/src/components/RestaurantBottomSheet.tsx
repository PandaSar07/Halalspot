import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    ScrollView, Dimensions, Animated as RNAnimated, ActivityIndicator, Pressable,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '../lib/ThemeContext';
import { Radius, Shadow } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { getMenuItems, getMenuCategories } from '@halalspot/supabase';
import type { RestaurantWithDistance } from '@halalspot/shared-types';

const { width, height } = Dimensions.get('window');

const CERT_LABELS: Record<string, string> = {
    halal_certified: '☪ Halal Certified',
    muslim_owned: '✦ Muslim Owned',
    halal_options: '◉ Halal Options',
};
const CERT_COLORS: Record<string, string> = {
    halal_certified: '#00C96B',
    muslim_owned: '#818CF8',
    halal_options: '#F59E0B',
};

type MenuItem = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    category: string;
    is_deal: boolean;
    deal_text: string | null;
};

type Props = {
    restaurant: RestaurantWithDistance | null;
    onClose: () => void;
};

export default function RestaurantBottomSheet({ restaurant, onClose }: Props) {
    const { theme } = useTheme();
    const router = useRouter();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['62%', '95%'], []);

    const [activeTab, setActiveTab] = useState('Most Ordered');
    const [categories, setCategories] = useState<string[]>(['Most Ordered', 'Deals']);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [menuLoading, setMenuLoading] = useState(false);
    const tabIndicator = useRef(new RNAnimated.Value(0)).current;

    useEffect(() => {
        if (!restaurant) return;
        loadMenu();
    }, [restaurant?.id]);

    const loadMenu = async () => {
        if (!restaurant) return;
        try {
            setMenuLoading(true);
            const [cats, items] = await Promise.all([
                getMenuCategories(supabase, restaurant.id),
                getMenuItems(supabase, restaurant.id),
            ]);
            setCategories(cats.length > 0 ? cats : ['Most Ordered', 'Deals']);
            setMenuItems(items as MenuItem[]);
        } catch (e) {
            console.error('Menu fetch error:', e);
        } finally {
            setMenuLoading(false);
        }
    };

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) onClose();
    }, [onClose]);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.6}
            />
        ),
        []
    );

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
            ? menuItems.slice(0, 8)
            : menuItems.filter(i => i.category === activeTab);

    if (!restaurant) return null;

    const certColor = CERT_COLORS[restaurant.certification_type] || '#00C96B';
    const certLabel = CERT_LABELS[restaurant.certification_type] || 'Halal';

    return (
        <BottomSheet
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            index={0}
            onChange={handleSheetChanges}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={{ backgroundColor: theme.textMuted, width: 36 }}
            backgroundStyle={{ backgroundColor: theme.bgCard }}
        >
            <BottomSheetScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <View style={styles.heroWrap}>
                    <Image
                        source={{ uri: restaurant.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop' }}
                        style={styles.heroImage}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={StyleSheet.absoluteFill}
                    />
                    {/* Expand to full page button */}
                    <TouchableOpacity
                        style={styles.expandBtn}
                        onPress={() => {
                            bottomSheetRef.current?.close();
                            router.push(`/restaurant/${restaurant.id}`);
                        }}
                    >
                        <Ionicons name="expand-outline" size={18} color="#111" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={[styles.content, { backgroundColor: theme.bgCard }]}>
                    {/* Name + quick pills */}
                    <Text style={[styles.name, { color: theme.textPrimary }]}>{restaurant.name}</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow} contentContainerStyle={styles.pillRowContent}>
                        <View style={[styles.pill, { backgroundColor: certColor + '20', borderColor: certColor + '55' }]}>
                            <Text style={[styles.pillText, { color: certColor }]}>{certLabel}</Text>
                        </View>
                        {restaurant.distance_meters ? (
                            <View style={[styles.pill, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
                                <Ionicons name="location-outline" size={12} color={theme.textSecondary} />
                                <Text style={[styles.pillText, { color: theme.textSecondary }]}>
                                    {(restaurant.distance_meters * 0.000621371).toFixed(1)} mi
                                </Text>
                            </View>
                        ) : null}
                        <View style={[styles.pill, { backgroundColor: '#00C96B20', borderColor: '#00C96B55' }]}>
                            <View style={styles.openDot} />
                            <Text style={[styles.pillText, { color: '#00C96B' }]}>Open</Text>
                        </View>
                        {restaurant.avg_rating ? (
                            <View style={[styles.pill, { backgroundColor: theme.goldDim, borderColor: theme.gold + '55' }]}>
                                <Ionicons name="star" size={12} color={theme.gold} />
                                <Text style={[styles.pillText, { color: theme.gold }]}>{restaurant.avg_rating.toFixed(1)}</Text>
                            </View>
                        ) : null}
                    </ScrollView>

                    {/* Description */}
                    <Text style={[styles.description, { color: theme.textSecondary }]}>
                        {restaurant.description || `${restaurant.name} serves authentic halal cuisine in the heart of Philadelphia. Stop by to experience bold flavors, fresh ingredients, and a warm atmosphere.`}
                    </Text>

                    {/* Tab bar */}
                    <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
                        {categories.slice(0, 4).map((tab, i) => (
                            <TouchableOpacity key={tab} style={styles.tab} onPress={() => handleTabChange(tab, i)}>
                                <Text style={[
                                    styles.tabText,
                                    { color: activeTab === tab ? '#00C96B' : theme.textSecondary },
                                    activeTab === tab && styles.tabTextActive,
                                ]}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
                        <RNAnimated.View style={[
                            styles.tabIndicator,
                            { width: width / Math.min(categories.length, 4), transform: [{ translateX: tabIndicator }] },
                        ]} />
                    </View>

                    {/* Menu Items */}
                    {menuLoading ? (
                        <View style={styles.menuLoading}>
                            <ActivityIndicator color="#00C96B" />
                            <Text style={[styles.menuLoadingText, { color: theme.textSecondary }]}>Loading menu…</Text>
                        </View>
                    ) : filteredItems.length === 0 ? (
                        <View style={styles.menuEmpty}>
                            <Ionicons name="restaurant-outline" size={32} color={theme.textMuted} />
                            <Text style={[styles.menuEmptyText, { color: theme.textMuted }]}>
                                {activeTab === 'Deals' ? 'No active deals' : 'Menu coming soon'}
                            </Text>
                        </View>
                    ) : (
                        filteredItems.map(item => (
                            <MenuItemCard key={item.id} item={item} theme={theme} />
                        ))
                    )}

                    <View style={{ height: 30 }} />
                </View>
            </BottomSheetScrollView>
        </BottomSheet>
    );
}

function MenuItemCard({ item, theme }: { item: MenuItem; theme: any }) {
    return (
        <View style={[styles.menuCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <View style={styles.menuCardLeft}>
                {item.is_deal && item.deal_text && (
                    <View style={styles.dealTag}>
                        <Ionicons name="pricetag" size={10} color="#fff" />
                        <Text style={styles.dealTagText}>{item.deal_text}</Text>
                    </View>
                )}
                <Text style={[styles.menuName, { color: theme.textPrimary }]}>{item.name}</Text>
                {item.description ? (
                    <Text style={[styles.menuDesc, { color: theme.textSecondary }]} numberOfLines={2}>{item.description}</Text>
                ) : null}
                <Text style={[styles.menuPrice, { color: theme.textPrimary }]}>${item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.menuCardRight}>
                {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.menuImage} />
                ) : (
                    <View style={[styles.menuImagePlaceholder, { backgroundColor: theme.bgElevated }]}>
                        <Ionicons name="restaurant-outline" size={22} color={theme.textMuted} />
                    </View>
                )}
                <TouchableOpacity style={styles.addBtn}>
                    <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    heroWrap: { width: '100%', height: 180, position: 'relative', overflow: 'hidden' },
    heroImage: { width: '100%', height: '100%' },
    expandBtn: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
    content: { flex: 1, padding: 20, paddingTop: 16 },
    name: { fontSize: 24, fontFamily: 'Outfit-SemiBold', fontWeight: '800', marginBottom: 10 },
    pillRow: { marginBottom: 12 },
    pillRowContent: { gap: 8, paddingRight: 4 },
    pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, borderWidth: 1 },
    pillText: { fontSize: 12, fontFamily: 'Outfit-SemiBold' },
    openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00C96B' },
    description: { fontSize: 14, fontFamily: 'Outfit', lineHeight: 21, marginBottom: 16 },
    tabBar: { flexDirection: 'row', borderBottomWidth: 1.5, marginBottom: 12, position: 'relative' },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
    tabText: { fontSize: 13, fontFamily: 'Outfit-SemiBold' },
    tabTextActive: { fontFamily: 'Outfit-Bold' },
    tabIndicator: { position: 'absolute', bottom: -1.5, height: 2.5, backgroundColor: '#00C96B', borderRadius: 2 },
    menuLoading: { alignItems: 'center', paddingVertical: 40, gap: 10 },
    menuLoadingText: { fontSize: 13, fontFamily: 'Outfit' },
    menuEmpty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
    menuEmptyText: { fontSize: 14, fontFamily: 'Outfit' },
    menuCard: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
    menuCardLeft: { flex: 1, gap: 4 },
    dealTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 2 },
    dealTagText: { color: '#fff', fontSize: 10, fontFamily: 'Outfit-SemiBold' },
    menuName: { fontSize: 15, fontFamily: 'Outfit-SemiBold', fontWeight: '700' },
    menuDesc: { fontSize: 12, fontFamily: 'Outfit', lineHeight: 17 },
    menuPrice: { fontSize: 14, fontFamily: 'Outfit-SemiBold', fontWeight: '700', marginTop: 4 },
    menuCardRight: { alignItems: 'center', gap: 8 },
    menuImage: { width: 80, height: 80, borderRadius: 12 },
    menuImagePlaceholder: { width: 80, height: 80, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    addBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#00C96B', alignItems: 'center', justifyContent: 'center' },
});
