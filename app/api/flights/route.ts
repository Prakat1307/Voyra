import { NextRequest, NextResponse } from 'next/server';
import { searchFlights, searchCityCode } from '@/lib/services/amadeus';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const origin = req.nextUrl.searchParams.get('origin');
    const destination = req.nextUrl.searchParams.get('destination');
    const date = req.nextUrl.searchParams.get('date');
    const adults = parseInt(req.nextUrl.searchParams.get('adults') || '1');

    if (!origin || !destination || !date) {
        return NextResponse.json({ error: 'origin, destination, and date are required' }, { status: 400 });
    }

    
    const originCode = origin.length === 3 ? origin.toUpperCase() : await searchCityCode(origin);
    const destCode = destination.length === 3 ? destination.toUpperCase() : await searchCityCode(destination);

    if (!originCode || !destCode) {
        return NextResponse.json({
            error: 'Could not resolve city codes',
            originCode,
            destCode,
        }, { status: 400 });
    }

    const flights = await searchFlights(originCode, destCode, date, adults, 5);
    return NextResponse.json({ flights, originCode, destCode });
}
