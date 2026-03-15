"use client";

import { useState, useEffect } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface Place {
    id: string;
    name: string;
    kinds: string[];
    description: string;
    distance: number;
    lat?: number;
    lng?: number;
    image?: string | null;
    wikiUrl?: string | null;
}

const KIND_EMOJI: Record<string, string> = {
    foods: '🍽️', restaurants: '🍽️', cafes: '☕', cultural: '🏛️',
    museums: '🏛️', historic: '🏰', natural: '🌿', parks: '🌳',
    beaches: '🏖️', architecture: '🏗️', religion: '🛕', sport: '⚽',
    transport: '🚌', interesting_places: '📍',
};

function getKindEmoji(kinds: string[]): string {
    for (const k of kinds) {
        const key = k.trim().toLowerCase();
        if (KIND_EMOJI[key]) return KIND_EMOJI[key];
    }
    return '📍';
}

function formatKind(kinds: string[]): string {
    return kinds.map(k => k.replace(/_/g, ' ')).map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(' • ').slice(0, 40);
}

interface NearbyPlacesProps {
    lat: number;
    lng: number;
    locationName?: string;
    kind?: string;
}

export default function NearbyPlaces({ lat, lng, locationName, kind = 'interesting_places' }: NearbyPlacesProps) {
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!lat || !lng) return;
        setLoading(true);
        setError(null);
        fetch(`/api/places/nearby?lat=${lat}&lng=${lng}&kind=${kind}`)
            .then(r => r.json())
            .then(data => { if (data.error) throw new Error(data.error); setPlaces(data.places || []); })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [lat, lng, kind]);

    if (loading) {
        return (
            <div className="flex gap-3 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map(i => <div key={i} className="flex-shrink-0 w-48 h-32 bg-secondary rounded-xl animate-pulse" />)}
            </div>
        );
    }

    if (error || places.length === 0) return null;

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Nearby {locationName ? `"${locationName}"` : 'This Stop'}
                </h4>
                <span className="text-xs text-muted-foreground">{places.length} places</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {places.map((place, i) => (
                    <motion.div
                        key={place.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex-shrink-0 w-48 bg-secondary rounded-xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-md transition-all group"
                    >
                        <div className="h-20 relative overflow-hidden bg-secondary">
                            {place.image ? (
                                <img src={place.image} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl">{getKindEmoji(place.kinds)}</div>
                            )}
                            <div className="absolute top-1.5 right-1.5 bg-background/80 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[9px] text-muted-foreground">
                                {place.distance}m
                            </div>
                        </div>
                        <div className="p-2.5">
                            <p className="text-xs font-semibold text-foreground truncate">{place.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{formatKind(place.kinds)}</p>
                            {place.description && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{place.description}</p>}
                            {place.wikiUrl && (
                                <a href={place.wikiUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary flex items-center gap-0.5 mt-1.5 hover:underline">
                                    Learn more <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
