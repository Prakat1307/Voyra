
'use client';

import { motion } from 'framer-motion';

export function VibeContextBanner({ vibeContext }: { vibeContext: any }) {
    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 
                 border-b border-purple-500/30 px-6 py-3"
        >
            <div className="flex items-center gap-4 max-w-4xl mx-auto">
                {vibeContext.imageUrl && (
                    <img
                        src={vibeContext.imageUrl}
                        alt="Vibe"
                        className="w-12 h-12 rounded-lg object-cover ring-2 ring-purple-500/50"
                    />
                )}
                <div className="flex-1">
                    <p className="text-purple-300 text-sm font-medium">
                        🎨 Planning from your vibe match
                    </p>
                    <div className="flex gap-2 mt-1">
                        {vibeContext.mood?.map((m: string) => (
                            <span
                                key={m}
                                className="text-xs px-2 py-0.5 bg-purple-500/20 
                           text-purple-300 rounded-full"
                            >
                                {m}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
