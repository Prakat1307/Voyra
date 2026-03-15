"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    hoverEffect?: boolean;
    children: React.ReactNode;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, hoverEffect = true, children, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={hoverEffect ? { y: -4, transition: { duration: 0.2 } } : {}}
                className={cn(
                    "glass-card rounded-xl p-6 transition-shadow duration-300",
                    hoverEffect && "hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-white/5",
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);
GlassCard.displayName = "GlassCard";
