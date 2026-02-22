import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '../../src/lib/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function FavoritesScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Saved</Text>
                <Text style={styles.subtitle}>Your favorite spots</Text>
            </View>
            <View style={styles.emptyState}>
                <LinearGradient
                    colors={[Colors.primaryDim, 'transparent']}
                    style={styles.emptyGlow}
                />
                <View style={styles.emptyIcon}>
                    <Ionicons name="heart" size={38} color={Colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No saved spots yet</Text>
                <Text style={styles.emptySubtitle}>
                    Tap the heart icon on any restaurant to save it here for quick access.
                </Text>
                <TouchableOpacity style={styles.exploreBtn}>
                    <Text style={styles.exploreBtnText}>Explore Restaurants</Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.bg} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: { paddingTop: 62, paddingHorizontal: 20, paddingBottom: 8 },
    title: { fontSize: 30, color: Colors.textPrimary, fontFamily: 'DMSerifDisplay', letterSpacing: -1 },
    subtitle: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'Outfit', marginTop: 2 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 14, position: 'relative' },
    emptyGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, opacity: 0.4, top: '30%' },
    emptyIcon: {
        width: 76, height: 76, borderRadius: 38,
        backgroundColor: Colors.primaryDim, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: Colors.primary + '44',
    },
    emptyTitle: { fontSize: 20, color: Colors.textPrimary, fontFamily: 'Outfit-SemiBold', fontWeight: '700', textAlign: 'center' },
    emptySubtitle: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'Outfit', textAlign: 'center', lineHeight: 20 },
    exploreBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14,
        borderRadius: Radius.pill, marginTop: 6,
    },
    exploreBtnText: { color: Colors.bg, fontFamily: 'Outfit-SemiBold', fontSize: 15, fontWeight: '700' },
});
