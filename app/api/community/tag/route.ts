import { NextRequest, NextResponse } from 'next/server';
import { geminiJSON } from '@/lib/services/gemini';

export const dynamic = 'force-dynamic';

const AVAILABLE_TAGS = [
    'Solo', 'Family', 'Couple', 'Friends',
    'Adventure', 'Cultural', 'Relaxed', 'Foodie',
    'Budget', 'Mid-range', 'Luxury',
    'Beach', 'Mountains', 'City', 'Rural', 'Desert',
    'Weekend', 'Long-Trip',
    'Monsoon', 'Winter', 'Summer', 'Spring',
    'International', 'Domestic',
];

export async function POST(req: NextRequest) {
    try {
        const { title, description, tips, location } = await req.json();

        if (!title) {
            return NextResponse.json({ error: 'title is required' }, { status: 400 });
        }

        const prompt = `Classify the following travel post into relevant tags from the provided list.

Post Title: "${title}"
Location: "${location || 'Unknown'}"
Description: "${description || ''}"
Tips: ${JSON.stringify(tips || [])}

Available tags: ${AVAILABLE_TAGS.join(', ')}

Select 3-6 most relevant tags that accurately describe this trip post.
Return ONLY valid JSON in this exact format:
{
  "tags": ["Tag1", "Tag2", "Tag3"]
}`;

        const data = await geminiJSON(
            prompt,
            'You are a travel content classifier. Return only the most relevant tags as a JSON array.'
        );

        return NextResponse.json({ tags: data.tags || [] });
    } catch (error: any) {
        console.error('Auto-tag error:', error);
        return NextResponse.json({ error: error.message || 'Tagging failed' }, { status: 500 });
    }
}
