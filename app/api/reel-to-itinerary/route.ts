import { NextRequest, NextResponse } from 'next/server';
import { geminiJSON } from '@/lib/services/gemini';

export const dynamic = 'force-dynamic';


async function getYouTubeTranscript(url: string): Promise<string> {
    
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!match) throw new Error('Invalid YouTube URL. Please provide a valid YouTube video link.');
    const videoId = match[1];

    
    const { YoutubeTranscript } = await import('youtube-transcript');
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptItems || transcriptItems.length === 0) {
        throw new Error('No transcript found for this video. The video may have captions disabled.');
    }

    
    const fullText = transcriptItems.map((t: any) => t.text).join(' ');
    return fullText.slice(0, 8000);
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        if (!url) {
            return NextResponse.json({ error: 'url is required' }, { status: 400 });
        }

        
        let transcript: string;
        try {
            transcript = await getYouTubeTranscript(url);
        } catch (err: any) {
            return NextResponse.json({ error: err.message || 'Failed to fetch transcript' }, { status: 422 });
        }

        
        const prompt = `The following is a transcript from a YouTube travel vlog:

---
${transcript}
---

Extract all travel destinations, activities, tips, and recommendations mentioned in this vlog.
Organize them into a structured travel itinerary.

Return ONLY valid JSON in this exact format:
{
  "title": "Trip title derived from the video content",
  "destination": "Main destination(s) mentioned",
  "highlights": ["key highlight 1", "key highlight 2", "key highlight 3"],
  "itinerary": [
    {
      "day": "Day 1",
      "activities": [
        {
          "time": "Morning",
          "activity": "Activity name",
          "location": "Place name",
          "notes": "Tips or details mentioned in the vlog",
          "cost": "Estimated cost if mentioned, or empty string",
          "lat": 0,
          "long": 0
        }
      ]
    }
  ],
  "tips": ["General travel tip 1", "tip 2", "tip 3"],
  "estimated_budget": "Budget range if mentioned"
}

If lat/long are not mentioned, use 0 for both. Be concise and practical.`;

        const data = await geminiJSON(
            prompt,
            'You are an expert travel content analyst. Extract clear, actionable travel itineraries from transcripts.'
        );

        return NextResponse.json({ success: true, ...data });
    } catch (error: any) {
        console.error('Reel to itinerary error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate itinerary from video' }, { status: 500 });
    }
}
