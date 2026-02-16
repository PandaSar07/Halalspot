import { createClient } from '@supabase/supabase-js';
import type { Database } from '@halalspot/shared-types';

export interface SupabaseClientOptions {
    supabaseUrl: string;
    supabaseKey: string;
    options?: {
        auth?: {
            persistSession?: boolean;
            autoRefreshToken?: boolean;
        };
    };
}

/**
 * Create a Supabase client instance
 * This is a factory function that can be used in both web and mobile apps
 */
export function createSupabaseClient({
    supabaseUrl,
    supabaseKey,
    options = {},
}: SupabaseClientOptions) {
    return createClient<Database>(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: options.auth?.persistSession ?? true,
            autoRefreshToken: options.auth?.autoRefreshToken ?? true,
        },
    });
}

export type SupabaseClient = ReturnType<typeof createSupabaseClient>;
