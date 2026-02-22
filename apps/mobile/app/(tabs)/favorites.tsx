import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Radius, Shadow } from '../../src/lib/theme';
import { useTheme } from '../../src/lib/ThemeContext';

export default function FavoritesScreen() {
    const { theme } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Saved</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your favorite spots</Text>
            </View>
            <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: theme.primaryDim, borderColor: theme.primary + '44' }]}>
                    <Ionicons name="heart" size={38} color={theme.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No saved spots yet</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                    Tap the heart icon on any restaurant to save it here for quick access.
                </Text>
                <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: theme.primary }]}>
                    <Text style={[styles.exploreBtnText, { color: theme.bg }]}>Explore Restaurants</Text>
                    <Ionicons name="arrow-forward" size={16} color={theme.bg} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 62, paddingHorizontal: 20, paddingBottom: 8 },
    title: { fontSize: 30, fontFamily: 'DMSerifDisplay', letterSpacing: -1 },
    subtitle: { fontSize: 13, fontFamily: 'Outfit', marginTop: 2 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 14 },
    emptyIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    emptyTitle: { fontSize: 20, fontFamily: 'Outfit-SemiBold', fontWeight: '700', textAlign: 'center' },
    emptySubtitle: { fontSize: 14, fontFamily: 'Outfit', textAlign: 'center', lineHeight: 20 },
    exploreBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 100, marginTop: 6 },
    exploreBtnText: { fontFamily: 'Outfit-SemiBold', fontSize: 15, fontWeight: '700' },
});
