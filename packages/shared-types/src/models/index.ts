import { z } from 'zod';
import type { Database } from '../database.types';

// Database table types
export type User = Database['public']['Tables']['users']['Row'];
export type Restaurant = Database['public']['Tables']['restaurants']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type RestaurantInsert = Database['public']['Tables']['restaurants']['Insert'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
export type FavoriteInsert = Database['public']['Tables']['favorites']['Insert'];

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type RestaurantUpdate = Database['public']['Tables']['restaurants']['Update'];
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];
export type FavoriteUpdate = Database['public']['Tables']['favorites']['Update'];

// Enums
export type CertificationType = Database['public']['Enums']['certification_type'];
export type RestaurantStatus = Database['public']['Enums']['restaurant_status'];

// Geolocation types
export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface RestaurantWithDistance extends Restaurant {
    distance_meters?: number;
    avg_rating?: number;
}

// Validation schemas
export const coordinatesSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
});

export const restaurantInsertSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    location: coordinatesSchema,
    address: z.string().max(500).optional(),
    cuisine: z.string().max(100).optional(),
    opening_hours: z.any().optional(),
    certification_type: z.enum(['halal_certified', 'muslim_owned', 'halal_options']),
    certification_details: z.string().max(500).optional(),
    phone: z.string().max(20).optional(),
    website: z.string().url().optional(),
    image_url: z.string().url().optional(),
});

export const reviewInsertSchema = z.object({
    restaurant_id: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional(),
});

export const userUpdateSchema = z.object({
    full_name: z.string().min(1).max(255).optional(),
    avatar_url: z.string().url().optional(),
});
