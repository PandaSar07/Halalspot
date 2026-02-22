'use client';

import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Restaurant } from '@halalspot/shared-types';

interface RestaurantMapProps {
    restaurants: Restaurant[];
}

export function RestaurantMap({ restaurants }: RestaurantMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!mapboxToken) {
            console.error('Mapbox token not found');
            return;
        }

        mapboxgl.accessToken = mapboxToken;

        // Center on Philadelphia
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-75.1652, 39.9526], // Philadelphia coordinates
            zoom: 12,
        });

        map.current.on('load', () => {
            setMapLoaded(true);
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        return () => {
            map.current?.remove();
        };
    }, []);

    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Remove existing markers
        const markers = document.querySelectorAll('.mapboxgl-marker');
        markers.forEach(marker => marker.remove());

        // Add markers for each restaurant
        restaurants.forEach((restaurant) => {
            // Extract coordinates from location field
            // Assuming location is { type: 'Point', coordinates: [lng, lat] }
            let longitude = -75.1652;
            let latitude = 39.9526;

            if (restaurant.location && typeof restaurant.location === 'object') {
                const loc = restaurant.location as any;
                if (loc.coordinates && Array.isArray(loc.coordinates)) {
                    [longitude, latitude] = loc.coordinates;
                }
            }

            // Create custom marker element
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.width = '32px';
            el.style.height = '32px';
            el.style.borderRadius = '50%';
            el.style.backgroundColor = '#10b981';
            el.style.border = '3px solid white';
            el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            el.style.cursor = 'pointer';

            // Create popup
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-base mb-1 text-gray-900">${restaurant.name}</h3>
          <p class="text-sm text-gray-600 mb-1">Mediterranean</p>
          <div class="flex items-center gap-1 mb-2">
            <span class="text-yellow-500">★</span>
            <span class="text-sm font-medium text-gray-900">4.5</span>
            <span class="text-sm text-gray-500">(0)</span>
          </div>
          <p class="text-xs text-gray-600">${restaurant.address || ''}</p>
          <a href="/restaurants/${restaurant.id}" class="text-sm text-primary hover:underline mt-2 inline-block">
            View Details →
          </a>
        </div>
      `);

            // Add marker to map
            new mapboxgl.Marker(el)
                .setLngLat([longitude, latitude])
                .setPopup(popup)
                .addTo(map.current!);
        });
    }, [restaurants, mapLoaded]);

    return (
        <div className="relative w-full h-full min-h-[600px] rounded-xl overflow-hidden">
            <div ref={mapContainer} className="absolute inset-0" />
        </div>
    );
}
