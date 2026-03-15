'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Dashboard Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 text-foreground">
            <div className="bg-card/50 backdrop-blur-md p-8 rounded-2xl border border-destructive/20 max-w-md text-center shadow-xl">
                <h2 className="text-2xl font-bold mb-4 text-destructive">Something went wrong!</h2>
                <p className="text-muted-foreground mb-6">
                    {error.message || "We couldn't load your dashboard. Please try again."}
                </p>
                <div className="flex justify-center gap-4">
                    <Button
                        onClick={() => reset()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Try again
                    </Button>
                    <Button
                        variant="outline"
                        className="border-border text-muted-foreground hover:bg-secondary"
                        onClick={() => window.location.href = '/'}
                    >
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
