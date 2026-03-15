"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DollarSign, Clock, MapPin, BedDouble, Calendar, Users, Briefcase,
    Share2, Download, Edit3, Utensils, Sparkles, Plane, Train, Car,
    Camera, Sunrise, Sun, Sunset, Moon, Coffee, CheckCircle2,
    ArrowRight, Wallet, Tag, TrendingUp
} from "lucide-react";
import { AnimatedButton } from "@/components/custom/animated-button";


const BUDGET_ESTIMATES: Record<string, { hotel: number; food: number; activities: number; misc: number }> = {
    budget: { hotel: 800, food: 400, activities: 300, misc: 200 },
    "mid-range": { hotel: 2500, food: 1000, activities: 800, misc: 500 },
    "mid range": { hotel: 2500, food: 1000, activities: 800, misc: 500 },
    luxury: { hotel: 8000, food: 3000, activities: 2000, misc: 1500 },
};

function parseNumTravelers(travelers: any): number {
    if (!travelers) return 1;
    if (typeof travelers === "number") return travelers;
    const nums = String(travelers).match(/\d+/g);
    if (!nums || nums.length === 0) return 1;
    return nums.reduce((sum: number, n: string) => sum + parseInt(n, 10), 0) || 1;
}

function getTimeIcon(time: string) {
    if (!time) return <Clock size={14} />;
    const h = parseInt(time.split(":")[0]) || 0;
    if (h >= 5 && h < 9) return <Sunrise size={14} />;
    if (h >= 9 && h < 13) return <Sun size={14} />;
    if (h >= 13 && h < 18) return <Coffee size={14} />;
    if (h >= 18 && h < 21) return <Sunset size={14} />;
    return <Moon size={14} />;
}

function getModeIcon(mode: string | null) {
    if (mode === "flight") return <Plane size={14} />;
    if (mode === "train") return <Train size={14} />;
    return <Car size={14} />;
}

const TYPE_STYLE: Record<string, { card: string; dot: string; badge: string }> = {
    transit: { card: "from-violet-500/20 to-purple-500/10 border-violet-500/30", dot: "bg-violet-400", badge: "text-violet-300" },
    activity: { card: "from-sky-500/20 to-cyan-500/10 border-sky-500/30", dot: "bg-sky-400", badge: "text-sky-300" },
    dining: { card: "from-amber-500/20 to-orange-500/10 border-amber-500/30", dot: "bg-amber-400", badge: "text-amber-300" },
};
const DEFAULT_STYLE = { card: "from-slate-500/20 to-slate-600/10 border-slate-500/30", dot: "bg-slate-400", badge: "text-slate-300" };

function safeStr(val: any, fallback = ""): string {
    if (val === null || val === undefined) return fallback;
    return String(val);
}

export default function ItineraryResultsPage({ params }: { params: { tripId: string } }) {
    const [tripData, setTripData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [heroImage, setHeroImage] = useState<string>("");
    const [activeDay, setActiveDay] = useState(0);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const res = await fetch(`/api/trips/${params.tripId}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setTripData(data);

                const dest = data?.tripDetails?.destination || data?.metadata?.title || "travel destination";
                const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
                if (unsplashKey && dest) {
                    try {
                        const imgRes = await fetch(
                            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(dest)}&per_page=1&orientation=landscape&client_id=${unsplashKey}`
                        );
                        if (imgRes.ok) {
                            const imgData = await imgRes.json();
                            const url = imgData?.results?.[0]?.urls?.regular;
                            if (url) setHeroImage(url);
                        }
                    } catch {  }
                }
            } catch (err: any) {
                setFetchError(safeStr(err?.message, "Unknown error"));
            } finally {
                setIsLoading(false);
            }
        };
        if (params?.tripId) fetchTrip();
    }, [params?.tripId]);

    
    if (isLoading) return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-5">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <Sparkles className="absolute inset-0 m-auto text-primary" size={26} />
            </div>
            <p className="text-lg font-medium animate-pulse">Building Your Itinerary...</p>
        </div>
    );

    
    if (fetchError || !tripData) return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4 px-4 text-center">
            <MapPin size={48} className="text-red-400" />
            <h2 className="text-2xl font-bold">Itinerary Not Found</h2>
            <p className="text-slate-400 max-w-md">Could not load this trip. The generation may have failed.</p>
            <AnimatedButton onClick={() => { window.location.href = '/chat'; }}>Plan a New Trip</AnimatedButton>
        </div>
    );

    
    const tripDetails = tripData?.tripDetails || {};
    const itinerary: any[] = Array.isArray(tripData?.itinerary) ? tripData.itinerary : [];
    const aiMeta = tripData?.metadata || tripDetails?.aiMetadata || {};
    const aiSummary = tripData?.summary || tripDetails?.aiSummary || {};

    const destination = safeStr(tripDetails?.destination || aiMeta?.title, "Your Trip");
    const travelers = tripDetails?.travelers ?? "2";
    const rawStyle = safeStr(tripDetails?.budget?.style || aiMeta?.budgetStyle, "mid-range").toLowerCase().trim();
    const budgetStyle = rawStyle || "mid-range";
    const currency = safeStr(aiMeta?.currency, "INR");
    const numTravelers = parseNumTravelers(travelers);
    const numDays = Math.max(itinerary.length, 1);

    const safeDateStr = (val: any) => {
        if (!val) return "";
        try { return new Date(val).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
        catch { return safeStr(val); }
    };
    const startDate = safeDateStr(tripDetails?.dates?.start);
    const endDate = safeDateStr(tripDetails?.dates?.end);
    const dateRange = startDate && endDate ? `${startDate} — ${endDate}` : "Dates TBD";

    const costs = BUDGET_ESTIMATES[budgetStyle] || BUDGET_ESTIMATES["mid-range"];
    const hotelTotal = costs.hotel * numDays;
    const foodTotal = costs.food * numTravelers * numDays;
    const activitiesTotal = costs.activities * numTravelers * numDays;
    const miscTotal = costs.misc * numTravelers * numDays;
    const flightEst = numTravelers * (budgetStyle === "budget" ? 2500 : budgetStyle === "luxury" ? 15000 : 5500);
    const grandTotal = hotelTotal + foodTotal + activitiesTotal + miscTotal + flightEst;

    
    const buildActivities = (day: any) => {
        if (!day) return [];
        const segs = (Array.isArray(day.segments) ? day.segments : []).map((s: any) => ({
            time: safeStr(s?.departure || s?.time, ""),
            type: "transit",
            mode: s?.mode || null,
            title: `${s?.mode ? s.mode.charAt(0).toUpperCase() + s.mode.slice(1) : "Transit"}: ${safeStr(s?.from)} → ${safeStr(s?.to)}`,
            desc: `Arrival: ${safeStr(s?.arrival, "N/A")} • Fare: ₹${Number(s?.estimated_fare?.amount || 0).toLocaleString()}`,
            duration: s?.duration_minutes ? `${Math.floor(s.duration_minutes / 60)}h ${s.duration_minutes % 60}m` : "",
        }));
        const visits = (Array.isArray(day.visits) ? day.visits : []).map((v: any) => ({
            time: safeStr(v?.start_time || v?.time, ""),
            type: safeStr(v?.type, "activity"),
            mode: null,
            title: safeStr(v?.name || v?.title, "Visit"),
            desc: v?.description || (v?.weather ? `${safeStr(v.weather?.summary)} • ${safeStr(v.weather?.temp_c)}°C` : ""),
            duration: v?.visit_duration_minutes ? `${Math.floor(v.visit_duration_minutes / 60)}h ${v.visit_duration_minutes % 60}m` : "",
        }));
        return [...segs, ...visits].sort((a, b) => a.time.localeCompare(b.time));
    };

    const currentDay = itinerary[activeDay] ?? {};
    const activities = buildActivities(currentDay);

    const handleShare = () => {
        try { navigator.clipboard.writeText(window.location.href); } catch { }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    
    const highlights: { name: string; day: number }[] = [];
    for (const day of itinerary) {
        const dayVisits = Array.isArray(day?.visits) ? day.visits : [];
        for (const v of dayVisits.slice(0, 2)) {
            const name = safeStr(v?.name || v?.title);
            if (name) highlights.push({ name, day: day?.day || 0 });
        }
        if (highlights.length >= 8) break;
    }

    return (
        <div className="min-h-screen bg-[#070B14] text-slate-100">

            {}
            <div className="relative h-[55vh] min-h-[380px] overflow-hidden">
                {heroImage
                    ? <img src={heroImage} alt={destination} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900" />
                }
                <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#070B14]/40 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10 max-w-6xl mx-auto w-full left-0 right-0">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-primary/20 text-primary border border-primary/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                                <Sparkles size={12} /> AI-Generated
                            </span>
                            <span className="bg-white/10 text-white/80 text-xs px-3 py-1 rounded-full border border-white/10">
                                {numDays} Day{numDays !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold capitalize mb-4 drop-shadow-lg">{destination}</h1>
                        <div className="flex flex-wrap gap-3 text-white/80 text-sm">
                            <span className="flex items-center gap-2 bg-black/30 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
                                <Calendar size={14} className="text-primary" /> {dateRange}
                            </span>
                            <span className="flex items-center gap-2 bg-black/30 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
                                <Users size={14} className="text-green-400" /> {safeStr(travelers)} Travelers
                            </span>
                            <span className="flex items-center gap-2 bg-black/30 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
                                <Tag size={14} className="text-amber-400" /> {budgetStyle}
                            </span>
                        </div>
                    </motion.div>
                </div>

                <div className="absolute top-24 right-6 flex gap-2">
                    <button onClick={handleShare} className="flex items-center gap-2 bg-black/40 backdrop-blur border border-white/10 hover:bg-white/10 transition-colors px-4 py-2 rounded-full text-sm font-medium">
                        <Share2 size={15} /> {copied ? "Copied!" : "Share"}
                    </button>
                    <button className="flex items-center gap-2 bg-primary/90 hover:bg-primary border border-primary/50 transition-colors px-4 py-2 rounded-full text-sm font-medium">
                        <Download size={15} /> Export
                    </button>
                </div>
            </div>

            {}
            <div className="max-w-6xl mx-auto px-4 pb-20 -mt-4 relative z-10">

                {}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {[
                        { icon: <Plane size={18} className="text-violet-400" />, label: "Flights", value: `₹${flightEst.toLocaleString()}`, border: "border-violet-500/20 from-violet-500/10" },
                        { icon: <BedDouble size={18} className="text-sky-400" />, label: "Hotels", value: `₹${hotelTotal.toLocaleString()}`, border: "border-sky-500/20 from-sky-500/10" },
                        { icon: <Utensils size={18} className="text-amber-400" />, label: "Food", value: `₹${foodTotal.toLocaleString()}`, border: "border-amber-500/20 from-amber-500/10" },
                        { icon: <Camera size={18} className="text-green-400" />, label: "Activities", value: `₹${activitiesTotal.toLocaleString()}`, border: "border-green-500/20 from-green-500/10" },
                    ].map((s, i) => (
                        <div key={i} className={`bg-gradient-to-br ${s.border} to-transparent border rounded-2xl p-4`}>
                            <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">{s.icon} {s.label}</div>
                            <p className="text-xl font-bold">{s.value}</p>
                            <p className="text-xs text-slate-500 mt-1">per trip</p>
                        </div>
                    ))}
                </motion.div>

                <div className="grid lg:grid-cols-12 gap-6">

                    {}
                    <div className="lg:col-span-8 space-y-5">

                        {}
                        {itinerary.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {itinerary.map((day: any, idx: number) => (
                                    <button key={idx} onClick={() => setActiveDay(idx)}
                                        className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${activeDay === idx
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                                            : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"}`}>
                                        Day {day?.day ?? idx + 1}
                                        <span className={`ml-2 text-xs ${activeDay === idx ? "text-white/60" : "text-slate-600"}`}>
                                            {safeStr(day?.date)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {}
                        <AnimatePresence mode="wait">
                            <motion.div key={activeDay}
                                initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }}
                                className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">

                                {}
                                <div className="bg-gradient-to-r from-primary/20 via-indigo-500/10 to-transparent border-b border-white/5 px-6 py-5">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold flex items-center gap-3">
                                            <span className="bg-primary text-white w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold shadow-lg shadow-primary/40">
                                                {currentDay?.day ?? activeDay + 1}
                                            </span>
                                            Day {currentDay?.day ?? activeDay + 1}
                                        </h2>
                                        <span className="text-sm font-mono text-primary">{safeStr(currentDay?.date)}</span>
                                    </div>
                                    {currentDay?.lodging && (
                                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm mt-3 w-fit">
                                            <BedDouble size={15} className="text-primary/70" />
                                            <span className="text-slate-300">{safeStr(currentDay.lodging)}</span>
                                        </div>
                                    )}
                                </div>

                                {}
                                <div className="p-6">
                                    {activities.length === 0 ? (
                                        <p className="text-slate-500 text-sm text-center py-8">No activities listed for this day.</p>
                                    ) : (
                                        <div className="relative space-y-3">
                                            <div className="absolute left-[26px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />
                                            {activities.map((act: any, i: number) => {
                                                const style = TYPE_STYLE[act.type] || DEFAULT_STYLE;
                                                return (
                                                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.05 }} className="flex gap-4 group">
                                                        <div className="flex items-start pt-4 flex-shrink-0">
                                                            <div className={`w-4 h-4 rounded-full border-2 ${style.dot} border-[#070B14] ring-2 ring-current/30 shadow`} />
                                                        </div>
                                                        <div className={`flex-1 mb-1 bg-gradient-to-r ${style.card} border rounded-xl p-4 group-hover:scale-[1.005] transition-transform`}>
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                                        <span className="font-bold text-white text-sm flex items-center gap-1">
                                                                            {getTimeIcon(act.time)} {act.time}
                                                                        </span>
                                                                        <span className={`text-xs px-2 py-0.5 rounded-full bg-black/20 border border-current/20 flex items-center gap-1 font-medium ${style.badge}`}>
                                                                            {act.mode ? getModeIcon(act.mode) : act.type === "dining" ? <Utensils size={10} /> : act.type === "transit" ? <Car size={10} /> : <MapPin size={10} />}
                                                                            {act.type}
                                                                        </span>
                                                                    </div>
                                                                    <h3 className="text-white font-semibold text-base leading-snug">{act.title}</h3>
                                                                    {act.desc && <p className={`text-sm mt-1 leading-relaxed ${style.badge} opacity-80`}>{act.desc}</p>}
                                                                    {act.duration && (
                                                                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                                                                            <Clock size={11} /> {act.duration}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1 text-primary bg-primary/10 px-3 py-1.5 rounded-md flex-shrink-0 mt-1">
                                                                    <Edit3 size={12} /> Edit
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {itinerary.length > 1 && (
                                    <div className="px-6 pb-5 flex justify-between">
                                        <button onClick={() => setActiveDay(Math.max(0, activeDay - 1))} disabled={activeDay === 0}
                                            className="text-sm text-slate-400 hover:text-white disabled:opacity-30 transition-colors">← Prev</button>
                                        <button onClick={() => setActiveDay(Math.min(itinerary.length - 1, activeDay + 1))} disabled={activeDay === itinerary.length - 1}
                                            className="text-sm text-primary hover:text-primary/80 disabled:opacity-30 flex items-center gap-1 transition-colors">
                                            Next <ArrowRight size={14} />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {}
                    <div className="lg:col-span-4 space-y-5">

                        {}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border border-green-500/20 rounded-2xl overflow-hidden">
                                <div className="px-5 pt-5 pb-3">
                                    <h3 className="font-bold text-green-400 flex items-center gap-2 mb-4 text-base">
                                        <Wallet size={18} /> Budget Breakdown
                                    </h3>
                                    <div className="space-y-2.5 text-sm">
                                        {[
                                            { label: "✈️ Flights", value: flightEst, note: `${numTravelers} pax` },
                                            { label: "🏨 Hotel", value: hotelTotal, note: `${numDays} nights` },
                                            { label: "🍽️ Food", value: foodTotal, note: `₹${costs.food}/pax/day` },
                                            { label: "🎯 Activities", value: activitiesTotal, note: `₹${costs.activities}/pax/day` },
                                            { label: "🛍️ Misc", value: miscTotal, note: "others" },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-slate-300">{item.label}</span>
                                                    <span className="text-slate-600 text-xs ml-2">{item.note}</span>
                                                </div>
                                                <span className="font-semibold">₹{item.value.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mx-5 border-t border-white/10 my-3" />
                                <div className="px-5 pb-3 flex items-center justify-between">
                                    <span className="font-bold">Grand Total</span>
                                    <span className="text-2xl font-black text-green-400">₹{grandTotal.toLocaleString()}</span>
                                </div>
                                <div className="px-5 pb-5">
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <TrendingUp size={11} /> {numTravelers} traveler{numTravelers > 1 ? "s" : ""} · {numDays} days · {budgetStyle}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {}
                        {highlights.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                    <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                                        <CheckCircle2 size={18} className="text-primary" /> Trip Highlights
                                    </h3>
                                    <div className="space-y-2">
                                        {highlights.map((h, i) => (
                                            <div key={i} className="flex items-center gap-3 group">
                                                <div className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary transition-colors flex-shrink-0" />
                                                <span className="text-sm text-slate-300 group-hover:text-white transition-colors truncate">{h.name}</span>
                                                <span className="text-xs text-slate-600 ml-auto flex-shrink-0">Day {h.day}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                                    <Briefcase size={18} className="text-indigo-400" /> Quick Actions
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { icon: <Download size={15} />, label: "Export PDF" },
                                        { icon: <Share2 size={15} />, label: "Share Trip", action: handleShare },
                                        { icon: <Edit3 size={15} />, label: "Edit Trip" },
                                        { icon: <Camera size={15} />, label: "Add Photos" },
                                    ].map((btn, i) => (
                                        <button key={i} onClick={btn.action}
                                            className="flex items-center gap-2 justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all rounded-xl py-2.5 text-sm font-medium text-slate-300">
                                            {btn.icon} {btn.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
