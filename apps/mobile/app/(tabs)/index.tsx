import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function ExploreScreen() {
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <Text style={styles.title}>HalalSpot</Text>
            <Text style={styles.subtitle}>Find halal restaurants near you</Text>
            <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Map will be displayed here</Text>
                <Text style={styles.hint}>
                    Mapbox integration ready - add your token to .env
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#22c55e',
        textAlign: 'center',
        marginTop: 60,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 20,
    },
    placeholderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    hint: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});
