"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Compass, Map, MessageSquare, Sparkles, ArrowRight, Plane, Camera, Star } from "lucide-react";
import { useState, useEffect } from "react";

const DESTINATIONS = [
  "Paris, France 🇫🇷",
  "Tokyo, Japan 🇯🇵",
  "Bali, Indonesia 🇮🇩",
  "New York, USA 🇺🇸",
  "Santorini, Greece 🇬🇷",
  "Dubai, UAE 🇦🇪",
  "Rome, Italy 🇮🇹",
  "London, UK 🇬🇧",
];

const strategies = [
  {
    title: "AI Chat Planner",
    description: "Chat naturally to build your perfect trip. AI creates personalized day-by-day itineraries in seconds.",
    icon: <MessageSquare className="w-7 h-7 text-sky-500" />,
    href: "/chat",
    gradient: "from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30",
    border: "border-sky-200/50 dark:border-sky-800/50 hover:border-sky-400 dark:hover:border-sky-600",
    iconBg: "bg-sky-100 dark:bg-sky-900/50",
  },
  {
    title: "Vibe Match",
    description: "Upload a photo or pick a mood — our AI finds destinations that match your travel vibe.",
    icon: <Camera className="w-7 h-7 text-orange-500" />,
    href: "/vibe-search",
    gradient: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
    border: "border-orange-200/50 dark:border-orange-800/50 hover:border-orange-400 dark:hover:border-orange-600",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
  },
  {
    title: "Smart Itinerary",
    description: "Detailed plans with live budgets, weather forecasts, flights, and nearby discoveries.",
    icon: <Map className="w-7 h-7 text-emerald-500" />,
    href: "/itinerary",
    gradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
    border: "border-emerald-200/50 dark:border-emerald-800/50 hover:border-emerald-400 dark:hover:border-emerald-600",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
  },
];

const STATS = [
  { label: "Destinations", value: "190+", icon: "🌍" },
  { label: "Trips Planned", value: "50K+", icon: "✈️" },
  { label: "User Rating", value: "4.9", icon: "⭐" },
  { label: "APIs Integrated", value: "8+", icon: "🔗" },
];

function AnimatedSearchBar() {
  const [currentDest, setCurrentDest] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const dest = DESTINATIONS[currentDest];
    let charIndex = 0;

    if (isTyping) {
      const typeTimer = setInterval(() => {
        if (charIndex <= dest.length) {
          setDisplayText(dest.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeTimer);
          setTimeout(() => setIsTyping(false), 2000);
        }
      }, 80);
      return () => clearInterval(typeTimer);
    } else {
      const eraseTimer = setInterval(() => {
        if (displayText.length > 0) {
          setDisplayText((prev) => prev.slice(0, -1));
        } else {
          clearInterval(eraseTimer);
          setCurrentDest((prev) => (prev + 1) % DESTINATIONS.length);
          setIsTyping(true);
        }
      }, 40);
      return () => clearInterval(eraseTimer);
    }
  }, [currentDest, isTyping, displayText.length]);

  return (
    <Link href="/chat" className="block w-full max-w-2xl mx-auto group">
      <div className="relative">
        <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-200 dark:border-slate-700 shadow-lg group-hover:shadow-xl group-hover:border-primary/50 transition-all duration-300 px-5 py-4">
          <Compass className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
          <div className="flex-1 text-left">
            <span className="text-muted-foreground text-base">Where to?  </span>
            <span className="text-foreground font-medium">{displayText}</span>
            <span className="inline-block w-0.5 h-5 bg-primary animate-pulse ml-0.5 align-middle" />
          </div>
          <div className="flex-shrink-0 ml-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Hero() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">

      {}
      <div className="absolute inset-0 bg-travel-warm pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      {}
      <main className="relative z-10 container mx-auto px-4 pt-16 pb-24 flex flex-col items-center text-center">

        {}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Travel Planning</span>
        </motion.div>

        {}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 max-w-4xl"
        >
          Your Next Adventure{" "}
          <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400">
            Starts Here
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed"
        >
          Plan smarter with AI chat, real-time flights & weather, local discoveries,
          and personalized itineraries — all in one beautiful platform.
        </motion.p>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-2xl mb-16"
        >
          <AnimatedSearchBar />
        </motion.div>

        {}
        <div className="grid md:grid-cols-3 gap-5 w-full max-w-5xl px-4 mb-16">
          {strategies.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <Link href={item.href} className="block h-full">
                <div className={`group h-full p-7 rounded-2xl bg-gradient-to-br ${item.gradient} border ${item.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
                  <div className={`mb-5 inline-flex p-3 rounded-xl ${item.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Get started <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-gray-200/50 dark:border-slate-800/50 hover:shadow-md transition-all text-center"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 pt-10 border-t border-border w-full max-w-4xl"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground text-center mb-5">Powered By</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Gemini 2.5 Flash", "Next.js 14", "MongoDB Atlas", "Amadeus API",
              "OpenWeatherMap", "Unsplash", "OpenStreetMap",
            ].map((tech, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground border border-border"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
