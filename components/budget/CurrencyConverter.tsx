"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, RefreshCw, Loader2, TrendingUp } from 'lucide-react';

const POPULAR_CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht' },
];

export default function CurrencyConverter({ tripBudget }: { tripBudget?: number }) {
    const [amount, setAmount] = useState(tripBudget || 1000);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [rates, setRates] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRates(fromCurrency);
    }, [fromCurrency]);

    const fetchRates = async (base: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/exchange?base=${base}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setRates(data.rates || {});
        } catch (e: any) {
            setError(e.message || 'Failed to fetch rates');
        } finally {
            setLoading(false);
        }
    };

    const convertedAmount = rates[toCurrency] ? (amount * rates[toCurrency]).toFixed(2) : '—';

    const swapCurrencies = () => {
        const temp = fromCurrency;
        setFromCurrency(toCurrency);
        setToCurrency(temp);
    };

    const getCurrencySymbol = (code: string) => POPULAR_CURRENCIES.find(c => c.code === code)?.symbol || code;

    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Currency Converter
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Live exchange rates</p>
            </div>

            <div className="p-5 space-y-5">
                {}
                <div className="flex items-end gap-3">
                    <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            className="w-full bg-secondary text-foreground text-lg font-bold rounded-xl px-3 py-2.5 border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                    <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">From</label>
                        <select
                            value={fromCurrency}
                            onChange={(e) => setFromCurrency(e.target.value)}
                            className="w-full bg-secondary text-foreground text-sm font-medium rounded-xl px-3 py-3 border border-border focus:border-primary outline-none transition-all cursor-pointer"
                        >
                            {POPULAR_CURRENCIES.map(c => (
                                <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={swapCurrencies}
                        className="p-2.5 rounded-xl bg-secondary border border-border hover:border-primary/30 hover:bg-secondary/80 transition-all mb-0.5"
                    >
                        <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                    </button>

                    <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">To</label>
                        <select
                            value={toCurrency}
                            onChange={(e) => setToCurrency(e.target.value)}
                            className="w-full bg-secondary text-foreground text-sm font-medium rounded-xl px-3 py-3 border border-border focus:border-primary outline-none transition-all cursor-pointer"
                        >
                            {POPULAR_CURRENCIES.map(c => (
                                <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {}
                <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 rounded-2xl p-5 border border-sky-200/50 dark:border-sky-800/50 text-center">
                    {loading ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto" />
                    ) : (
                        <>
                            <div className="text-sm text-muted-foreground mb-1">
                                {getCurrencySymbol(fromCurrency)} {amount.toLocaleString()} {fromCurrency} =
                            </div>
                            <div className="text-3xl font-bold text-foreground">
                                {getCurrencySymbol(toCurrency)} {parseFloat(convertedAmount).toLocaleString()} <span className="text-lg text-muted-foreground">{toCurrency}</span>
                            </div>
                            {rates[toCurrency] && (
                                <div className="text-xs text-muted-foreground mt-2">
                                    1 {fromCurrency} = {rates[toCurrency].toFixed(4)} {toCurrency}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {}
                <div>
                    <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">Quick Rates from {fromCurrency}</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {POPULAR_CURRENCIES.filter(c => c.code !== fromCurrency).slice(0, 6).map(c => (
                            <button
                                key={c.code}
                                onClick={() => setToCurrency(c.code)}
                                className={`text-left p-2.5 rounded-xl border transition-all text-sm ${toCurrency === c.code
                                        ? 'bg-primary/5 border-primary/30 dark:bg-primary/10'
                                        : 'bg-secondary border-border hover:border-primary/20'
                                    }`}
                            >
                                <div className="font-medium text-foreground">{c.symbol} {c.code}</div>
                                <div className="text-[10px] text-muted-foreground">{rates[c.code] ? rates[c.code].toFixed(2) : '—'}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
