import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking, Modal, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Radius, Shadow } from '../../src/lib/theme';
import { useTheme } from '../../src/lib/ThemeContext';
import { useAuth } from '../../src/lib/AuthContext';
import { supabase } from '../../src/lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
    const { theme, isDark, toggleTheme } = useTheme();
    const { user, signOut } = useAuth();
    const router = useRouter();
    
    const [stats, setStats] = useState({ reviews: 0, saved: 0, checkins: 0 });
    const [aboutVisible, setAboutVisible] = useState(false);

    const displayName = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? 'Halal Spot User';
    const displayEmail = user?.email ?? '';

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const [reviewsRes, favoritesRes] = await Promise.all([
                supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
                supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
            ]);
            
            setStats({
                reviews: reviewsRes.count || 0,
                saved: favoritesRes.count || 0,
                checkins: 0, // Placeholder for future feature
            });
        } catch (error) {
            console.error('Error fetching profile stats:', error);
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: signOut },
            ]
        );
    };

    const menuItems = [
        { 
            icon: 'heart-outline', 
            label: 'Saved Restaurants', 
            desc: 'Your bookmarked spots',
            onPress: () => router.push('/(tabs)/favorites')
        },
        { 
            icon: 'star-outline', 
            label: 'My Reviews', 
            desc: 'Reviews you\'ve written',
            onPress: () => router.push('/my-reviews')
        },
        { 
            icon: 'notifications-outline', 
            label: 'Notifications', 
            desc: 'Manage alerts',
            onPress: () => Alert.alert('Notifications', 'Notification settings coming soon!')
        },
        { 
            icon: 'shield-outline', 
            label: 'Privacy & Security', 
            desc: 'Account settings',
            onPress: () => Alert.alert('Privacy', 'Privacy settings coming soon!')
        },
        { 
            icon: 'help-circle-outline', 
            label: 'Help & Support', 
            desc: 'FAQs and contact',
            onPress: () => Linking.openURL('mailto:support@halalspot.com').catch(() => {
                Alert.alert('Error', 'Could not open mail app. Please email support@halalspot.com');
            })
        },
        { 
            icon: 'information-circle-outline', 
            label: 'About HalalSpot', 
            desc: 'Version 1.0.0',
            onPress: () => setAboutVisible(true)
        },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} showsVerticalScrollIndicator={false}>
            {/* Avatar Header with home background */}
            <View style={styles.profileHeaderWrap}>
                {/* Green gradient */}
                {!theme.isDark && (
                    <LinearGradient
                        colors={theme.heroBg}
                        style={StyleSheet.absoluteFillObject}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                    />
                )}
                {/* Faint Islamic pattern */}
                <Image
                    source={require('../../assets/islamic_hero_bg.png')}
                    style={[styles.profileHeaderPattern, { opacity: theme.isDark ? 0.15 : 0.08 }]}
                    resizeMode="cover"
                />
                {/* Gradient fade out at bottom */}
                <LinearGradient
                    colors={['transparent', theme.bg]}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0.5, y: 0.3 }}
                    end={{ x: 0.5, y: 1 }}
                />
                {/* Content */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarRing}>
                        <View style={[styles.avatar, { backgroundColor: theme.primaryDim }]}>
                            <Ionicons name="person" size={36} color={theme.primary} />
                        </View>
                    </View>
                    <Text style={styles.name}>{displayName}</Text>
                    <Text style={styles.email}>{displayEmail}</Text>
                    {user ? (
                        <TouchableOpacity style={[styles.signInBtn, { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }]} onPress={handleSignOut}>
                            <Text style={[styles.signInBtnText, { color: '#fff' }]}>Sign Out</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={[styles.signInBtn, { backgroundColor: theme.primary }]} onPress={() => router.push('/landing')}>
                            <Text style={[styles.signInBtnText, { color: theme.bg }]}>Sign In</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Mini Stats */}
            <View style={[styles.miniStats, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <TouchableOpacity style={styles.miniStat} onPress={() => router.push('/my-reviews')}>
                    <Text style={[styles.miniStatNum, { color: theme.textPrimary }]}>{stats.reviews}</Text>
                    <Text style={[styles.miniStatLabel, { color: theme.textMuted }]}>Reviews</Text>
                </TouchableOpacity>
                <View style={[styles.miniStatDivider, { backgroundColor: theme.border }]} />
                <TouchableOpacity style={styles.miniStat} onPress={() => router.push('/(tabs)/favorites')}>
                    <Text style={[styles.miniStatNum, { color: theme.textPrimary }]}>{stats.saved}</Text>
                    <Text style={[styles.miniStatLabel, { color: theme.textMuted }]}>Saved</Text>
                </TouchableOpacity>
                <View style={[styles.miniStatDivider, { backgroundColor: theme.border }]} />
                <View style={styles.miniStat}>
                    <Text style={[styles.miniStatNum, { color: theme.textPrimary }]}>{stats.checkins}</Text>
                    <Text style={[styles.miniStatLabel, { color: theme.textMuted }]}>Check-ins</Text>
                </View>
            </View>

            {/* Appearance Toggle */}
            <View style={[styles.menuSection, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <View style={[styles.menuItem, { borderBottomColor: theme.border }]}>
                    <View style={[styles.menuIconWrap, { backgroundColor: theme.primaryDim }]}>
                        <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={theme.primary} />
                    </View>
                    <View style={styles.menuText}>
                        <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>Dark Mode</Text>
                        <Text style={[styles.menuDesc, { color: theme.textMuted }]}>{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</Text>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: theme.border, true: theme.primaryDim }}
                        thumbColor={isDark ? theme.primary : '#f3f3f3'}
                        ios_backgroundColor={theme.border}
                    />
                </View>
            </View>

            {/* Menu Items */}
            <View style={[styles.menuSection, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                {menuItems.map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        onPress={item.onPress}
                        style={[styles.menuItem, { borderBottomColor: theme.border }, i === menuItems.length - 1 && { borderBottomWidth: 0 }]}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.menuIconWrap, { backgroundColor: theme.primaryDim }]}>
                            <Ionicons name={item.icon as any} size={20} color={theme.primary} />
                        </View>
                        <View style={styles.menuText}>
                            <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                            <Text style={[styles.menuDesc, { color: theme.textMuted }]}>{item.desc}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ height: 40 }} />

            {/* About Modal */}
            <Modal
                visible={aboutVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setAboutVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.aboutModal, { backgroundColor: theme.bgCard }]}>
                        <Image source={require('../../assets/logo.png')} style={styles.aboutLogo} resizeMode="contain" />
                        <Text style={[styles.aboutTitle, { color: theme.textPrimary }]}>HalalSpot</Text>
                        <Text style={[styles.aboutVersion, { color: theme.textMuted }]}>Version 1.0.0</Text>
                        <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
                            HalalSpot is your companion for finding the best halal dining experiences in Philadelphia and beyond.
                        </Text>
                        <TouchableOpacity 
                            style={[styles.closeAboutBtn, { backgroundColor: theme.primary }]}
                            onPress={() => setAboutVisible(false)}
                        >
                            <Text style={[styles.closeAboutText, { color: theme.bg }]}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    profileHeaderWrap: { overflow: 'hidden', position: 'relative' },
    profileHeaderPattern: { position: 'absolute', width: SCREEN_WIDTH * 1.5, height: SCREEN_WIDTH * 1.5, top: -SCREEN_WIDTH * 0.25, left: -SCREEN_WIDTH * 0.25 },
    profileHeader: { paddingTop: 70, paddingBottom: 80, alignItems: 'center', gap: 6 },
    avatarRing: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: 'rgba(0,201,107,0.4)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
    name: { fontSize: 22, color: '#fff', fontFamily: 'DMSerifDisplay' },
    email: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'Outfit' },
    signInBtn: { marginTop: 10, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 100 },
    signInBtnText: { fontFamily: 'Outfit-SemiBold', fontSize: 14, fontWeight: '700' },
    miniStats: { flexDirection: 'row', marginHorizontal: 20, borderRadius: 20, paddingVertical: 18, marginTop: -30, borderWidth: 1 },
    miniStat: { flex: 1, alignItems: 'center', gap: 2 },
    miniStatNum: { fontSize: 22, fontFamily: 'Outfit-SemiBold', fontWeight: '800' },
    miniStatLabel: { fontSize: 11, fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5 },
    miniStatDivider: { width: 1 },
    menuSection: { marginTop: 14, marginHorizontal: 20, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14, borderBottomWidth: 1 },
    menuIconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    menuText: { flex: 1, gap: 1 },
    menuLabel: { fontSize: 14, fontFamily: 'Outfit-SemiBold', fontWeight: '600' },
    menuDesc: { fontSize: 12, fontFamily: 'Outfit' },
    
    // About Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 40 },
    aboutModal: { width: '100%', borderRadius: 32, padding: 30, alignItems: 'center', gap: 12 },
    aboutLogo: { width: 80, height: 80 },
    aboutTitle: { fontSize: 24, fontFamily: 'DMSerifDisplay' },
    aboutVersion: { fontSize: 14, fontFamily: 'Outfit' },
    aboutText: { fontSize: 14, fontFamily: 'Outfit', textAlign: 'center', lineHeight: 22, marginTop: 8 },
    closeAboutBtn: { marginTop: 20, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 100 },
    closeAboutText: { fontFamily: 'Outfit-SemiBold', fontSize: 16, fontWeight: '700' },
});
