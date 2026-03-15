export async function fetchLiveExchangeRate(base: string, target: string): Promise<number | null> {
    const API_KEY = process.env.EXCHANGERATE_API_KEY;
    if (!API_KEY) return null;

    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${base}/${target}`, {
            next: { revalidate: 900 } 
        });

        if (!response.ok) return null;

        const data = await response.json();
        return data.conversion_rate || null;
    } catch (error) {
        console.error("Currency API Error:", error);
        return null;
    }
}


export async function formatCurrency(
    baseAmount: number,
    baseCurrency: string,
    isIndiaRoute: boolean
): Promise<{ primary: string, amount: number, secondary?: string, rate?: number }> {

    
    if (isIndiaRoute || baseCurrency.toUpperCase() === 'INR') {
        return {
            primary: "INR",
            amount: baseAmount,
        };
    }

    
    const rate = await fetchLiveExchangeRate(baseCurrency, 'INR');

    if (rate) {
        return {
            primary: baseCurrency,
            amount: baseAmount,
            secondary: "INR",
            rate: rate
        };
    }

    
    return {
        primary: baseCurrency,
        amount: baseAmount
    };
}
