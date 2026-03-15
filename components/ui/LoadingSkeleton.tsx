export function SkeletonCard() {
    return (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="h-40 skeleton" />
            <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 skeleton rounded" />
                <div className="h-3 w-1/2 skeleton rounded" />
                <div className="flex gap-2">
                    <div className="h-6 w-16 skeleton rounded-full" />
                    <div className="h-6 w-16 skeleton rounded-full" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonLine({ width = "w-full" }: { width?: string }) {
    return <div className={`h-4 ${width} skeleton rounded`} />;
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    const widths = ["w-full", "w-5/6", "w-4/5", "w-3/4", "w-2/3"];
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className={`h-3 ${widths[i % widths.length]} skeleton rounded`} />
            ))}
        </div>
    );
}

export function SkeletonAvatar({ size = "w-10 h-10" }: { size?: string }) {
    return <div className={`${size} rounded-full skeleton`} />;
}

export function SkeletonDashboard() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-9 w-24 skeleton rounded-full flex-shrink-0" />
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        </div>
    );
}
