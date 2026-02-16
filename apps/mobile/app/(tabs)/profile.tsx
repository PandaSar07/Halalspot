import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace('/(auth)/login');
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Profile</Text>
                <Text style={styles.message}>Please sign in to view your profile</Text>
                <Button title="Sign In" onPress={() => router.push('/(auth)/login')} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.email}>{user.email}</Text>
            <Button title="Sign Out" onPress={handleSignOut} color="#ef4444" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    message: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    email: {
        fontSize: 18,
        marginBottom: 20,
        color: '#333',
    },
});
