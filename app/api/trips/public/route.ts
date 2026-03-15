import { NextRequest, NextResponse } from 'next/server';
import { findTripByIdAndUserId, updateTrip } from '@/lib/db/supabase-db';
import { getServerUser } from '@/utils/users/server';

export async function POST(req: NextRequest) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { tripId, isPublic } = await req.json();

        const trip = await findTripByIdAndUserId(tripId, user.id);

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found or unauthorized' }, { status: 404 });
        }

        const updatedTrip = await updateTrip(tripId, { isPublic });

        return NextResponse.json({
            success: true,
            tripId: updatedTrip._id,
            isPublic: updatedTrip.isPublic
        });

    } catch (error: any) {
        console.error('Error toggling trip visibility:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
