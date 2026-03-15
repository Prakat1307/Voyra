"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusIcon, MapPin, Calendar, Clock, ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import { RequestCredits } from "../request-credits";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ItineraryDisplay from "../travel-itinerary";
import BudgetTracker from "@/components/budget/BudgetDashboard";
import TravelBadges from "@/components/gamification/TravelBadges";
import TripTimeline from "@/components/timeline/TripTimeline";
import DocumentVault from "@/components/documents/DocumentVault";
import TripJournal from "@/components/journal/TripJournal";
import TripWeather from "@/components/weather/TripWeather";
import CurrencyConverter from "@/components/budget/CurrencyConverter";
import FlightSearch from "@/components/travel/FlightSearch";
import NearbyPlaces from "@/components/travel/NearbyPlaces";
import DestinationInfo from "@/components/travel/DestinationInfo";
import { getDestinationImage } from "@/lib/services/unsplash";


function useUnsplashImage(query: string) {
  const [imageUrl, setImageUrl] = useState<string>("");
  useEffect(() => {
    if (!query) return;
    getDestinationImage(query).then(setImageUrl);
  }, [query]);
  return imageUrl;
}


function TripSidebarCard({ item, isSelected, onSelect }: { item: any; isSelected: boolean; onSelect: () => void }) {
  const destination = item.data?.tripDetails?.destination || item.title || 'travel';
  const imageUrl = useUnsplashImage(destination);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl transition-all duration-200 border overflow-hidden",
        isSelected
          ? "border-primary/50 shadow-md ring-1 ring-primary/20 bg-primary/5 dark:bg-primary/10"
          : "bg-card border-border hover:bg-secondary hover:border-primary/20"
      )}
    >
      {imageUrl ? (
        <div className="relative h-16 w-full overflow-hidden">
          <img src={imageUrl} alt={destination} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
          <div className="absolute inset-0 flex flex-col justify-center px-3">
            <span className={cn("font-medium truncate text-sm", isSelected ? "text-sky-300" : "text-white")}>
              {item.title}
            </span>
            <div className="flex items-center text-[10px] text-white/70 mt-0.5">
              <Calendar className="w-2.5 h-2.5 mr-1" />
              {item.subtitle}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3">
          <div className="flex justify-between items-start mb-1">
            <span className={cn("font-medium truncate pr-2 text-sm", isSelected ? "text-primary" : "text-foreground")}>
              {item.title}
            </span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 mr-1" />
            {item.subtitle}
          </div>
        </div>
      )}
    </button>
  );
}

const FEATURE_TABS = [
  { id: 'budget', label: '💰 Budget' },
  { id: 'flights', label: '✈️ Flights' },
  { id: 'explore', label: '📍 Explore' },
  { id: 'destination', label: '🌍 Destination' },
  { id: 'weather', label: '🌤️ Weather' },
  { id: 'currency', label: '💱 Currency' },
  { id: 'badges', label: '🏆 Badges' },
  { id: 'timeline', label: '🗺️ Timeline' },
  { id: 'documents', label: '📁 Documents' },
  { id: 'journal', label: '📔 Journal' },
  { id: 'chat', label: '💬 Chat Log' },
];

function RecentActivityCard({ h, onClick }: { h: any; onClick: () => void }) {
  const isItinerary = h.type === 'itinerary';
  const isVibe = h.type === 'vibe';
  const dest = h.location?.destination || "travel";
  const imageUrl = useUnsplashImage(dest);

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl transition-all duration-200 border border-border bg-card hover:bg-secondary hover:border-primary/20 overflow-hidden mb-2 relative group"
    >
      {imageUrl ? (
        <div className="relative h-16 w-full overflow-hidden">
          <img src={imageUrl} alt={dest} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 flex flex-col justify-center px-3 z-10 pointer-events-none">
            <span className="font-medium truncate text-sm text-white">
              {isItinerary ? (
                <span className="flex items-center gap-1">
                  {h.location?.origin || 'Trip'} <ArrowRight className="w-3 h-3 mx-1 text-white/70 shadow-sm" /> {dest}
                </span>
              ) : isVibe ? (
                `Vibe Check: ${dest}`
              ) : (
                <span className="italic">&quot;{h.query}&quot;</span>
              )}
            </span>
            <div className="flex items-center text-[10px] text-white/70 mt-0.5 font-medium">
              {new Date(h.createdAt).toLocaleDateString()} &bull; {h.type.toUpperCase()}
            </div>
          </div>
          <div className={cn("absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full shadow-md z-10",
            isItinerary ? 'bg-emerald-500' : isVibe ? 'bg-orange-500' : 'bg-sky-500'
          )} />
        </div>
      ) : (
        <div className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/50">
          <div className={cn("mt-1.5 w-2 h-2 rounded-full flex-shrink-0",
            isItinerary ? 'bg-emerald-500' : isVibe ? 'bg-orange-500' : 'bg-sky-500'
          )} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate font-medium">
              {isItinerary ? (
                <span className="flex items-center gap-1">
                  {h.location?.origin || 'Trip'} <ArrowRight className="w-3 h-3 mx-1 text-muted-foreground" /> {dest}
                </span>
              ) : isVibe ? (
                `Vibe Check: ${dest}`
              ) : (
                <span className="italic">&quot;{h.query}&quot;</span>
              )}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {new Date(h.createdAt).toLocaleDateString()} &bull; {h.type.toUpperCase()}
            </p>
          </div>
        </div>
      )}
    </button>
  );
}

export default function Dashboard({
  email,
  history,
  trips,
  credits,
}: {
  email: string;
  history: any[];
  trips: any[];
  credits: number;
}) {
  const [selectedItem, setSelectedItem] = useState<any>(trips[0] || null);
  const [showSidebar, setShowSidebar] = useState(true);

  const listItems = trips.map(trip => {
    const title = trip.title || trip.destinations?.[0]?.city || trip.tripDetails?.destination || 'Undefined Trip';
    const startDateRaw = trip.startDate || trip.tripDetails?.dates?.start;
    const endDateRaw = trip.endDate || trip.tripDetails?.dates?.end;
    const subtitle = startDateRaw && endDateRaw ? `${new Date(startDateRaw).toLocaleDateString()} - ${new Date(endDateRaw).toLocaleDateString()}` : 'Dates TBA';

    return {
      id: trip._id,
      type: 'trip',
      title,
      subtitle,
      data: trip
    };
  });

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={cn(
          "w-80 bg-card/80 backdrop-blur-xl border-r border-border flex flex-col z-20",
          !showSidebar && "hidden md:flex"
        )}
      >
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              My Trips
            </h1>
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border">
              {credits} credits
            </span>
          </div>

          <Link href="/itinerary">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white border-none shadow-md hover:shadow-lg rounded-xl transition-all">
              <PlusIcon className="mr-2 h-4 w-4" /> New Journey
            </Button>
          </Link>
        </div>

        <div className="px-4 py-3 grid gap-1.5">
          <Link href="/community">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg text-sm">
              <span className="mr-2">🌍</span> Community Board
            </Button>
          </Link>
          <Link href="/journal">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg text-sm">
              <span className="mr-2">📔</span> Travel Journal
            </Button>
          </Link>
        </div>

        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-4">
            <div className="px-1">
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Itineraries</h3>
              <div className="space-y-2">
                {listItems.length === 0 && <p className="text-sm text-muted-foreground italic px-2">No itineraries yet.</p>}
                {listItems.map((item) => (
                  <TripSidebarCard
                    key={item.id}
                    item={item}
                    isSelected={selectedItem?._id === item.id}
                    onSelect={() => setSelectedItem(item.data)}
                  />
                ))}
              </div>
            </div>

            <div className="px-1 pt-4 border-t border-border">
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <RecentActivityCard
                    key={i}
                    h={h}
                    onClick={() => {
                      if (h.type === 'itinerary' && (h.tripId || h.metadata?.tripId)) {
                        const tripId = h.tripId || h.metadata?.tripId;
                        const foundTrip = trips.find(t => t.id === tripId || t._id === tripId);
                        if (foundTrip) setSelectedItem(foundTrip);
                      } else if (h.type === 'vibe' && h.location?.destination) {
                        window.location.href = `/vibe-search?q=${encodeURIComponent(h.location.destination)}`;
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </motion.div>

      {}
      <div className="flex-1 flex flex-col relative bg-background overflow-hidden">
        {!selectedItem ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 flex items-center justify-center shadow-xl shadow-indigo-500/10">
                <Compass className="w-12 h-12 text-indigo-400 opacity-80" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">✦</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-foreground">Your adventures await</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Select a trip from the sidebar or create a new journey to get started</p>
            </div>
            <Link href="/vibe-search">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 h-11 shadow-lg shadow-indigo-500/25">
                <PlusIcon className="w-4 h-4 mr-2" /> Plan New Trip
              </Button>
            </Link>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <TripHeroView item={selectedItem} listItems={listItems} />
          </ScrollArea>
        )}

        {credits <= 0 && <RequestCredits email={email} />}
      </div>
    </div>
  );
}

function TripHeroView({ item, listItems }: { item: any; listItems: any[] }) {
  const destination = item.tripDetails?.destination || item.title || 'travel';
  const heroImage = useUnsplashImage(destination);
  const [activeFeature, setActiveFeature] = useState('itinerary');

  const startDate = item.startDate || item.tripDetails?.dates?.start;
  const endDate = item.endDate || item.tripDetails?.dates?.end;
  const duration = item.duration || item.tripDetails?.duration || '—';
  const travelers = item.travelers || item.tripDetails?.travelers || 2;
  const budget = item.tripDetails?.aiSummary?.total_estimated_cost_inr
    ? `₹${Number(item.tripDetails.aiSummary.total_estimated_cost_inr).toLocaleString('en-IN')}`
    : item.budget?.total || '—';

  const FEATURE_TABS = [
    { id: 'itinerary', label: '🗺️ Itinerary', emoji: '🗺️' },
    { id: 'budget', label: '💰 Budget', emoji: '💰' },
    { id: 'weather', label: '🌤️ Weather', emoji: '🌤️' },
    { id: 'flights', label: '✈️ Flights', emoji: '✈️' },
    { id: 'explore', label: '📍 Explore', emoji: '📍' },
    { id: 'destination', label: '🌍 Destination', emoji: '🌍' },
    { id: 'currency', label: '💱 Currency', emoji: '💱' },
    { id: 'badges', label: '🏆 Badges', emoji: '🏆' },
    { id: 'timeline', label: '📅 Timeline', emoji: '📅' },
    { id: 'documents', label: '📁 Documents', emoji: '📁' },
    { id: 'journal', label: '📔 Journal', emoji: '📔' },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {}
      <div className="relative w-full h-72 md:h-96 overflow-hidden flex-shrink-0">
        {}
        {heroImage && (
          <img
            src={heroImage}
            alt={destination}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-slate-900/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/60 via-transparent to-transparent" />

        {}
        <div className="absolute top-6 right-8 w-32 h-32 rounded-full bg-violet-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-12 right-24 w-24 h-24 rounded-full bg-indigo-500/15 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />

        {}
        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10">
          {}
          <div className="flex items-center gap-2 text-white/50 text-xs font-medium mb-3">
            <Compass className="w-3 h-3" />
            <span>My Trips</span>
            <span className="text-white/30">›</span>
            <span className="text-white/80">{destination}</span>
          </div>

          {}
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-2xl mb-3">
            {destination}
          </h1>

          {}
          <div className="flex flex-wrap gap-2 mb-2">
            {startDate && (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
                <Calendar className="w-3 h-3 text-sky-300" />
                {new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                {endDate && <> — {new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</>}
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
              <Clock className="w-3 h-3 text-emerald-300" />
              {duration} Days
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
              👥 {travelers} Travelers
            </div>
            {budget !== '—' && (
              <div className="flex items-center gap-1.5 bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 text-indigo-200 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
                💰 {budget}
              </div>
            )}
            <PublishToggle
              tripId={item._id}
              initialState={item.isPublic}
              onToggle={(newState) => {
                const idx = listItems.findIndex(i => i.id === item._id);
                if (idx > -1) listItems[idx].data.isPublic = newState;
              }}
            />
          </div>
        </div>
      </div>

      {}
      <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {FEATURE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFeature(tab.id)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap",
                activeFeature === tab.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/8 bg-white/4 border border-white/8"
              )}
            >
              <span>{tab.emoji}</span>
              <span className="hidden sm:inline">{tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="flex-1 bg-slate-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="p-4 md:p-8 max-w-7xl mx-auto"
          >
            {activeFeature === 'itinerary' && (
              <ItineraryDisplay
                id={item._id}
                name={item.tripDetails?.destination || item.tripDetails?.title || item.title}
                itinerary={(() => {
                  const days = (item.itinerary && item.itinerary.length > 0 ? item.itinerary : item.days || []);
                  return days.map((d: any, di: number) => {
                    const visits = Array.isArray(d.visits) ? d.visits : [];
                    const segments = Array.isArray(d.segments) ? d.segments : [];
                    const activities = Array.isArray(d.activities) ? d.activities : [];
                    const merged = [
                      ...segments.map((s: any) => ({
                        time: s.departure || s.time || "",
                        activity: `${s.mode ? s.mode.charAt(0).toUpperCase() + s.mode.slice(1) : "Transit"}: ${s.from || ""} → ${s.to || ""}`,
                        location: s.to || "",
                        notes: s.estimated_fare ? `Fare: ₹${s.estimated_fare.amount || 0}` : "",
                        cost: s.estimated_fare?.amount || 0,
                        lat: 0, long: 0, category: "transit", description: ""
                      })),
                      ...visits.map((v: any) => ({
                        time: v.start_time || v.time || "",
                        activity: v.name || "Visit",
                        location: v.name || "",
                        notes: v.weather ? `${v.weather.summary || ""} • ${v.weather.temp_c || ""}°C` : "",
                        cost: 0, lat: v.lat || 0, long: v.lng || v.long || 0,
                        description: v.description || "", imageUrl: v.images?.[0] || "",
                        bookingUrl: v.map_link || "", category: "activity"
                      })),
                      ...activities.map((a: any) => ({
                        time: a.time || a.timeSlot?.start || "",
                        activity: a.activity || a.name || "",
                        description: a.description || "",
                        location: a.location?.name || a.location || "",
                        notes: a.notes || "",
                        cost: a.estimatedCost?.amount || a.cost || 0,
                        lat: a.location?.lat || a.lat || 0,
                        long: a.location?.lng || a.long || a.lng || 0,
                        category: a.category || "activity"
                      }))
                    ];
                    const dayLabel = d.date
                      ? new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
                      : `Day ${di + 1}`;
                    return { day: dayLabel, activities: merged };
                  });
                })()}
                budget_breakdown={(() => {
                  const summary = item.tripDetails?.aiSummary || item.summary || {};
                  const total = summary.total_estimated_cost_inr;
                  if (!total) return undefined;
                  return {
                    currency: "INR",
                    total_estimated_cost: `₹${Number(total).toLocaleString('en-IN')}`,
                    category_breakdown: summary.category_breakdown || {
                      accommodation: "Included", transport: "Included",
                      food: "Included", activities: "Included", miscellaneous: "Included"
                    },
                    daily_summaries: []
                  };
                })()}
              />
            )}
            {activeFeature === 'budget' && (
              <BudgetTracker
                tripId={item._id}
                totalBudget={item.budget?.total ? parseFloat(item.budget.total) : 50000}
                currency={item.budget?.currency || 'INR'}
                days={item.duration}
                people={item.travelers || 2}
              />
            )}
            {activeFeature === 'weather' && <TripWeather tripId={item._id} destination={destination} startDate={item.startDate || item.tripDetails?.dates?.start} />}
            {activeFeature === 'flights' && <FlightSearch tripId={item._id} origin={item.tripDetails?.origin || ''} destination={destination} date={item.startDate || item.tripDetails?.dates?.start} />}
            {activeFeature === 'explore' && <NearbyPlaces tripId={item._id} destination={destination} />}
            {activeFeature === 'destination' && <DestinationInfo destination={destination} />}
            {activeFeature === 'currency' && <CurrencyConverter baseCurrency={item.budget?.currency || 'INR'} />}
            {activeFeature === 'badges' && <TravelBadges userId={item.userId} tripId={item._id} />}
            {activeFeature === 'timeline' && <TripTimeline tripId={item._id} startDate={item.startDate || item.tripDetails?.dates?.start} endDate={item.endDate || item.tripDetails?.dates?.end} />}
            {activeFeature === 'documents' && <DocumentVault tripId={item._id} />}
            {activeFeature === 'journal' && <TripJournal tripId={item._id} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}



function FeatureTabs({ selectedItem }: { selectedItem: any }) {
  const [activeFeature, setActiveFeature] = useState('budget');

  return (
    <div className="space-y-6 pb-12">
      {}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {FEATURE_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFeature(tab.id)}
            className={cn(
              "flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-xl transition-all whitespace-nowrap",
              activeFeature === tab.id
                ? "bg-primary text-white shadow-md"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeFeature}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {activeFeature === 'budget' && (
            <BudgetTracker
              tripId={selectedItem._id}
              totalBudget={selectedItem.budget?.total ? parseFloat(selectedItem.budget.total) : 50000}
              currency={selectedItem.budget?.currency || 'INR'}
              days={selectedItem.duration}
              people={selectedItem.travelers || 2}
            />
          )}
          {activeFeature === 'badges' && (
            <TravelBadges />
          )}
          {activeFeature === 'timeline' && (
            <TripTimeline
              days={selectedItem.duration}
              itinerary={selectedItem.days?.map((d: any, i: number) => ({
                day: i + 1,
                title: `Day ${i + 1}`,
                theme: d.theme || `Day ${i + 1} Activities`,
                activities: d.activities?.map((a: any) => ({
                  time: a.timeSlot?.start || '09:00',
                  title: a.name || a.activity || 'Activity',
                  type: a.type || 'sightseeing',
                  duration: a.duration || '1hr',
                  icon: a.type === 'food' ? '🍽️' : a.type === 'adventure' ? '🏄' : '📍',
                  description: a.description,
                  location: a.location?.name,
                  cost: a.estimatedCost?.amount
                })) || []
              }))}
            />
          )}
          {activeFeature === 'documents' && (
            <DocumentVault tripId={selectedItem._id} />
          )}
          {activeFeature === 'journal' && (
            <TripJournal tripId={selectedItem._id} />
          )}
          {activeFeature === 'weather' && (
            <TripWeather destination={selectedItem.tripDetails?.destination || selectedItem.title || ''} />
          )}
          {activeFeature === 'currency' && (
            <CurrencyConverter tripBudget={selectedItem.tripDetails?.budget?.amount} />
          )}
          {activeFeature === 'flights' && (
            <FlightSearch
              origin={selectedItem.tripDetails?.source || ''}
              destination={selectedItem.tripDetails?.destination || selectedItem.title || ''}
              departureDate={selectedItem.tripDetails?.startDate ? new Date(selectedItem.tripDetails.startDate).toISOString().split('T')[0] : ''}
              travelers={(selectedItem.tripDetails?.adults || 1) + (selectedItem.tripDetails?.children || 0)}
            />
          )}
          {activeFeature === 'explore' && (
            <NearbyPlaces destination={selectedItem.tripDetails?.destination || selectedItem.title || ''} />
          )}
          {activeFeature === 'destination' && (
            <DestinationInfo destination={selectedItem.tripDetails?.destination || selectedItem.title || ''} />
          )}
          {activeFeature === 'chat' && (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4 max-h-[600px] overflow-y-auto">
              <h3 className="text-lg font-semibold text-foreground mb-4">Planning Conversation</h3>
              {!selectedItem.chatHistory || selectedItem.chatHistory.length === 0 ? (
                <p className="text-muted-foreground italic">No chat history available for this trip.</p>
              ) : (
                selectedItem.chatHistory.map((msg: any, idx: number) => (
                  <div key={idx} className={cn("flex flex-col space-y-1", msg.role === 'user' ? "items-end" : "items-start")}>
                    <div className={cn(
                      "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user'
                        ? "bg-primary text-white rounded-tr-sm"
                        : "bg-secondary text-foreground rounded-tl-sm border border-border"
                    )}>
                      {msg.role === 'assistant' || msg.role === 'model' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p>{msg.content}</p>
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground opacity-60 px-1">
                      {msg.role === 'user' ? 'You' : 'AI Planner'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PublishToggle({ tripId, initialState, onToggle }: { tripId: string, initialState: boolean, onToggle: (s: boolean) => void }) {
  const [isPublic, setIsPublic] = useState(initialState);
  const [loading, setLoading] = useState(false);

  
  const [currentId, setCurrentId] = useState(tripId);
  if (currentId !== tripId) {
    setCurrentId(tripId);
    setIsPublic(initialState);
  }

  const handleToggle = async () => {
    setLoading(true);
    const newState = !isPublic;
    try {
      const res = await fetch('/api/trips/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, isPublic: newState })
      });

      if (res.ok) {
        setIsPublic(newState);
        onToggle(newState);
      }
    } catch (err) {
      console.error("Failed to toggle visibility", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border",
        isPublic
          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/50 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
          : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
      )}
    >
      <div className={cn("w-2 h-2 rounded-full", isPublic ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/50")} />
      {loading ? "Updating..." : (isPublic ? "Public" : "Private")}
    </button>
  );
}
