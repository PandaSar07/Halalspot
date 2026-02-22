import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '../../src/lib/theme';
import { LinearGradient } from 'expo-linear-gradient';

const menuItems = [
    { icon: 'heart-outline', label: 'Saved Restaurants', desc: 'Your bookmarked spots' },
    { icon: 'star-outline', label: 'My Reviews', desc: 'Reviews you\'ve written' },
    { icon: 'notifications-outline', label: 'Notifications', desc: 'Manage alerts' },
    { icon: 'shield-outline', label: 'Privacy & Security', desc: 'Account settings' },
    { icon: 'help-circle-outline', label: 'Help & Support', desc: 'FAQs and contact' },
    { icon: 'information-circle-outline', label: 'About HalalSpot', desc: 'Version 1.0.0' },
];

export default function ProfileScreen() {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Avatar Header */}
            <LinearGradient colors={['#0F2018', '#0F0F0F']} style={styles.profileHeader}>
                <View style={styles.avatarRing}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={36} color={Colors.primary} />
                    </View>
                </View>
                <Text style={styles.name}>Guest User</Text>
                <Text style={styles.email}>Sign in to access your profile</Text>
                <TouchableOpacity style={styles.signInBtn}>
                    <Text style={styles.signInBtnText}>Sign In</Text>
                </TouchableOpacity>
            </LinearGradient>

            {/* Stats */}
            <View style={styles.miniStats}>
                <View style={styles.miniStat}>
                    <Text style={styles.miniStatNum}>0</Text>
                    <Text style={styles.miniStatLabel}>Reviews</Text>
                </View>
                <View style={styles.miniStatDivider} />
                <View style={styles.miniStat}>
                    <Text style={styles.miniStatNum}>0</Text>
                    <Text style={styles.miniStatLabel}>Saved</Text>
                </View>
                <View style={styles.miniStatDivider} />
                <View style={styles.miniStat}>
                    <Text style={styles.miniStatNum}>0</Text>
                    <Text style={styles.miniStatLabel}>Check-ins</Text>
                </View>
            </View>

            {/* Menu */}
            <View style={styles.menuSection}>
                {menuItems.map((item, i) => (
                    <TouchableOpacity key={i} style={styles.menuItem} activeOpacity={0.7}>
                        <View style={styles.menuIconWrap}>
                            <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.menuText}>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <Text style={styles.menuDesc}>{item.desc}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    profileHeader: {
        paddingTop: 70, paddingBottom: 28, alignItems: 'center', gap: 6,
    },
    avatarRing: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: Colors.primary + '55', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryDim, alignItems: 'center', justifyContent: 'center' },
    name: { fontSize: 22, color: Colors.textPrimary, fontFamily: 'DMSerifDisplay' },
    email: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'Outfit' },
    signInBtn: {
        marginTop: 10, backgroundColor: Colors.primary, paddingHorizontal: 28,
        paddingVertical: 12, borderRadius: Radius.pill,
    },
    signInBtnText: { color: Colors.bg, fontFamily: 'Outfit-SemiBold', fontSize: 14, fontWeight: '700' },
    miniStats: {
        flexDirection: 'row', backgroundColor: Colors.bgCard, marginHorizontal: 20,
        borderRadius: Radius.xl, paddingVertical: 18, marginTop: 16,
        borderWidth: 1, borderColor: Colors.border,
    },
    miniStat: { flex: 1, alignItems: 'center', gap: 2 },
    miniStatNum: { fontSize: 22, color: Colors.textPrimary, fontFamily: 'Outfit-SemiBold', fontWeight: '800' },
    miniStatLabel: { fontSize: 11, color: Colors.textMuted, fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5 },
    miniStatDivider: { width: 1, backgroundColor: Colors.border },
    menuSection: { marginTop: 20, marginHorizontal: 20, backgroundColor: Colors.bgCard, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
    menuIconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.primaryDim, alignItems: 'center', justifyContent: 'center' },
    menuText: { flex: 1, gap: 1 },
    menuLabel: { fontSize: 14, color: Colors.textPrimary, fontFamily: 'Outfit-SemiBold', fontWeight: '600' },
    menuDesc: { fontSize: 12, color: Colors.textMuted, fontFamily: 'Outfit' },
});
