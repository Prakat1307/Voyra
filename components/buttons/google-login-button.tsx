"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { ImSpinner2 } from "react-icons/im";
import { createClient } from "@/utils/supabase/client";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";

const GoogleLoginButton = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""
                    }/auth/callback`,
                queryParams: {
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        });

        if (error) {
            console.error("Sign in error:", error);
            setIsLoading(false);
        } else if (data?.url) {
            
            router.push(data.url);
        }
    };

    return (
        <Button
            variant="outline"
            type="button"
            className="w-full"
            disabled={isLoading}
            onClick={handleGoogleLogin}
        >
            {isLoading ? (
                <ImSpinner2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <FcGoogle className="mr-2 h-4 w-4" />
            )}{" "}
            Google
        </Button>
    );
};

export default GoogleLoginButton;
