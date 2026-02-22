import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/lib/ThemeContext';

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textMuted,
                tabBarStyle: {
                    backgroundColor: theme.tabBar,
                    borderTopWidth: 1,
                    borderTopColor: theme.tabBorder,
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontFamily: 'Outfit-SemiBold',
                    marginTop: 0,
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconWrap, focused && { backgroundColor: theme.primaryDim }]}>
                            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconWrap, focused && { backgroundColor: theme.primaryDim }]}>
                            <Ionicons name={focused ? 'search' : 'search-outline'} size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: 'Saved',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconWrap, focused && { backgroundColor: theme.primaryDim }]}>
                            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconWrap, focused && { backgroundColor: theme.primaryDim }]}>
                            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    iconWrap: {
        width: 36, height: 36,
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 10,
    },
});
