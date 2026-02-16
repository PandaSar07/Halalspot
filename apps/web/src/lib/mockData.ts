// Mock restaurant data for Philadelphia area
export interface Restaurant {
    id: string;
    name: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    certificationType: 'halal_certified' | 'muslim_owned' | 'halal_options';
    imageUrl: string;
    rating: number;
    reviewCount: number;
    phone?: string;
    website?: string;
    cuisine: string;
}

export const mockRestaurants: Restaurant[] = [
    {
        id: '1',
        name: 'Saad\'s Halal Restaurant',
        description: 'Authentic Middle Eastern cuisine with a modern twist. Family-owned since 2010.',
        address: '4500 Walnut St, Philadelphia, PA 19139',
        latitude: 39.9522,
        longitude: -75.2158,
        certificationType: 'halal_certified',
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
        rating: 4.8,
        reviewCount: 234,
        phone: '(215) 555-0123',
        cuisine: 'Middle Eastern'
    },
    {
        id: '2',
        name: 'Kabobeesh',
        description: 'Traditional Pakistani and Indian halal cuisine in the heart of Philadelphia.',
        address: '3925 Walnut St, Philadelphia, PA 19104',
        latitude: 39.9533,
        longitude: -75.2024,
        certificationType: 'halal_certified',
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
        rating: 4.6,
        reviewCount: 189,
        phone: '(215) 555-0124',
        cuisine: 'Pakistani/Indian'
    },
    {
        id: '3',
        name: 'Halal Cart',
        description: 'Famous street food style halal cart with chicken and lamb over rice.',
        address: '3401 Walnut St, Philadelphia, PA 19104',
        latitude: 39.9522,
        longitude: -75.1932,
        certificationType: 'muslim_owned',
        imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop',
        rating: 4.7,
        reviewCount: 456,
        phone: '(215) 555-0125',
        cuisine: 'Street Food'
    },
    {
        id: '4',
        name: 'Manakeesh Cafe',
        description: 'Lebanese bakery and cafe serving fresh manakeesh, shawarma, and more.',
        address: '4420 Walnut St, Philadelphia, PA 19104',
        latitude: 39.9525,
        longitude: -75.2112,
        certificationType: 'halal_certified',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
        rating: 4.9,
        reviewCount: 312,
        phone: '(215) 555-0126',
        website: 'https://manakeesh.com',
        cuisine: 'Lebanese'
    },
    {
        id: '5',
        name: 'Istanbul Grill',
        description: 'Turkish restaurant offering kebabs, pide, and traditional desserts.',
        address: '1337 Chestnut St, Philadelphia, PA 19107',
        latitude: 39.9496,
        longitude: -75.1627,
        certificationType: 'halal_certified',
        imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&h=600&fit=crop',
        rating: 4.5,
        reviewCount: 278,
        phone: '(215) 555-0127',
        cuisine: 'Turkish'
    },
    {
        id: '6',
        name: 'Marrakesh Restaurant',
        description: 'Moroccan dining experience with tagines, couscous, and mint tea.',
        address: '517 S Leithgow St, Philadelphia, PA 19147',
        latitude: 39.9423,
        longitude: -75.1499,
        certificationType: 'muslim_owned',
        imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop',
        rating: 4.7,
        reviewCount: 198,
        phone: '(215) 555-0128',
        cuisine: 'Moroccan'
    },
    {
        id: '7',
        name: 'Naf Naf Grill',
        description: 'Fast-casual Middle Eastern restaurant with build-your-own bowls and pitas.',
        address: '1529 Walnut St, Philadelphia, PA 19102',
        latitude: 39.9495,
        longitude: -75.1664,
        certificationType: 'halal_options',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
        rating: 4.4,
        reviewCount: 523,
        phone: '(215) 555-0129',
        website: 'https://nafnafgrill.com',
        cuisine: 'Middle Eastern'
    },
    {
        id: '8',
        name: 'Suraya',
        description: 'Modern Lebanese restaurant with a market, cafe, and garden.',
        address: '1528 Frankford Ave, Philadelphia, PA 19125',
        latitude: 39.9729,
        longitude: -75.1359,
        certificationType: 'halal_certified',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
        rating: 4.8,
        reviewCount: 412,
        phone: '(215) 555-0130',
        website: 'https://surayaphilly.com',
        cuisine: 'Lebanese'
    },
    {
        id: '9',
        name: 'Alyan\'s Restaurant',
        description: 'Family-style Middle Eastern restaurant with generous portions.',
        address: '603 S 4th St, Philadelphia, PA 19147',
        latitude: 39.9413,
        longitude: -75.1501,
        certificationType: 'halal_certified',
        imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop',
        rating: 4.6,
        reviewCount: 267,
        phone: '(215) 555-0131',
        cuisine: 'Middle Eastern'
    },
    {
        id: '10',
        name: 'Goldie',
        description: 'Vegan falafel shop with halal-friendly options and tahini shakes.',
        address: '1526 Sansom St, Philadelphia, PA 19102',
        latitude: 39.9503,
        longitude: -75.1663,
        certificationType: 'halal_options',
        imageUrl: 'https://images.unsplash.com/photo-1593252719532-348494f747be?w=800&h=600&fit=crop',
        rating: 4.5,
        reviewCount: 389,
        phone: '(215) 555-0132',
        cuisine: 'Vegan/Falafel'
    },
    {
        id: '11',
        name: 'Bitar\'s',
        description: 'Lebanese grocery and restaurant serving authentic homemade dishes.',
        address: '947 Federal St, Philadelphia, PA 19147',
        latitude: 39.9294,
        longitude: -75.1582,
        certificationType: 'muslim_owned',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
        rating: 4.7,
        reviewCount: 156,
        phone: '(215) 555-0133',
        cuisine: 'Lebanese'
    },
    {
        id: '12',
        name: 'Zaki Kabob House',
        description: 'Afghan restaurant specializing in kabobs, rice dishes, and fresh naan.',
        address: '4600 Baltimore Ave, Philadelphia, PA 19143',
        latitude: 39.9474,
        longitude: -75.2189,
        certificationType: 'halal_certified',
        imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&h=600&fit=crop',
        rating: 4.8,
        reviewCount: 201,
        phone: '(215) 555-0134',
        cuisine: 'Afghan'
    }
];

// Helper function to calculate distance between two coordinates (in miles)
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Get certification badge color
export function getCertificationColor(type: Restaurant['certificationType']): string {
    switch (type) {
        case 'halal_certified':
            return 'bg-green-100 text-green-800';
        case 'muslim_owned':
            return 'bg-blue-100 text-blue-800';
        case 'halal_options':
            return 'bg-purple-100 text-purple-800';
    }
}

// Get certification label
export function getCertificationLabel(type: Restaurant['certificationType']): string {
    switch (type) {
        case 'halal_certified':
            return 'Halal Certified';
        case 'muslim_owned':
            return 'Muslim Owned';
        case 'halal_options':
            return 'Halal Options';
    }
}
