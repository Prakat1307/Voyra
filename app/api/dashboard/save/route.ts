import { NextResponse } from 'next/server';
import { getServerUser } from "@/utils/users/server";
import { createUserHistory, updateTrip, createTrip } from "@/lib/db/supabase-db";


export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        
        const { type, metadata, payload, tripId } = body;

        
        const historyAction = await createUserHistory({
            userId: user.id,
            type: type || 'dashboard-save',
            query: metadata?.title || 'Saved Dashboard Item',
            location: {
                destination: metadata?.destination?.name || 'Unknown'
            },
            metadata: {
                ...metadata,
                source: metadata?.generated_by || 'auto-save',
                last_modified_at: new Date().toISOString()
            },
            tripId: tripId || null
        });

        
        if (type === 'itinerary' && tripId && payload) {
            const updatedTrip = await updateTrip(tripId, {
                metadata: metadata,
                itinerary: payload.days || [],
                summary: payload.summary || {}
            });
            return NextResponse.json({ success: true, historyId: historyAction?.id, tripId: updatedTrip?.id });
        }

        
        if (type === 'itinerary' && !tripId) {
            const newTrip = await createTrip({
                userId: user.id,
                tripDetails: {
                    destination: metadata?.destination?.name || 'Unknown',
                    dates: metadata?.dates || { start: '', end: '' },
                },
                itinerary: payload?.days || [],
                metadata: metadata,
                summary: payload?.summary || {},
                status: 'planning',
                createdAt: new Date(),
            });
            return NextResponse.json({ success: true, historyId: historyAction?.id, tripId: newTrip?.id || newTrip?._id });
        }

        
        return NextResponse.json({ success: true, historyId: historyAction?.id });

    } catch (error: any) {
        console.error("Dashboard Auto-save Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
