'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ReplanNotificationProps {
    notification: any;
    onAccept: (id: string) => void;
    onDismiss: (id: string) => void;
}

export default function ReplanNotification({ notification, onAccept, onDismiss }: ReplanNotificationProps) {
    if (!notification) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-20 right-4 z-50 max-w-sm w-full bg-slate-900 rounded-xl shadow-2xl border border-indigo-500/20 overflow-hidden"
            >
                <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <span>🔔</span>
                        <h3 className="font-medium text-sm">Itinerary Update</h3>
                    </div>
                    <button onClick={() => onDismiss(notification._id)} className="text-white/60 hover:text-white">✕</button>
                </div>

                <div className="p-4">
                    <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                        {notification.message}
                    </p>

                    <div className="bg-slate-800 rounded-lg p-3 text-xs space-y-2 mb-4 border border-slate-700">
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="font-semibold text-slate-200">Suggestion:</span>
                        </div>
                        {notification.suggestedPlan.activities.slice(0, 3).map((act: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                <span>{act.timeSlot?.start} - {act.name}</span>
                            </div>
                        ))}
                        {notification.suggestedPlan.activities.length > 3 && (
                            <p className="text-slate-500 pl-3.5">+ {notification.suggestedPlan.activities.length - 3} more</p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onAccept(notification._id)}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition"
                        >
                            Update Plan
                        </button>
                        <button
                            onClick={() => onDismiss(notification._id)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2 rounded-lg transition border border-slate-700"
                        >
                            Keep Original
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
