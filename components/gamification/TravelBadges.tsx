'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_BADGES = [
    { id: 'first_trip', name: 'First Steps', icon: '👣', desc: 'Plan your first trip', category: 'milestone', check: (stats: any) => stats.totalTrips >= 1 },
    { id: 'five_trips', name: 'Wanderer', icon: '🧭', desc: 'Plan 5 trips', category: 'milestone', check: (stats: any) => stats.totalTrips >= 5 },
    { id: 'ten_trips', name: 'Globe Trotter', icon: '🌍', desc: 'Plan 10 trips', category: 'milestone', check: (stats: any) => stats.totalTrips >= 10 },
    { id: 'beach_lover', name: 'Beach Bum', icon: '🏖️', desc: 'Plan a beach destination trip', category: 'destination', check: (stats: any) => stats.beachTrips >= 1 },
    { id: 'mountain_goat', name: 'Mountain Goat', icon: '🏔️', desc: 'Plan a mountain trip', category: 'destination', check: (stats: any) => stats.mountainTrips >= 1 },
    { id: 'city_explorer', name: 'Urban Explorer', icon: '🏙️', desc: 'Plan 3 city trips', category: 'destination', check: (stats: any) => stats.cityTrips >= 3 },
    { id: 'heritage_hunter', name: 'Heritage Hunter', icon: '🏛️', desc: 'Visit a UNESCO site', category: 'destination', check: (stats: any) => stats.heritageTrips >= 1 },
    { id: 'squad_goals', name: 'Squad Goals', icon: '👨‍👩‍👧‍👦', desc: 'Plan a group trip (5+ people)', category: 'social', check: (stats: any) => stats.maxGroupSize >= 5 },
    { id: 'solo_warrior', name: 'Solo Warrior', icon: '🦅', desc: 'Plan a solo trip', category: 'social', check: (stats: any) => stats.soloTrips >= 1 },
    { id: 'budget_master', name: 'Budget Master', icon: '💰', desc: 'Stay under budget on 3 trips', category: 'budget', check: (stats: any) => stats.underBudgetTrips >= 3 },
    { id: 'eco_warrior', name: 'Eco Warrior', icon: '🌿', desc: 'Choose eco-friendly transport 5 times', category: 'eco', check: (stats: any) => stats.ecoChoices >= 5 },
    { id: 'weekend_warrior', name: 'Weekend Warrior', icon: '⚡', desc: 'Plan a 2-day trip', category: 'duration', check: (stats: any) => stats.shortTrips >= 1 },
    { id: 'long_hauler', name: 'Long Hauler', icon: '🗺️', desc: 'Plan a 15+ day trip', category: 'duration', check: (stats: any) => stats.longTrips >= 1 },
    { id: 'packed_ready', name: 'Packed & Ready', icon: '🎒', desc: 'Complete a packing list 100%', category: 'feature', check: (stats: any) => stats.completedPackingLists >= 1 },
    { id: 'chatterbox', name: 'Chatterbox', icon: '💬', desc: 'Ask 20 questions to TravelBuddy', category: 'feature', check: (stats: any) => stats.chatMessages >= 20 },
    { id: 'green_traveler', name: 'Green Traveler', icon: '♻️', desc: 'Check carbon footprint 3 times', category: 'feature', check: (stats: any) => stats.carbonChecks >= 3 },
];

const LEVELS = [
    { level: 1, name: 'Tourist', minXP: 0, icon: '🎫' },
    { level: 2, name: 'Traveler', minXP: 100, icon: '🧳' },
    { level: 3, name: 'Explorer', minXP: 300, icon: '🧭' },
    { level: 4, name: 'Adventurer', minXP: 600, icon: '🏕️' },
    { level: 5, name: 'Voyager', minXP: 1000, icon: '🚀' },
    { level: 6, name: 'Nomad', minXP: 1500, icon: '🌍' },
    { level: 7, name: 'Legend', minXP: 2500, icon: '👑' },
];

interface TravelBadgesProps {
    userStats?: Record<string, number>;
}

export default function TravelBadges({ userStats }: TravelBadgesProps) {
    const [stats, setStats] = useState({
        totalTrips: 0, beachTrips: 0, mountainTrips: 0, cityTrips: 0,
        heritageTrips: 0, maxGroupSize: 0, soloTrips: 0, underBudgetTrips: 0,
        ecoChoices: 0, shortTrips: 0, longTrips: 0, completedPackingLists: 0,
        chatMessages: 0, carbonChecks: 0,
        ...userStats
    });
    const [selectedBadge, setSelectedBadge] = useState<typeof ALL_BADGES[0] | null>(null);
    const [showUnlockAnimation, setShowUnlockAnimation] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('travel-stats');
        if (saved) {
            try {
                setStats(prev => ({ ...prev, ...JSON.parse(saved) }));
            } catch {  }
        }
    }, []);

    useEffect(() => {
        const savedBadges: string[] = JSON.parse(localStorage.getItem('unlocked-badges') || '[]');
        const currentBadges = ALL_BADGES.filter(b => b.check(stats)).map(b => b.id);
        const newBadges = currentBadges.filter(id => !savedBadges.includes(id));

        if (newBadges.length > 0) {
            setShowUnlockAnimation(newBadges[0]);
            localStorage.setItem('unlocked-badges', JSON.stringify(currentBadges));
            setTimeout(() => setShowUnlockAnimation(null), 3000);
        }
    }, [stats]);

    const unlockedBadges = ALL_BADGES.filter(b => b.check(stats));
    const lockedBadges = ALL_BADGES.filter(b => !b.check(stats));

    const xp = unlockedBadges.length * 50 + (stats.totalTrips * 20);
    const currentLevel = [...LEVELS].reverse().find(l => xp >= l.minXP) || LEVELS[0];
    const nextLevel = LEVELS.find(l => l.minXP > xp);
    const progressToNext = nextLevel
        ? ((xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100
        : 100;

    return (
        <div className="space-y-6">
            {}
            <AnimatePresence>
                {showUnlockAnimation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: 'spring', damping: 15 }}
                            className="glass rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4 border border-yellow-500/30"
                        >
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="text-7xl mb-4 inline-block"
                            >
                                {ALL_BADGES.find(b => b.id === showUnlockAnimation)?.icon}
                            </motion.div>
                            <h3 className="text-xl font-bold text-white mb-2">🎉 Badge Unlocked!</h3>
                            <p className="text-lg font-semibold text-indigo-400">
                                {ALL_BADGES.find(b => b.id === showUnlockAnimation)?.name}
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                {ALL_BADGES.find(b => b.id === showUnlockAnimation)?.desc}
                            </p>
                            <p className="text-xs text-emerald-400 mt-3 font-medium">+50 XP</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm border border-white/10">
                                {currentLevel.icon}
                            </div>
                            <div>
                                <p className="text-white/60 text-[10px] uppercase tracking-wider font-semibold">Level {currentLevel.level}</p>
                                <h2 className="text-2xl font-bold">{currentLevel.name}</h2>
                                <p className="text-white/70 text-xs">{xp} XP earned</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold">
                                {unlockedBadges.length}<span className="text-lg font-normal text-white/50">/{ALL_BADGES.length}</span>
                            </p>
                            <p className="text-white/50 text-[10px]">Badges earned</p>
                        </div>
                    </div>

                    {nextLevel && (
                        <div>
                            <div className="flex justify-between text-[10px] text-white/60 mb-1">
                                <span>{currentLevel.name}</span>
                                <span>{nextLevel.icon} {nextLevel.name} ({nextLevel.minXP} XP)</span>
                            </div>
                            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressToNext}%` }}
                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                    className="h-full bg-white rounded-full"
                                />
                            </div>
                            <p className="text-[10px] text-white/50 mt-1">{nextLevel.minXP - xp} XP to next level</p>
                        </div>
                    )}
                </div>
            </div>

            {}
            <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    ✅ Unlocked ({unlockedBadges.length})
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {unlockedBadges.map(badge => (
                        <motion.button
                            key={badge.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedBadge(badge)}
                            className="glass rounded-xl p-4 border-2 border-yellow-500/40 text-center relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent" />
                            <span className="text-3xl relative z-10 group-hover:scale-125 transition-transform inline-block">
                                {badge.icon}
                            </span>
                            <p className="text-[10px] font-medium text-white mt-2 relative z-10 truncate">
                                {badge.name}
                            </p>
                        </motion.button>
                    ))}
                </div>
            </div>

            {}
            <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    🔒 Locked ({lockedBadges.length})
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {lockedBadges.map(badge => (
                        <button
                            key={badge.id}
                            onClick={() => setSelectedBadge(badge)}
                            className="glass rounded-xl p-4 border border-slate-700/50 text-center opacity-50 hover:opacity-70 transition"
                        >
                            <span className="text-3xl grayscale inline-block">{badge.icon}</span>
                            <p className="text-[10px] font-medium text-slate-500 mt-2 truncate">{badge.name}</p>
                            <p className="text-[8px] text-slate-600">???</p>
                        </button>
                    ))}
                </div>
            </div>

            {}
            <AnimatePresence>
                {selectedBadge && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                        onClick={() => setSelectedBadge(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="glass rounded-2xl p-6 max-w-sm mx-4 shadow-2xl text-center border border-slate-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="text-6xl inline-block mb-3">{selectedBadge.icon}</span>
                            <h3 className="text-xl font-bold text-white">{selectedBadge.name}</h3>
                            <p className="text-sm text-slate-400 mt-2">{selectedBadge.desc}</p>
                            <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium
                ${selectedBadge.check(stats)
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                {selectedBadge.check(stats) ? '✅ Unlocked' : '🔒 Locked'}
                            </span>
                            <button
                                onClick={() => setSelectedBadge(null)}
                                className="block w-full mt-4 py-2 text-sm text-slate-500 hover:text-white transition"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
