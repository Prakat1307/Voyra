

export interface CountryInfo {
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

export async function getCountryInfo(countryName: string): Promise<CountryInfo | null> {
    try {
        const res = await fetch(
            `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=name,capital,region,subregion,population,languages,currencies,timezones,flag,flags,idd,car,continents,borders,area,maps`,
            { next: { revalidate: 86400 * 7 } } 
        );

        if (!res.ok) return null;
        const data = await res.json();
        const country = data[0];
        if (!country) return null;

        const currencies = country.currencies
            ? Object.entries(country.currencies).map(([code, val]: [string, any]) => ({
                code,
                name: val.name,
                symbol: val.symbol,
            }))
            : [];

        const languages = country.languages
            ? Object.values(country.languages) as string[]
            : [];

        return {
            name: country.name?.common || countryName,
            officialName: country.name?.official || '',
            capital: country.capital?.[0] || '',
            region: country.region || '',
            subregion: country.subregion || '',
            population: country.population || 0,
            languages,
            currencies,
            timezones: country.timezones || [],
            flag: country.flag || '',
            flagPng: country.flags?.png || '',
            callingCode: `${country.idd?.root || ''}${country.idd?.suffixes?.[0] || ''}`,
            drivingSide: country.car?.side || '',
            continents: country.continents || [],
            borders: country.borders || [],
            area: country.area || 0,
            maps: country.maps?.googleMaps || '',
        };
    } catch (error) {
        console.error('Country info fetch failed:', error);
        return null;
    }
}


export function formatPopulation(pop: number): string {
    if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(1)}B`;
    if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M`;
    if (pop >= 1_000) return `${(pop / 1_000).toFixed(1)}K`;
    return pop.toString();
}


export function extractCountryFromDestination(destination: string): string {
    const parts = destination.split(',').map(s => s.trim());
    return parts[parts.length - 1] || destination;
}
