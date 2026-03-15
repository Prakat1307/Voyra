'use client';

import { motion } from 'framer-motion';

interface ChatMessageProps {
    message: {
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp?: string | number;
        isItinerary?: boolean;
        tripId?: string;
    };
    onViewTrip?: () => void;
}

export default function ChatMessage({ message, onViewTrip }: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`max-w-[80%] lg:max-w-[60%] ${isUser
                ? 'bg-indigo-600 text-white rounded-2xl rounded-br-md'
                : 'bg-white/10 text-white/90 rounded-2xl rounded-bl-md'
                } px-4 py-3`}>

                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

                {message.isItinerary && onViewTrip && (
                    <button
                        onClick={onViewTrip}
                        className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-xl transition flex items-center justify-center gap-2"
                    >
                        <span>📋</span> View Itinerary
                    </button>
                )}

                <span className={`text-[10px] mt-1 block ${isUser ? 'text-indigo-200' : 'text-white/30'
                    }`}>
                    {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit'
                    }) : ''}
                </span>
            </div>
        </motion.div>
    );
}
