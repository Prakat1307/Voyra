


export interface WeatherDay {
    date: string;
    temp: { min: number; max: number; avg: number };
    feels_like: number;
    humidity: number;
    description: string;
    icon: string;
    wind_speed: number;
    pop: number; 
}

export interface WeatherData {
    city: string;
    country: string;
    forecast: WeatherDay[];
}


function wmoCodeToDescription(code: number): string {
    if (code === 0) return 'clear sky';
    if (code === 1) return 'mainly clear';
    if (code === 2) return 'partly cloudy';
    if (code === 3) return 'overcast';
    if (code <= 49) return 'foggy / mist';
    if (code <= 57) return 'drizzle';
    if (code <= 67) return 'rain';
    if (code <= 77) return 'snow';
    if (code <= 82) return 'rain showers';
    if (code <= 86) return 'snow showers';
    if (code <= 99) return 'thunderstorm';
    return 'partly cloudy';
}


function wmoCodeToIcon(code: number): string {
    if (code === 0) return '01d';
    if (code <= 2) return '02d';
    if (code === 3) return '04d';
    if (code <= 49) return '50d';
    if (code <= 57) return '09d';
    if (code <= 67) return '10d';
    if (code <= 77) return '13d';
    if (code <= 82) return '09d';
    if (code <= 86) return '13d';
    if (code <= 99) return '11d';
    return '02d';
}


async function geocodeCity(city: string): Promise<{ lat: number; lon: number; displayName: string } | null> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
            {
                headers: { 'User-Agent': 'TravelPlanAI/1.0 (travel-itinerary-app)' },
                next: { revalidate: 3600 * 24 },
            }
        );
        const data = await res.json();
        if (!data || data.length === 0) return null;
        return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
            displayName: data[0].display_name?.split(',')[0] || city,
        };
    } catch {
        return null;
    }
}


export async function getWeatherForecast(city: string): Promise<WeatherData | null> {
    try {
        const geo = await geocodeCity(city);
        if (!geo) {
            console.warn(`Geocoding failed for city: ${city}`);
            return null;
        }

        const { lat, lon, displayName } = geo;

        const url = [
            `https://api.open-meteo.com/v1/forecast`,
            `?latitude=${lat}&longitude=${lon}`,
            `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max`,
            `,weathercode,windspeed_10m_max,apparent_temperature_max,relative_humidity_2m_max`,
            `&timezone=auto`,
            `&forecast_days=7`,
        ].join('');

        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) {
            console.error(`Open-Meteo API error: ${res.status}`);
            return null;
        }

        const data = await res.json();
        const daily = data.daily;

        const forecast: WeatherDay[] = daily.time.map((date: string, i: number) => {
            const tMax = Math.round(daily.temperature_2m_max[i]);
            const tMin = Math.round(daily.temperature_2m_min[i]);
            const code = daily.weathercode[i];
            const pop = (daily.precipitation_probability_max[i] ?? 0) / 100; 

            return {
                date,
                temp: {
                    min: tMin,
                    max: tMax,
                    avg: Math.round((tMax + tMin) / 2),
                },
                feels_like: Math.round(daily.apparent_temperature_max[i] ?? tMax),
                humidity: daily.relative_humidity_2m_max[i] ?? 60,
                description: wmoCodeToDescription(code),
                icon: wmoCodeToIcon(code),
                wind_speed: Math.round(daily.windspeed_10m_max[i] ?? 0),
                pop,
            };
        });

        return {
            city: displayName,
            country: '',
            forecast,
        };
    } catch (error) {
        console.error('Open-Meteo weather fetch failed:', error);
        return null;
    }
}


export function getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
