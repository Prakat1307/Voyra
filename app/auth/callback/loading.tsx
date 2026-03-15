"use client";

import { motion } from "framer-motion";
import { Plane } from "lucide-react";

export default function AuthCallbackLoading() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
            {}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Plane className="w-12 h-12 text-primary rotate-[-30deg]" />
                </motion.div>
            </motion.div>

            {}
            <motion.h2
                className="mt-6 text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                TravelPlan AI
            </motion.h2>

            {}
            <motion.div
                className="mt-8 w-48 h-1 bg-muted rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                />
            </motion.div>

            {}
            <motion.p
                className="mt-4 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                Preparing your journey...
            </motion.p>
        </div>
    );
}
