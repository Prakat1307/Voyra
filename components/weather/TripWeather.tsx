"use client";

import React, { useState, useEffect } from 'react';
import { CloudSun, Wind, Droplets, Thermometer, Loader2 } from 'lucide-react';

interface ForecastDay {
    date: string;
    temp: { min: number; max: number; avg: number };
    feels_like: number;
    humidity: number;
    description: string;
    icon: string;
    wind_speed: number;
    pop: number;
}

function getWeatherEmoji(desc: string): string {
    const d = desc.toLowerCase();
    if (d.includes('clear') || d.includes('sun')) return '☀️';
    if (d.includes('cloud') && d.includes('few')) return '🌤️';
    if (d.includes('cloud') && d.includes('scatter')) return '⛅';
    if (d.includes('cloud')) return '☁️';
    if (d.includes('rain') && d.includes('heavy')) return '🌧️';
    if (d.includes('rain') || d.includes('drizzle')) return '🌦️';
    if (d.includes('thunder') || d.includes('storm')) return '⛈️';
    if (d.includes('snow')) return '🌨️';
    if (d.includes('fog') || d.includes('mist') || d.includes('haze')) return '🌫️';
    return '🌤️';
}

function getTempColor(temp: number): string {
    if (temp >= 35) return 'text-red-600 dark:text-red-400';
    if (temp >= 28) return 'text-orange-600 dark:text-orange-400';
    if (temp >= 20) return 'text-amber-600 dark:text-amber-400';
    if (temp >= 10) return 'text-sky-600 dark:text-sky-400';
    return 'text-blue-600 dark:text-blue-400';
}

export default function TripWeather({ destination }: { destination: string }) {
    const [forecast, setForecast] = useState<ForecastDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [city, setCity] = useState('');

    useEffect(() => {
        if (!destination) return;
        const cityName = destination.split(',')[0].trim();
        const fetchWeather = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setForecast(data.forecast || []);
                setCity(data.city || cityName);
            } catch (e: any) {
                setError(e.message || 'Failed to load weather');
            } finally {
                setLoading(false);
            }
        };
        fetchWeather();
    }, [destination]);

    if (loading) {
        return (
            <div className="bg-card rounded-2xl border border-border p-8 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-primary animate-spin mr-3" />
                <span className="text-muted-foreground text-sm">Loading weather...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
                <CloudSun className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">{error}</p>
            </div>
        );
    }

    
    const maxTemp = Math.max(...forecast.map(f => f.temp.max));
    const minTemp = Math.min(...forecast.map(f => f.temp.min));
    const rainChance = Math.max(...forecast.map(f => f.pop));
    const tips: string[] = [];
    if (maxTemp >= 30) tips.push('🧴 Sunscreen & hat essential');
    if (maxTemp >= 25 && maxTemp < 30) tips.push('👕 Light breathable clothes');
    if (minTemp < 15) tips.push('🧥 Pack a warm layer');
    if (minTemp < 5) tips.push('🧤 Heavy winter gear needed');
    if (rainChance > 0.4) tips.push('☂️ Bring an umbrella');
    if (tips.length === 0) tips.push('😎 Great weather, pack light!');

    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <CloudSun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    5-Day Forecast
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{city} • OpenWeatherMap</p>
            </div>

            <div className="p-5">
                <div className="grid grid-cols-5 gap-3 mb-5">
                    {forecast.slice(0, 5).map((day, i) => (
                        <div key={i} className="bg-secondary rounded-xl p-3 text-center border border-border hover:border-primary/20 hover:shadow-sm transition-all">
                            <div className="text-xs text-muted-foreground mb-1 font-medium">
                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className="text-3xl my-2">{getWeatherEmoji(day.description)}</div>
                            <div className={`text-lg font-bold ${getTempColor(day.temp.max)}`}>
                                {Math.round(day.temp.max)}°
                            </div>
                            <div className="text-xs text-muted-foreground">{Math.round(day.temp.min)}°</div>
                            <div className="text-[9px] text-muted-foreground mt-1 capitalize truncate">{day.description}</div>
                            {day.pop > 0.1 && (
                                <div className="text-[9px] text-sky-500 mt-0.5">💧 {Math.round(day.pop * 100)}%</div>
                            )}
                        </div>
                    ))}
                </div>

                {}
                {forecast.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="bg-secondary rounded-xl p-3 border border-border">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Wind className="w-3.5 h-3.5 text-sky-500" />
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Wind</span>
                            </div>
                            <div className="text-sm font-medium text-foreground">{forecast[0].wind_speed} m/s</div>
                        </div>
                        <div className="bg-secondary rounded-xl p-3 border border-border">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Humidity</span>
                            </div>
                            <div className="text-sm font-medium text-foreground">{forecast[0].humidity}%</div>
                        </div>
                        <div className="bg-secondary rounded-xl p-3 border border-border">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Feels Like</span>
                            </div>
                            <div className="text-sm font-medium text-foreground">{Math.round(forecast[0].feels_like)}°C</div>
                        </div>
                    </div>
                )}

                {}
                <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                    <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-semibold">🧳 Packing Tips</h4>
                    <div className="flex flex-wrap gap-2">
                        {tips.map((tip, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-full bg-background text-[10px] text-muted-foreground border border-border">{tip}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
