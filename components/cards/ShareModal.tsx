'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    trip: any;
}

export default function ShareModal({ isOpen, onClose, trip }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !trip) return null;

    const cardUrl = `/api/cards?title=${encodeURIComponent(trip.title)}&destinations=${encodeURIComponent(trip.destinations[0]?.city)}&days=${trip.duration}&vibe=✨ 🏖️ 🍝`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl"
                >
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-4 text-center">Share Your Adventure 🌍</h3>

                        {}
                        <div className="bg-slate-100 rounded-xl overflow-hidden aspect-[1.91/1] mb-6 shadow-md relative group">
                            <img
                                src={cardUrl}
                                alt="Trip Card"
                                className="w-full h-full object-cover"
                            />
                            <a
                                href={cardUrl}
                                download={`trip-${trip.title}.png`}
                                className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                                <div className="bg-white text-black px-4 py-2 rounded-full font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition">
                                    ⬇️ Download Image
                                </div>
                            </a>
                        </div>

                        {}
                        <div className="space-y-3">
                            <button
                                onClick={handleCopyLink}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                            >
                                {copied ? '✅ Link Copied!' : '🔗 Copy Trip Link'}
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="py-2.5 bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 rounded-xl font-medium transition">
                                    Share on Twitter
                                </button>
                                <button className="py-2.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-xl font-medium transition">
                                    Share on WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
                    >
                        ✕
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
