import type { SupabaseClient } from '../client';
import type { Coordinates, RestaurantWithDistance } from '@halalspot/shared-types';

/**
 * Query nearby restaurants using PostGIS
 */
export async function getNearbyRestaurants(
    client: SupabaseClient,
    coordinates: Coordinates,
    radiusMeters: number = 5000
): Promise<RestaurantWithDistance[]> {
    const { data, error } = await client.rpc('nearby_restaurants', {
        lat: coordinates.latitude,
        lng: coordinates.longitude,
        radius_meters: radiusMeters,
    });

    if (error) throw error;
    return (data as unknown as RestaurantWithDistance[]) || [];
}

/**
 * Get a single restaurant by ID with average rating
 */
export async function getRestaurantById(client: SupabaseClient, id: string) {
    const { data: restaurant, error: restaurantError } = await client
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

    if (restaurantError) throw restaurantError;

    const { data: avgRating } = await client.rpc('restaurant_avg_rating', {
        restaurant_id: id,
    });

    return {
        ...restaurant,
        avg_rating: avgRating || 0,
    };
}

/**
 * Get reviews for a restaurant
 */
export async function getRestaurantReviews(client: SupabaseClient, restaurantId: string) {
    const { data, error } = await client
        .from('reviews')
        .select(`
      *,
      user:users(id, full_name, avatar_url)
    `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Get a single user's review for a restaurant (null if not reviewed yet)
 */
export async function getUserReview(client: SupabaseClient, userId: string, restaurantId: string) {
    const { data, error } = await client
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .maybeSingle();

    if (error) throw error;
    return data;
}

/**
 * Submit or update a review for a restaurant (upsert — one review per user per restaurant)
 */
export async function submitReview(
    client: SupabaseClient,
    { restaurantId, userId, rating, comment }: { restaurantId: string; userId: string; rating: number; comment: string }
) {
    const { data, error } = await client
        .from('reviews')
        .upsert(
            { restaurant_id: restaurantId, user_id: userId, rating, comment, updated_at: new Date().toISOString() },
            { onConflict: 'restaurant_id,user_id' }
        )
        .select()
        .single();

    if (error) throw error;
    return data;
}


/**
 * Get user's favorite restaurants
 */
export async function getUserFavorites(client: SupabaseClient, userId: string) {
    const { data, error } = await client
        .from('favorites')
        .select(`
      *,
      restaurant:restaurants(*)
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Check if a restaurant is favorited by the user
 */
export async function isRestaurantFavorited(
    client: SupabaseClient,
    userId: string,
    restaurantId: string
): Promise<boolean> {
    const { data, error } = await client
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .single();

    return !error && !!data;
}

/**
 * Toggle favorite status for a restaurant
 */
export async function toggleFavorite(
    client: SupabaseClient,
    userId: string,
    restaurantId: string
): Promise<boolean> {
    const isFavorited = await isRestaurantFavorited(client, userId, restaurantId);

    if (isFavorited) {
        const { error } = await client
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('restaurant_id', restaurantId);

        if (error) throw error;
        return false;
    } else {
        const { error } = await client
            .from('favorites')
            .insert({ user_id: userId, restaurant_id: restaurantId });

        if (error) throw error;
        return true;
    }
}

/**
 * Get menu items for a restaurant, optionally filtered by category
 */
export async function getMenuItems(
    client: SupabaseClient,
    restaurantId: string,
    category?: string
) {
    let query = (client as any)
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('is_deal', { ascending: false })
        .order('created_at', { ascending: true });

    if (category && category !== 'All') {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

/**
 * Get distinct menu categories for a restaurant
 */
export async function getMenuCategories(
    client: SupabaseClient,
    restaurantId: string
): Promise<string[]> {
    const { data, error } = await (client as any)
        .from('menu_items')
        .select('category')
        .eq('restaurant_id', restaurantId);

    if (error) throw error;
    const categories = [...new Set<string>((data || []).map((r: any) => String(r.category)))];

    return ['Menu', ...categories.filter(c => c !== 'Most Ordered' && c !== 'Menu'), 'Deals'];
}
