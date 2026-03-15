"use client";

import React, { useState } from 'react';
import { Plane, Clock, Loader2, Search, AlertCircle } from 'lucide-react';

interface FlightOffer {
    id: string;
    price: string;
    currency: string;
    airline: string;
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    stops: number;
    cabin: string;
}

const AIRLINE_NAMES: Record<string, string> = {
    'AA': 'American Airlines', 'UA': 'United Airlines', 'DL': 'Delta Air Lines',
    'BA': 'British Airways', 'LH': 'Lufthansa', 'AF': 'Air France',
    'EK': 'Emirates', 'QR': 'Qatar Airways', 'SQ': 'Singapore Airlines',
    'AI': 'Air India', '6E': 'IndiGo', 'TK': 'Turkish Airlines',
    'QF': 'Qantas', 'CX': 'Cathay Pacific', 'NH': 'ANA',
    'JL': 'Japan Airlines', 'KL': 'KLM', 'LX': 'SWISS',
    'EY': 'Etihad Airways', 'WN': 'Southwest Airlines',
};

function formatTime(datetime: string): string {
    if (!datetime) return '—';
    try {
        return new Date(datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch { return '—'; }
}

function formatDuration(dur: string): string {
    return dur.replace('H', 'h ').replace('M', 'm').trim();
}

export default function FlightSearch({
    origin,
    destination,
    departureDate,
    travelers,
}: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    travelers?: number;
}) {
    const [flights, setFlights] = useState<FlightOffer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const [fromCity, setFromCity] = useState(origin || '');
    const [toCity, setToCity] = useState(destination || '');
    const [date, setDate] = useState(departureDate || '');
    const [adults, setAdults] = useState(travelers || 1);

    const searchFlights = async () => {
        if (!fromCity || !toCity || !date) return;
        setLoading(true);
        setError(null);
        setSearched(true);

        try {
            const params = new URLSearchParams({ origin: fromCity, destination: toCity, date, adults: adults.toString() });
            const res = await fetch(`/api/flights?${params}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to search flights');
                setFlights([]);
            } else {
                setFlights(data.flights || []);
                if (data.flights?.length === 0) setError('No flights found for this route.');
            }
        } catch {
            setError('Failed to fetch flights. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-900/30">
                        <Plane className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    Flight Search
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Powered by Amadeus • Real-time data</p>
            </div>

            <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block font-medium">From</label>
                        <input type="text" value={fromCity} onChange={(e) => setFromCity(e.target.value)} placeholder="e.g. Delhi or DEL"
                            className="w-full bg-secondary text-foreground text-sm rounded-xl px-3 py-2.5 border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none placeholder-muted-foreground/50 transition-all" />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block font-medium">To</label>
                        <input type="text" value={toCity} onChange={(e) => setToCity(e.target.value)} placeholder="e.g. Paris or CDG"
                            className="w-full bg-secondary text-foreground text-sm rounded-xl px-3 py-2.5 border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none placeholder-muted-foreground/50 transition-all" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block font-medium">Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-secondary text-foreground text-sm rounded-xl px-3 py-2.5 border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block font-medium">Travelers</label>
                        <input type="number" value={adults} onChange={(e) => setAdults(parseInt(e.target.value) || 1)} min={1} max={9}
                            className="w-full bg-secondary text-foreground text-sm rounded-xl px-3 py-2.5 border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all" />
                    </div>
                </div>
                <button onClick={searchFlights} disabled={loading || !fromCity || !toCity || !date}
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {loading ? 'Searching...' : 'Search Flights'}
                </button>
            </div>

            {searched && (
                <div className="border-t border-border p-5">
                    {error ? (
                        <div className="flex items-center gap-3 text-orange-600 dark:text-amber-400 text-sm py-4 justify-center">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{flights.length} flights found</div>
                            {flights.map((flight, i) => (
                                <div key={flight.id || i} className="bg-secondary rounded-2xl p-4 border border-border hover:border-primary/30 hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-900/30">
                                                <Plane className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-foreground">{AIRLINE_NAMES[flight.airline] || flight.airline}</div>
                                                <div className="text-[10px] text-muted-foreground">{flight.cabin}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">${flight.price}</div>
                                            <div className="text-[10px] text-muted-foreground">{flight.currency}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-background rounded-xl p-3 border border-border">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-foreground">{flight.departure}</div>
                                            <div className="text-xs text-muted-foreground">{formatTime(flight.departureTime)}</div>
                                        </div>
                                        <div className="flex-1 px-4 flex flex-col items-center">
                                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {formatDuration(flight.duration)}
                                            </div>
                                            <div className="w-full flex items-center gap-1 my-1">
                                                <div className="flex-1 h-px bg-border" />
                                                <Plane className="w-3 h-3 text-primary rotate-90" />
                                                <div className="flex-1 h-px bg-border" />
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-foreground">{flight.arrival}</div>
                                            <div className="text-xs text-muted-foreground">{formatTime(flight.arrivalTime)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
