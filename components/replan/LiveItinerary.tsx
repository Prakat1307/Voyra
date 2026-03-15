'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReplanNotification from './ReplanNotification';

interface LiveItineraryProps {
    tripId: string;
    dayPlan: any;
    onUpdate: () => void;
}

export default function LiveItinerary({ tripId, dayPlan, onUpdate }: LiveItineraryProps) {
    const [weather, setWeather] = useState<any>(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [notification, setNotification] = useState<any>(null);
    const [checkingReplan, setCheckingReplan] = useState(false);

    
    useEffect(() => {
        
        
        const checkConditions = async () => {
            setLoadingWeather(true);
            
            await new Promise(r => setTimeout(r, 1000));

            const mockWeather = {
                temp: 22,
                condition: 'Rainy',
                icon: '🌧️'
            };
            setWeather(mockWeather);
            setLoadingWeather(false);

            
            if (mockWeather.condition === 'Rainy' && !notification) {
                checkReplan('weather', mockWeather);
            }
        };

        checkConditions();
    }, [dayPlan]);

    const checkReplan = async (type: string, data: any) => {
        setCheckingReplan(true);
        try {
            const response = await fetch('/api/replan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripId,
                    dayId: dayPlan.dayNumber,
                    trigger: { type, data },
                    userConstraints: {}
                })
            });

            const result = await response.json();
            if (result.success) {
                setNotification({
                    _id: result.notificationId,
                    message: result.suggestion.replanMessage,
                    suggestedPlan: { activities: result.suggestion.updatedActivities }
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCheckingReplan(false);
        }
    };

    const handleAccept = async (id: string) => {
        
        setNotification(null);
        onUpdate(); 
        alert("Itinerary updated! 🌧️ Indoor plan activated.");
    };

    return (
        <div className="space-y-6">
            <ReplanNotification
                notification={notification}
                onAccept={handleAccept}
                onDismiss={() => setNotification(null)}
            />

            {}
            <div className="bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-800 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Live Conditions</h3>
                    <div className="flex items-center gap-3 mt-1">
                        {loadingWeather ? (
                            <div className="h-8 w-24 bg-slate-800 animate-pulse rounded" />
                        ) : (
                            <>
                                <span className="text-3xl">{weather?.icon}</span>
                                <div>
                                    <p className="text-xl font-bold text-white">{weather?.temp}°C</p>
                                    <p className="text-sm text-slate-400">{weather?.condition}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => checkReplan('manual', null)}
                    disabled={checkingReplan}
                    className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium transition border border-indigo-500/30"
                >
                    {checkingReplan ? 'Checking...' : 'Check Schedule'}
                </button>
            </div>

            {}
            <div className="relative border-l-2 border-slate-800 ml-4 space-y-8 pl-8 py-2">
                {dayPlan.activities.map((act: any, i: number) => (
                    <motion.div
                        key={act.id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative"
                    >
                        <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white ${act.status === 'completed' ? 'bg-green-500' : 'bg-indigo-500'
                            }`} />

                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm hover:shadow-md transition hover:border-slate-700">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-white">{act.name}</h4>
                                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                                    {act.timeSlot?.start}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-3 line-clamp-2">{act.description}</p>

                            <div className="flex gap-2 text-xs">
                                {act.status === 'planned' && (
                                    <button className="text-slate-500 hover:text-green-400 transition">
                                        Mark Done
                                    </button>
                                )}
                                <button className="text-slate-500 hover:text-indigo-400 transition">
                                    Details
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
