"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Package, Check, Plus, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PackingCategory {
    name: string;
    items: string[];
}

interface PackingListProps {
    destination: string;
    duration?: string;
    activities?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
    'Clothing': '👕',
    'Documents': '📄',
    'Toiletries': '🧴',
    'Tech & Accessories': '🔌',
    'Health & Safety': '💊',
    'Snacks & Misc': '🎒',
};

export default function PackingList({ destination, duration, activities }: PackingListProps) {
    const [categories, setCategories] = useState<PackingCategory[]>([]);
    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [newItems, setNewItems] = useState<Record<string, string>>({});
    const [isOpen, setIsOpen] = useState(false);

    const month = new Date().toLocaleString('en-US', { month: 'long' });

    const fetchPackingList = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/packing-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ destination, duration, month, activities }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            setCategories(data.categories || []);
            
            const expandState: Record<string, boolean> = {};
            (data.categories || []).forEach((c: PackingCategory) => { expandState[c.name] = true; });
            setExpanded(expandState);
        } catch (e: any) {
            setError(e.message || 'Failed to generate packing list');
        } finally {
            setLoading(false);
        }
    };

    const toggleCheck = (catName: string, item: string) => {
        const key = `${catName}::${item}`;
        setChecked(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const addItem = (catName: string) => {
        const text = newItems[catName]?.trim();
        if (!text) return;
        setCategories(prev => prev.map(c =>
            c.name === catName ? { ...c, items: [...c.items, text] } : c
        ));
        setNewItems(prev => ({ ...prev, [catName]: '' }));
    };

    const removeItem = (catName: string, item: string) => {
        setCategories(prev => prev.map(c =>
            c.name === catName ? { ...c, items: c.items.filter(i => i !== item) } : c
        ));
    };

    const totalItems = categories.reduce((acc, c) => acc + c.items.length, 0);
    const checkedCount = Object.values(checked).filter(Boolean).length;

    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen && categories.length === 0) fetchPackingList();
                }}
                className="w-full p-5 flex items-center justify-between hover:bg-secondary/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-foreground">Packing List</h3>
                        {categories.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {checkedCount}/{totalItems} packed
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {categories.length > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); fetchPackingList(); }}
                            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            title="Regenerate"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    )}
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
                        <div className="px-5 pb-5 pt-0">
                            {}
                            {categories.length > 0 && (
                                <div className="mb-4">
                                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-emerald-500 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(checkedCount / totalItems) * 100}%` }}
                                            transition={{ duration: 0.4 }}
                                        />
                                    </div>
                                </div>
                            )}

                            {loading && (
                                <div className="flex items-center justify-center py-8 gap-3">
                                    <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                                    <span className="text-sm text-muted-foreground">Generating packing list with AI...</span>
                                </div>
                            )}

                            {error && (
                                <div className="text-center py-6">
                                    <p className="text-sm text-destructive mb-3">{error}</p>
                                    <button onClick={fetchPackingList} className="text-xs text-primary hover:underline">Try again</button>
                                </div>
                            )}

                            {!loading && !error && categories.length === 0 && (
                                <div className="text-center py-6">
                                    <button
                                        onClick={fetchPackingList}
                                        className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        Generate Packing List
                                    </button>
                                </div>
                            )}

                            {}
                            <div className="space-y-3">
                                {categories.map(category => (
                                    <div key={category.name} className="bg-secondary/40 rounded-xl border border-border overflow-hidden">
                                        <button
                                            onClick={() => setExpanded(prev => ({ ...prev, [category.name]: !prev[category.name] }))}
                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/60 transition-colors"
                                        >
                                            <span className="font-medium text-sm flex items-center gap-2">
                                                <span>{CATEGORY_ICONS[category.name] || '📦'}</span>
                                                {category.name}
                                                <span className="text-xs text-muted-foreground font-normal">
                                                    ({category.items.filter(item => checked[`${category.name}::${item}`]).length}/{category.items.length})
                                                </span>
                                            </span>
                                            {expanded[category.name] ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                                        </button>

                                        <AnimatePresence>
                                            {expanded[category.name] && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: 'auto' }}
                                                    exit={{ height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-3 space-y-1.5">
                                                        {category.items.map(item => {
                                                            const key = `${category.name}::${item}`;
                                                            const isChecked = checked[key];
                                                            return (
                                                                <div key={item} className="flex items-center gap-2.5 group">
                                                                    <button
                                                                        onClick={() => toggleCheck(category.name, item)}
                                                                        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${isChecked
                                                                            ? 'bg-emerald-500 border-emerald-500'
                                                                            : 'border-border hover:border-primary'}`}
                                                                    >
                                                                        {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                                                                    </button>
                                                                    <span className={`text-sm flex-1 transition-all ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                                                        {item}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => removeItem(category.name, item)}
                                                                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}

                                                        {}
                                                        <div className="flex gap-2 mt-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Add item..."
                                                                value={newItems[category.name] || ''}
                                                                onChange={e => setNewItems(prev => ({ ...prev, [category.name]: e.target.value }))}
                                                                onKeyDown={e => e.key === 'Enter' && addItem(category.name)}
                                                                className="flex-1 text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                                                            />
                                                            <button
                                                                onClick={() => addItem(category.name)}
                                                                className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
