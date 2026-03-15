import { NextResponse } from 'next/server';
import { geminiJSON } from '@/lib/services/gemini';
import { getMultipleDestinationImages } from "@/lib/services/unsplash";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const prompt = `Generate 3 highly realistic, diverse travel community posts about destinations in India (e.g., hidden gems, weekend getaways, cultural trips, nature spots).
Return a JSON object with this exact schema:
{
  "community": [
    {
      "id": "unique-string",
      "author": { "name": "Realistic Traveler Name", "badge": "Explorer|Local Expert|Nomad" },
      "title": "Catchy Title like '48 Hours in Udaipur' or 'Hidden Beaches of Gokarna'",
      "rating": 4.8,
      "cost_bracket": "$$ (Moderate) | $ (Budget) | $$$ (Luxury)",
      "geotag": { "name": "City, State", "lat": 0.0, "lng": 0.0 },
      "tips": ["Tip 1", "Tip 2", "Tip 3"],
      "pros_cons": { "pros": ["Pro 1", "Pro 2"], "cons": ["Con 1"] },
      "search_query": "Specific iconic landmark or vibrant location name for fetching an Unsplash image"
    }
  ]
}`;
        const data = await geminiJSON(prompt, 'You are a realistic travel community feed generator. Output valid JSON representing traveler stories.');

        
        if (data.community) {
            await Promise.all(data.community.map(async (item: any) => {
                try {
                    const photos = await getMultipleDestinationImages(item.search_query || item.geotag.name, 2);
                    item.images = photos && photos.length > 0 ? photos : ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600"];
                } catch (e) {
                    item.images = ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600"];
                }
            }));
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Community Feed Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
