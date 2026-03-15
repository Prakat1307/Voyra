'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EXPENSE_CATEGORIES = [
    { id: 'transport', label: 'Transport', icon: '🚗', color: '#818CF8' },
    { id: 'food', label: 'Food & Drinks', icon: '🍔', color: '#F59E0B' },
    { id: 'stay', label: 'Accommodation', icon: '🏨', color: '#A78BFA' },
    { id: 'activities', label: 'Activities', icon: '🎭', color: '#34D399' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#F472B6' },
    { id: 'emergency', label: 'Emergency', icon: '🚑', color: '#EF4444' },
    { id: 'other', label: 'Other', icon: '📦', color: '#6B7280' },
];

const CURRENCIES: Record<string, { symbol: string; rate: number }> = {
    INR: { symbol: '₹', rate: 1 },
    USD: { symbol: '$', rate: 0.012 },
    EUR: { symbol: '€', rate: 0.011 },
    GBP: { symbol: '£', rate: 0.0095 },
    THB: { symbol: '฿', rate: 0.42 },
    JPY: { symbol: '¥', rate: 1.79 },
};

interface Traveler {
    id: string;
    name: string;
}

interface Expense {
    id: number;
    description: string;
    amount: number;
    category: string;
    paidBy: string;
    splitAmong: string[];
    date: string;
    timestamp: string;
}

interface BudgetTrackerProps {
    tripId?: string;
    totalBudget?: number;
    currency?: string;
    days?: number;
    people?: number;
}

export default function BudgetTracker({ tripId, totalBudget, currency: initCurrency, days, people }: BudgetTrackerProps) {
    const [budget, setBudget] = useState(totalBudget || 50000);
    const [currency, setCurrency] = useState(initCurrency || 'INR');
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        category: 'food',
        paidBy: '',
        splitAmong: [] as string[],
        date: new Date().toISOString().split('T')[0]
    });
    const [travelers, setTravelers] = useState<Traveler[]>(
        Array.from({ length: people || 2 }, (_, i) => ({
            id: `person-${i}`,
            name: `Person ${i + 1}`
        }))
    );
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const saved = localStorage.getItem(`budget-${tripId || 'default'}`);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setExpenses(data.expenses || []);
                if (data.travelers?.length) setTravelers(data.travelers);
                if (data.budget) setBudget(data.budget);
            } catch {  }
        }
    }, [tripId]);

    useEffect(() => {
        localStorage.setItem(`budget-${tripId || 'default'}`, JSON.stringify({
            expenses, travelers, budget
        }));
    }, [expenses, travelers, budget, tripId]);

    const stats = useMemo(() => {
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
        const remaining = budget - totalSpent;
        const dailyAverage = days ? totalSpent / days : 0;

        const byCategory: Record<string, number> = {};
        EXPENSE_CATEGORIES.forEach(cat => {
            byCategory[cat.id] = expenses
                .filter(e => e.category === cat.id)
                .reduce((sum, e) => sum + e.amount, 0);
        });

        const byPerson: Record<string, { paid: number; owes: number }> = {};
        travelers.forEach(t => {
            byPerson[t.id] = {
                paid: expenses.filter(e => e.paidBy === t.id).reduce((sum, e) => sum + e.amount, 0),
                owes: 0
            };
        });

        expenses.forEach(e => {
            const splitPeople = e.splitAmong?.length ? e.splitAmong : travelers.map(t => t.id);
            const perPerson = e.amount / splitPeople.length;
            splitPeople.forEach(personId => {
                if (personId !== e.paidBy) {
                    if (!byPerson[personId]) byPerson[personId] = { paid: 0, owes: 0 };
                    byPerson[personId].owes += perPerson;
                }
            });
        });

        return { totalSpent, remaining, dailyAverage, byCategory, byPerson };
    }, [expenses, budget, travelers, days]);

    const settlements = useMemo(() => {
        const balances = travelers.map(t => ({
            ...t,
            balance: (stats.byPerson[t.id]?.paid || 0) - (stats.byPerson[t.id]?.owes || 0)
        }));

        const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
        const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);

        const transactions: { from: string; to: string; amount: number }[] = [];
        let i = 0, j = 0;

        while (i < debtors.length && j < creditors.length) {
            const amount = Math.min(-debtors[i].balance, creditors[j].balance);
            if (amount > 0.01) {
                transactions.push({
                    from: debtors[i].name,
                    to: creditors[j].name,
                    amount: Math.round(amount * 100) / 100
                });
            }
            debtors[i].balance += amount;
            creditors[j].balance -= amount;
            if (Math.abs(debtors[i].balance) < 0.01) i++;
            if (Math.abs(creditors[j].balance) < 0.01) j++;
        }

        return transactions;
    }, [stats, travelers]);

    const convertCurrency = (amount: number) => {
        return (amount * (CURRENCIES[currency]?.rate || 1)).toFixed(2);
    };

    const formatMoney = (amount: number) => {
        return `${CURRENCIES[currency]?.symbol || '₹'}${convertCurrency(amount)}`;
    };

    const addExpense = () => {
        if (!newExpense.description || !newExpense.amount) return;
        setExpenses(prev => [...prev, {
            ...newExpense,
            id: Date.now(),
            amount: parseFloat(newExpense.amount),
            splitAmong: newExpense.splitAmong.length ? newExpense.splitAmong : travelers.map(t => t.id),
            timestamp: new Date().toISOString()
        }]);
        setNewExpense({
            description: '', amount: '', category: 'food',
            paidBy: travelers[0]?.id || '', splitAmong: [],
            date: new Date().toISOString().split('T')[0]
        });
        setShowAddForm(false);
    };

    const deleteExpense = (id: number) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const percentSpent = Math.min((stats.totalSpent / budget) * 100, 100);
    const isOverBudget = stats.totalSpent > budget;

    return (
        <div className="space-y-6">
            {}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        💰 Budget & Expenses
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">
                        Track spending and split costs with your group
                    </p>
                </div>
                <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                    {Object.entries(CURRENCIES).map(([code, { symbol }]) => (
                        <option key={code} value={code}>{symbol} {code}</option>
                    ))}
                </select>
            </div>

            {}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="glass rounded-xl p-4 border border-indigo-500/20">
                    <p className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold">Total Budget</p>
                    <p className="text-xl font-bold text-white mt-1">{formatMoney(budget)}</p>
                    <input
                        type="range" min="5000" max="500000" step="1000" value={budget}
                        onChange={(e) => setBudget(parseInt(e.target.value))}
                        className="w-full mt-2 accent-indigo-500 h-1"
                    />
                </div>
                <div className="glass rounded-xl p-4 border border-orange-500/20">
                    <p className="text-[10px] text-orange-300 uppercase tracking-wider font-semibold">Spent</p>
                    <p className={`text-xl font-bold mt-1 ${isOverBudget ? 'text-red-400' : 'text-orange-300'}`}>
                        {formatMoney(stats.totalSpent)}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">{percentSpent.toFixed(1)}% of budget</p>
                </div>
                <div className={`glass rounded-xl p-4 border ${isOverBudget ? 'border-red-500/30' : 'border-emerald-500/20'}`}>
                    <p className={`text-[10px] uppercase tracking-wider font-semibold ${isOverBudget ? 'text-red-300' : 'text-emerald-300'}`}>Remaining</p>
                    <p className={`text-xl font-bold mt-1 ${isOverBudget ? 'text-red-400' : 'text-emerald-300'}`}>
                        {isOverBudget ? '-' : ''}{formatMoney(Math.abs(stats.remaining))}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                        ~{formatMoney(Math.max(0, stats.remaining) / Math.max(1, days || 1))}/day left
                    </p>
                </div>
                <div className="glass rounded-xl p-4 border border-purple-500/20">
                    <p className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold">Daily Average</p>
                    <p className="text-xl font-bold text-purple-300 mt-1">{formatMoney(stats.dailyAverage)}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                        Per person: {formatMoney(stats.dailyAverage / Math.max(1, travelers.length))}
                    </p>
                </div>
            </div>

            {}
            <div className="glass rounded-xl p-4 border border-slate-700/50">
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentSpent, 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full relative ${isOverBudget
                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                : percentSpent > 75
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                            }`}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                </div>
                {isOverBudget && (
                    <p className="text-red-400 text-xs mt-2 font-medium">
                        ⚠️ You&apos;ve exceeded your budget by {formatMoney(Math.abs(stats.remaining))}
                    </p>
                )}
            </div>

            {}
            <div className="flex gap-1 bg-slate-900 rounded-xl p-1 border border-slate-800">
                {[
                    { id: 'overview', label: '📊 Overview' },
                    { id: 'expenses', label: '📝 Expenses' },
                    { id: 'split', label: '🤝 Split' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all
              ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {}
                        <div className="glass rounded-xl p-5 border border-slate-700/50">
                            <h3 className="font-semibold text-white mb-4 text-sm">Category Breakdown</h3>
                            <div className="space-y-3">
                                {EXPENSE_CATEGORIES.map(cat => {
                                    const amount = stats.byCategory[cat.id] || 0;
                                    const percent = stats.totalSpent ? (amount / stats.totalSpent) * 100 : 0;
                                    return (
                                        <div key={cat.id}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-400">{cat.icon} {cat.label}</span>
                                                <span className="font-medium text-slate-300">{formatMoney(amount)}</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percent}%` }}
                                                    transition={{ duration: 0.8, delay: 0.1 }}
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: cat.color }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {}
                        <div className="glass rounded-xl p-5 border border-slate-700/50">
                            <h3 className="font-semibold text-white mb-4 text-sm">Spending Distribution</h3>
                            <div className="flex items-center justify-center">
                                <div className="relative w-48 h-48">
                                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                        {(() => {
                                            let offset = 0;
                                            return EXPENSE_CATEGORIES.map(cat => {
                                                const amount = stats.byCategory[cat.id] || 0;
                                                const percent = stats.totalSpent ? (amount / stats.totalSpent) * 100 : 0;
                                                const currentOffset = offset;
                                                offset += percent;
                                                if (percent === 0) return null;
                                                return (
                                                    <circle
                                                        key={cat.id}
                                                        cx="18" cy="18" r="15.915"
                                                        fill="none"
                                                        stroke={cat.color}
                                                        strokeWidth="3"
                                                        strokeDasharray={`${percent} ${100 - percent}`}
                                                        strokeDashoffset={-currentOffset}
                                                        className="transition-all duration-700"
                                                    />
                                                );
                                            });
                                        })()}
                                        {stats.totalSpent === 0 && (
                                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#334155" strokeWidth="3" />
                                        )}
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-lg font-bold text-white">{formatMoney(stats.totalSpent)}</span>
                                        <span className="text-[10px] text-slate-500">total spent</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4 justify-center">
                                {EXPENSE_CATEGORIES.filter(c => (stats.byCategory[c.id] || 0) > 0).map(cat => (
                                    <div key={cat.id} className="flex items-center gap-1.5 text-[10px]">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <span className="text-slate-400">{cat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {}
                {activeTab === 'expenses' && (
                    <motion.div
                        key="expenses"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="w-full py-3 border-2 border-dashed border-indigo-500/30 rounded-xl text-indigo-400 font-medium hover:bg-indigo-500/10 transition mb-4 flex items-center justify-center gap-2 text-sm"
                        >
                            ➕ Add Expense
                        </button>

                        <AnimatePresence>
                            {showAddForm && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="glass rounded-xl p-5 border border-indigo-500/30 mb-4 space-y-4 overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="What did you spend on?"
                                            value={newExpense.description}
                                            onChange={(e) => setNewExpense(p => ({ ...p, description: e.target.value }))}
                                            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm w-full text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Amount (₹)"
                                            value={newExpense.amount}
                                            onChange={(e) => setNewExpense(p => ({ ...p, amount: e.target.value }))}
                                            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm w-full text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <select
                                            value={newExpense.category}
                                            onChange={(e) => setNewExpense(p => ({ ...p, category: e.target.value }))}
                                            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                        >
                                            {EXPENSE_CATEGORIES.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={newExpense.paidBy}
                                            onChange={(e) => setNewExpense(p => ({ ...p, paidBy: e.target.value }))}
                                            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="">Who paid?</option>
                                            {travelers.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="date"
                                            value={newExpense.date}
                                            onChange={(e) => setNewExpense(p => ({ ...p, date: e.target.value }))}
                                            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500 mb-2">Split among (leave empty for equal split):</p>
                                        <div className="flex flex-wrap gap-2">
                                            {travelers.map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => {
                                                        setNewExpense(p => ({
                                                            ...p,
                                                            splitAmong: p.splitAmong.includes(t.id)
                                                                ? p.splitAmong.filter(id => id !== t.id)
                                                                : [...p.splitAmong, t.id]
                                                        }));
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full text-xs border transition
                            ${newExpense.splitAmong.includes(t.id)
                                                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                                                            : 'border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                                                >
                                                    {t.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => setShowAddForm(false)}
                                            className="px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 rounded-lg transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={addExpense}
                                            disabled={!newExpense.description || !newExpense.amount}
                                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg shadow-indigo-500/20"
                                        >
                                            Add Expense
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {}
                        <div className="space-y-2">
                            {expenses.length === 0 ? (
                                <div className="text-center py-12 text-slate-600">
                                    <p className="text-4xl mb-3">💸</p>
                                    <p className="text-sm">No expenses yet. Start tracking!</p>
                                </div>
                            ) : (
                                [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => {
                                    const cat = EXPENSE_CATEGORIES.find(c => c.id === expense.category);
                                    const payer = travelers.find(t => t.id === expense.paidBy);
                                    return (
                                        <motion.div
                                            key={expense.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="glass rounded-xl p-4 border border-slate-700/50 flex items-center gap-4 hover:border-slate-600 transition group"
                                        >
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                                style={{ backgroundColor: (cat?.color || '#6B7280') + '20' }}
                                            >
                                                {cat?.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white text-sm truncate">{expense.description}</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                    {payer?.name || 'Unknown'} • {new Date(expense.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-white text-sm">{formatMoney(expense.amount)}</p>
                                                <p className="text-[10px] text-slate-500">
                                                    {formatMoney(expense.amount / (expense.splitAmong?.length || travelers.length))}/person
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => deleteExpense(expense.id)}
                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition p-1 text-sm"
                                            >
                                                🗑️
                                            </button>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}

                {}
                {activeTab === 'split' && (
                    <motion.div
                        key="split"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {}
                        <div className="glass rounded-xl p-5 border border-slate-700/50">
                            <h3 className="font-semibold text-white mb-3 text-sm">👥 Travelers</h3>
                            <div className="space-y-2">
                                {travelers.map((t, i) => (
                                    <input
                                        key={t.id}
                                        value={t.name}
                                        onChange={(e) => {
                                            setTravelers(prev => prev.map((tr, idx) =>
                                                idx === i ? { ...tr, name: e.target.value } : tr
                                            ));
                                        }}
                                        className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm w-full text-white focus:border-indigo-500 focus:outline-none"
                                        placeholder={`Person ${i + 1}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {}
                        <div className="glass rounded-xl p-5 border border-slate-700/50">
                            <h3 className="font-semibold text-white mb-4 text-sm">📊 Balance Summary</h3>
                            <div className="space-y-2">
                                {travelers.map(t => {
                                    const paid = stats.byPerson[t.id]?.paid || 0;
                                    const owes = stats.byPerson[t.id]?.owes || 0;
                                    const balance = paid - owes;
                                    return (
                                        <div key={t.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                                            <div>
                                                <p className="font-medium text-sm text-white">{t.name}</p>
                                                <p className="text-[10px] text-slate-500">Paid: {formatMoney(paid)}</p>
                                            </div>
                                            <span className={`font-bold text-sm ${balance > 0 ? 'text-emerald-400' : balance < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                                                {balance > 0 ? '+' : ''}{formatMoney(balance)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {}
                        <div className="glass rounded-xl p-5 border border-emerald-500/20 bg-emerald-500/5">
                            <h3 className="font-semibold text-emerald-300 mb-4 text-sm flex items-center gap-2">
                                🤝 Settle Up
                            </h3>
                            {settlements.length === 0 ? (
                                <p className="text-emerald-400/70 text-sm">✅ Everyone is settled up!</p>
                            ) : (
                                <div className="space-y-3">
                                    {settlements.map((s, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                                            <span className="font-medium text-sm text-white">{s.from}</span>
                                            <div className="flex-1 flex items-center gap-2">
                                                <div className="flex-1 h-px bg-emerald-800" />
                                                <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 bg-emerald-900/50 rounded-full border border-emerald-800">
                                                    {formatMoney(s.amount)}
                                                </span>
                                                <div className="flex-1 h-px bg-emerald-800" />
                                                <span className="text-emerald-500">→</span>
                                            </div>
                                            <span className="font-medium text-sm text-white">{s.to}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
