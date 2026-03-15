import { NextResponse } from 'next/server';
import { createExpense, getExpensesByTripId, deleteExpense, getTripById } from '@/lib/db/supabase-db';


export async function POST(request: Request) {
    try {
        const data = await request.json();

        
        const trip = await getTripById(data.tripId);
        if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

        const expense = await createExpense({
            ...data,
            date: new Date(data.date)
        });

        return NextResponse.json(expense);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const tripId = searchParams.get('tripId');

        if (!tripId) return NextResponse.json({ error: 'Trip ID required' }, { status: 400 });

        const expenses = await getExpensesByTripId(tripId);

        
        const stats = {
            total: expenses.reduce((sum: number, e: any) => sum + e.amount, 0),
            byCategory: expenses.reduce((acc: any, e: any) => {
                acc[e.category] = (acc[e.category] || 0) + e.amount;
                return acc;
            }, {})
        };

        return NextResponse.json({ expenses, stats });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await deleteExpense(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
