import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
            </View>

            {/* Avatar */}
            <View style={styles.avatarSection}>
                <LinearGradient colors={['#10b981', '#059669']} style={styles.avatar}>
                    <Ionicons name="person" size={40} color="#fff" />
                </LinearGradient>
                <Text style={styles.name}>Guest User</Text>
                <Text style={styles.email}>Sign in to save your favorites</Text>
                <TouchableOpacity style={styles.signInButton}>
                    <Text style={styles.signInText}>Sign In</Text>
                </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
                <MenuItem icon="notifications-outline" label="Notifications" />
                <MenuItem icon="moon-outline" label="Dark Mode" />
                <MenuItem icon="language-outline" label="Language" value="English" />
                <MenuItem icon="location-outline" label="Location" value="Philadelphia" />
            </View>

            <View style={styles.menuSection}>
                <MenuItem icon="help-circle-outline" label="Help & Support" />
                <MenuItem icon="document-text-outline" label="Terms of Service" />
                <MenuItem icon="shield-checkmark-outline" label="Privacy Policy" />
                <MenuItem icon="star-outline" label="Rate App" />
            </View>

            <Text style={styles.version}>HalalSpot v1.0.0</Text>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

function MenuItem({ icon, label, value }: { icon: string; label: string; value?: string }) {
    return (
        <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
                <Ionicons name={icon as any} size={22} color="#6b7280" />
                <Text style={styles.menuLabel}>{label}</Text>
            </View>
            <View style={styles.menuItemRight}>
                {value && <Text style={styles.menuValue}>{value}</Text>}
                <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 4 },
    title: { fontSize: 30, fontWeight: '800', color: '#111827' },
    avatarSection: { alignItems: 'center', paddingVertical: 24 },
    avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    name: { fontSize: 22, fontWeight: '700', color: '#111827' },
    email: { fontSize: 14, color: '#6b7280', marginTop: 2 },
    signInButton: { marginTop: 14, backgroundColor: '#10b981', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
    signInText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    menuSection: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f3f4f6' },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    menuItemRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    menuLabel: { fontSize: 15, fontWeight: '500', color: '#374151' },
    menuValue: { fontSize: 14, color: '#9ca3af' },
    version: { textAlign: 'center', fontSize: 13, color: '#d1d5db', marginTop: 8 },
});
