
'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { VibeContextBanner } from '@/components/chat/VibeContextBanner';
import { EditContextBanner } from '@/components/chat/EditContextBanner';

export default function ChatClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        addMessage,
        setMessages,
        vibeContext,
        currentFlow,
        setFlow,
        tripDetails,
        updateTripDetails,
        editTarget,
        currentTrip,
        setCurrentTrip,
        setReadyToGenerate,
    } = useTripStore();

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    
    
    
    useEffect(() => {
        if (initialized) return;

        const from = searchParams.get('from');
        const destination = searchParams.get('destination');

        
        if (from === 'vibe' && vibeContext) {
            initFromVibe(destination || '');
        }
        
        else if (from === 'edit' && editTarget) {
            initFromEdit();
        }
        
        else if (messages.length === 0) {
            initFreshChat();
        }

        setInitialized(true);
    }, [searchParams]);

    
    const initFromVibe = async (destination: string) => {
        setFlow('vibe-to-chat');

        const greeting = {
            id: `ast-${Date.now()}`,
            role: 'assistant' as const,
            content: `Love the vibe! 🎨 I can see you're drawn to **${vibeContext?.mood?.join(', ')}** experiences.

I found **${destination}** as a perfect match. Let me help you plan this trip!

To get started:
- 📅 **When** are you thinking of going?
- 👥 **How many** travelers?
- 💰 Any **budget** in mind?

Or just tell me what your dream trip looks like!`,
            timestamp: Date.now(),
            metadata: { type: 'vibe-context' as const },
        };

        setMessages([greeting]);
    };

    
    const initFromEdit = async () => {
        if (!currentTrip || !editTarget) return;
        setFlow('editing-itinerary');

        const activity =
            currentTrip.itinerary[editTarget.dayIndex]?.activities[editTarget.activityIndex];

        const editGreeting = {
            id: `ast-${Date.now()}`,
            role: 'assistant' as const,
            content: `I see you want to change **Day ${editTarget.dayIndex + 1}** — 
**${activity?.title}** (${activity?.time}).

What would you prefer instead? You can tell me:
- A different type of activity
- A specific place you have in mind
- Just say "something more adventurous" and I'll figure it out! 🎯`,
            timestamp: Date.now(),
            metadata: { type: 'edit-request' as const },
        };

        addMessage(editGreeting);
    };

    
    const initFreshChat = () => {
        setFlow('chat-planning');

        const welcome = {
            id: `ast-${Date.now()}`,
            role: 'assistant' as const,
            content: `Hey there! 👋 I'm your AI travel planner.

Tell me about your dream trip! You can:
- 📸 Share a photo of a place you love → I'll find it
- 🗣️ Just describe what you're feeling
- 📍 Name a destination

What sounds exciting to you?`,
            timestamp: Date.now(),
        };

        setMessages([welcome]);
    };

    
    
    
    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: any = {
            id: `usr-${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: Date.now(),
        };
        addMessage(userMsg);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    tripDetails,
                    vibeContext,
                    currentFlow,
                    editTarget: editTarget
                        ? {
                            ...editTarget,
                            tripId: currentTrip?._id,
                            currentActivity:
                                currentTrip?.itinerary[editTarget.dayIndex]?.activities[
                                editTarget.activityIndex
                                ],
                        }
                        : null,
                }),
            });

            const data = await res.json();

            
            const assistantMsg: any = {
                id: `ast-${Date.now()}`,
                role: 'assistant',
                content: data.message,
                timestamp: Date.now(),
            };
            addMessage(assistantMsg);

            
            if (data.extractedDetails) {
                updateTripDetails(data.extractedDetails);
            }

            
            if (data.readyToGenerate) {
                setReadyToGenerate(true);
                handleGenerateItinerary(data.finalTripDetails || tripDetails);
            }

            
            if (data.updatedActivity && editTarget && currentTrip) {
                handleUpdateActivity(data.updatedActivity);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    
    
    
    const handleGenerateItinerary = async (details: any) => {
        setFlow('chat-to-itinerary');

        const generatingMsg: any = {
            id: `ast-gen-${Date.now()}`,
            role: 'assistant',
            content: `🎉 I have everything I need! Generating your personalized itinerary...`,
            timestamp: Date.now(),
        };
        addMessage(generatingMsg);

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripDetails: details,
                    vibeContext,
                    messages, 
                }),
            });
            const trip = await res.json();

            setCurrentTrip(trip);
            setFlow('viewing-itinerary');

            const readyMsg: any = {
                id: `ast-ready-${Date.now()}`,
                role: 'assistant',
                content: `✅ Your trip to **${details.destination}** is ready! 

🗺️ ${trip.itinerary.length} days of adventure planned.

[Click here to view your itinerary →](/itinerary/${trip._id})

Don't worry — you can always come back and change anything!`,
                timestamp: Date.now(),
            };
            addMessage(readyMsg);

            
            setTimeout(() => {
                router.push(`/itinerary/${trip._id}`);
            }, 3000);
        } catch (err) {
            console.error(err);
        }
    };

    
    
    
    const handleUpdateActivity = (updatedActivity: any) => {
        if (!currentTrip || !editTarget) return;

        const updatedItinerary = [...currentTrip.itinerary];
        updatedItinerary[editTarget.dayIndex].activities[editTarget.activityIndex] =
            updatedActivity;

        const updatedTrip = { ...currentTrip, itinerary: updatedItinerary };
        setCurrentTrip(updatedTrip);

        
        fetch(`/api/trips/${currentTrip._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itinerary: updatedItinerary }),
        });

        const doneMsg: any = {
            id: `ast-done-${Date.now()}`,
            role: 'assistant',
            content: `✅ Updated! Day ${editTarget.dayIndex + 1} now has **${updatedActivity.title}** instead.

[← Back to your itinerary](/itinerary/${currentTrip._id})`,
            timestamp: Date.now(),
        };
        addMessage(doneMsg);
    };

    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-screen bg-slate-900">
            {}
            {currentFlow === 'vibe-to-chat' && vibeContext && (
                <VibeContextBanner vibeContext={vibeContext} />
            )}
            {currentFlow === 'editing-itinerary' && editTarget && currentTrip && (
                <EditContextBanner
                    editTarget={editTarget}
                    trip={currentTrip}
                    onCancel={() => router.push(`/itinerary/${currentTrip._id}`)}
                />
            )}

            {}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                    {messages
                        .filter((m) => m.role !== 'system')
                        .map((msg) => (
                            <ChatMessage key={msg.id} message={msg} />
                        ))}
                </AnimatePresence>

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-white/50"
                    >
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        </div>
                        Planning...
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {}
            <ChatInput
                value={input}
                onChange={setInput}
                onSend={handleSend}
                loading={loading}
                placeholder={
                    currentFlow === 'editing-itinerary'
                        ? "What would you prefer instead?"
                        : "Tell me about your dream trip..."
                }
            />
        </div>
    );
}
