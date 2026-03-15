const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function getWeatherForecast(lat: number, lng: number) {
    if (!API_KEY) {
        console.warn('OPENWEATHER_API_KEY is missing. returning mock weather data.');
        return mockWeatherData();
    }

    try {
        const response = await fetch(
            `${BASE_URL}/onecall?lat=${lat}&lon=${lng}&exclude=minutely,hourly&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) throw new Error('Weather API failed');

        return await response.json();
    } catch (error) {
        console.error('Weather fetch error:', error);
        return mockWeatherData();
    }
}

function mockWeatherData() {
    return {
        current: {
            temp: 24,
            weather: [{ main: 'Sunny', description: 'Clear sky', icon: '01d' }]
        },
        daily: Array(7).fill(0).map((_, i) => ({
            dt: Date.now() / 1000 + i * 86400,
            temp: { day: 24 + Math.random() * 5 - 2 },
            weather: [{
                main: Math.random() > 0.8 ? 'Rain' : 'Clouds',
                description: 'Partly cloudy',
                icon: '02d'
            }],
            pop: Math.random() * 0.5
        }))
    };
}
