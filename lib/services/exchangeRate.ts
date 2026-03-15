const EXCHANGERATE_API_KEY = process.env.EXCHANGERATE_API_KEY;

export interface ExchangeRates {
    base: string;
    rates: Record<string, number>;
    lastUpdated: string;
}


export const POPULAR_CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
];


export async function getExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRates | null> {
    if (!EXCHANGERATE_API_KEY) {
        console.warn("ExchangeRate API key missing");
        return null;
    }

    try {
        const res = await fetch(
            `https://v6.exchangerate-api.com/v6/${EXCHANGERATE_API_KEY}/latest/${baseCurrency}`,
            { next: { revalidate: 86400 } } 
        );

        if (!res.ok) {
            console.error(`Exchange rate API error: ${res.status}`);
            return null;
        }

        const data = await res.json();

        if (data.result !== 'success') {
            console.error("Exchange rate API returned error:", data);
            return null;
        }

        return {
            base: data.base_code,
            rates: data.conversion_rates,
            lastUpdated: data.time_last_update_utc,
        };
    } catch (error) {
        console.error("Exchange rate fetch failed:", error);
        return null;
    }
}


export function convertCurrency(
    amount: number,
    fromRate: number,
    toRate: number
): number {
    return Math.round((amount / fromRate) * toRate * 100) / 100;
}


export function getCurrencySymbol(code: string): string {
    return POPULAR_CURRENCIES.find(c => c.code === code)?.symbol || code;
}
