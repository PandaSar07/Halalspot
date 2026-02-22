'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Phone } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getCertificationColor, getCertificationLabel } from '@/lib/utils';
import type { Restaurant } from '@halalspot/shared-types';

interface RestaurantCardProps {
    restaurant: Restaurant;
    distance?: number;
}

export function RestaurantCard({ restaurant, distance }: RestaurantCardProps) {
    return (
        <Link href={`/restaurants/${restaurant.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
                <div className="relative h-48 w-full">
                    <Image
                        src={restaurant.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop'}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCertificationColor(restaurant.certification_type)}`}>
                            {getCertificationLabel(restaurant.certification_type)}
                        </span>
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-1">
                        {restaurant.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-2">Mediterranean</p>

                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-gray-900">4.5</span>
                        </div>
                        <span className="text-sm text-gray-500">
                            (0 reviews)
                        </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {restaurant.description}
                    </p>

                    <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{restaurant.address}</span>
                    </div>

                    {distance && (
                        <div className="mt-2 text-sm font-medium text-primary">
                            {(distance / 1609.34).toFixed(1)} miles away
                        </div>
                    )}

                    {restaurant.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                            <Phone className="w-4 h-4" />
                            <span>{restaurant.phone}</span>
                        </div>
                    )}
                </div>
            </Card>
        </Link>
    );
}
