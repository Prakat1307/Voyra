import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80"
];

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get('q');
    if (!query) {
        return NextResponse.json({ url: FALLBACK_IMAGES[0] });
    }

    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) {
        return NextResponse.json({ url: FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)] });
    }

    try {
        const res = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' travel')}&orientation=landscape&per_page=1`,
            { headers: { Authorization: `Client-ID ${key}` }, next: { revalidate: 86400 } } 
        );
        if (!res.ok) throw new Error(`Unsplash ${res.status}`);
        const data = await res.json();
        const url = data.results?.[0]?.urls?.regular;
        return NextResponse.json({
            url: url || FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)],
            credit: data.results?.[0]?.user?.name || null
        });
    } catch (error) {
        console.error("Unsplash API error:", error);
        return NextResponse.json({ url: FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)] });
    }
}
