import { NextRequest, NextResponse } from 'next/server';
import { getWeatherForecast } from '@/lib/services/weather';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const city = req.nextUrl.searchParams.get('city');
    if (!city) {
        return NextResponse.json({ error: 'City parameter required' }, { status: 400 });
    }

    const data = await getWeatherForecast(city);
    if (!data) {
        return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
    }

    return NextResponse.json(data);
}
