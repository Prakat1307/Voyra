"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CloneButton({ tripId }: { tripId: string }) {
    const [cloning, setCloning] = useState(false);
    const [cloned, setCloned] = useState(false);
    const router = useRouter();

    const handleClone = async () => {
        setCloning(true);
        try {
            const res = await fetch('/api/trips/clone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tripId })
            });

            if (res.ok) {
                setCloned(true);
                router.refresh(); 
                setTimeout(() => setCloned(false), 3000);
            } else {
                console.error("Failed to clone trip");
            }
        } catch (error) {
            console.error("Error cloning trip:", error);
        } finally {
            setCloning(false);
        }
    };

    return (
        <Button
            size="sm"
            variant="outline"
            className={`border-slate-700 hover:bg-slate-800 hover:text-white transition-all ${cloned ? 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10' : 'text-slate-400'}`}
            onClick={handleClone}
            disabled={cloning || cloned}
        >
            {cloning ? (
                <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Cloning...
                </>
            ) : cloned ? (
                <>
                    <Check className="w-3 h-3 mr-2" />
                    Cloned!
                </>
            ) : (
                <>
                    <Copy className="w-3 h-3 mr-2" />
                    Clone Trip
                </>
            )}
        </Button>
    );
}
