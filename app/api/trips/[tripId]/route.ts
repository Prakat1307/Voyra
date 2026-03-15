
import { NextRequest, NextResponse } from 'next/server';
import { getTripById, updateTrip } from '@/lib/db/supabase-db';


export async function GET(
    req: NextRequest,
    { params }: { params: { tripId: string } }
) {
    const trip = await getTripById(params.tripId);

    if (!trip) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json(trip);
}


export async function PATCH(
    req: NextRequest,
    { params }: { params: { tripId: string } }
) {
    const body = await req.json();

    const trip = await getTripById(params.tripId);
    if (!trip) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    
    let itinerary = trip.itinerary || [];

    
    if (body.itinerary) {
        itinerary = body.itinerary;
    }

    
    if (body.updateActivity) {
        const { dayIndex, activityIndex, activity } = body.updateActivity;

        if (
            itinerary[dayIndex] &&
            itinerary[dayIndex].activities &&
            itinerary[dayIndex].activities[activityIndex]
        ) {
            itinerary[dayIndex].activities[activityIndex] = activity;
        }
    }

    
    if (body.updateDay) {
        const { dayIndex, day } = body.updateDay;
        if (itinerary[dayIndex]) {
            itinerary[dayIndex] = day;
        }
    }

    const updatedTrip = await updateTrip(params.tripId, { itinerary });

    return NextResponse.json(updatedTrip);
}
