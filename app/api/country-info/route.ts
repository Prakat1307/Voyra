import { NextRequest, NextResponse } from 'next/server';
import { getCountryInfo } from '@/lib/services/countries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const country = req.nextUrl.searchParams.get('country');
    if (!country) {
        return NextResponse.json({ error: 'country parameter required' }, { status: 400 });
    }

    const info = await getCountryInfo(country);
    if (!info) {
        return NextResponse.json({ error: `Could not find info for "${country}"` }, { status: 404 });
    }

    return NextResponse.json(info);
}
