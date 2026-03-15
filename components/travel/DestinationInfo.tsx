"use client";

import React, { useState, useEffect } from 'react';
import { Globe, Clock, Banknote, Languages, Users, Car, MapPin, Phone, Loader2, ExternalLink } from 'lucide-react';

interface CountryInfo {
    name: string;
    officialName: string;
    capital: string;
    region: string;
    subregion: string;
    population: number;
    languages: string[];
    currencies: { code: string; name: string; symbol: string }[];
    timezones: string[];
    flag: string;
    flagPng: string;
    callingCode: string;
    drivingSide: string;
    continents: string[];
    borders: string[];
    area: number;
    maps: string;
}

function formatNum(n: number): string {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
}

export default function DestinationInfo({ destination }: { destination: string }) {
    const [info, setInfo] = useState<CountryInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!destination) return;
        const fetchInfo = async () => {
            setLoading(true);
            setError(null);
            try {
                const parts = destination.split(',').map(s => s.trim());
                const countryGuess = parts[parts.length - 1] || destination;
                const res = await fetch(`/api/country-info?country=${encodeURIComponent(countryGuess)}`);
                if (!res.ok) {
                    const res2 = await fetch(`/api/country-info?country=${encodeURIComponent(destination)}`);
                    if (!res2.ok) throw new Error('Not found');
                    setInfo(await res2.json());
                } else {
                    setInfo(await res.json());
                }
            } catch {
                setError('Country info not available for this destination');
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, [destination]);

    if (loading) {
        return (
            <div className="bg-card rounded-2xl border border-border p-8 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-primary animate-spin mr-3" />
                <span className="text-muted-foreground text-sm">Loading destination info...</span>
            </div>
        );
    }

    if (error || !info) {
        return (
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
                <Globe className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">{error || 'No info available'}</p>
            </div>
        );
    }

    const infoCards = [
        { icon: <MapPin className="w-4 h-4 text-rose-500" />, label: 'Capital', value: info.capital },
        { icon: <Globe className="w-4 h-4 text-sky-500" />, label: 'Region', value: info.subregion || info.region },
        { icon: <Users className="w-4 h-4 text-purple-500" />, label: 'Population', value: formatNum(info.population) },
        { icon: <Banknote className="w-4 h-4 text-emerald-500" />, label: 'Currency', value: info.currencies.map(c => `${c.symbol} ${c.code}`).join(', ') },
        { icon: <Languages className="w-4 h-4 text-amber-500" />, label: 'Languages', value: info.languages.slice(0, 3).join(', ') },
        { icon: <Clock className="w-4 h-4 text-cyan-500" />, label: 'Timezone', value: info.timezones[0] || '—' },
        { icon: <Phone className="w-4 h-4 text-indigo-500" />, label: 'Calling Code', value: info.callingCode || '—' },
        { icon: <Car className="w-4 h-4 text-orange-500" />, label: 'Driving Side', value: info.drivingSide ? info.drivingSide.charAt(0).toUpperCase() + info.drivingSide.slice(1) : '—' },
    ];

    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border flex items-center gap-4">
                <div className="text-5xl">{info.flag}</div>
                <div className="flex-1">
                    <h3 className="text-xl font-display font-bold text-foreground">{info.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{info.officialName}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground/60">{info.continents.join(', ')}</span>
                        <span className="text-border">•</span>
                        <span className="text-[10px] text-muted-foreground/60">{info.area.toLocaleString()} km²</span>
                    </div>
                </div>
                {info.maps && (
                    <a href={info.maps} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-colors">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                )}
            </div>

            <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {infoCards.map((card, i) => (
                        <div key={i} className="bg-secondary rounded-xl p-3 border border-border hover:border-primary/20 hover:shadow-sm transition-all">
                            <div className="flex items-center gap-2 mb-2">
                                {card.icon}
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{card.label}</span>
                            </div>
                            <div className="text-sm font-medium text-foreground truncate" title={card.value}>{card.value || '—'}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-5 pb-5">
                <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                    <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-semibold">✈️ Quick Travel Tips</h4>
                    <div className="flex flex-wrap gap-2">
                        {info.drivingSide && (
                            <span className="px-2.5 py-1 rounded-full bg-background text-[10px] text-muted-foreground border border-border">
                                🚗 Drive on the {info.drivingSide}
                            </span>
                        )}
                        {info.currencies[0] && (
                            <span className="px-2.5 py-1 rounded-full bg-background text-[10px] text-muted-foreground border border-border">
                                💰 Pay in {info.currencies[0].name} ({info.currencies[0].symbol})
                            </span>
                        )}
                        {info.languages[0] && (
                            <span className="px-2.5 py-1 rounded-full bg-background text-[10px] text-muted-foreground border border-border">
                                🗣️ Speak {info.languages[0]}
                            </span>
                        )}
                        {info.callingCode && (
                            <span className="px-2.5 py-1 rounded-full bg-background text-[10px] text-muted-foreground border border-border">
                                📞 Dial {info.callingCode}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {info.borders.length > 0 && (
                <div className="px-5 pb-5">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">🌍 Neighboring Countries</div>
                    <div className="flex flex-wrap gap-1.5">
                        {info.borders.map((b) => (
                            <span key={b} className="px-2 py-1 rounded-lg bg-secondary text-[10px] text-muted-foreground font-mono border border-border">{b}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
