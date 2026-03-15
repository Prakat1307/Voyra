
import { generateChatResponse } from './gemini';

interface Activity {
    id: string;
    time: string;
    title: string;
    description: string;
    location: string;
    type: string;
    cost?: number;
}

interface ReplanResult {
    needsAdjustment: boolean;
    explanation?: string;
    adjustedActivities?: { index: number; newTime?: string; reason?: string }[];
}


export async function cascadeReplan(
    dayActivities: Activity[],
    changedIndex: number,
    newActivity: Activity,
    destination: string
): Promise<ReplanResult | null> {
    const prevActivity = dayActivities[changedIndex - 1];
    const nextActivity = dayActivities[changedIndex + 1];

    
    const needsCascade = checkCascadeNeeded(
        prevActivity,
        newActivity,
        nextActivity
    );

    if (!needsCascade) return null;

    const prompt = `
You are a travel logistics optimizer for ${destination}.

An activity was just changed in a day's itinerary.

PREVIOUS ACTIVITY (before the changed one):
${prevActivity ? `${prevActivity.time}: ${prevActivity.title} at ${prevActivity.location}` : 'None (this is first activity)'}

NEW ACTIVITY (just changed):
${newActivity.time}: ${newActivity.title} at ${newActivity.location}

NEXT ACTIVITY (after the changed one):
${nextActivity ? `${nextActivity.time}: ${nextActivity.title} at ${nextActivity.location}` : 'None (this is last activity)'}

Check:
1. Is there enough travel time between locations?
2. Does the time slot still make sense?
3. Should the next activity's time be adjusted?

If adjustments are needed, return JSON:
{
  "needsAdjustment": true,
  "explanation": "brief explanation",
  "adjustedActivities": [
    {
      "index": ${changedIndex + 1},
      "newTime": "adjusted time",
      "reason": "why"
    }
  ]
}

If no adjustment needed, return:
{ "needsAdjustment": false }
`;

    try {
        const response = await generateChatResponse(prompt, []); 
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error('Cascade replan failed:', e);
    }

    return null;
}

function checkCascadeNeeded(
    prev: Activity | undefined,
    current: Activity,
    next: Activity | undefined
): boolean {
    
    if (next && current.location !== next.location) return true;
    if (prev && current.location !== prev.location) return true;

    
    const slowTypes = ['adventure', 'relaxation', 'culture'];
    

    if (slowTypes.includes(current.type) && next) return true;

    return false;
}
