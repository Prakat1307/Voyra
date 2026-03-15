


let cachedToken: { token: string; expires: number } | null = null;

async function getAmadeusToken(): Promise<string> {
    
    if (cachedToken && Date.now() < cachedToken.expires) {
        return cachedToken.token;
    }

    const key = process.env.AMADEUS_API_KEY;
    const secret = process.env.AMADEUS_API_SECRET;
    if (!key || !secret) throw new Error('Amadeus API credentials missing');

    const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${key}&client_secret=${secret}`,
    });

    if (!res.ok) throw new Error(`Amadeus auth error: ${res.status}`);
    const data = await res.json();

    cachedToken = {
        token: data.access_token,
        expires: Date.now() + (data.expires_in - 60) * 1000, 
    };

    return cachedToken.token;
}

export interface FlightOffer {
    id: string;
    price: string;
    currency: string;
    airline: string;
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    stops: number;
    cabin: string;
}

export async function searchFlights(
    origin: string,
    destination: string,
    departureDate: string,
    adults: number = 1,
    maxResults: number = 5
): Promise<FlightOffer[]> {
    try {
        const token = await getAmadeusToken();
        const params = new URLSearchParams({
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate,
            adults: adults.toString(),
            max: maxResults.toString(),
            currencyCode: 'USD',
        });

        const res = await fetch(
            `https://test.api.amadeus.com/v2/shopping/flight-offers?${params}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
            const errBody = await res.text();
            console.error('Amadeus flight error:', errBody);
            return [];
        }

        const data = await res.json();
        return (data.data || []).map((offer: any) => {
            const seg = offer.itineraries[0]?.segments;
            const firstSeg = seg?.[0];
            const lastSeg = seg?.[seg.length - 1];

            return {
                id: offer.id,
                price: offer.price?.total || '—',
                currency: offer.price?.currency || 'USD',
                airline: firstSeg?.carrierCode || '—',
                departure: firstSeg?.departure?.iataCode || origin,
                arrival: lastSeg?.arrival?.iataCode || destination,
                departureTime: firstSeg?.departure?.at || '',
                arrivalTime: lastSeg?.arrival?.at || '',
                duration: offer.itineraries[0]?.duration?.replace('PT', '') || '—',
                stops: (seg?.length || 1) - 1,
                cabin: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
            };
        });
    } catch (error) {
        console.error('Flight search failed:', error);
        return [];
    }
}

export interface HotelOffer {
    name: string;
    hotelId: string;
    distance: string;
    distanceUnit: string;
    latitude: number;
    longitude: number;
}

export async function searchHotels(
    cityCode: string,
    radius: number = 10,
    maxResults: number = 8
): Promise<HotelOffer[]> {
    try {
        const token = await getAmadeusToken();
        const params = new URLSearchParams({
            cityCode,
            radius: radius.toString(),
            radiusUnit: 'KM',
            hotelSource: 'ALL',
        });

        const res = await fetch(
            `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?${params}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) return [];
        const data = await res.json();

        return (data.data || []).slice(0, maxResults).map((h: any) => ({
            name: h.name,
            hotelId: h.hotelId,
            distance: h.distance?.value?.toString() || '—',
            distanceUnit: h.distance?.unit || 'KM',
            latitude: h.geoCode?.latitude,
            longitude: h.geoCode?.longitude,
        }));
    } catch (error) {
        console.error('Hotel search failed:', error);
        return [];
    }
}


export async function searchCityCode(keyword: string): Promise<string | null> {
    try {
        const token = await getAmadeusToken();
        const params = new URLSearchParams({
            keyword,
            subType: 'CITY',
            'page[limit]': '1',
        });

        const res = await fetch(
            `https://test.api.amadeus.com/v1/reference-data/locations?${params}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) return null;
        const data = await res.json();
        return data.data?.[0]?.iataCode || null;
    } catch {
        return null;
    }
}
