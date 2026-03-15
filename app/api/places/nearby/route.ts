import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const OPENTRIPMAP_API_KEY = process.env.FOURSQUARE_API_KEY; 



export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const kind = searchParams.get('kind') || 'interesting_places';
    const radius = searchParams.get('radius') || '1500';

    if (!lat || !lng) {
        return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    try {
        
        const listUrl = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lng}&lat=${lat}&kinds=${kind}&limit=8&format=json&apikey=5ae2e3f221c38a28845f05b63d3a8e5a72f5f54d0c0af9b7f05ff74`;

        const res = await fetch(listUrl, { next: { revalidate: 3600 } });

        if (!res.ok) {
            throw new Error(`OpenTripMap error: ${res.status}`);
        }

        const places = await res.json();

        
        const enriched = await Promise.allSettled(
            (Array.isArray(places) ? places : []).slice(0, 6).map(async (place: any) => {
                try {
                    const detailRes = await fetch(
                        `https://api.opentripmap.com/0.1/en/places/xid/${place.xid}?apikey=5ae2e3f221c38a28845f05b63d3a8e5a72f5f54d0c0af9b7f05ff74`,
                        { next: { revalidate: 3600 * 24 } }
                    );
                    const detail = await detailRes.json();
                    return {
                        id: place.xid,
                        name: detail.name || place.name || 'Unnamed Place',
                        kinds: (detail.kinds || place.kinds || '').split(',').slice(0, 2),
                        description: detail.wikipedia_extracts?.text?.slice(0, 150) || detail.info?.descr?.slice(0, 150) || '',
                        distance: Math.round(place.dist || 0),
                        lat: place.point?.lat || detail.point?.lat,
                        lng: place.point?.lon || detail.point?.lon,
                        image: detail.preview?.source || null,
                        wikiUrl: detail.url || null,
                    };
                } catch {
                    return {
                        id: place.xid,
                        name: place.name || 'Nearby Place',
                        kinds: (place.kinds || '').split(',').slice(0, 2),
                        description: '',
                        distance: Math.round(place.dist || 0),
                        lat: place.point?.lat,
                        lng: place.point?.lon,
                        image: null,
                        wikiUrl: null,
                    };
                }
            })
        );

        const results = enriched
            .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
            .map(r => r.value)
            .filter(p => p.name && p.name !== 'Unnamed Place');

        return NextResponse.json({ places: results });
    } catch (error: any) {
        console.error('Nearby places error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch nearby places' }, { status: 500 });
    }
}
