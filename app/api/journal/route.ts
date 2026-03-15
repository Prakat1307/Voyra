import { NextRequest, NextResponse } from 'next/server';
import { createJournalEntry, getJournalEntries } from '@/lib/db/supabase-db';
import { getServerUser } from '@/utils/users/server';


export async function GET(req: NextRequest) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const tripId = searchParams.get('tripId') || undefined;

        const entries = await getJournalEntries(user.id, tripId);

        return NextResponse.json(entries);
    } catch (error: any) {
        console.error('Error fetching journal entries:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { tripId, title, content, mood, tags, location, isPublic, images } = body;

        if (!tripId || !title || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const entry = await createJournalEntry({
            userId: user.id,
            tripId,
            title,
            content,
            mood,
            tags,
            location,
            isPublic,
            images,
            date: new Date()
        });

        return NextResponse.json(entry, { status: 201 });
    } catch (error: any) {
        console.error('Error creating journal entry:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
