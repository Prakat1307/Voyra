"use client";

import { useState } from 'react';
import { Youtube, Sparkles, Loader2, MapPin, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratedItinerary {
    title: string;
    destination: string;
    highlights: string[];
    itinerary: { day: string; activities: any[] }[];
    tips: string[];
    estimated_budget: string;
}

export default function ReelToItinerary() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GeneratedItinerary | null>(null);

    const handleGenerate = async () => {
        if (!url.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch('/api/reel-to-itinerary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to process video');
            setResult(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {}
            <div className="p-5 border-b border-border">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
                        <Youtube className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="font-semibold text-foreground">YouTube Reel → Itinerary</h3>
                </div>
                <p className="text-xs text-muted-foreground ml-8">Paste any travel vlog URL and we'll extract a full itinerary from it</p>
            </div>

            <div className="p-5 space-y-4">
                {/* URL Input */}
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="url"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                            className="w-full bg-secondary border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !url.trim()}
                        className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {loading ? 'Extracting...' : 'Generate'}
                    </button>
                </div>

                {/* Loading state */}
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Fetching transcript and generating itinerary with AI...</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">This may take 15-30 seconds</p>
                    </motion.div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* Result */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {/* Title & Destination */}
                            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                                <h4 className="font-bold text-foreground text-base">{result.title}</h4>
                                <p className="text-sm text-primary flex items-center gap-1.5 mt-1">
                                    <MapPin className="w-3.5 h-3.5" /> {result.destination}
                                </p>
                                {result.estimated_budget && (
                                    <p className="text-xs text-muted-foreground mt-1">💰 {result.estimated_budget}</p>
                                )}
                            </div>

                            {/* Highlights */}
                            {result.highlights?.length > 0 && (
                                <div>
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Highlights</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {result.highlights.map((h, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-secondary border border-border rounded-full text-xs text-foreground">
                                                ✨ {h}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Day-by-day */}
                            <div>
                                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Itinerary</h5>
                                <div className="space-y-3">
                                    {result.itinerary?.map((day, dayIdx) => (
                                        <div key={dayIdx} className="bg-secondary rounded-xl p-3.5 border border-border">
                                            <p className="font-semibold text-sm text-foreground mb-2">{day.day}</p>
                                            <div className="space-y-2">
                                                {day.activities?.map((act: any, i: number) => (
                                                    <div key={i} className="flex gap-2 text-sm">
                                                        <span className="text-primary font-medium min-w-[60px] text-xs">{act.time || 'Stop'}</span>
                                                        <div>
                                                            <p className="text-foreground font-medium text-xs">{act.activity}</p>
                                                            {act.location && <p className="text-muted-foreground text-[11px]">📍 {act.location}</p>}
                                                            {act.notes && <p className="text-muted-foreground text-[11px]">{act.notes}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tips */}
                            {result.tips?.length > 0 && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3.5 border border-amber-200 dark:border-amber-800">
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                                        <Lightbulb className="w-3.5 h-3.5" /> Travel Tips from Video
                                    </h5>
                                    <ul className="space-y-1.5">
                                        {result.tips.map((tip, i) => (
                                            <li key={i} className="text-xs text-amber-800 dark:text-amber-300 flex gap-2">
                                                <span className="text-amber-500">•</span> {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
