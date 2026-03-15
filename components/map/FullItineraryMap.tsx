"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
});


const DAY_COLORS = [
    "#3b82f6", 
    "#ef4444", 
    "#22c55e", 
    "#f59e0b", 
    "#a855f7", 
    "#06b6d4", 
    "#f97316", 
    "#ec4899", 
];

function createDayIcon(dayIndex: number, stopIndex: number) {
    const color = DAY_COLORS[dayIndex % DAY_COLORS.length];
    return L.divIcon({
        className: "",
        html: `<div style="
            background: ${color};
            width: 28px; height: 28px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            display: flex; align-items: center; justify-content: center;
        ">
            <span style="transform: rotate(45deg); color: white; font-size: 10px; font-weight: bold;">${stopIndex + 1}</span>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
    });
}

function FitBounds({ positions }: { positions: LatLngExpression[] }) {
    const map = useMap();
    useEffect(() => {
        if (positions.length > 0) {
            const bounds = L.latLngBounds(positions as any);
            map.fitBounds(bounds, { padding: [40, 40] });
        }
    }, [map, positions]);
    return null;
}

interface Activity {
    time: string;
    activity: string;
    location: string;
    notes: string;
    cost: string | number;
    lat: number;
    long: number;
}

interface DayItinerary {
    day: string;
    activities: Activity[];
}

interface FullItineraryMapProps {
    itinerary: DayItinerary[];
    height?: string;
}

export default function FullItineraryMap({ itinerary, height = "420px" }: FullItineraryMapProps) {
    
    const dayPositions: { dayIndex: number; dayLabel: string; positions: LatLngExpression[]; activities: Activity[] }[] = [];
    const allPositions: LatLngExpression[] = [];

    itinerary.forEach((day, dayIndex) => {
        const validActivities = day.activities.filter(
            a => a.lat && a.long && !isNaN(a.lat) && !isNaN(a.long)
        );
        if (validActivities.length === 0) return;

        const positions: LatLngExpression[] = validActivities.map(a => [a.lat, a.long]);
        dayPositions.push({ dayIndex, dayLabel: day.day, positions, activities: validActivities });
        allPositions.push(...positions);
    });

    if (allPositions.length === 0) {
        return (
            <div style={{ height }} className="bg-secondary rounded-2xl flex items-center justify-center">
                <p className="text-muted-foreground text-sm">No map coordinates available for this itinerary.</p>
            </div>
        );
    }

    const center = allPositions[0];

    return (
        <div style={{ height }} className="rounded-2xl overflow-hidden border border-border">
            <MapContainer
                center={center}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <FitBounds positions={allPositions} />

                {dayPositions.map(({ dayIndex, dayLabel, positions, activities }) => (
                    <>
                        {}
                        {positions.length > 1 && (
                            <Polyline
                                key={`line-${dayIndex}`}
                                positions={positions}
                                color={DAY_COLORS[dayIndex % DAY_COLORS.length]}
                                weight={3}
                                opacity={0.7}
                                dashArray="8, 6"
                            />
                        )}
                        {}
                        {activities.map((activity, stopIndex) => (
                            <Marker
                                key={`${dayIndex}-${stopIndex}`}
                                position={[activity.lat, activity.long]}
                                icon={createDayIcon(dayIndex, stopIndex)}
                            >
                                <Popup>
                                    <div className="text-sm font-sans">
                                        <div className="text-xs font-bold text-gray-500 mb-0.5">{dayLabel} • Stop {stopIndex + 1}</div>
                                        <div className="font-semibold">{activity.activity}</div>
                                        <div className="text-gray-500">{activity.location}</div>
                                        {activity.time && <div className="text-gray-400 text-xs mt-0.5">⏰ {activity.time}</div>}
                                        {activity.cost && <div className="text-green-600 text-xs">💰 {activity.cost}</div>}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </>
                ))}
            </MapContainer>

            {}
            <div className="absolute bottom-3 left-3 z-[1000] flex flex-col gap-1 bg-background/90 backdrop-blur-sm rounded-xl p-2.5 border border-border shadow-lg">
                {dayPositions.map(({ dayIndex, dayLabel }) => (
                    <div key={dayIndex} className="flex items-center gap-2 text-xs">
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: DAY_COLORS[dayIndex % DAY_COLORS.length] }}
                        />
                        <span className="text-foreground font-medium">{dayLabel}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}


export { };
