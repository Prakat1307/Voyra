"use client";

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const CITY_COSTS: Record<string, { accommodation: [number, number]; food: [number, number]; transport: [number, number]; activities: [number, number] }> = {
    metro: { accommodation: [1500, 4000], food: [600, 1500], transport: [300, 800], activities: [400, 1200] },
    'tier-2': { accommodation: [800, 2500], food: [300, 900], transport: [150, 500], activities: [200, 700] },
    hill: { accommodation: [1200, 3500], food: [400, 1000], transport: [400, 1000], activities: [300, 800] },
    beach: { accommodation: [1000, 3000], food: [350, 1000], transport: [200, 600], activities: [300, 900] },
    international: { accommodation: [5000, 15000], food: [1500, 4000], transport: [800, 2500], activities: [1000, 3000] },
};

const BUDGET_MULTIPLIER: Record<string, number> = {
    budget: 0.7,
    'mid-range': 1.0,
    moderate: 1.0,
    luxury: 2.2,
    premium: 2.2,
};

function getCityTier(destination: string): string {
    const d = destination.toLowerCase();
    if (['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'pune', 'kolkata'].some(c => d.includes(c))) return 'metro';
    if (['manali', 'shimla', 'mussoorie', 'ooty', 'munnar', 'darjeeling', 'kodaikanal', 'leh'].some(c => d.includes(c))) return 'hill';
    if (['goa', 'pondicherry', 'mahabalipuram', 'kovalam', 'varkala', 'gokarna', 'andaman', 'vizag'].some(c => d.includes(c))) return 'beach';
    if (['europe', 'usa', 'uk', 'australia', 'japan', 'singapore', 'dubai', 'thailand', 'bali', 'paris', 'london'].some(c => d.includes(c))) return 'international';
    return 'tier-2';
}

const CHART_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7'];

interface CostEstimatorProps {
    destination: string;
    duration?: number; 
    travelers?: number;
    budgetStyle?: string;
}

export default function CostEstimator({ destination, duration = 3, travelers = 1, budgetStyle = 'mid-range' }: CostEstimatorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const estimates = useMemo(() => {
        const tier = getCityTier(destination);
        const costs = CITY_COSTS[tier] || CITY_COSTS['tier-2'];
        const multiplier = BUDGET_MULTIPLIER[budgetStyle.toLowerCase()] || 1.0;

        const calc = (range: [number, number]) => {
            const avg = (range[0] + range[1]) / 2;
            return Math.round(avg * multiplier * duration * travelers);
        };

        const accommodation = calc(costs.accommodation);
        const food = calc(costs.food);
        const transport = calc(costs.transport);
        const activities = calc(costs.activities);
        const total = accommodation + food + transport + activities;

        return [
            { name: 'Accommodation', value: accommodation, color: CHART_COLORS[0], icon: '🏨' },
            { name: 'Food & Drinks', value: food, color: CHART_COLORS[1], icon: '🍽️' },
            { name: 'Transport', value: transport, color: CHART_COLORS[2], icon: '🚗' },
            { name: 'Activities', value: activities, color: CHART_COLORS[3], icon: '🎯' },
        ];
    }, [destination, duration, travelers, budgetStyle]);

    const total = estimates.reduce((sum, e) => sum + e.value, 0);
    const tier = getCityTier(destination);

    const formatCurrency = (val: number) =>
        val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : `₹${val.toLocaleString('en-IN')}`;

    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-5 flex items-center justify-between hover:bg-secondary/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-foreground">Cost Estimate</h3>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(total)} total · {tier.replace(/-/g, ' ')} pricing
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(total)}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5">
                            {}
                            <div className="h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={estimates}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={70}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {estimates.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => [formatCurrency(value), '']}
                                            contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {}
                            <div className="space-y-2.5 mt-1">
                                {estimates.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                            <span className="text-sm text-foreground">{item.icon} {item.name}</span>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">{formatCurrency(item.value)}</span>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-border flex items-center justify-between">
                                    <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                                        <TrendingUp className="w-3.5 h-3.5 text-green-500" /> Total
                                    </span>
                                    <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(total)}</span>
                                </div>
                            </div>

                            <p className="text-[10px] text-muted-foreground mt-3 text-center">
                                Estimates for {travelers} traveler{travelers > 1 ? 's' : ''} · {duration} days · {budgetStyle} budget · Local averages
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
