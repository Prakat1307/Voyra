"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get("code");
        const next = searchParams.get("next") ?? "/itinerary";
        const supabase = createClient();

        const handleAuth = async () => {
            if (!code) {
                setError("No authentication code found.");
                return;
            }

            try {
                const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) throw error;

                
                
                router.replace(next);
            } catch (err: any) {
                console.error("Auth callback exception:", err);
                setError("Failed to complete sign in. Please try again.");
            }
        };

        handleAuth();
    }, [router, searchParams]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
                <h1 className="text-xl font-bold text-red-500 mb-4">Authentication Error</h1>
                <p className="text-muted-foreground">{error}</p>
                <button
                    onClick={() => router.replace('/login')}
                    className="mt-6 px-4 py-2 bg-primary rounded-md text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    Return to Login
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-6"
            />
            <h2 className="text-xl font-semibold tracking-tight text-slate-200">
                Completing sign in...
            </h2>
            <p className="text-sm text-slate-400 mt-2">Setting up your secure session</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-6 animate-spin" />
                <h2 className="text-xl font-semibold tracking-tight text-slate-200">
                    Loading...
                </h2>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
