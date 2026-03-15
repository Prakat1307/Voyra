
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


interface VibeContext {
    imageUrl?: string;
    mood?: string[];
    suggestedDestinations?: string[];
    description?: string;
    colors?: string[];
    season?: string;
}

interface TripDetails {
    destination?: string;
    dates?: { start: string; end: string };
    budget?: { amount: number; currency: string; style?: string };
    travelers?: number;
    interests?: string[];
    pace?: 'slow' | 'moderate' | 'fast';
    vibe?: string;
    vibeDescription?: string;
    round?: number;
}

interface ChatMessage {
    id?: string; 
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string | number;
    metadata?: {
        type?: 'vibe-context' | 'edit-request' | 'normal' | 'replan-request';
        editTarget?: {
            dayIndex: number;
            activityIndex: number;
            tripId: string;
        };
    };
    tripId?: string;
    isItinerary?: boolean;
}

interface ItineraryDay {
    day: number;
    date?: string;
    title: string;
    activities: Activity[];
}

interface Activity {
    id: string;
    time: string;
    title: string;
    description: string;
    location: string;
    type: string;
    imageUrl?: string;
    cost?: number;
    _justUpdated?: boolean; 
}

interface Trip {
    _id: string;
    itinerary: ItineraryDay[];
    tripDetails: TripDetails;
    vibeContext?: VibeContext;
    status: 'draft' | 'completed' | 'editing';
}


type AppFlow =
    | 'idle'
    | 'vibe-exploring'
    | 'vibe-to-chat'        
    | 'chat-planning'
    | 'chat-to-itinerary'   
    | 'viewing-itinerary'
    | 'editing-itinerary'   
    ;


interface TravelStore {
    
    currentFlow: AppFlow;
    setFlow: (flow: AppFlow) => void;

    
    vibeContext: VibeContext | null;
    setVibeContext: (ctx: VibeContext | null) => void;
    clearVibeContext: () => void;

    
    messages: ChatMessage[];
    tripDetails: TripDetails;
    
    tripData: TripDetails;

    addMessage: (msg: ChatMessage) => void;
    setMessages: (msgs: ChatMessage[]) => void;
    clearMessages: () => void;

    updateTripDetails: (details: Partial<TripDetails>) => void;
    updateTripData: (details: Partial<TripDetails>) => void; 

    readyToGenerate: boolean;
    setReadyToGenerate: (val: boolean) => void;

    conversationId: string | null; 
    setConversationId: (id: string | null) => void;

    
    currentTrip: Trip | null;
    setCurrentTrip: (trip: Trip | null) => void;

    
    editTarget: {
        dayIndex: number;
        activityIndex: number;
    } | null;
    setEditTarget: (target: { dayIndex: number; activityIndex: number } | null) => void;

    
    startTripFromVibe: (vibeCtx: VibeContext) => void;
    editActivityFromItinerary: (dayIndex: number, activityIndex: number) => void;
    resetAll: () => void;
}

export const useTripStore = create<TravelStore>()(
    persist(
        (set, get) => ({
            
            currentFlow: 'idle',
            setFlow: (flow) => set({ currentFlow: flow }),

            
            vibeContext: null,
            setVibeContext: (ctx) => set({ vibeContext: ctx }),
            clearVibeContext: () => set({ vibeContext: null }),

            
            messages: [],
            tripDetails: {},
            get tripData() { return this.tripDetails }, 

            addMessage: (msg) =>
                set((state) => ({ messages: [...state.messages, msg] })),
            setMessages: (msgs) => set({ messages: msgs }),
            clearMessages: () => set({ messages: [], conversationId: null, tripDetails: {} }),

            updateTripDetails: (details) =>
                set((state) => ({
                    tripDetails: { ...state.tripDetails, ...details },
                })),
            updateTripData: (details) => get().updateTripDetails(details), 

            readyToGenerate: false,
            setReadyToGenerate: (val) => set({ readyToGenerate: val }),

            conversationId: null,
            setConversationId: (id) => set({ conversationId: id }),

            
            currentTrip: null,
            setCurrentTrip: (trip) => set({ currentTrip: trip }),

            
            editTarget: null,
            setEditTarget: (target) => set({ editTarget: target }),

            
            
            
            startTripFromVibe: (vibeCtx) => {
                const systemMessage: ChatMessage = {
                    id: `sys-${Date.now()}`,
                    role: 'system',
                    content: `User found a vibe they love! Context:
            - Mood: ${vibeCtx.mood?.join(', ')}
            - Suggested Destinations: ${vibeCtx.suggestedDestinations?.join(', ')}
            - Description: ${vibeCtx.description}
            - Season: ${vibeCtx.season}
            Start the conversation by acknowledging their vibe and asking about dates and budget.`,
                    timestamp: Date.now(),
                    metadata: { type: 'vibe-context' },
                };

                set({
                    vibeContext: vibeCtx,
                    currentFlow: 'vibe-to-chat',
                    messages: [systemMessage],
                    tripDetails: {
                        destination: vibeCtx.suggestedDestinations?.[0],
                        interests: vibeCtx.mood,
                    },
                });
            },

            
            
            
            editActivityFromItinerary: (dayIndex, activityIndex) => {
                const trip = get().currentTrip;
                if (!trip) return;

                const activity = trip.itinerary[dayIndex]?.activities[activityIndex];
                if (!activity) return;

                const editMessage: ChatMessage = {
                    id: `edit-${Date.now()}`,
                    role: 'system',
                    content: `User wants to change an activity:
            - Day ${dayIndex + 1}: ${trip.itinerary[dayIndex].title}
            - Activity: ${activity.title} at ${activity.time}
            - Location: ${activity.location}
            - Current description: ${activity.description}
            Ask them what they'd like instead.`,
                    timestamp: Date.now(),
                    metadata: {
                        type: 'edit-request',
                        editTarget: {
                            dayIndex,
                            activityIndex,
                            tripId: trip._id,
                        },
                    },
                };

                set({
                    currentFlow: 'editing-itinerary',
                    editTarget: { dayIndex, activityIndex },
                    messages: [...get().messages, editMessage],
                });
            },

            
            resetAll: () =>
                set({
                    currentFlow: 'idle',
                    vibeContext: null,
                    messages: [],
                    tripDetails: {},
                    readyToGenerate: false,
                    currentTrip: null,
                    editTarget: null,
                    conversationId: null,
                }),
        }),
        {
            name: 'travel-app-store',
            partialize: (state) => ({
                vibeContext: state.vibeContext,
                tripDetails: state.tripDetails,
                currentTrip: state.currentTrip,
                currentFlow: state.currentFlow,
                messages: state.messages,
                conversationId: state.conversationId,
            }),
        }
    )
);
