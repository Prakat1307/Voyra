"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserAccountNav from "./users/user-account-nav";
import { User } from "@supabase/supabase-js";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon, Menu, Compass, Map, LayoutDashboard, Users, Plane } from "lucide-react";

interface NavbarProps {
  isLoggedIn: boolean;
  user: User | null;
}

const NAV_LINKS = [
  { href: "/chat", label: "Plan Trip", icon: Plane },
  { href: "/vibe-search", label: "Explore", icon: Compass },
  { href: "/itinerary", label: "Itinerary", icon: Map },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/community", label: "Community", icon: Users },
];

export default function Navbar({ isLoggedIn, user }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-teal-400 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Travel<span className="text-primary">Plan</span> AI
              </span>
            </Link>

            {}
            <div className="hidden md:flex ml-10 space-x-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {}
          <div className="flex items-center gap-2">
            {}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {}
            <div className="hidden sm:flex items-center">
              {isLoggedIn ? (
                <UserAccountNav user={user!} />
              ) : (
                <Link href="/login">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-xl px-5 shadow-md hover:shadow-lg transition-all">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {}
            <div className="flex items-center md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background border-border w-72">
                  <nav className="flex flex-col gap-1 mt-8">
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                      >
                        <link.icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    ))}
                    <hr className="my-4 border-border" />
                    {!isLoggedIn && (
                      <Link href="/login">
                        <Button className="w-full bg-primary text-white rounded-xl">
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
