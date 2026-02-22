'use client';

import type { Restaurant } from '@halalspot/shared-types';
import { RestaurantCard } from './RestaurantCard';

interface RestaurantGridProps {
    restaurants: (Restaurant & { distance_meters?: number })[];
}

export function RestaurantGrid({ restaurants }: RestaurantGridProps) {
    if (restaurants.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No restaurants found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
        </div>
    );
}
