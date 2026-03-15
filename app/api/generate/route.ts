import { NextRequest, NextResponse } from 'next/server';
import { generateItinerary } from '@/lib/services/gemini';
import { createTrip, createUserHistory } from '@/lib/db/supabase-db';
import { getMultipleDestinationImages } from '@/lib/services/unsplash';
import { fetchFlightPricing, fetchHotelPricing } from '@/lib/services/pricing';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import { getServerUser } from '@/utils/users/server';

export const dynamic = 'force-dynamic';

const logFile = path.join(process.cwd(), 'generate_debug.log');

const log = (msg: string) => {
  const timestamp = new Date().toISOString();
  try {
    fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
  } catch (e) {
    console.error('Failed to write to log file', e);
  }
  console.log(`[DEBUG] ${msg}`);
};

export async function POST(req: NextRequest) {
  log('Received trip generation request');
  try {
    const user = await getServerUser();
    const body = await req.json();
    log(`Request body parsed. User: ${user?.id || 'Guest'}`);

    
    let prompt = `You are a HIGHLY DETAILED travel planning assistant that builds GAPLESS, HOUR-BY-HOUR, TIME-AWARE actionable itineraries. 
Output MUST be strictly JSON. You must include continuous time slots throughout the day covering:
1. Transport segments (flights, trains, cabs) with precise times.
2. Local transit times between places.
3. Weather snapshots for every major time slot.
4. Specific eating spots (breakfast, lunch, dinner).
5. 3-5 Points of Interest (POIs) per day.

BUDGET INSTRUCTIONS: Use the user's currency. HOWEVER, if the destination is located within India, ALL costs and the total budget MUST be forcefully converted and returned exclusively in INR (₹).

TRIP DETAILS:
- Destination: ${body.tripDetails?.destination || body.travelLocation}
- Dates: ${body.tripDetails?.dates?.start || body.startDate} to ${body.tripDetails?.dates?.end || body.endDate}
- Budget: ${JSON.stringify(body.tripDetails?.budget || body.budget)}
- Travelers: ${body.tripDetails?.travelers || body.adults}
- Interests: ${body.tripDetails?.interests?.join(', ') || body.interests}
- Pace: ${body.tripDetails?.pace || 'Medium'}
`;

    if (body.vibeContext) {
      prompt += `
IMPORTANT VIBE CONTEXT:
The user found this trip through a visual vibe match.
- Their mood: ${body.vibeContext.mood?.join(', ')}
- Vibe description: ${body.vibeContext.description}
- Season preference: ${body.vibeContext.season}

Make sure the itinerary MATCHES this vibe throughout.
`;
    }

    prompt += `
Return a VALID JSON object exactly matching this schema (do NOT wrap in markdown \`\`\`json):
{
  "type": "itinerary",
  "metadata": {
    "title": "...",
    "origin": {"name": "...", "lat": 0, "lng": 0},
    "destination": {"name": "...", "lat": 0, "lng": 0},
    "currency": "INR",
    "generated_by": "ai_smart_itinerary_v1"
  },
  "payload": {
    "days": [
      {
        "day": 1,
        "date": "YYYY-MM-DD",
        "segments": [{
            "type": "transport",
            "mode": "flight|train|cab",
            "from": "...",
            "to": "...",
            "departure": "time",
            "arrival": "time",
            "duration_minutes": 0,
            "estimated_fare": {"amount": 0, "currency": "INR", "source": "Estimate"}
        }],
        "visits": [{
            "name": "Place Name",
            "lat": 0,
            "lng": 0,
            "start_time": "time",
            "end_time": "time",
            "visit_duration_minutes": 0,
            "weather": {"summary": "...", "temp_c": 0, "chance_of_rain": 0},
            "images": [],
            "map_link": "..."
        }]
      }
    ],
    "summary": {"total_estimated_cost_inr": 0}
  }
}`;

    log(`Generated Prompt: ${prompt}`);

    log('Calling AI Service...');
    const rawItineraryData = await generateItinerary(prompt);
    log('AI Response received.');

    
    const sanitizeItinerary = (itineraryData: any) => {
      
      if (itineraryData?.payload?.days) {
        return itineraryData.payload.days.map((day: any) => ({
          ...day,
          segments: Array.isArray(day.segments) ? day.segments : [],
          visits: Array.isArray(day.visits) ? day.visits.map((visit: any) => ({
            ...visit,
            id: visit.id || crypto.randomUUID(),
            images: visit.images || [],
          })) : []
        }));
      }

      
      const daysArray = Array.isArray(itineraryData) ? itineraryData : [];
      return daysArray.map((day: any, i: number) => ({
        day: day.day || i + 1,
        date: day.date || "TBD",
        segments: [],
        visits: Array.isArray(day.activities) ? day.activities.map((act: any) => ({
          id: act.id || crypto.randomUUID(),
          name: act.title || "Activity",
          description: act.description || "",
          time: act.time || "Flexible",
          location: act.location || "TBD",
          lat: act.lat || 0,
          lng: act.long || 0,
          cost: act.cost || 0
        })) : []
      }));
    };

    const sanitizedItinerary = sanitizeItinerary(rawItineraryData);
    log('Itinerary sanitized.');

    
    log('Hydrating itinerary with External APIs...');
    const hydratedItinerary = await Promise.all(sanitizedItinerary.map(async (day: any) => {
      
      if (day.segments) {
        day.segments = await Promise.all(day.segments.map(async (seg: any) => {
          if (seg.mode === 'flight') {
            const priceEst = await fetchFlightPricing(seg.from, seg.to, day.date);
            seg.estimated_fare = { ...seg.estimated_fare, amount: priceEst.amount, currency: priceEst.currency, source: priceEst.source };
          } else if (seg.mode === 'cab' || seg.mode === 'transit') {
            const priceEst = await fetchHotelPricing(seg.to, day.date); 
            seg.estimated_fare = { ...seg.estimated_fare, amount: Math.floor(priceEst.amount / 5), currency: priceEst.currency, source: "Aggregator Scrape" };
          }
          return seg;
        }));
      }

      
      if (day.visits) {
        day.visits = await Promise.all(day.visits.map(async (visit: any) => {
          try {
            const searchQuery = visit.name ? `${visit.name} ${body.tripDetails?.destination || ''} landmark` : body.tripDetails?.destination || 'travel';
            const photos = await getMultipleDestinationImages(searchQuery, 1);
            if (photos && photos.length > 0) {
              visit.images = photos;
            }
          } catch (e) {
            console.log("Unsplash hydration failed for", visit.name);
          }
          return visit;
        }));
      }
      return day;
    }));
    log('Hydration complete.');

    
    const itineraryMetadata = rawItineraryData?.metadata || {};
    const itinerarySummary = rawItineraryData?.payload?.summary || { total_estimated_cost_inr: 0 };

    
    const normalizeBudget = (b: any) => {
      if (typeof b === 'string') {
        let style = b.toLowerCase().trim();
        if (style === 'medium') style = 'mid-range';
        return { amount: 0, currency: 'USD', style };
      }
      return {
        amount: b?.amount || 0,
        currency: b?.currency || 'USD',
        style: b?.style || 'mid-range'
      };
    };

    const finalTripDetails = {
      destination: body.tripDetails?.destination || body.travelLocation,
      dates: {
        start: body.tripDetails?.dates?.start || body.startDate,
        end: body.tripDetails?.dates?.end || body.endDate
      },
      budget: normalizeBudget(body.tripDetails?.budget || body.budget),
      travelers: body.tripDetails?.travelers || body.adults || 1,
      interests: body.tripDetails?.interests || (typeof body.interests === 'string' ? body.interests.split(',') : body.interests) || [],
      pace: body.tripDetails?.pace || 'Medium',
      
      aiMetadata: itineraryMetadata,
      aiSummary: itinerarySummary,
    };

    log(`Final Trip Details: ${JSON.stringify(finalTripDetails)}`);

    
    log('Saving to Supabase...');

    const trip = await createTrip({
      userId: user?.id,
      tripDetails: finalTripDetails,
      vibeContext: body.vibeContext || null,
      itinerary: hydratedItinerary,
      metadata: itineraryMetadata,
      summary: itinerarySummary,
      chatHistory: body.messages || [],
      status: 'completed',
      createdAt: new Date(),
    });

    if (!trip || !trip._id) {
      throw new Error("Failed to create trip record in database.");
    }

    log(`Trip saved with ID: ${trip._id}`);

    
    try {
      const historyEntry = await createUserHistory({
        userId: user?.id,
        type: 'itinerary',
        query: `Trip to ${finalTripDetails.destination}`,
        location: {
          origin: itineraryMetadata?.origin?.name || '',
          destination: finalTripDetails.destination
        },
        metadata: {
          tripId: trip._id,
          budget: finalTripDetails.budget,
          duration: `${finalTripDetails.dates.start} - ${finalTripDetails.dates.end}`,
          currency: itineraryMetadata?.currency || "USD"
        },
        tripId: trip._id,
      });
      if (historyEntry) {
        log(`History entry created: ${historyEntry._id}`);
      }
    } catch (histError) {
      console.error("Failed to save history entry", histError);
      
    }

    return NextResponse.json(trip);

  } catch (error: any) {
    log(`ERROR: ${error.message}`);
    log(`Stack: ${error.stack}`);
    return NextResponse.json(
      { error: 'Failed to generate itinerary', details: error.message },
      { status: 500 }
    );
  }
}
