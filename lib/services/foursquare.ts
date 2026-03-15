


export interface NearbyPlace {
    id: string;
    name: string;
    category: string;
    categoryIcon: string;
    address: string;
    distance: number;
    lat: number;
    lng: number;
    type: string;
}

const CATEGORY_MAP: Record<string, { icon: string; label: string }> = {
    restaurant: { icon: '🍽️', label: 'Restaurant' },
    cafe: { icon: '☕', label: 'Café' },
    bar: { icon: '🍺', label: 'Bar' },
    fast_food: { icon: '🍔', label: 'Fast Food' },
    hotel: { icon: '🏨', label: 'Hotel' },
    hostel: { icon: '🛏️', label: 'Hostel' },
    museum: { icon: '🏛️', label: 'Museum' },
    gallery: { icon: '🎨', label: 'Gallery' },
    theatre: { icon: '🎭', label: 'Theatre' },
    cinema: { icon: '🎬', label: 'Cinema' },
    park: { icon: '🌳', label: 'Park' },
    garden: { icon: '🌺', label: 'Garden' },
    place_of_worship: { icon: '⛪', label: 'Place of Worship' },
    monument: { icon: '🗿', label: 'Monument' },
    memorial: { icon: '🏛️', label: 'Memorial' },
    viewpoint: { icon: '👀', label: 'Viewpoint' },
    beach_resort: { icon: '🏖️', label: 'Beach' },
    marketplace: { icon: '🛍️', label: 'Market' },
    supermarket: { icon: '🛒', label: 'Supermarket' },
    pharmacy: { icon: '💊', label: 'Pharmacy' },
    hospital: { icon: '🏥', label: 'Hospital' },
    atm: { icon: '🏧', label: 'ATM' },
    bus_station: { icon: '🚌', label: 'Bus Station' },
    train_station: { icon: '🚉', label: 'Train Station' },
    airport: { icon: '✈️', label: 'Airport' },
};

function getCategory(tags: any): { icon: string; label: string } {
    const amenity = tags?.amenity;
    const tourism = tags?.tourism;
    const shop = tags?.shop;
    const leisure = tags?.leisure;

    if (amenity && CATEGORY_MAP[amenity]) return CATEGORY_MAP[amenity];
    if (tourism && CATEGORY_MAP[tourism]) return CATEGORY_MAP[tourism];
    if (tourism === 'attraction') return { icon: '⭐', label: 'Attraction' };
    if (tourism === 'hotel') return CATEGORY_MAP.hotel;
    if (shop) return { icon: '🛍️', label: 'Shop' };
    if (leisure === 'park') return CATEGORY_MAP.park;
    if (leisure === 'garden') return CATEGORY_MAP.garden;

    return { icon: '📍', label: 'Place' };
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function searchNearbyPlaces(
    lat: number,
    lng: number,
    category: string = 'all',
    limit: number = 12,
    radius: number = 2000
): Promise<NearbyPlace[]> {
    try {
        let amenityFilter = '';
        switch (category) {
            case 'food': amenityFilter = 'node["amenity"~"restaurant|fast_food"]'; break;
            case 'cafe': amenityFilter = 'node["amenity"="cafe"]'; break;
            case 'sights': amenityFilter = 'node["tourism"~"attraction|museum|monument|memorial|viewpoint"]'; break;
            case 'shopping': amenityFilter = 'node["shop"]'; break;
            default: amenityFilter = 'node["amenity"~"restaurant|cafe|bar|fast_food"]; node["tourism"~"attraction|museum|monument|hotel"]; node["shop"]'; break;
        }

        const query = `
            [out:json][timeout:10];
            (
              ${amenityFilter}(around:${radius},${lat},${lng});
            );
            out body ${limit * 2};
        `;

        const res = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (!res.ok) {
            console.error(`Overpass API error: ${res.status}`);
            return [];
        }

        const data = await res.json();

        const places: NearbyPlace[] = (data.elements || [])
            .filter((el: any) => el.tags?.name)
            .map((el: any) => {
                const cat = getCategory(el.tags);
                return {
                    id: el.id.toString(),
                    name: el.tags.name,
                    category: cat.label,
                    categoryIcon: cat.icon,
                    address: [el.tags['addr:street'], el.tags['addr:city']].filter(Boolean).join(', ') || '',
                    distance: Math.round(haversineDistance(lat, lng, el.lat, el.lon)),
                    lat: el.lat,
                    lng: el.lon,
                    type: el.tags.amenity || el.tags.tourism || el.tags.shop || 'place',
                };
            })
            .sort((a: NearbyPlace, b: NearbyPlace) => a.distance - b.distance)
            .slice(0, limit);

        return places;
    } catch (error) {
        console.error('Overpass API search failed:', error);
        return [];
    }
}
