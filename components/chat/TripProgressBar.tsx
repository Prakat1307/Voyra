'use client';

import { motion } from 'framer-motion';

const rounds = [
    { label: 'Destination', icon: '📍' },
    { label: 'Dates', icon: '📅' },
    { label: 'Budget', icon: '💰' },
    { label: 'Details', icon: '⚡' },
    { label: 'Generate', icon: '✨' },
];

interface TripProgressBarProps {
    round?: number;
    tripData?: any;
}

export default function TripProgressBar({ round = 1, tripData = {} }: TripProgressBarProps) {
    return (
        <div className="hidden md:flex items-center gap-1">
            {rounds.map((r, i) => {
                const step = i + 1;
                const isActive = step === round;
                const isCompleted = step < round;

                return (
                    <div key={i} className="flex items-center">
                        <motion.div
                            animate={{
                                scale: isActive ? 1.1 : 1,
                                backgroundColor: isCompleted
                                    ? 'rgba(99, 102, 241, 0.8)'
                                    : isActive
                                        ? 'rgba(99, 102, 241, 0.4)'
                                        : 'rgba(255, 255, 255, 0.05)'
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                        >
                            <span>{r.icon}</span>
                            <span className={`hidden lg:inline ${isCompleted ? 'text-indigo-200' : isActive ? 'text-white' : 'text-white/30'
                                }`}>
                                {r.label}
                            </span>
                            {isCompleted && <span className="text-green-400">✓</span>}
                        </motion.div>
                        {i < rounds.length - 1 && (
                            <div className={`w-4 h-px mx-0.5 ${isCompleted ? 'bg-indigo-500' : 'bg-white/10'
                                }`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
