'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineActivity {
    time: string;
    title: string;
    type: string;
    duration: string;
    icon: string;
    description?: string;
    location?: string;
    cost?: string;
}

interface TimelineDay {
    day: number;
    title: string;
    theme: string;
    activities: TimelineActivity[];
}

interface TripTimelineProps {
    itinerary?: TimelineDay[];
    days?: number;
}

const TYPE_COLORS: Record<string, string> = {
    sightseeing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    food: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    adventure: 'bg-red-500/10 text-red-400 border-red-500/30',
    leisure: 'bg-green-500/10 text-green-400 border-green-500/30',
    wellness: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    transport: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    shopping: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
};

const THEMES = ['Arrival & Explore', 'Adventure Day', 'Culture & Heritage', 'Nature & Relaxation', 'Departure'];

export default function TripTimeline({ itinerary, days }: TripTimelineProps) {
    const [activeDay, setActiveDay] = useState(1);
    const [expandedActivity, setExpandedActivity] = useState<number | null>(null);

    const timelineData: TimelineDay[] = itinerary || Array.from({ length: days || 3 }, (_, i) => ({
        day: i + 1,
        title: `Day ${i + 1}`,
        theme: THEMES[i % 5],
        activities: [
            { time: '06:00', title: 'Sunrise Yoga', type: 'wellness', duration: '1hr', icon: '🧘' },
            { time: '08:00', title: 'Breakfast at Local Cafe', type: 'food', duration: '45min', icon: '🍳' },
            { time: '10:00', title: 'Visit Temple', type: 'sightseeing', duration: '2hr', icon: '🏛️' },
            { time: '13:00', title: 'Lunch - Street Food Tour', type: 'food', duration: '1.5hr', icon: '🍜' },
            { time: '15:00', title: 'Beach Walk', type: 'leisure', duration: '2hr', icon: '🏖️' },
            { time: '18:00', title: 'Sunset Point', type: 'sightseeing', duration: '1hr', icon: '🌅' },
            { time: '20:00', title: 'Dinner', type: 'food', duration: '1.5hr', icon: '🍽️' },
        ]
    }));

    const currentDay = timelineData.find(d => d.day === activeDay);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🗺️ Trip Timeline
            </h2>

            {}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {timelineData.map((day) => (
                    <motion.button
                        key={day.day}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setActiveDay(day.day); setExpandedActivity(null); }}
                        className={`flex-shrink-0 px-5 py-3 rounded-xl transition-all text-center min-w-[80px]
              ${activeDay === day.day
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105 border border-indigo-400/30'
                                : 'glass text-slate-400 border border-slate-700/50 hover:border-indigo-500/30'}`}
                    >
                        <p className="text-[10px] opacity-70 uppercase tracking-wider">Day</p>
                        <p className="text-xl font-bold">{day.day}</p>
                        <p className="text-[9px] opacity-60 mt-0.5 truncate max-w-[70px]">{day.theme}</p>
                    </motion.button>
                ))}
            </div>

            {}
            <AnimatePresence mode="wait">
                {currentDay && (
                    <motion.div
                        key={activeDay}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                    >
                        {}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 opacity-50" />

                        <div className="space-y-1">
                            {currentDay.activities.map((activity, i) => (
                                <div key={i} className="relative pl-14">
                                    {}
                                    <div className={`absolute left-[18px] top-5 w-4 h-4 rounded-full border-[3px] z-10 shadow-sm transition-all
                    ${expandedActivity === i
                                            ? 'bg-indigo-500 border-indigo-300 shadow-indigo-500/50'
                                            : 'bg-slate-900 border-indigo-500'}`}
                                    />

                                    {}
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => setExpandedActivity(expandedActivity === i ? null : i)}
                                        className={`w-full text-left glass rounded-xl p-4 border transition-all hover:border-indigo-500/30
                      ${expandedActivity === i
                                                ? 'border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                                                : 'border-slate-700/50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl flex-shrink-0">{activity.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                                        {activity.time}
                                                    </span>
                                                    <h4 className="font-semibold text-white text-sm">{activity.title}</h4>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[9px] px-2 py-0.5 rounded-full border ${TYPE_COLORS[activity.type] || TYPE_COLORS.sightseeing}`}>
                                                        {activity.type}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500">⏱️ {activity.duration}</span>
                                                </div>
                                            </div>
                                            <svg
                                                className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ${expandedActivity === i ? 'rotate-180' : ''}`}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>

                                        <AnimatePresence>
                                            {expandedActivity === i && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-3 pt-3 border-t border-slate-700/50 text-sm text-slate-400 overflow-hidden"
                                                >
                                                    <p>{activity.description || 'Detailed description of the activity would go here. This is pulled from your Gemini-generated itinerary.'}</p>
                                                    <div className="flex gap-2 mt-3">
                                                        {activity.location && (
                                                            <span className="text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                                                📍 {activity.location}
                                                            </span>
                                                        )}
                                                        {activity.cost && (
                                                            <span className="text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                                                💰 {activity.cost}
                                                            </span>
                                                        )}
                                                        {!activity.location && !activity.cost && (
                                                            <>
                                                                <span className="text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-700">📍 Location info</span>
                                                                <span className="text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-700">💰 Cost estimate</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
