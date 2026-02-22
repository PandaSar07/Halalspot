'use client';

import { useState, useEffect } from 'react';
import { Search, LayoutGrid, Map as MapIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { RestaurantGrid } from '@/components/restaurants/RestaurantGrid';
import { RestaurantMap } from '@/components/restaurants/RestaurantMap';
import type { Restaurant } from '@halalspot/shared-types';

export default function RestaurantsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        fetchRestaurants();
    }, [searchQuery, selectedType]);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            let query = supabase.from('restaurants').select('*');

            if (searchQuery) {
                query = query.ilike('name', `%${searchQuery}%`);
            }

            if (selectedType !== 'all') {
                query = query.eq('certification_type', selectedType);
            }

            const { data, error } = await query;
            if (error) throw error;
            setRestaurants(data || []);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        Discover Halal Restaurants
                    </h1>

                    {/* Search and Filters */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search restaurants..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                            />
                        </div>

                        {/* Filter by certification type */}
                        <div className="flex gap-2">
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                            >
                                <option value="all">All Types</option>
                                <option value="halal_certified">Halal Certified</option>
                                <option value="muslim_owned">Muslim Owned</option>
                                <option value="halal_options">Halal Options</option>
                            </select>

                            {/* View toggle */}
                            <div className="flex gap-2 border border-gray-300 rounded-lg p-1 bg-white">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded ${viewMode === 'grid'
                                            ? 'bg-primary text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <LayoutGrid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`p-2 rounded ${viewMode === 'map'
                                            ? 'bg-primary text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <MapIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results count */}
                    <p className="text-sm text-gray-600 mt-4">
                        {loading ? 'Searching...' : `Found ${restaurants.length} restaurant${restaurants.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    viewMode === 'grid' ? (
                        <RestaurantGrid restaurants={restaurants} />
                    ) : (
                        <RestaurantMap restaurants={restaurants} />
                    )
                )}
            </div>
        </div>
    );
}
