import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRates } from '@/lib/services/exchangeRate';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const base = req.nextUrl.searchParams.get('base') || 'USD';

    const data = await getExchangeRates(base);
    if (!data) {
        return NextResponse.json({ error: 'Failed to fetch exchange rates' }, { status: 500 });
    }

    return NextResponse.json(data);
}
