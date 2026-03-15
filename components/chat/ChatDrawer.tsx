
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTripStore } from '@/lib/store';
import {
    X,
    Send,
    Sparkles,
    ArrowLeft,
    Loader2,
} from 'lucide-react';

interface ChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
}

export function ChatDrawer({ isOpen, onClose, tripId }: ChatDrawerProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const {
        messages,
        addMessage,
        editTarget,
        setEditTarget,
        currentTrip,
        setCurrentTrip,
        vibeContext,
        currentFlow,
        setFlow,
        tripDetails,
    } = useTripStore();

    
    
    
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    
    
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    
    
    
    useEffect(() => {
        if (!editTarget || !currentTrip || !isOpen) return;

        const activity =
            currentTrip.itinerary[editTarget.dayIndex]?.activities[
            editTarget.activityIndex
            ];

        if (!activity) return;

        
        generateSuggestions(activity);

        
        const hasEditGreeting = messages.some(
            (m) => m.metadata?.type === 'edit-request'
        );
        if (hasEditGreeting) return;

        const editGreeting = {
            id: `ast-edit-${Date.now()}`,
            role: 'assistant' as const,
            content: `✏️ **Editing Day ${editTarget.dayIndex + 1}**

**${activity.title}** — ${activity.time}
📍 ${activity.location}

What would you like instead? You can:
- Describe what you want
- Pick a suggestion below
- Say "surprise me!"`,
            timestamp: Date.now(),
            metadata: { type: 'edit-request' as const },
        };

        addMessage(editGreeting);
    }, [editTarget, isOpen]);

    
    
    
    const generateSuggestions = async (activity: any) => {
        const typeMap: Record<string, string[]> = {
            sightseeing: [
                '🏛️ Something more cultural',
                '📸 A hidden photo spot instead',
                '🚶 A walking tour of the area',
            ],
            food: [
                '🍜 Street food experience',
                '🍷 Fine dining instead',
                '👨🍳 A cooking class',
            ],
            adventure: [
                '🧘 Something more relaxing',
                '🤿 Water-based activity',
                '🚴 Cycling adventure',
            ],
            relaxation: [
                '⚡ Something more adventurous',
                '💆 Spa & wellness',
                '☕ Café hopping instead',
            ],
            culture: [
                '🎨 Art gallery visit',
                '🎭 Live performance',
                '📚 Historical deep dive',
            ],
        };

        setSuggestions(
            typeMap[activity.type] || [
                '🔄 Something completely different',
                '⬆️ Upgrade this experience',
                '🎲 Surprise me!',
            ]
        );
    };

    
    
    
    const handleDayReplan = (updatedDay: any) => {
        if (!currentTrip) return;

        const dayIndex = updatedDay.day - 1;
        const updatedItinerary = JSON.parse(JSON.stringify(currentTrip.itinerary));

        
        updatedDay.activities = updatedDay.activities.map((act: any) => ({
            ...act,
            _justUpdated: true,
        }));

        updatedItinerary[dayIndex] = updatedDay;

        const updatedTrip = { ...currentTrip, itinerary: updatedItinerary };
        setCurrentTrip(updatedTrip);

        
        fetch(`/api/trips/${currentTrip._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                updateDay: { dayIndex, day: updatedDay },
            }),
        });

        
        const confirmMsg = {
            id: `ast-confirm-${Date.now()}`,
            role: 'assistant' as const,
            content: `✅ **Day ${updatedDay.day}** has been completely replanned!

New schedule:
${updatedDay.activities
                    .map((a: any) => `- **${a.time}**: ${a.title}`)
                    .join('\n')}

Look to the left — it's already updated! 👀`,
            timestamp: Date.now(),
        };
        addMessage(confirmMsg);

        setSuggestions([
            '👍 Perfect!',
            '🔄 Try again differently',
            '✏️ Tweak one of these',
        ]);

        
        setTimeout(() => {
            const cleanDay = {
                ...updatedDay,
                activities: updatedDay.activities.map((a: any) => ({
                    ...a,
                    _justUpdated: false,
                })),
            };
            const cleanItinerary = [...updatedItinerary];
            cleanItinerary[dayIndex] = cleanDay;
            setCurrentTrip({ ...updatedTrip, itinerary: cleanItinerary });
        }, 3000);
    };

    
    
    
    const handleRealTimeUpdate = (updatedActivity: any) => {
        if (!currentTrip || !editTarget) return;

        const updatedItinerary = JSON.parse(JSON.stringify(currentTrip.itinerary));
        updatedItinerary[editTarget.dayIndex].activities[editTarget.activityIndex] =
        {
            ...updatedActivity,
            _justUpdated: true, 
        };

        const updatedTrip = {
            ...currentTrip,
            itinerary: updatedItinerary,
        };

        setCurrentTrip(updatedTrip);

        
        fetch(`/api/trips/${currentTrip._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itinerary: updatedItinerary }),
        });

        
        setTimeout(() => {
            setEditTarget(null);

            
            const cleanItinerary = JSON.parse(JSON.stringify(updatedItinerary));
            cleanItinerary[editTarget.dayIndex].activities[
                editTarget.activityIndex
            ]._justUpdated = false;
            setCurrentTrip({ ...updatedTrip, itinerary: cleanItinerary });
        }, 3000);
    };

    
    
    
    const handleReplanSuggestion = (replan: any) => {
        const replanMsg = {
            id: `ast-replan-${Date.now()}`,
            role: 'assistant' as const,
            content: `🔄 **This change affects other parts of your day:**

${replan.explanation}

Would you like me to adjust the rest of Day ${(editTarget?.dayIndex || 0) + 1} to fit better?`,
            timestamp: Date.now(),
        };
        addMessage(replanMsg);

        setSuggestions([
            '✅ Yes, replan the full day',
            '❌ No, just change this one',
            '🔄 Show me both options',
        ]);
    };

    
    
    
    const handleSend = async (customInput?: string) => {
        const messageText = customInput || input;
        if (!messageText.trim() || loading) return;

        const userMsg = {
            id: `usr-${Date.now()}`,
            role: 'user' as const,
            content: messageText.trim(),
            timestamp: Date.now(),
        };
        addMessage(userMsg);
        setInput('');
        setLoading(true);
        setSuggestions([]);

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
                            fullItinerary: currentTrip?.itinerary,
                        }
                        : null,
                    mode: editTarget ? 'edit' : 'general',
                }),
            });

            const data = await res.json();

            const assistantMsg = {
                id: `ast-${Date.now()}`,
                role: 'assistant' as const,
                content: data.message,
                timestamp: Date.now(),
            };
            addMessage(assistantMsg);

            
            if (data.updatedActivity && editTarget && currentTrip) {
                handleRealTimeUpdate(data.updatedActivity);
            }

            
            if (data.replanSuggestion) {
                handleReplanSuggestion(data.replanSuggestion);
            }

            
            if (data.updatedDay && currentTrip) {
                handleDayReplan(data.updatedDay);
            }

            
            if (data.followUpSuggestions) {
                setSuggestions(data.followUpSuggestions);
            }
        } catch (err) {
            console.error(err);
            addMessage({
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: '❌ Something went wrong. Try again?',
                timestamp: Date.now(),
            });
        } finally {
            setLoading(false);
        }
    };

    
    
    
    const handleGeneralChat = () => {
        setEditTarget(null);

        const generalMsg = {
            id: `ast-general-${Date.now()}`,
            role: 'assistant' as const,
            content: `💬 What would you like to change about your trip?

You can:
- "Add a beach day"
- "Day 3 is too packed, make it lighter"
- "Swap Day 2 and Day 4"
- "Find me a better restaurant for dinner on Day 1"
- "Change the whole vibe to more adventurous"`,
            timestamp: Date.now(),
        };
        addMessage(generalMsg);

        setSuggestions([
            '📅 Rearrange my days',
            '➕ Add a free day',
            '🔄 Change the pace',
            '🍽️ Better food spots',
        ]);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />

                    {}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900
                       border-l border-white/10 shadow-2xl z-50 flex flex-col"
                    >
                        {}
                        <div className="flex items-center justify-between px-5 py-4
                            border-b border-white/10 bg-slate-900/80 backdrop-blur">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-r from-purple-600 to-pink-600
                                rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-sm">
                                        {editTarget ? 'Edit Activity' : 'Trip Assistant'}
                                    </h3>
                                    <p className="text-white/40 text-xs">
                                        {editTarget
                                            ? `Day ${editTarget.dayIndex + 1} · Activity ${editTarget.activityIndex + 1}`
                                            : 'Ask me anything about your trip'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-lg
                           hover:bg-white/10 text-white/50 hover:text-white transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {}
                        <AnimatePresence>
                            {editTarget && currentTrip && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                                <span className="text-amber-300 text-xs font-medium">
                                                    Editing:{' '}
                                                    {
                                                        currentTrip.itinerary[editTarget.dayIndex]
                                                            ?.activities[editTarget.activityIndex]?.title
                                                    }
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setEditTarget(null);
                                                    handleGeneralChat();
                                                }}
                                                className="text-amber-300/60 hover:text-amber-300
                                   text-xs flex items-center gap-1"
                                            >
                                                <ArrowLeft className="w-3 h-3" />
                                                General chat
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4
                            scrollbar-thin scrollbar-track-transparent
                            scrollbar-thumb-white/10">
                            <AnimatePresence>
                                {messages
                                    .filter((m) => m.role !== 'system')
                                    .map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                                                }`}
                                        >
                                            <div
                                                className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                                        ? 'bg-purple-600 text-white rounded-tr-sm'
                                                        : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
                                                    }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                                    {msg.content}
                                                </p>
                                                <p
                                                    className={`text-[10px] mt-1 ${msg.role === 'user'
                                                            ? 'text-purple-200'
                                                            : 'text-white/30'
                                                        }`}
                                                >
                                                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    }) : ''}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                            </AnimatePresence>

                            {}
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="bg-white/5 border border-white/10 rounded-2xl
                                  rounded-tl-sm px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                                            <span className="text-white/50 text-sm">Thinking...</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {}
                        <AnimatePresence>
                            {suggestions.length > 0 && !loading && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-5 py-3 border-t border-white/5 overflow-hidden"
                                >
                                    <p className="text-white/30 text-xs mb-2">Quick suggestions</p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.map((s, i) => (
                                            <motion.button
                                                key={s}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                onClick={() => handleSend(s)}
                                                className="px-3 py-1.5 bg-white/5 border border-white/10
                                   text-white/70 rounded-full text-xs
                                   hover:bg-purple-500/20 hover:border-purple-500/30
                                   hover:text-purple-300 transition-all"
                                            >
                                                {s}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {}
                        <div className="px-4 py-4 border-t border-white/10 bg-slate-900/80
                            backdrop-blur">
                            <div className="flex items-center gap-2 bg-white/5 border
                              border-white/10 rounded-xl px-4 py-2
                              focus-within:border-purple-500/50 transition">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={
                                        editTarget
                                            ? 'What would you prefer instead?'
                                            : 'Ask me anything about your trip...'
                                    }
                                    className="flex-1 bg-transparent text-white text-sm
                             placeholder:text-white/30 outline-none"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || loading}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg
                             bg-purple-600 text-white hover:bg-purple-700
                             disabled:opacity-30 disabled:cursor-not-allowed
                             transition"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
