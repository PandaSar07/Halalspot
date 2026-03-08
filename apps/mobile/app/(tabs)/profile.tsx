import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Radius, Shadow } from '../../src/lib/theme';
import { useTheme } from '../../src/lib/ThemeContext';
import { useAuth } from '../../src/lib/AuthContext';

const menuItems = [
    { icon: 'heart-outline', label: 'Saved Restaurants', desc: 'Your bookmarked spots' },
    { icon: 'star-outline', label: 'My Reviews', desc: 'Reviews you\'ve written' },
    { icon: 'notifications-outline', label: 'Notifications', desc: 'Manage alerts' },
    { icon: 'shield-outline', label: 'Privacy & Security', desc: 'Account settings' },
    { icon: 'help-circle-outline', label: 'Help & Support', desc: 'FAQs and contact' },
    { icon: 'information-circle-outline', label: 'About HalalSpot', desc: 'Version 1.0.0' },
];

export default function ProfileScreen() {
    const { theme, isDark, toggleTheme } = useTheme();
    const { user, signOut } = useAuth();

    const displayName = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? 'Halal Spot User';
    const displayEmail = user?.email ?? '';

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

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} showsVerticalScrollIndicator={false}>
            {/* Avatar Header */}
            <LinearGradient colors={theme.heroBg} style={styles.profileHeader}>
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
                    <TouchableOpacity style={[styles.signInBtn, { backgroundColor: theme.primary }]}>
                        <Text style={[styles.signInBtnText, { color: theme.bg }]}>Sign In</Text>
                    </TouchableOpacity>
                )}
            </LinearGradient>

            {/* Mini Stats */}
            <View style={[styles.miniStats, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <View style={styles.miniStat}>
                    <Text style={[styles.miniStatNum, { color: theme.textPrimary }]}>0</Text>
                    <Text style={[styles.miniStatLabel, { color: theme.textMuted }]}>Reviews</Text>
                </View>
                <View style={[styles.miniStatDivider, { backgroundColor: theme.border }]} />
                <View style={styles.miniStat}>
                    <Text style={[styles.miniStatNum, { color: theme.textPrimary }]}>0</Text>
                    <Text style={[styles.miniStatLabel, { color: theme.textMuted }]}>Saved</Text>
                </View>
                <View style={[styles.miniStatDivider, { backgroundColor: theme.border }]} />
                <View style={styles.miniStat}>
                    <Text style={[styles.miniStatNum, { color: theme.textPrimary }]}>0</Text>
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    profileHeader: { paddingTop: 70, paddingBottom: 28, alignItems: 'center', gap: 6 },
    avatarRing: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: 'rgba(0,201,107,0.4)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
    name: { fontSize: 22, color: '#fff', fontFamily: 'DMSerifDisplay' },
    email: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'Outfit' },
    signInBtn: { marginTop: 10, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 100 },
    signInBtnText: { fontFamily: 'Outfit-SemiBold', fontSize: 14, fontWeight: '700' },
    miniStats: { flexDirection: 'row', marginHorizontal: 20, borderRadius: 20, paddingVertical: 18, marginTop: 16, borderWidth: 1 },
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
});
