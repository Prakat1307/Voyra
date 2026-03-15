import { NextRequest, NextResponse } from 'next/server';
import { getTripById, createTrip } from '@/lib/db/supabase-db';
import { getServerUser } from '@/utils/users/server';

export async function POST(req: NextRequest) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { tripId } = await req.json();

        
        const originalTrip = await getTripById(tripId);
        if (!originalTrip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        
        if (!originalTrip.isPublic && originalTrip.userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized to clone this trip' }, { status: 403 });
        }

        
        const { _id, id, userId, createdAt, updatedAt, ...tripData } = originalTrip;

        const newTrip = await createTrip({
            ...tripData,
            userId: user.id,
            title: `Copy of ${originalTrip.title}`,
            isPublic: false,
            createdAt: new Date(),
            status: 'planning'
        });

        return NextResponse.json({ success: true, newTripId: newTrip._id });

    } catch (error: any) {
        console.error('Error cloning trip:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
