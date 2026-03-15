"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createEvents } from "ics";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Copy, CheckCircle, FileText, Calendar, Plane, Hotel, Clock, DollarSign, Image as ImageIcon, ExternalLink, Utensils, AlertTriangle, MapPin, Wallet, PieChart, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

import { getDestinationImage } from "@/lib/services/unsplash";


const MapComponent = dynamic(
  () => import("@/components/map-component").then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => <div>Loading map...</div>,
  }
);

interface Activity {
  time: string;
  activity: string;
  location: string;
  notes: string;
  cost: string | number;
  long: number;
  lat: number;
  opening_time?: string;
  closing_time?: string;
  ticket_price?: string;
  is_ticket_fixed?: boolean;
  child_precautions?: string;
  description?: string;
  price_type?: string;

  
  category?: string;
  bookingUrl?: string;
  imageUrl?: string;
  tags?: string[];
}

interface Flight {
  airline: string;
  flight_number: string;
  price: string;
  booking_link_query: string;
}

interface Hotel {
  name: string;
  rating: string;
  price: string;
  booking_link_query: string;
}

interface FoodPlace {
  name: string;
  cuisine: string;
  price_range: string;
  location: string;
  rating: string;
  google_search_query: string;
}

interface BudgetCategory {
  accommodation: string;
  transport: string;
  food: string;
  activities: string;
  miscellaneous: string;
}

interface DailySummary {
  day: number;
  estimated_cost: string;
  activity_count: number;
}

interface BudgetBreakdown {
  currency: string;
  total_estimated_cost: string;
  daily_summaries: DailySummary[];
  category_breakdown: BudgetCategory;
}

interface Recommendations {
  flights: Flight[];
  hotels: Hotel[];
  food_places?: FoodPlace[];
}

interface DayItinerary {
  day: string;
  activities: Activity[];
}

interface ItineraryDisplayProps {
  name?: string;
  itinerary: DayItinerary[];
  recommendations?: Recommendations;
  budget_breakdown?: BudgetBreakdown;
  id: number;
}

export default function ItineraryDisplay({
  name,
  itinerary,
  recommendations,
  budget_breakdown,
  id,
}: ItineraryDisplayProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [displayedActivities, setDisplayedActivities] = useState<Activity[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [isStreaming, setIsStreaming] = useState(true);
  const [activeTab, setActiveTab] = useState("preview");
  const [isCopied, setIsCopied] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const contentRef = useRef("");

  useEffect(() => {
    let content = "";
    itinerary.forEach((day) => {
      content += `Day: ${day.day}\n\n`;
      day.activities.forEach((activity) => {
        content += `Time: ${activity.time}\n`;
        content += `Activity: ${activity.activity}\n`;
        content += `Location: ${activity.location}\n`;
        content += `Notes: ${activity.notes}\n`;
        content += `Cost: ${activity.cost}\n`;
        content += `Coordinates: ${activity.lat}, ${activity.long}\n\n`;
      });
      content += "---\n\n";
    });

    contentRef.current = content;

    let index = 0;
    const interval = setInterval(() => {
      if (index < content.length) {
        setDisplayedContent((prev) => prev + content[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 1);

    return () => clearInterval(interval);
  }, [itinerary]);

  useEffect(() => {
    if (currentDayIndex < itinerary.length) {
      const currentDay = itinerary[currentDayIndex];
      if (currentActivityIndex < currentDay.activities.length) {
        const interval = setInterval(() => {
          setDisplayedActivities((prev) => [
            ...prev,
            currentDay.activities[currentActivityIndex],
          ]);
          setCurrentActivityIndex((prev) => prev + 1);
        }, 100);

        return () => clearInterval(interval);
      } else {
        setCurrentDayIndex((prev) => prev + 1);
        setCurrentActivityIndex(0);
      }
    } else {
      setIsStreaming(false);
    }
  }, [itinerary, currentDayIndex, currentActivityIndex]);

  const [headerImage, setHeaderImage] = useState<string>("");

  useEffect(() => {
    const fetchImage = async () => {
      
      const query = itinerary[0]?.activities[0]?.location || name || "travel";
      const img = await getDestinationImage(query);
      setHeaderImage(img);
    };
    fetchImage();
  }, [name, itinerary]);

  const downloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([contentRef.current], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "travel_itinerary.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: "Itinerary Downloaded",
      description: "Your itinerary has been downloaded as a text file.",
    });
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    const splitContent = doc.splitTextToSize(contentRef.current, 180);
    const pageHeight = doc.internal.pageSize.height;
    let cursorY = 20;

    for (let i = 0; i < splitContent.length; i++) {
      if (cursorY > pageHeight - 20) {
        doc.addPage();
        cursorY = 20;
      }
      doc.text(splitContent[i], 15, cursorY);
      cursorY += 7;
    }

    doc.save("travel_itinerary.pdf");
    toast({
      title: "Itinerary Downloaded",
      description: "Your itinerary has been downloaded as a PDF file.",
    });
  };

  const downloadIcs = () => {
    const events = itinerary.flatMap((day) =>
      day.activities.map((activity) => {
        const [year, month, date] = day.day
          .split(" ")[1]
          .split("-")
          .map(Number);
        const [hour, minute] = activity.time.split(":").map(Number);
        return {
          title: activity.activity,
          description: `${activity.notes}\nCost: ${activity.cost}`,
          location: activity.location,
          start: [year, month, date, hour, minute],
          duration: { hours: 1, minutes: 0 },
        };
      })
    );

    
    createEvents(
      events.map((event) => ({
        ...event,
        start: event.start as [number, number, number, number, number],
        end: [
          ...event.start.slice(0, 3),
          event.start[3] + event.duration.hours,
          event.start[4] + event.duration.minutes,
        ] as [number, number, number, number, number],
      })),
      (error: any, value: BlobPart) => {
        if (error) {
          console.error(error);
          toast({
            title: "Download Failed",
            description: "Failed to generate ICS file. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const element = document.createElement("a");
        const file = new Blob([value], { type: "text/calendar" });
        element.href = URL.createObjectURL(file);
        element.download = "travel_itinerary.ics";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast({
          title: "Itinerary Downloaded",
          description: "Your itinerary has been downloaded as an ICS file.",
        });
      }
    );
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/delete-itinerary`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    window.location.reload();
  }
  const handleCopy = () => {
    navigator.clipboard
      .writeText(contentRef.current)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Itinerary Copied",
          description: "Your itinerary has been copied to the clipboard.",
        });
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Copy Failed",
          description: "Failed to copy the itinerary. Please try again.",
          variant: "destructive",
        });
      });
  };

  const handleDownload = (format: "txt" | "pdf" | "ics") => {
    switch (format) {
      case "txt":
        downloadTxt();
        break;
      case "pdf":
        downloadPdf();
        break;
      case "ics":
        downloadIcs();
        break;
    }
  };

  return (
    <Card className="h-full w-full mx-auto max-w-7xl overflow-hidden border-0 shadow-xl bg-card">
      <div className="relative h-64 md:h-80 overflow-hidden group">
        {}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${headerImage || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-2 tracking-tight text-white drop-shadow-lg">
                {name || `${itinerary[0]?.day} Trip`}
              </h2>
              <div className="flex flex-wrap gap-3 mt-4 text-white/90">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-md border border-white/20">
                  <Calendar className="w-4 h-4" />
                  {itinerary[0]?.day} - {itinerary[itinerary.length - 1]?.day}
                </div>
                {budget_breakdown && (
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-md border border-white/20">
                    <Wallet className="w-4 h-4" />
                    {budget_breakdown.total_estimated_cost}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleDownload("pdf")} variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30 border border-white/20 backdrop-blur-md">
                <Download className="w-4 h-4 mr-2" /> PDF
              </Button>
              <Button onClick={handleCopy} variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30 border border-white/20 backdrop-blur-md">
                {isCopied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {isCopied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="p-4 sm:p-6 md:p-8 bg-slate-950 min-h-[500px]">

          {budget_breakdown && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="md:col-span-1 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-600 flex items-center gap-2">
                    <PieChart className="w-4 h-4" /> Total Budget
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900 tracking-tight">{budget_breakdown.total_estimated_cost}</div>
                  <p className="text-sm text-orange-600/80 mt-1 font-medium">Estimated for entire trip</p>
                </CardContent>
              </Card>
              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(budget_breakdown.category_breakdown).map(([key, value]) => (
                  <div key={key} className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-center">
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">{key}</div>
                    <div className="font-bold text-slate-200">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {itinerary.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={cn(
                    "flex-shrink-0 flex flex-col items-center px-5 py-3 rounded-2xl border transition-all duration-300 text-sm font-semibold",
                    selectedDayIdx === idx
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30 scale-105"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:border-indigo-500/40 hover:text-white hover:bg-slate-800"
                  )}
                >
                  <span className="text-[10px] uppercase tracking-widest mb-0.5 opacity-70">
                    Day
                  </span>
                  <span className="text-xl font-bold leading-none">{idx + 1}</span>
                  <span className="text-[10px] mt-1 opacity-60 truncate max-w-[80px] text-center">
                    {day.day}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {}
          {itinerary[selectedDayIdx] && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-white">
                  {itinerary[selectedDayIdx].activities.filter(a => a.category === 'activity').length}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">Places</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-indigo-400">
                  {itinerary[selectedDayIdx].activities.filter(a => a.category === 'transit').length}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">Transits</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-emerald-400">
                  ₹{itinerary[selectedDayIdx].activities.reduce((sum, a) => sum + Number(String(a.cost || 0).replace(/[^0-9.]/g, '') || 0), 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">Est. Cost</div>
              </div>
            </div>
          )}

          {}
          <AnimatePresence mode="wait">
            {itinerary[selectedDayIdx] && (
              <motion.div
                key={selectedDayIdx}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative"
              >
                {}
                <div className="absolute left-[22px] top-8 bottom-0 w-px bg-gradient-to-b from-indigo-600 via-slate-700 to-transparent" />

                <div className="space-y-4">
                  {itinerary[selectedDayIdx].activities.map((activity, actIndex) => (
                    <motion.div
                      key={actIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: actIndex * 0.07 }}
                      className="flex gap-4 relative"
                    >
                      {}
                      <div className={cn(
                        "flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center z-10 border-2 shadow-lg",
                        activity.category === 'transit'
                          ? "bg-slate-800 border-slate-600 text-slate-300"
                          : "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                      )}>
                        {activity.category === 'transit'
                          ? <Plane className="w-4 h-4" />
                          : <MapPin className="w-4 h-4" />
                        }
                      </div>

                      {}
                      <div className={cn(
                        "flex-1 rounded-2xl border overflow-hidden transition-all duration-300 group",
                        activity.category === 'transit'
                          ? "bg-slate-900/60 border-slate-800 hover:border-slate-600"
                          : "bg-slate-900 border-slate-800 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
                      )}>
                        {}
                        {activity.imageUrl && (
                          <div className="relative h-32 overflow-hidden">
                            <img src={activity.imageUrl} alt={activity.activity} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                            <div className="absolute bottom-2 left-3 flex items-center gap-2">
                              {activity.time && (
                                <span className="text-xs bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-medium border border-white/10">
                                  🕐 {activity.time}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="p-4">
                          {}
                          {!activity.imageUrl && (
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              {activity.time && (
                                <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 rounded-lg text-xs font-bold border border-indigo-500/20">
                                  🕐 {activity.time}
                                </span>
                              )}
                              {activity.category && (
                                <span className={cn(
                                  "px-2 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider border",
                                  activity.category === 'transit'
                                    ? "bg-slate-800 text-slate-400 border-slate-700"
                                    : "bg-violet-900/30 text-violet-300 border-violet-700/40"
                                )}>
                                  {activity.category}
                                </span>
                              )}
                            </div>
                          )}

                          {}
                          <h3 className={cn(
                            "font-bold mb-1 transition-colors",
                            activity.category === 'transit'
                              ? "text-base text-slate-300"
                              : "text-lg text-white group-hover:text-indigo-300"
                          )}>
                            {activity.activity}
                          </h3>

                          {}
                          {activity.location && activity.location !== activity.activity && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                              <MapPin className="w-3 h-3" /> {activity.location}
                            </p>
                          )}

                          {}
                          {(activity.notes || activity.description) && (
                            <div className={cn(
                              "text-sm leading-relaxed rounded-xl p-3 mt-2 border",
                              activity.category === 'transit'
                                ? "bg-slate-800/50 border-slate-700/50 text-slate-400"
                                : "bg-slate-800/40 border-slate-700/30 text-slate-300"
                            )}>
                              {activity.description || activity.notes}
                            </div>
                          )}

                          {}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
                            <div className="flex items-center gap-3">
                              {activity.cost !== undefined && activity.cost !== 0 && activity.cost !== '' && (
                                <div>
                                  <div className="text-[10px] text-slate-500 uppercase">Cost</div>
                                  <div className="text-sm font-bold text-emerald-400">
                                    ₹{String(activity.cost).replace(/[^0-9.]/g, '')}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {activity.location && (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20 hover:bg-teal-500/20 transition-colors"
                                >
                                  <MapPin className="w-3 h-3" /> Map
                                </a>
                              )}
                              {activity.bookingUrl && (
                                <a
                                  href={activity.bookingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" /> View
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {itinerary[selectedDayIdx].activities.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                      <Clock className="w-10 h-10 mb-3 opacity-30" />
                      <p className="text-sm">No activities planned for this day yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-900 border-t border-slate-800 p-4 flex justify-between text-xs text-slate-500">
        <div>Generated by AI Travel Planner</div>
        <div>{new Date().toLocaleDateString()}</div>
      </CardFooter>
    </Card>
  );
}

