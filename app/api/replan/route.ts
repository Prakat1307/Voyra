import { NextResponse } from 'next/server';
import { geminiJSON } from '@/lib/services/gemini';
import { REPLAN_PROMPT } from '@/lib/constants/prompts';
import { getWeatherForecast } from '@/lib/utils/weatherAPI';
import { createNotification, getTripById } from '@/lib/db/supabase-db';

export async function POST(request: Request) {
    try {
        const { tripId, dayId, trigger, userConstraints } = await request.json();

        
        const trip = await getTripById(tripId) as any;
        if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

        const dayPlan = trip.days.find((d: any) => d._id === dayId || d.dayNumber === dayId);
        if (!dayPlan) return NextResponse.json({ error: 'Day plan not found' }, { status: 404 });

        
        let enrichedTrigger = { ...trigger };
        if (trigger.type === 'weather') {
            const weather = await getWeatherForecast(dayPlan.activities[0]?.location?.lat || 0, dayPlan.activities[0]?.location?.lng || 0);
            enrichedTrigger.data = weather.current;
        }

        
        const prompt = REPLAN_PROMPT(dayPlan, enrichedTrigger, userConstraints || {});
        const replanResult = await geminiJSON(prompt, 'You are an intelligent travel assistant. Adjust the itinerary based on the new situation.');

        
        const notification = await createNotification({
            tripId,
            userId: trip.userId,
            type: 'replan_suggestion',
            title: 'Itinerary Update Suggestion',
            message: replanResult.replanMessage,
            originalPlan: dayPlan,
            suggestedPlan: { ...dayPlan, activities: replanResult.updatedActivities },
            status: 'pending',
            priority: 'high'
        });

        return NextResponse.json({
            success: true,
            notificationId: notification._id,
            suggestion: replanResult
        });

    } catch (error: any) {
        console.error('Replan error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
