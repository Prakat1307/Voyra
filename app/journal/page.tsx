"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/custom/glass-card";
import { AnimatedButton } from "@/components/custom/animated-button";
import {
    BookOpen, Star, MapPin, Calendar, Lock, Globe, Share2, Download, Image as ImageIcon, Sparkles, Map, ChevronRight, CheckCircle2
} from "lucide-react";

const MOCK_JOURNAL = {
    trip_name: "Weekend in Jaipur",
    dates: "Nov 21 - Nov 24, 2025",
    summary: "Best markets and forts! The morning light at Amber Fort was incredible, and the local food scenes in the old city were unforgettable. A perfect blend of heritage and culture.",
    privacy: "private",
    days: [
        {
            day: 1,
            items: [
                {
                    time: "09:00 AM",
                    place: "Amber Fort",
                    notes: "Loved the light in the morning. We hiked up all the way. Getting there early meant we beat the crowds.",
                    rating: 5,
                    photos: ["https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=600&auto=format&fit=crop"]
                },
                {
                    time: "01:30 PM",
                    place: "Laxmi Mishthan Bhandar (LMB)",
                    notes: "Amazing Raj Kachori and Ghevar. Very crowded but totally worth the wait.",
                    rating: 4,
                    photos: []
                }
            ]
        },
        {
            day: 2,
            items: [
                {
                    time: "10:00 AM",
                    place: "Hawa Mahal",
                    notes: "Went to the cafe opposite to get the best view and photos.",
                    rating: 5,
                    photos: ["https://images.unsplash.com/photo-1599661046289-e31897846140?q=80&w=600&auto=format&fit=crop"]
                }
            ]
        }
    ]
};

export default function TripJournalPage() {
    const [privacy, setPrivacy] = useState(MOCK_JOURNAL.privacy);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => setIsExporting(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-12 px-4">
            {}
            <div className="max-w-4xl mx-auto mb-10 text-center">
                <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-6">
                    <BookOpen size={32} />
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{MOCK_JOURNAL.trip_name}</h1>
                <div className="flex justify-center gap-4 text-slate-400 text-sm">
                    <span className="flex items-center gap-1"><Calendar size={16} /> {MOCK_JOURNAL.dates}</span>
                    <span className="flex items-center gap-1"><MapPin size={16} /> Jaipur, India</span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">

                {}
                <GlassCard className="p-4 border-white/10 flex flex-wrap justify-between items-center bg-primary/5">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPrivacy(privacy === "private" ? "public" : "private")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${privacy === "private" ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-green-500/20 text-green-400 border border-green-500/30"}`}
                        >
                            {privacy === "private" ? <><Lock size={14} /> Private</> : <><Globe size={14} /> Public</>}
                        </button>
                        <span className="text-xs text-slate-500 hidden sm:inline-block">
                            {privacy === "private" ? "Only you can see this." : "Visible to community."}
                        </span>
                    </div>

                    <div className="flex gap-3">
                        <AnimatedButton variant="outline" className="border-white/10 hover:bg-white/5">
                            <Share2 size={16} className="mr-2" /> Share Link
                        </AnimatedButton>
                        <AnimatedButton
                            className="bg-primary text-white"
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            {isExporting ? <CheckCircle2 size={16} className="mr-2" /> : <Download size={16} className="mr-2" />}
                            {isExporting ? "Exported!" : "Export PDF"}
                        </AnimatedButton>
                    </div>
                </GlassCard>

                {}
                <GlassCard className="p-6 md:p-8 border-white/10 border-l-4 border-l-primary relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
                    <h3 className="font-semibold text-primary flex items-center gap-2 mb-3">
                        <Sparkles size={18} /> AI Trip Highlight
                    </h3>
                    <p className="text-lg text-slate-300 leading-relaxed font-display italic">
                        "{MOCK_JOURNAL.summary}"
                    </p>
                    <div className="mt-4 flex gap-2">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-400 border border-white/10">#heritage</span>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-400 border border-white/10">#weekend-getaway</span>
                    </div>
                </GlassCard>

                {}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Daily Memories</h2>

                    {MOCK_JOURNAL.days.map((day, dIdx) => (
                        <div key={dIdx} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-slate-800 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-slate-700">
                                    {day.day}
                                </span>
                                <span className="font-bold text-slate-400">Day {day.day}</span>
                                <div className="flex-1 h-px bg-white/10" />
                            </div>

                            <div className="pl-4 md:pl-11 space-y-4">
                                {day.items.map((item, iIdx) => (
                                    <GlassCard key={iIdx} className="p-5 border-white/10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">{item.place}</h3>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <span className="text-primary font-medium">{item.time}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={14}
                                                        className={star <= item.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-300 mb-4">{item.notes}</p>

                                        {item.photos.length > 0 && (
                                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mt-4">
                                                {item.photos.map((photo, pIdx) => (
                                                    <div key={pIdx} className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 group cursor-pointer ring-1 ring-white/10 hover:ring-primary transition-all">
                                                        <img src={photo} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
                                            <button className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                                                <ImageIcon size={14} /> Add Photos
                                            </button>
                                        </div>
                                    </GlassCard>
                                ))}

                                <button className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-slate-500 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                                    Add Memory to Day {day.day}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
