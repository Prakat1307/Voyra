import { NextRequest, NextResponse } from 'next/server';
import { geminiJSON } from '@/lib/services/gemini';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { destination, duration, month, activities } = await req.json();

        if (!destination) {
            return NextResponse.json({ error: 'destination is required' }, { status: 400 });
        }

        const prompt = `Generate a practical packing list for a ${duration || 'multi-day'} trip to ${destination} in the month of ${month || 'the upcoming season'}.
Activities planned: ${activities || 'sightseeing, local food, exploring'}.

Return ONLY a valid JSON object in this exact format:
{
  "categories": [
    {
      "name": "Clothing",
      "items": ["Light t-shirts (3-4)", "Comfortable walking shoes", "...]
    },
    {
      "name": "Documents",
      "items": ["Government ID", "Hotel booking printout", "..."]
    },
    {
      "name": "Toiletries",
      "items": ["Sunscreen SPF 50+", "Moisturiser", "..."]
    },
    {
      "name": "Tech & Accessories",
      "items": ["Power bank", "Universal adapter", "..."]
    },
    {
      "name": "Health & Safety",
      "items": ["Basic first aid kit", "Insect repellent", "..."]
    },
    {
      "name": "Snacks & Misc",
      "items": ["Reusable water bottle", "Dry snacks", "..."]
    }
  ]
}

Be specific and practical for the destination and season. Think about the weather, culture, and activity type.`;

        const data = await geminiJSON(prompt, 'You are a travel packing expert. Return concise, practical packing lists as clean JSON.');

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Packing list generation error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate packing list' }, { status: 500 });
    }
}
