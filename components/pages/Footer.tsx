"use client";

import Link from 'next/link';
import { Compass } from 'lucide-react';
import { BsGithub, BsTwitter, BsInstagram, BsLinkedin } from 'react-icons/bs';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  
  
  if (pathname === '/chat') return null;

  return (
    <footer className="bg-secondary/50 dark:bg-slate-950 text-muted-foreground border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-teal-400 rounded-xl flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Travel<span className="text-primary">Plan</span> AI
              </h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Plan smarter with AI-powered itineraries, real-time flights, weather forecasts,
              and local discoveries — all in one beautiful platform.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Navigate</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-primary transition">Home</Link></li>
              <li><Link href="/chat" className="hover:text-primary transition">AI Chat</Link></li>
              <li><Link href="/vibe-search" className="hover:text-primary transition">Vibe Search</Link></li>
              <li><Link href="/itinerary" className="hover:text-primary transition">Itinerary</Link></li>
              <li><Link href="/community" className="hover:text-primary transition">Community</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Connect</h4>
            <div className="flex space-x-3">
              <a href="#" className="p-2 rounded-lg hover:bg-secondary hover:text-primary transition" aria-label="GitHub"><BsGithub size={18} /></a>
              <a href="#" className="p-2 rounded-lg hover:bg-secondary hover:text-primary transition" aria-label="Twitter"><BsTwitter size={18} /></a>
              <a href="#" className="p-2 rounded-lg hover:bg-secondary hover:text-primary transition" aria-label="Instagram"><BsInstagram size={18} /></a>
              <a href="#" className="p-2 rounded-lg hover:bg-secondary hover:text-primary transition" aria-label="LinkedIn"><BsLinkedin size={18} /></a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TravelPlan AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
