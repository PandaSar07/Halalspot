'use client';

import { useState } from 'react';
import { Search, Filter, LayoutGrid, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { mockRestaurants, Restaurant } from '@/lib/mockData';
import { RestaurantGrid } from '@/components/restaurants/RestaurantGrid';
import { RestaurantMap } from '@/components/restaurants/RestaurantMap';

export default function RestaurantsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

    // Filter restaurants based on search and type
    const filteredRestaurants = mockRestaurants.filter((restaurant) => {
        const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.address.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = selectedType === 'all' || restaurant.certificationType === selectedType;

        return matchesSearch && matchesType;
    });

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
                                placeholder="Search restaurants, cuisine, or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Filter by certification type */}
                        <div className="flex gap-2">
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
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
                        Found {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {viewMode === 'grid' ? (
                    <RestaurantGrid restaurants={filteredRestaurants} />
                ) : (
                    <RestaurantMap restaurants={filteredRestaurants} />
                )}
            </div>
        </div>
    );
}
