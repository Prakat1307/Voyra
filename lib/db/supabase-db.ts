import { createClient } from "@/utils/supabase/server";


export function getDB() {
    return createClient();
}


export async function createTrip(data: any) {
    const supabase = getDB();
    const insertData = mapTripToRow(data);
    const { data: trip, error } = await supabase
        .from('trips')
        .insert(insertData)
        .select()
        .single();
    if (error) throw new Error(`Failed to create trip: ${error.message}`);
    return mapRowToTrip(trip);
}

export async function getTripById(id: string) {
    const supabase = getDB();
    const { data: trip, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();
    if (error) return null;
    return mapRowToTrip(trip);
}

export async function getTripsByUserId(userId: string) {
    const supabase = getDB();
    const { data: trips, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch trips: ${error.message}`);
    return (trips || []).map(mapRowToTrip);
}

export async function getPublicTrips(limit = 50) {
    const supabase = getDB();
    const { data: trips, error } = await supabase
        .from('trips')
        .select('*')
        .eq('is_public', true)
        .neq('status', 'archived')
        .order('updated_at', { ascending: false })
        .limit(limit);
    if (error) throw new Error(`Failed to fetch public trips: ${error.message}`);
    return (trips || []).map(mapRowToTrip);
}

export async function updateTrip(id: string, data: any) {
    const supabase = getDB();
    const updateData: any = { updated_at: new Date().toISOString() };

    if (data.itinerary !== undefined) updateData.itinerary = data.itinerary;
    if (data.days !== undefined) updateData.days = data.days;
    if (data.isPublic !== undefined) updateData.is_public = data.isPublic;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.tripDetails !== undefined) updateData.trip_details = data.tripDetails;
    if (data.vibeContext !== undefined) updateData.vibe_context = data.vibeContext;
    if (data.chatHistory !== undefined) updateData.chat_history = data.chatHistory;
    if (data.tags !== undefined) updateData.tags = data.tags;

    const { data: trip, error } = await supabase
        .from('trips')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
    if (error) throw new Error(`Failed to update trip: ${error.message}`);
    return mapRowToTrip(trip);
}

export async function findTripByIdAndUserId(id: string, userId: string) {
    const supabase = getDB();
    const { data: trip, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
    if (error) return null;
    return mapRowToTrip(trip);
}


function mapTripToRow(data: any) {
    return {
        user_id: data.userId,
        title: data.title || null,
        description: data.description || null,
        destinations: data.destinations || [],
        start_date: data.startDate || null,
        end_date: data.endDate || null,
        duration: data.duration || null,
        travelers: data.travelers || null,
        budget: data.budget || null,
        preferences: data.preferences || null,
        vibe_context: data.vibeContext || null,
        trip_details: data.tripDetails || null,
        itinerary: data.itinerary || [],
        days: data.days || [],
        
        
        
        status: data.status || 'planning',
        is_public: data.isPublic ?? false,
        conversation_id: data.conversationId || null,
        chat_history: data.chatHistory || [],
        tags: data.tags || [],
        created_at: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
    };
}


function mapRowToTrip(row: any) {
    if (!row) return null;
    return {
        _id: row.id,
        id: row.id,
        userId: row.user_id,
        title: row.title,
        description: row.description,
        destinations: row.destinations || [],
        startDate: row.start_date,
        endDate: row.end_date,
        duration: row.duration,
        travelers: row.travelers,
        budget: row.budget,
        preferences: row.preferences,
        vibeContext: row.vibe_context,
        tripDetails: row.trip_details,
        itinerary: row.itinerary || [],
        days: row.days || [],
        metadata: row.metadata || {},
        summary: row.summary || {},
        status: row.status,
        isPublic: row.is_public,
        conversationId: row.conversation_id,
        chatHistory: row.chat_history || [],
        tags: row.tags || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}


export async function createUserHistory(data: any) {
    const supabase = getDB();
    const { data: entry, error } = await supabase
        .from('user_history')
        .insert({
            user_id: data.userId,
            type: data.type,
            query: data.query,
            location: data.location || null,
            metadata: data.metadata || null,
            trip_id: data.tripId || null,
        })
        .select()
        .single();
    if (error) throw new Error(`Failed to create history: ${error.message}`);
    return mapRowToHistory(entry);
}

export async function getUserHistory(userId: string, limit = 20) {
    const supabase = getDB();
    const { data: entries, error } = await supabase
        .from('user_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw new Error(`Failed to fetch history: ${error.message}`);
    return (entries || []).map(mapRowToHistory);
}

function mapRowToHistory(row: any) {
    if (!row) return null;
    return {
        _id: row.id,
        id: row.id,
        userId: row.user_id,
        type: row.type,
        query: row.query,
        location: row.location,
        metadata: row.metadata,
        tripId: row.trip_id,
        createdAt: row.created_at,
    };
}


export async function createJournalEntry(data: any) {
    const supabase = getDB();
    const { data: entry, error } = await supabase
        .from('journal_entries')
        .insert({
            user_id: data.userId,
            trip_id: data.tripId,
            title: data.title,
            content: data.content,
            images: data.images || [],
            mood: data.mood || 'neutral',
            tags: data.tags || [],
            is_public: data.isPublic ?? false,
            location: data.location || null,
            date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        })
        .select()
        .single();
    if (error) throw new Error(`Failed to create journal entry: ${error.message}`);
    return mapRowToJournal(entry);
}

export async function getJournalEntries(userId: string, tripId?: string) {
    const supabase = getDB();
    let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (tripId) {
        query = query.eq('trip_id', tripId);
    }

    const { data: entries, error } = await query;
    if (error) throw new Error(`Failed to fetch journal entries: ${error.message}`);
    return (entries || []).map(mapRowToJournal);
}

function mapRowToJournal(row: any) {
    if (!row) return null;
    return {
        _id: row.id,
        id: row.id,
        userId: row.user_id,
        tripId: row.trip_id,
        title: row.title,
        content: row.content,
        images: row.images || [],
        mood: row.mood,
        tags: row.tags || [],
        isPublic: row.is_public,
        location: row.location,
        date: row.date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}


export async function createExpense(data: any) {
    const supabase = getDB();
    const { data: expense, error } = await supabase
        .from('expenses')
        .insert({
            trip_id: data.tripId,
            user_id: data.userId,
            amount: data.amount,
            currency: data.currency,
            amount_in_base_currency: data.amountInBaseCurrency || null,
            base_currency: data.baseCurrency || null,
            exchange_rate: data.exchangeRate || null,
            category: data.category,
            description: data.description || null,
            date: new Date(data.date).toISOString(),
            day_number: data.dayNumber || null,
        })
        .select()
        .single();
    if (error) throw new Error(`Failed to create expense: ${error.message}`);
    return mapRowToExpense(expense);
}

export async function getExpensesByTripId(tripId: string) {
    const supabase = getDB();
    const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', tripId)
        .order('date', { ascending: false });
    if (error) throw new Error(`Failed to fetch expenses: ${error.message}`);
    return (expenses || []).map(mapRowToExpense);
}

export async function deleteExpense(id: string) {
    const supabase = getDB();
    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
    if (error) throw new Error(`Failed to delete expense: ${error.message}`);
}

function mapRowToExpense(row: any) {
    if (!row) return null;
    return {
        _id: row.id,
        id: row.id,
        tripId: row.trip_id,
        userId: row.user_id,
        amount: row.amount,
        currency: row.currency,
        amountInBaseCurrency: row.amount_in_base_currency,
        baseCurrency: row.base_currency,
        exchangeRate: row.exchange_rate,
        category: row.category,
        description: row.description,
        date: row.date,
        dayNumber: row.day_number,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}


export async function createNotification(data: any) {
    const supabase = getDB();
    const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
            trip_id: data.tripId,
            user_id: data.userId,
            type: data.type,
            title: data.title || null,
            message: data.message || null,
            original_plan: data.originalPlan || null,
            suggested_plan: data.suggestedPlan || null,
            status: data.status || 'pending',
            priority: data.priority || 'medium',
            expires_at: data.expiresAt || null,
        })
        .select()
        .single();
    if (error) throw new Error(`Failed to create notification: ${error.message}`);
    return mapRowToNotification(notification);
}

function mapRowToNotification(row: any) {
    if (!row) return null;
    return {
        _id: row.id,
        id: row.id,
        tripId: row.trip_id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        message: row.message,
        originalPlan: row.original_plan,
        suggestedPlan: row.suggested_plan,
        status: row.status,
        priority: row.priority,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}




export async function createUser(user: any) {
    const supabase = getDB();
    const { data: userData, error: UserError } = await supabase
        .from("users")
        .insert({
            id: user?.id,
            name: user?.user_metadata.full_name,
            avatar: user?.user_metadata.avatar_url,
            email: user?.email,
            email_verified: user?.user_metadata.email_verified,
            credits: 5,
        })
        .select()
        .single();

    if (userData) {
        console.log("User created");
        return userData;
    }
    if (UserError) {
        console.log("Error creating user (table may not exist), returning mock data:", UserError.message);
        return {
            id: user?.id,
            name: user?.user_metadata.full_name,
            avatar: user?.user_metadata.avatar_url,
            email: user?.email,
            email_verified: user?.user_metadata.email_verified,
            credits: 5,
        };
    }
}

export async function getUserFromDatabase(userId: string) {
    const supabase = getDB();
    const { data: userData, error: UserError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

    if (UserError) {
        
        return { credits: 5 }; 
    }
    return userData ?? { credits: 5 };
}


export async function createUserPreferences(
    currentLocation: string,
    travelLocation: string,
    startDate: Date,
    endDate: Date,
    budget: number,
    interests: string[],
    userId: string
) {
    const supabase = getDB();
    const { error: errorPreferences } = await supabase
        .from("userpreferences")
        .insert({
            current_location: currentLocation,
            travel_location: travelLocation,
            start_date: startDate,
            end_date: endDate,
            budget: budget,
            interests: interests,
            userid: userId,
        });
    if (errorPreferences) {
        console.log(errorPreferences);
        throw new Error(errorPreferences.message);
    }
}

export async function createResponse(
    name: string,
    json: string,
    userId: string
) {
    const supabase = getDB();
    const { error: errorResponse } = await supabase.from("response").insert({
        name,
        response: json,
        userid: userId,
    });
    if (errorResponse) {
        console.log(errorResponse);
        throw new Error(errorResponse.message);
    }
}

export async function getUserCredits(userId: string) {
    const supabase = getDB();
    try {
        const { data, error } = await supabase
            .from("users")
            .select("credits")
            .eq("id", userId)
            .single();
        if (error) {
            console.log("error from credits, returning fallback:", error.message);
            return 5; 
        }
        return data?.credits ?? 5;
    } catch (e) {
        console.log("exception from credits, returning fallback:", e);
        return 5;
    }
}

export async function updateUserCredits(userId: string) {
    const supabase = getDB();
    let credits = await getUserCredits(userId);
    credits -= 1;
    const { error: errorUpdate } = await supabase.from("users").update({
        credits,
    }).eq("id", userId);
    if (errorUpdate) {
        console.log("Error updating credits, ignoring missing table:", errorUpdate.message);
        return;
    }
}
