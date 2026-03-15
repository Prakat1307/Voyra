export function mergeTripData(existing: any, newData: any) {
    const merged = { ...existing };

    
    Object.entries(newData).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        if (Array.isArray(value) && value.length === 0) return;
        if (typeof value === 'object' && !Array.isArray(value)) {
            
            merged[key] = { ...(merged[key] || {}), ...value };
            
            Object.keys(merged[key]).forEach(k => {
                if (merged[key][k] === null) delete merged[key][k];
            });
        } else if (Array.isArray(value)) {
            
            merged[key] = [...Array.from(new Set([...(merged[key] as any[] || []), ...(value as any[])]))];
        } else {
            merged[key] = value;
        }
    });

    return merged;
}

export function calculateConversationRound(tripData: any) {
    const hasDestination = tripData.destinations?.length > 0 || tripData.destination;
    const hasDates = tripData.dates?.start || tripData.duration;
    const hasBudget = tripData.budget || tripData.travelStyle;
    const hasTravelers = tripData.travelers;
    const hasPreferences = (tripData.interests?.length > 0) ||
        (tripData.dietary?.length > 0) ||
        (tripData.mustSees?.length > 0);

    if (!hasDestination) return 1;
    if (!hasDates) return 2;
    if (!hasBudget) return 3;
    if (!hasPreferences) return 4;
    return 5;  
}

export function isTripDataComplete(tripData: any) {
    return !!(
        (tripData.destinations?.length > 0 || tripData.destination) &&
        (tripData.dates?.start || tripData.duration) &&
        (tripData.budget || tripData.travelStyle) &&
        tripData.travelers
    );
}

export function getMissingFields(tripData: any) {
    const missing = [];
    if (!tripData.destinations?.length && !tripData.destination) missing.push('destination');
    if (!tripData.dates?.start && !tripData.duration) missing.push('dates or duration');
    if (!tripData.budget && !tripData.travelStyle) missing.push('budget');
    if (!tripData.travelers) missing.push('number of travelers');
    return missing;
}
