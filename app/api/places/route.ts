import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyPlaces } from '@/lib/services/foursquare';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const lat = parseFloat(req.nextUrl.searchParams.get('lat') || '0');
    const lng = parseFloat(req.nextUrl.searchParams.get('lng') || '0');
    const category = req.nextUrl.searchParams.get('category') || 'all';
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '12');

    if (!lat && !lng) {
        return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const places = await searchNearbyPlaces(lat, lng, category, limit);
    return NextResponse.json({ places });
}
