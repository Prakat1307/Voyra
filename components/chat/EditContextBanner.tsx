
'use client';

import { motion } from 'framer-motion';

export function EditContextBanner({
    editTarget,
    trip,
    onCancel,
}: {
    editTarget: { dayIndex: number; activityIndex: number };
    trip: any;
    onCancel: () => void;
}) {
    const activity =
        trip.itinerary[editTarget.dayIndex]?.activities[editTarget.activityIndex];

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 
                 border-b border-amber-500/30 px-6 py-3"
        >
            <div className="flex items-center justify-between max-w-4xl mx-auto">
                <div>
                    <p className="text-amber-300 text-sm font-medium">
                        ✏️ Editing: Day {editTarget.dayIndex + 1} — {activity?.title}
                    </p>
                    <p className="text-amber-300/60 text-xs mt-0.5">
                        {activity?.time} · {activity?.location}
                    </p>
                </div>
                <button
                    onClick={onCancel}
                    className="text-amber-300/60 hover:text-amber-300 text-sm
                     px-3 py-1 rounded-lg hover:bg-amber-500/10 transition"
                >
                    ✕ Cancel
                </button>
            </div>
        </motion.div>
    );
}
