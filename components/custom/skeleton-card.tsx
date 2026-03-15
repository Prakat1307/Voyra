"use client";




export function SkeletonCard() {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
            {}
            <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary" />
                <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-secondary rounded-full w-32" />
                    <div className="h-2.5 bg-secondary rounded-full w-24" />
                </div>
            </div>
            {}
            <div className="mx-4 h-44 rounded-xl bg-secondary" />
            {}
            <div className="p-4 space-y-2.5">
                <div className="h-3.5 bg-secondary rounded-full w-3/4" />
                <div className="h-3 bg-secondary rounded-full w-1/2" />
                <div className="h-3 bg-secondary rounded-full w-5/6" />
            </div>
            {}
            <div className="px-4 py-3 border-t border-border flex gap-4">
                <div className="h-6 bg-secondary rounded-full w-16" />
                <div className="h-6 bg-secondary rounded-full w-16" />
            </div>
        </div>
    );
}

export function SkeletonItineraryDay() {
    return (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4 animate-pulse">
            <div className="h-4 bg-secondary rounded-full w-24" />
            {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl bg-secondary flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3.5 bg-secondary rounded-full w-3/4" />
                        <div className="h-3 bg-secondary rounded-full w-1/2" />
                        <div className="h-3 bg-secondary rounded-full w-5/6" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SkeletonWeather() {
    return (
        <div className="bg-card rounded-2xl border border-border p-5 animate-pulse">
            <div className="h-4 bg-secondary rounded-full w-32 mb-4" />
            <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="bg-secondary rounded-xl h-24" />
                ))}
            </div>
        </div>
    );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 animate-pulse ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-3 bg-secondary rounded-full"
                    style={{ width: `${70 + (i % 3) * 10}%` }}
                />
            ))}
        </div>
    );
}
