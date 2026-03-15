export default function Loading() {
    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {}
            <div className="w-80 bg-card/80 border-r border-border hidden md:flex flex-col p-6 space-y-6">
                <div className="h-8 bg-secondary rounded animate-pulse w-3/4"></div>
                <div className="h-10 bg-secondary rounded animate-pulse w-full"></div>
                <div className="space-y-4 pt-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-secondary/50 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>

            {}
            <div className="flex-1 p-8 space-y-8">
                <div className="h-12 bg-secondary rounded animate-pulse w-1/3"></div>
                <div className="space-y-4">
                    <div className="h-64 bg-secondary/50 rounded-xl animate-pulse"></div>
                    <div className="h-64 bg-secondary/50 rounded-xl animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}
