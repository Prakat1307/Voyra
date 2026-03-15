const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;


const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
    "https://images.unsplash.com/photo-1506461883276-594a12b11dc3?w=800&q=80",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80",
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    "https://images.unsplash.com/photo-1513407030348-c1e4a97b98d5?w=800&q=80"
];


function getHashFallback(query: string, index: number): string {
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
        hash = query.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash + index) % FALLBACK_IMAGES.length;
    return FALLBACK_IMAGES[idx];
}

export async function getDestinationImage(query: string): Promise<string> {
    if (!UNSPLASH_ACCESS_KEY) {
        console.warn("Unsplash API Key missing. Using fallback image.");
        return getHashFallback(query, 0);
    }

    try {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1`, {
            headers: {
                Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });

        if (!res.ok) throw new Error("Unsplash API Error");

        const data = await res.json();
        return data.results[0]?.urls?.regular || getHashFallback(query, 0);
    } catch (error) {
        console.error("Failed to fetch image:", error);
        return getHashFallback(query, 0);
    }
}

export async function getMultipleDestinationImages(query: string, count: number = 3): Promise<string[]> {
    if (!UNSPLASH_ACCESS_KEY) {
        return Array.from({ length: count }).map((_, i) => getHashFallback(query, i));
    }

    try {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=${count}`, {
            headers: {
                Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });

        if (!res.ok) throw new Error("Unsplash API Error");

        const data = await res.json();
        const urls = data.results.slice(0, count).map((r: any) => r.urls?.regular);

        
        while (urls.length < count) {
            urls.push(getHashFallback(query, urls.length));
        }

        return urls;
    } catch (error) {
        console.error("Failed to fetch multiple images:", error);
        return Array.from({ length: count }).map((_, i) => getHashFallback(query, i));
    }
}
