"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Send, MapPin, Calendar, Users, DollarSign, Activity, Settings2, Sparkles, Map, ToggleLeft, ToggleRight, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatedButton } from "@/components/custom/animated-button";
import { GlassCard } from "@/components/custom/glass-card";


const QUESTIONS = [
    { id: "destination", text: "Where would you like to travel?", icon: <MapPin className="w-4 h-4" /> },
    { id: "dates", text: "When are you going or for how many days?", icon: <Calendar className="w-4 h-4" /> },
    { id: "travelers", text: "How many people are traveling?", icon: <Users className="w-4 h-4" /> },
    { id: "type", text: "Who are you traveling with? (Solo/Couple/Family/Friends)", icon: <Users className="w-4 h-4" /> },
    { id: "budget", text: "What's your preferred budget level? (Budget/Mid-range/Luxury)", icon: <DollarSign className="w-4 h-4" /> },
    { id: "style", text: "What's your travel style? (Relaxed/Adventure/Culture)", icon: <Activity className="w-4 h-4" /> },
    { id: "mustSees", text: "Any absolute must-sees?", icon: <Sparkles className="w-4 h-4" /> },
    { id: "avoid", text: "Anything you want to avoid?", icon: <Settings2 className="w-4 h-4" /> },
];

export default function StructuredChatPage() {
    const [messages, setMessages] = useState<{ id: string; role: "ai" | "user"; content: string }[]>([
        { id: "init", role: "ai", content: "Hi! I'm your AI Travel planner. Let's build your perfect itinerary step-by-step.\n\n" + QUESTIONS[0].text }
    ]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [itineraryReady, setItineraryReady] = useState(false);
    const [viewMode, setViewMode] = useState<"chat" | "itinerary">("itinerary");

    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles].slice(0, 3));
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = () => {
        if (!inputValue.trim() && files.length === 0) return;

        const hasFiles = files.length > 0;
        const fileStr = hasFiles ? `\n[Attached ${files.length} file(s): ${files.map(f => f.name).join(', ')}]` : '';
        const userMsg = inputValue + fileStr;

        setInputValue("");
        setFiles([]);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userMsg }]);

        
        const currentQuestion = QUESTIONS[currentQIndex];
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: userMsg }));

        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);

            if (currentQIndex < QUESTIONS.length - 1) {
                
                const nextQ = QUESTIONS[currentQIndex + 1];
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "ai",
                    content: `Got it. Next: ${nextQ.text}`
                }]);
                setCurrentQIndex(currentQIndex + 1);
            } else {
                
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "ai",
                    content: "Perfect! I have everything I need. Generating your detailed itinerary now..."
                }]);
                generateItinerary();
            }
        }, 1000);
    };

    const generateItinerary = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripDetails: {
                        destination: answers.destination || "Anywhere",
                        dates: { start: new Date().toISOString(), end: new Date(Date.now() + 86400000 * 3).toISOString() }, 
                        travelers: answers.travelers || "1",
                        budget: { style: answers.budget || "mid-range", amount: 0, currency: "USD" },
                        interests: [(answers.style || ""), (answers.mustSees || "")].filter(Boolean),
                        pace: answers.avoid || 'Medium'
                    },
                    messages: messages.map(m => ({ role: m.role, content: m.content }))
                })
            });
            const data = await res.json();

            if (data && data._id) {
                
                window.location.href = `/itinerary/${data._id}`;
            } else {
                
                console.error("Failed to generate trip real-time. Showing mock.", data);
                setItineraryReady(true);
                setViewMode("itinerary");
            }
        } catch (error) {
            console.error("Error generating itinerary:", error);
            setItineraryReady(true);
            setViewMode("itinerary");
        } finally {
            setIsGenerating(false);
        }
    };

    if (itineraryReady) {
        return (
            <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-4 max-w-5xl mx-auto">

                {}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Your Trip to {answers.destination || "Destination"}</h1>
                        <p className="text-muted-foreground">{answers.dates || "3 Days"} • {answers.type || "Solo"} • {answers.budget || "Mid-range"}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-1 rounded-full border border-white/10">
                        <button
                            onClick={() => setViewMode("itinerary")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${viewMode === "itinerary" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}
                        >
                            Itinerary View
                        </button>
                        <button
                            onClick={() => setViewMode("chat")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${viewMode === "chat" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}
                        >
                            Chat Summary
                        </button>
                    </div>
                </div>

                {viewMode === "chat" ? (
                    <GlassCard className="max-w-2xl mx-auto h-[70vh] flex flex-col p-0 overflow-hidden border-white/10">
                        <div className="bg-primary/10 p-4 border-b border-border/50 flex items-center justify-between">
                            <h2 className="font-semibold flex items-center gap-2"><Bot size={18} className="text-primary" /> Planning Thread</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin flex flex-col gap-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex max-w-[80%] ${msg.role === "user" ? "self-end" : "self-start"}`}>
                                    <div className={`p-4 rounded-2xl text-sm ${msg.role === "user" ? "bg-primary text-white rounded-tr-sm" : "bg-white/10 text-slate-200 rounded-tl-sm"}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {}
                        <div className="md:col-span-2 space-y-6">
                            {[1, 2, 3].map((day) => (
                                <GlassCard key={day} className="p-0 overflow-hidden border-white/10">
                                    <div className="bg-primary/10 p-4 border-b border-border/50 flex justify-between items-center">
                                        <h3 className="font-bold text-lg">Day {day}</h3>
                                        <span className="text-xs font-mono text-muted-foreground">Nov 2{day}</span>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 h-2 rounded-full bg-primary mb-1" />
                                                <div className="w-0.5 h-full bg-white/10" />
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <p className="text-sm font-bold text-primary mb-1">09:00 AM</p>
                                                <h4 className="font-semibold mb-2">Morning Discovery</h4>
                                                <p className="text-sm text-slate-400">Explore the main attractions according to your "{answers.style}" style. Don't worry, we avoided {answers.avoid || "tourist traps"}.</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 h-2 rounded-full bg-primary mb-1" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-primary mb-1">01:00 PM</p>
                                                <h4 className="font-semibold mb-2">Local Lunch</h4>
                                                <p className="text-sm text-slate-400">Rest up and grab some local cuisine at a {answers.budget} friendly spot.</p>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>

                        {/* Side Column: Budget & Map Snippet */}
                        <div className="space-y-6">
                            <GlassCard className="border-white/10 p-5">
                                <h3 className="font-semibold mb-4 flex items-center gap-2"><DollarSign size={16} className="text-green-500" /> Estimated Budget</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Flights</span>
                                        <span>$450 - $600</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Lodging ({answers.dates || '3'} days)</span>
                                        <span>$300 - $450</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Food & Activities</span>
                                        <span>$200 - $350</span>
                                    </div>
                                    <div className="pt-3 mt-3 border-t border-white/10 flex justify-between font-bold">
                                        <span>Total Estimate</span>
                                        <span className="text-green-400">$950 - $1400</span>
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="border-white/10 p-1 flex items-center justify-center h-48 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-slate-800 animate-pulse" /> {/* Fake Map background */}
                                <div className="absolute inset-0 flex items-center justify-center flex-col z-10 transition-transform group-hover:scale-105">
                                    <Map className="w-8 h-8 text-primary mb-2 opacity-80" />
                                    <span className="text-sm font-medium opacity-80">Interactive Map View</span>
                                </div>
                            </GlassCard>

                            <AnimatedButton className="w-full">
                                Edit Itinerary
                            </AnimatedButton>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 top-16 overflow-hidden flex items-stretch">
            <style jsx global>{`
                body, html {
                    overflow: hidden !important;
                    height: 100% !important;
                    width: 100% !important;
                    position: fixed !important;
                }
                footer {
                    display: none !important;
                }
                /* Additional fix for browser auto-scroll on focus */
                input:focus {
                    outline: none !important;
                }
            `}</style>


            {/* ── Animated Background ── */}
            <div className="absolute inset-0 bg-[#050b18]">
                {/* Primary glow orbs */}
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-sky-600/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-teal-600/15 blur-[140px] animate-pulse [animation-delay:1.5s]" />
                <div className="absolute top-[30%] left-[60%] w-[300px] h-[300px] rounded-full bg-indigo-600/10 blur-[100px] animate-pulse [animation-delay:3s]" />

                {/* Subtle grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #ffffff 1px, transparent 1px),
                            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Floating destination labels */}
                {[
                    { label: '🗼 Paris', top: '12%', left: '8%', delay: '0s' },
                    { label: '🏔️ Manali', top: '20%', right: '10%', delay: '0.8s' },
                    { label: '🌊 Bali', bottom: '25%', left: '5%', delay: '1.6s' },
                    { label: '🏯 Tokyo', top: '55%', right: '7%', delay: '2.4s' },
                    { label: '🏖️ Goa', bottom: '15%', right: '20%', delay: '3.2s' },
                    { label: '🌆 NYC', top: '38%', left: '3%', delay: '4s' },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="absolute text-xs text-white/20 font-medium tracking-wide select-none pointer-events-none"
                        style={{
                            top: item.top,
                            left: (item as any).left,
                            right: (item as any).right,
                            bottom: item.bottom,
                            animation: `float 8s ease-in-out infinite`,
                            animationDelay: item.delay,
                        }}
                    >
                        {item.label}
                    </div>
                ))}
            </div>

            {/* ── Floating stat pills (left side) ── */}
            <div className="hidden lg:flex flex-col gap-4 justify-center pl-8 pr-4 z-10 w-64 flex-shrink-0">
                {[
                    { icon: '🌍', label: 'Destinations', value: '150+' },
                    { icon: '✈️', label: 'Trips planned', value: '12K+' },
                    { icon: '⭐', label: 'Avg rating', value: '4.9' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl px-5 py-4">
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className="text-xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-slate-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Chat Card ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 z-10">
                <div className="w-full max-w-2xl flex flex-col h-full">
                    <div
                        className="flex flex-col flex-1 min-h-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                        style={{
                            background: 'linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(7,15,35,0.98) 100%)',
                            backdropFilter: 'blur(24px)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 p-5"
                            style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(20,184,166,0.08) 100%)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center shadow-lg shadow-sky-500/30">
                                        <Bot size={20} className="text-white" />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-slate-900" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-base text-white">Trip Planner AI</h2>
                                    <p className="text-[11px] text-slate-400">Answer a few questions to build your itinerary</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5 text-[11px] text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-3 py-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    AI Online
                                </div>
                            </div>

                            {/* Step Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                                        {QUESTIONS[Math.min(currentQIndex, QUESTIONS.length - 1)].icon}
                                        <span>{QUESTIONS[Math.min(currentQIndex, QUESTIONS.length - 1)].id.charAt(0).toUpperCase() + QUESTIONS[Math.min(currentQIndex, QUESTIONS.length - 1)].id.slice(1)}</span>
                                    </span>
                                    <span className="text-[11px] text-slate-500">Step {Math.min(currentQIndex + 1, QUESTIONS.length)}/{QUESTIONS.length}</span>
                                </div>
                                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ background: 'linear-gradient(90deg, #0ea5e9, #14b8a6)' }}
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${((Math.min(currentQIndex + 1, QUESTIONS.length)) / QUESTIONS.length) * 100}%` }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                    />
                                </div>
                                <div className="flex gap-1">
                                    {QUESTIONS.map((q, i) => (
                                        <div
                                            key={q.id}
                                            className="flex-1 h-0.5 rounded-full transition-all duration-500"
                                            style={{ background: i <= currentQIndex ? 'linear-gradient(90deg, #0ea5e9, #14b8a6)' : 'rgba(255,255,255,0.08)' }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Messages — THIS is the only scrolling area */}
                        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 min-h-0"
                            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
                            <AnimatePresence>
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.25 }}
                                        className={`flex items-end gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                    >
                                        {/* Avatar */}
                                        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === "ai" ? "bg-gradient-to-br from-sky-500 to-teal-400" : "bg-slate-700"}`}>
                                            {msg.role === "ai" ? <Bot size={13} className="text-white" /> : <User size={13} className="text-slate-300" />}
                                        </div>

                                        {/* Bubble */}
                                        <div
                                            className={`max-w-[78%] px-4 py-3 text-[14px] leading-relaxed rounded-2xl ${msg.role === "user"
                                                ? "text-white rounded-br-sm"
                                                : "text-slate-200 rounded-bl-sm border border-white/[0.08]"}`}
                                            style={msg.role === "user"
                                                ? { background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 4px 20px rgba(14,165,233,0.3)' }
                                                : { background: 'rgba(255,255,255,0.04)' }
                                            }
                                        >
                                            {msg.content.split('\n').map((line, i) => (
                                                <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Typing indicator */}
                                {isTyping && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center">
                                            <Bot size={13} className="text-white" />
                                        </div>
                                        <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm border border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                            <div className="flex gap-1.5 items-center">
                                                <span className="w-1.5 h-1.5 bg-sky-400/70 rounded-full animate-bounce" />
                                                <span className="w-1.5 h-1.5 bg-sky-400/70 rounded-full animate-bounce [animation-delay:0.15s]" />
                                                <span className="w-1.5 h-1.5 bg-sky-400/70 rounded-full animate-bounce [animation-delay:0.3s]" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Generating spinner */}
                                {isGenerating && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-8 gap-3">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full border-2 border-sky-500/20" />
                                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-400 animate-spin" />
                                            <div className="absolute inset-2 rounded-full border border-transparent border-t-teal-400 animate-spin [animation-direction:reverse] [animation-duration:0.8s]" />
                                        </div>
                                        <p className="text-sm text-sky-300 font-medium animate-pulse">Designing your perfect itinerary...</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                            {files.length > 0 && (
                                <div className="flex gap-2 flex-wrap mb-3">
                                    {files.map((f, i) => (
                                        <div key={i} className="flex items-center gap-1 bg-white/10 text-xs px-2 py-1 rounded-lg border border-white/10 text-slate-300">
                                            <span className="truncate max-w-[140px]">{f.name}</span>
                                            <button type="button" onClick={() => removeFile(i)} className="text-slate-400 hover:text-white ml-1">
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <form
                                className="flex items-center gap-2 relative"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!isTyping && !isGenerating && (inputValue.trim() || files.length > 0)) handleSend();
                                }}
                            >
                                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFileSelect} />

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <Plus size={18} />
                                </button>

                                <div className="flex-1 relative">
                                    <Input
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Type your answer..."
                                        disabled={isTyping || isGenerating}
                                        className="w-full h-11 rounded-2xl text-sm text-white placeholder:text-slate-500 focus-visible:ring-sky-500/50 border-white/10 pr-4"
                                        style={{ background: 'rgba(255,255,255,0.06)' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={(!inputValue.trim() && files.length === 0) || isTyping || isGenerating}
                                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 4px 16px rgba(14,165,233,0.4)' }}
                                >
                                    <Send size={16} className="-translate-x-[1px]" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right side: Tips panel ── */}
            <div className="hidden lg:flex flex-col gap-4 justify-center pr-8 pl-4 z-10 w-64 flex-shrink-0">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Quick Tips</div>
                {[
                    { emoji: '📍', tip: 'Mention specific districts or neighborhoods for better results' },
                    { emoji: '💰', tip: 'Share your daily budget for accurate hotel & food suggestions' },
                    { emoji: '🗓️', tip: 'Include exact dates to get seasonal event recommendations' },
                ].map((item, i) => (
                    <div key={i} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 backdrop-blur-md">
                        <div className="text-xl mb-2">{item.emoji}</div>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.tip}</p>
                    </div>
                ))}
            </div>

            {/* Animations */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
                    50% { transform: translateY(-14px) rotate(2deg); opacity: 0.35; }
                }
            `}</style>

        </div>
    );
}
