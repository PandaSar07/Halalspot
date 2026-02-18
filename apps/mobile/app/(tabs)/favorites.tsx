import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Favorites</Text>
                <Text style={styles.subtitle}>Your saved restaurants</Text>
            </View>
            <View style={styles.empty}>
                <View style={styles.iconCircle}>
                    <Ionicons name="heart-outline" size={48} color="#d1d5db" />
                </View>
                <Text style={styles.emptyTitle}>No favorites yet</Text>
                <Text style={styles.emptySubtext}>
                    Tap the heart icon on a restaurant to save it here for quick access.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
    title: { fontSize: 30, fontWeight: '800', color: '#111827' },
    subtitle: { fontSize: 15, color: '#6b7280', marginTop: 2 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
    iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#374151', marginBottom: 8 },
    emptySubtext: { fontSize: 14, color: '#9ca3af', textAlign: 'center', maxWidth: 260, lineHeight: 20 },
});
