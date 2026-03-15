"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/custom/glass-card";
import { AnimatedButton } from "@/components/custom/animated-button";
import { SkeletonCard } from "@/components/custom/skeleton-card";
import { Search, Heart, Copy, MessageSquare, TrendingUp, MapPin, MoreHorizontal, Send, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const FILTER_CHIPS = [
    { label: 'All', value: 'all', emoji: '✨' },
    { label: 'Budget', value: 'budget', emoji: '💰' },
    { label: 'Adventure', value: 'adventure', emoji: '🧗' },
    { label: 'Solo', value: 'solo', emoji: '🎒' },
    { label: 'Family', value: 'family', emoji: '👨‍👩‍👧' },
    { label: 'Weekend', value: 'weekend', emoji: '🗓️' },
    { label: 'Beach', value: 'beach', emoji: '🏖️' },
    { label: 'Mountains', value: 'mountains', emoji: '🏔️' },
    { label: 'International', value: 'international', emoji: '✈️' },
];


function getPostFilters(post: any): string[] {
    const text = (post.trip.destination + post.trip.location + post.trip.tags.join(' ') + post.trip.cost).toLowerCase();
    const filters: string[] = ['all'];
    if (text.includes('budget') || text.includes('cheap') || text.includes('$') && !text.includes('$$')) filters.push('budget');
    if (text.includes('adventure') || text.includes('trek') || text.includes('hike') || text.includes('sport')) filters.push('adventure');
    if (text.includes('solo') || text.includes('single')) filters.push('solo');
    if (text.includes('family') || text.includes('kid') || text.includes('children')) filters.push('family');
    if (text.includes('weekend') || text.includes('2 day') || text.includes('48')) filters.push('weekend');
    if (text.includes('beach') || text.includes('coast') || text.includes('sea') || text.includes('goa') || text.includes('gokarna')) filters.push('beach');
    if (text.includes('mountain') || text.includes('hill') || text.includes('manali') || text.includes('trek')) filters.push('mountains');
    if (text.includes('international') || text.includes('flight') || text.includes('visa') || text.includes('abroad')) filters.push('international');
    return filters;
}



const dataset = {
    "community": [
        {
            "id": "c1",
            "author": {
                "name": "Traveler Diaries",
                "avatar": "https://i.pravatar.cc/150?u=a042581f4e29026704d",
                "badge": "Community-Sourced"
            },
            "title": "48 Hours in Udaipur: Royal Architecture & Lakeside Vibes",
            "rating": 4.8,
            "cost_bracket": "$$ (Moderate)",
            "geotag": {
                "name": "Udaipur, Rajasthan",
                "lat": 24.5854,
                "lng": 73.7125
            },
            "tips": [
                "Skip the main palace line by going early at 8 AM.",
                "Must do the sunset boat ride from Lal Ghat.",
                "Eat dinner at Ambrai for the best illuminated view of the City Palace."
            ],
            "pros_cons": {
                "pros": [
                    "Incredible heritage",
                    "Romantic atmosphere",
                    "Great rooftop cafes"
                ],
                "cons": [
                    "Very crowded during winter weekends",
                    "Narrow streets for driving"
                ]
            },
            "images": [
                "https://images.unsplash.com/photo-1598418080066-cd0884617181?q=80&w=700",
                "https://images.unsplash.com/photo-1624510007804-0346c7ad1650?q=80&w=700"
            ],
            "provenance_link": "https://reddit.com/r/travel/udaipur_guide",
            "original_date": "2025-11-15T00:00:00Z"
        },
        {
            "id": "c2",
            "author": {
                "name": "Mountain Explorer",
                "avatar": "https://i.pravatar.cc/150?u=a04258114e29026702d",
                "badge": "Top Contributor"
            },
            "title": "Monsoon Roadtrip down the Konkan Coast",
            "rating": 4.5,
            "cost_bracket": "$ (Budget)",
            "geotag": {
                "name": "Gokarna, Karnataka",
                "lat": 14.5381,
                "lng": 74.3182
            },
            "tips": [
                "Roads can get slippery towards Om Beach, rent a sturdy scooter.",
                "Pre-book beach shacks during long weekends.",
                "Try the local seafood thali at Mahalaxmi restaurant."
            ],
            "pros_cons": {
                "pros": [
                    "Lush green scenery",
                    "Cheap local stays",
                    "Beautiful secluded beaches"
                ],
                "cons": [
                    "Unpredictable heavy rain",
                    "Limited network coverage at Paradise Beach"
                ]
            },
            "images": [
                "https://images.unsplash.com/photo-1574516139454-93a8ed96bc37?q=80&w=700",
                "https://images.unsplash.com/photo-1638304918731-9f9f8c09a80d?q=80&w=700"
            ],
            "provenance_link": "https://tripadvisor.com/gokarna",
            "original_date": "2026-01-02T00:00:00Z"
        }
    ]
};

const MOCK_TRENDING = [
    { topic: "Trending in India 🌸", count: "124 itineraries" },
    { topic: "Popular for Solo Travelers 🎒", count: "89 itineraries" },
    { topic: "Weekend City Breaks 🏙️", count: "210 itineraries" },
];

const MOCK_FEED = (dataset as any).community.map((c: any) => ({
    id: c.id,
    author: {
        name: c.author.name,
        avatar: c.author.name.substring(0, 2).toUpperCase(),
        badge: c.author.badge
    },
    trip: {
        destination: c.title,
        location: c.geotag.name,
        duration: "Flexible",
        cost: c.cost_bracket,
        rating: c.rating,
        tags: [...(c.pros_cons.pros.slice(0, 2)), "Community Pick"],
        image: c.images[0] || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600",
        tips: c.tips,
        provenance_link: c.provenance_link
    },
    stats: { likes: Math.floor(Math.random() * 300) + 50, clones: Math.floor(Math.random() * 100) + 10, comments: 5 },
    comments: [
        { user: "TravelFan", text: "Great tips! Thanks for sharing the source link too." }
    ]
}));

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState("for-you");
    const [feed, setFeed] = useState<any[]>(MOCK_FEED);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedComments, setExpandedComments] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFeed = useMemo(() => {
        let result = feed;
        if (activeFilter !== 'all') {
            result = result.filter(post => getPostFilters(post).includes(activeFilter));
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(post =>
                post.trip.destination.toLowerCase().includes(q) ||
                post.trip.location.toLowerCase().includes(q) ||
                post.trip.tags.some((t: string) => t.toLowerCase().includes(q))
            );
        }
        return result;
    }, [feed, activeFilter, searchQuery]);

    useEffect(() => {
        const loadFeed = async () => {
            try {
                const res = await fetch('/api/community');
                if (!res.ok) throw new Error("API Failed");
                const data = await res.json();

                if (data && data.community) {
                    const mapped = data.community.map((c: any) => ({
                        id: c.id,
                        author: {
                            name: c.author.name,
                            avatar: c.author.name.substring(0, 2).toUpperCase(),
                            badge: c.author.badge
                        },
                        trip: {
                            destination: c.title,
                            location: c.geotag.name,
                            duration: "Flexible",
                            cost: c.cost_bracket,
                            rating: c.rating,
                            tags: [...((c.pros_cons?.pros || []).slice(0, 2)), "Community Pick"],
                            image: c.images?.[0] || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600",
                            tips: c.tips || [],
                            provenance_link: "#"
                        },
                        stats: { likes: Math.floor(Math.random() * 300) + 50, clones: Math.floor(Math.random() * 100) + 10, comments: 5 },
                        comments: [
                            { user: "TravelFan", text: "Great tips! Thanks for sharing." }
                        ]
                    }));
                    setFeed(mapped);
                }
            } catch (e) {
                console.error("Community Feed Error:", e);
                
            } finally {
                setIsLoading(false);
            }
        };
        loadFeed();
    }, []);

    const handleLike = (id: string) => {
        setFeed(feed.map((post: any) =>
            post.id === id ? { ...post, stats: { ...post.stats, likes: post.stats.likes + 1 } } : post
        ));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-12 px-4">
            {}
            <div className="max-w-6xl mx-auto mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Traveler Community</h1>
                <p className="text-slate-400 max-w-2xl mx-auto mb-8">
                    Get inspired by dynamic, AI-generated public itineraries. Remix, duplicate, and discuss trips with travelers worldwide.
                </p>

                {}
                <div className="max-w-xl mx-auto relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Search for destinations, themes, or travelers..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border-white/10 rounded-full h-12 pl-12 pr-4 text-base focus-visible:ring-primary"
                    />
                </div>

                {}
                <div className="flex flex-wrap gap-2 justify-center">
                    {FILTER_CHIPS.map(chip => (
                        <button
                            key={chip.value}
                            onClick={() => setActiveFilter(chip.value)}
                            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border ${
                                activeFilter === chip.value
                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                            }`}
                        >
                            {chip.emoji} {chip.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8">

                {}
                <div className="lg:col-span-4 space-y-6 hidden md:block">
                    <GlassCard className="p-5 border-white/10">
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <TrendingUp size={18} className="text-primary" /> Trending Now
                        </h3>
                        <div className="space-y-4">
                            {MOCK_TRENDING.map((trend, idx) => (
                                <div key={idx} className="group cursor-pointer">
                                    <p className="font-medium text-slate-200 group-hover:text-primary transition-colors">{trend.topic}</p>
                                    <p className="text-sm text-slate-500">{trend.count}</p>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard className="p-5 border-white/10 bg-primary/10">
                        <h3 className="font-semibold mb-2">Share your adventure</h3>
                        <p className="text-sm text-slate-300 mb-4">Make your recent trip public to help others plan their dream vacation.</p>
                        <AnimatedButton className="w-full">Publish a Trip</AnimatedButton>
                    </GlassCard>
                </div>

                {}
                <div className="lg:col-span-8 space-y-6">

                    {}
                    <div className="flex gap-6 border-b border-white/10 mb-6">
                        <button
                            onClick={() => setActiveTab("for-you")}
                            className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === "for-you" ? "text-primary" : "text-slate-400 hover:text-slate-200"}`}
                        >
                            For You
                            {activeTab === "for-you" && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                        <button
                            onClick={() => setActiveTab("following")}
                            className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === "following" ? "text-primary" : "text-slate-400 hover:text-slate-200"}`}
                        >
                            Following
                            {activeTab === "following" && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                    </div>

                    {}
                    <div className="space-y-6">
                        {isLoading && [1,2,3].map(i => <SkeletonCard key={i} />)}
                        {!isLoading && filteredFeed.length === 0 && (
                            <div className="text-center py-16">
                                <Filter className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-slate-400">No trips match this filter yet.</p>
                                <button onClick={() => { setActiveFilter('all'); setSearchQuery(''); }} className="text-sm text-primary mt-2 hover:underline">Clear filters</button>
                            </div>
                        )}
                        {!isLoading && filteredFeed.map((post: any) => (
                            <GlassCard key={post.id} className="p-0 overflow-hidden border-white/10">
                                {}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                                            {post.author.avatar}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-slate-200">{post.author.name}</h4>
                                            <p className="text-xs text-slate-500">Shared a new itinerary • 2h ago</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-400 hover:text-white"><MoreHorizontal size={18} /></button>
                                </div>

                                
                                <div className="px-4 pb-4">
                                    <div className="relative rounded-2xl overflow-hidden group cursor-pointer border border-white/5 bg-slate-800/50">
                                        <div className="h-48 relative">
                                            <img src={post.trip.image} alt={post.trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                                            <div className="absolute top-4 right-4">
                                                <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-xs font-bold text-yellow-400 flex items-center gap-1">★ {post.trip.rating}</span>
                                            </div>
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <div className="flex gap-2 mb-2 flex-wrap">
                                                    {post.trip.tags.map((tag: string) => (
                                                        <span key={tag} className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider">{tag}</span>
                                                    ))}
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-1 leading-tight">{post.trip.destination}</h3>
                                                <p className="text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <span className="flex items-center gap-1"><MapPin size={14} className="text-primary" /> {post.trip.location}</span>
                                                    <span className="flex items-center gap-1"><span className="text-green-400 font-bold">{post.trip.cost}</span></span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-900/50">
                                            <div className="mb-3 space-y-1">
                                                <p className="text-xs text-primary font-bold uppercase tracking-wider">Top Tips</p>
                                                {post.trip.tips.slice(0, 2).map((tip: string, i: number) => (
                                                    <p key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-primary">•</span>{tip}</p>
                                                ))}
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                                                <a href={post.trip.provenance_link} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                                                    Source Link ↗
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {}
                                <div className="px-4 py-3 border-t border-white/5 flex items-center gap-6">
                                    <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 text-slate-400 hover:text-pink-500 transition-colors group">
                                        <Heart size={18} className="group-active:scale-90 transition-transform" /> <span className="text-sm font-medium">{post.stats.likes}</span>
                                    </button>
                                    <button onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)} className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors">
                                        <MessageSquare size={18} /> <span className="text-sm font-medium">{post.stats.comments}</span>
                                    </button>
                                    <div className="flex-1" />
                                    <AnimatedButton variant="outline" className="border-white/10 hover:bg-white/5 text-xs h-8">
                                        <Copy size={14} className="mr-2" /> Remix & Edit
                                    </AnimatedButton>
                                </div>

                                {}
                                <AnimatePresence>
                                    {expandedComments === post.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="bg-slate-900/50 border-t border-white/5 px-4 py-4"
                                        >
                                            <div className="space-y-4 mb-4">
                                                {post.comments.map((c: any, i: number) => (
                                                    <div key={i} className="flex gap-3 text-sm">
                                                        <span className="font-bold text-slate-300">{c.user}</span>
                                                        <span className="text-slate-400">{c.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="relative">
                                                <Input placeholder="Ask a question..." className="bg-white/5 border-white/10 text-sm h-9 pr-10 rounded-lg" />
                                                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80">
                                                    <Send size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </GlassCard>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
