import React, { createContext, useContext, useState } from 'react';

type MapContextType = {
    highlightedRestaurantId: string | null;
    setHighlightedRestaurantId: (id: string | null) => void;
};

const MapContext = createContext<MapContextType>({
    highlightedRestaurantId: null,
    setHighlightedRestaurantId: () => {},
});

export function MapProvider({ children }: { children: React.ReactNode }) {
    const [highlightedRestaurantId, setHighlightedRestaurantId] = useState<string | null>(null);

    return (
        <MapContext.Provider value={{ highlightedRestaurantId, setHighlightedRestaurantId }}>
            {children}
        </MapContext.Provider>
    );
}

export const useMapContext = () => useContext(MapContext);
