"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, Map, Wand2, Paintbrush, ArrowRight, X, Plus, Sparkles, AlertCircle, PlaneTakeoff, Users, Wallet, CalendarDays, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/custom/glass-card";
import { AnimatedButton } from "@/components/custom/animated-button";
import { useToast } from "@/hooks/use-toast";
import { addDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function VibeSearchPage() {
    const router = useRouter();

    
    const [stage, setStage] = useState<"UPLOAD" | "ANALYZING" | "THEME_PREVIEW" | "PLACES">("UPLOAD");
    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [vibeText, setVibeText] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    
    const [palette, setPalette] = useState<string[]>(["#0ea5e9", "#14b8a6", "#f59e0b", "#fecdd3"]);
    const [tags, setTags] = useState<string[]>([]);
    const [selectedColor, setSelectedColor] = useState<string>("#0ea5e9");
    const [places, setPlaces] = useState<any[]>([]);

    
    const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
    const [buildTarget, setBuildTarget] = useState("");
    const [buildType, setBuildType] = useState<"place" | "theme">("place");
    const [buildData, setBuildData] = useState({
        origin: "",
        days: 3,
        budget: "medium" as "low" | "medium" | "high",
        travelers: 2
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            const newFiles = Array.from(e.target.files);
            const availableSlots = 5 - images.length;
            const filesToAdd = newFiles.slice(0, availableSlots);

            if (filesToAdd.length > 0) {
                const updatedFiles = [...images, ...filesToAdd];
                setImages(updatedFiles);
                setImageUrls(updatedFiles.map(f => URL.createObjectURL(f)));
            }
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newUrls = [...imageUrls];
        URL.revokeObjectURL(newUrls[index]);
        newUrls.splice(index, 1);
        setImageUrls(newUrls);
    };

    const triggerFileInput = () => {
        if (images.length < 5) {
            fileInputRef.current?.click();
        }
    };

    const analyzeVibes = async () => {
        if (images.length === 0 && !vibeText.trim()) return;
        setStage("ANALYZING");

        try {
            const formData = new FormData();
            images.forEach(img => formData.append('images', img));
            if (vibeText.trim()) formData.append('vibeText', vibeText);

            
            if (images.length === 0) formData.append('textOnly', 'true');

            const res = await fetch('/api/vibe-match', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Vibe match failed");
            const data = await res.json();

            if (data.overall_theme_tags) setTags(data.overall_theme_tags);
            if (data.top_candidates) setPlaces(data.top_candidates);

            setStage("THEME_PREVIEW");
        } catch (error) {
            console.error(error);
            
            setTags(["tropical", "coastal", "relaxed", "serene"]);
            setPlaces([
                { name: "Varkala, Kerala", explanation: "Coastal cliffside beaches matching your relaxed vibe.", photos: [{ url: "https://images.unsplash.com/photo-1593693397690-362cb961a0c4?q=80&w=800&auto=format&fit=crop" }] }
            ]);
            setStage("THEME_PREVIEW");
        }
    };

    const proceedToItinerary = (themeOnly: boolean, place?: string) => {
        setBuildType(themeOnly ? "theme" : "place");
        setBuildTarget(place || "");
        setIsBuildModalOpen(true);
    };

    const handleQuickBuild = async () => {
        if (!buildData.origin.trim()) {
            toast({ title: "Please enter your starting location", variant: "destructive" });
            return;
        }

        setIsGenerating(true);
        try {
            const dest = buildType === "theme" ? `A destination matching this aesthetic: ${tags.join(", ")}` : buildTarget;
            const startDate = new Date();
            const endDate = addDays(startDate, buildData.days);

            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentLocation: buildData.origin,
                    travelLocation: dest,
                    interests: `Theme aesthetic: ${tags.join(", ")}. Color: ${selectedColor}`,
                    startDate: startDate,
                    endDate: endDate,
                    budget: buildData.budget,
                    adults: buildData.travelers,
                    children: 0,
                }),
            });

            let data;
            try {
                data = await response.json();
            } catch (err) {
                throw new Error("Server took too long to respond or returned an invalid format. Please try again.");
            }

            if (!response.ok) throw new Error(data.details || data.error || "Failed to generate itinerary");

            const newTripId = data.id || data._id;
            toast({ title: "Success! 🎉", description: "Your perfect itinerary is ready. Redirecting..." });
            window.location.href = `/itinerary/${newTripId}`;
        } catch (error: any) {
            toast({ title: "Generation failed", description: error.message, variant: "destructive" });
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white relative flex flex-col items-center pt-24 pb-12 overflow-hidden">
            {}
            <div
                className="absolute inset-0 opacity-[0.15] transition-colors duration-1000 ease-in-out mix-blend-screen pointer-events-none"
                style={{
                    backgroundColor: selectedColor || "transparent",
                    backgroundImage: `radial-gradient(circle at 50% 0%, ${selectedColor}40 0%, transparent 70%)`
                }}
            />

            <div className="z-10 text-center mb-10 px-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 tracking-tight">
                    Match Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-serif italic">Vibe</span>
                </h1>
                <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
                    Upload photos that inspire you, describe your mood, and let AI craft your perfect travel aesthetic & destinations.
                </p>
            </div>

            <AnimatePresence mode="wait">
                {}
                {stage === "UPLOAD" && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-3xl px-4"
                    >
                        <GlassCard className="p-8 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden bg-white/5 backdrop-blur-xl">
                            {}
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleUpload}
                                className="hidden"
                                ref={fileInputRef}
                            />

                            <div className="flex flex-col gap-8">
                                {}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold flex items-center gap-2">
                                            <ImageIcon className="text-indigo-400" /> Visual Inspiration
                                        </h3>
                                        <span className="text-sm font-medium text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full">
                                            {images.length}/5 Photos
                                        </span>
                                    </div>

                                    {images.length === 0 ? (
                                        <div
                                            onClick={triggerFileInput}
                                            className="w-full border-2 border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-white/5 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group"
                                        >
                                            <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                                                <Camera className="w-10 h-10 text-indigo-400" />
                                            </div>
                                            <p className="text-lg font-medium mb-1">Upload exactly what you're looking for</p>
                                            <p className="text-sm text-slate-400">Click to browse or drag and drop up to 5 photos</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-4">
                                            {imageUrls.map((url, i) => (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    key={i}
                                                    className="relative w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden group shadow-lg ring-1 ring-white/10"
                                                >
                                                    <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                                            className="bg-red-500/80 hover:bg-red-500 text-white rounded-full p-2 backdrop-blur-sm transform hover:scale-110 transition-all"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}

                                            {images.length < 5 && (
                                                <motion.div
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                    onClick={triggerFileInput}
                                                    className="w-32 h-32 md:w-36 md:h-36 rounded-2xl border-2 border-dashed border-white/20 hover:border-indigo-400 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all text-slate-400 hover:text-indigo-400"
                                                >
                                                    <Plus className="w-8 h-8 mb-2" />
                                                    <span className="text-sm font-medium">Add Photo</span>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Text Input Area */}
                                <div>
                                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                                        <Sparkles className="text-purple-400" /> Describe the mood (Optional)
                                    </h3>
                                    <textarea
                                        value={vibeText}
                                        onChange={(e) => setVibeText(e.target.value)}
                                        placeholder="E.g., A quiet cabin in the snowy mountains, sipping hot chocolate by the fire..."
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none h-28"
                                    />
                                </div>

                                {/* Submit Actions */}
                                <div className="pt-4 flex justify-end">
                                    <AnimatedButton
                                        onClick={analyzeVibes}
                                        disabled={images.length === 0 && vibeText.trim().length === 0}
                                        className="py-6 px-10 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_0_40px_rgba(124,58,237,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Wand2 className="w-5 h-5 mr-3" />
                                        Analyze Vibe
                                    </AnimatedButton>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* STAGE 2: ANALYZING */}
                {stage === "ANALYZING" && (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, filter: "blur(10px)", scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center justify-center py-10"
                    >
                        <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden mb-12 shadow-[0_0_100px_rgba(99,102,241,0.3)] ring-1 ring-white/10 p-6 flex flex-wrap gap-2 items-center justify-center bg-slate-900/50 backdrop-blur-md">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 animate-pulse" />
                            {imageUrls.map((url, i) => (
                                <img key={i} src={url} alt="Analyzing" className="w-24 h-24 object-cover rounded-2xl opacity-60 mix-blend-luminosity" />
                            ))}
                            {/* Scanning laser beam effect */}
                            <motion.div
                                animate={{ top: ["-10%", "110%", "-10%"] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute left-0 right-0 h-2 bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,1),0_0_60px_rgba(99,102,241,0.6)] z-20"
                            />

                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-[3px] border-dashed border-indigo-500/30 rounded-full"
                            />
                        </div>
                        <h2 className="text-3xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            Decoding Your Aesthetic
                        </h2>
                        <div className="flex items-center gap-3 text-slate-400 animate-pulse text-lg">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            Finding the perfect Indian destinations...
                        </div>
                    </motion.div>
                )}

                {/* STAGE 3: THEME PREVIEW */}
                {stage === "THEME_PREVIEW" && (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        className="w-full max-w-5xl px-4 grid lg:grid-cols-[1fr_400px] gap-8"
                    >
                        {/* Left: Extracted Details */}
                        <div className="space-y-6">
                            {imageUrls.length > 0 && (
                                <div className="relative h-72 md:h-80 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 flex flex-wrap p-2 bg-black/40 backdrop-blur-sm gap-2">
                                    {imageUrls.map((url, i) => (
                                        <img key={i} src={url} alt="Vibe" className="flex-1 min-w-[30%] h-full object-cover rounded-2xl" />
                                    ))}
                                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none rounded-b-3xl" />
                                </div>
                            )}

                            <div className="grid sm:grid-cols-2 gap-6">
                                <GlassCard className="p-6 border-white/5 bg-white/[0.03]">
                                    <h3 className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-bold flex items-center gap-2">
                                        <Paintbrush className="w-4 h-4" /> Color Palette
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {palette.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-14 h-14 rounded-2xl shadow-lg transition-all duration-300 ${selectedColor === color ? "scale-110 ring-2 ring-offset-2 ring-offset-slate-950 ring-white z-10" : "hover:scale-105 hover:rounded-xl opacity-80 hover:opacity-100"}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-4">Click a color to change the page theme.</p>
                                </GlassCard>

                                <GlassCard className="p-6 border-white/5 bg-white/[0.03]">
                                    <h3 className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-bold flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" /> Aesthetic Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag) => (
                                            <span key={tag} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-sm font-medium border border-white/5 backdrop-blur-sm text-slate-200">
                                                #{tag.toLowerCase().replace(/\s+/g, '')}
                                            </span>
                                        ))}
                                    </div>
                                </GlassCard>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-col h-full">
                            <GlassCard
                                className="p-8 flex-1 flex flex-col justify-center border-t-4 transition-colors duration-700 shadow-2xl bg-white/5 backdrop-blur-xl"
                                style={{ borderTopColor: selectedColor }}
                            >
                                <div className="mb-8">
                                    <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-bold tracking-wider mb-4 border border-white/5" style={{ color: selectedColor }}>
                                        ANALYSIS COMPLETE
                                    </div>
                                    <h2 className="text-3xl font-display font-bold mb-3">Your Aesthetic is Defined</h2>
                                    <p className="text-slate-400 text-base leading-relaxed">
                                        We've distilled your uploads into a core travel vibe. You can jump straight to the AI planner with this aesthetic, or explore the specific destinations that match perfectly.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 mt-auto">
                                    <AnimatedButton
                                        className="w-full py-7 text-lg font-semibold rounded-2xl shadow-lg transition-transform hover:scale-[1.02]"
                                        style={{ backgroundColor: selectedColor, color: '#fff' }}
                                        onClick={() => proceedToItinerary(true)}
                                    >
                                        <Wand2 className="w-5 h-5 mr-3" />
                                        Use Theme Base & Build
                                    </AnimatedButton>

                                    <AnimatedButton
                                        variant="outline"
                                        className="w-full py-7 text-lg bg-black/40 hover:bg-black/60 border-white/10 rounded-2xl backdrop-blur-md"
                                        onClick={() => setStage("PLACES")}
                                    >
                                        <Map className="w-5 h-5 mr-3" style={{ color: selectedColor }} />
                                        Reveal Matching Places
                                    </AnimatedButton>
                                </div>
                            </GlassCard>
                        </div>
                    </motion.div>
                )}

                {}
                {stage === "PLACES" && (
                    <motion.div
                        key="places"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, filter: "blur(10px)" }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-6xl px-4"
                    >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">Destinations by Vibe</h2>
                                <p className="text-slate-400">Places that perfectly mirror your aesthetic.</p>
                            </div>
                            <AnimatedButton variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" onClick={() => setStage("THEME_PREVIEW")}>
                                ← Back to Analysis
                            </AnimatedButton>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {places.map((place, i) => {
                                const photoUrl = place.photos?.[0]?.url || "https://images.unsplash.com/photo-1506461883276-594a12b11dc3?w=800&q=80";
                                const score = place.match_score ? Math.round(place.match_score * 100) : 95 - i * 2;

                                return (
                                    <GlassCard key={i} className="p-0 overflow-hidden group flex flex-col h-full border-white/10 bg-white/[0.02]">
                                        <div className="h-56 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                                            <img src={photoUrl} alt={place.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                                            <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-green-400 border border-green-500/30 flex items-center shadow-lg">
                                                <Sparkles className="w-3 h-3 mr-1.5" /> {score}% MATCH
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 to-transparent z-10" />
                                            <h3 className="absolute bottom-4 left-5 right-5 z-20 text-2xl font-bold text-white drop-shadow-md">{place.name}</h3>
                                        </div>
                                        <div className="p-6 flex flex-col flex-1">
                                            <p className="text-sm text-slate-300 mb-6 leading-relaxed flex-1">
                                                {place.explanation || "A perfect match for your specific aesthetic preferences, offering scenic beauty and immersive experiences."}
                                            </p>
                                            <AnimatedButton
                                                className="w-full py-5 text-sm font-semibold rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 transition-all text-white group-hover:bg-indigo-600 group-hover:border-indigo-500 shadow-lg"
                                                onClick={() => proceedToItinerary(false, place.name)}
                                            >
                                                Build Itinerary Here <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </AnimatedButton>
                                        </div>
                                    </GlassCard>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {}
            <Dialog open={isBuildModalOpen} onOpenChange={setIsBuildModalOpen}>
                <DialogContent className="sm:max-w-md bg-slate-900/90 backdrop-blur-3xl border-white/10 text-white shadow-2xl shadow-indigo-500/10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            Almost Ready to Go
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-base pt-2">
                            {buildType === "theme"
                                ? "We'll design a trip matching your exact aesthetic. Just tell us your basics."
                                : `We're building an itinerary for ${buildTarget}. Just a few quick details.`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2 text-slate-300">
                                <PlaneTakeoff className="w-4 h-4 text-indigo-400" /> Starting From
                            </label>
                            <Input
                                placeholder="e.g. New York, London, Delhi..."
                                value={buildData.origin}
                                onChange={(e) => setBuildData({ ...buildData, origin: e.target.value })}
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2 text-slate-300">
                                    <CalendarDays className="w-4 h-4 text-purple-400" /> Duration (Days)
                                </label>
                                <Input
                                    type="number" min={1} max={30}
                                    value={buildData.days}
                                    onChange={(e) => setBuildData({ ...buildData, days: parseInt(e.target.value) || 1 })}
                                    className="bg-white/5 border-white/10 text-white focus:border-indigo-500 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2 text-slate-300">
                                    <Users className="w-4 h-4 text-pink-400" /> Travelers
                                </label>
                                <Input
                                    type="number" min={1} max={10}
                                    value={buildData.travelers}
                                    onChange={(e) => setBuildData({ ...buildData, travelers: parseInt(e.target.value) || 1 })}
                                    className="bg-white/5 border-white/10 text-white focus:border-indigo-500 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold flex items-center gap-2 text-slate-300">
                                <Wallet className="w-4 h-4 text-green-400" /> Travel Budget
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {["low", "medium", "high"].map((b) => (
                                    <button
                                        key={b}
                                        onClick={() => setBuildData({ ...buildData, budget: b as any })}
                                        className={`py-2 rounded-xl text-sm font-medium capitalize border transition-all ${buildData.budget === b
                                            ? "bg-indigo-500/20 border-indigo-400 text-indigo-300"
                                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                            }`}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <AnimatedButton
                        onClick={handleQuickBuild}
                        disabled={isGenerating || !buildData.origin}
                        className="w-full py-6 text-lg font-bold shadow-[0_0_30px_rgba(99,102,241,0.2)] mt-4 bg-gradient-to-r from-indigo-600 to-purple-600"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                Designing Your Trip...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-5 h-5 mr-3" />
                                Generate Itinerary
                            </>
                        )}
                    </AnimatedButton>
                </DialogContent>
            </Dialog>
        </div>
    );
}
