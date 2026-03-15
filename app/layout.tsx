import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { getServerUser } from "@/utils/users/server";
import Navbar from "@/components/navbar";
import Footer from "@/components/pages/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ChatWidget } from "@/components/custom/chat-widget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "TravelPlan AI — Smart Trip Planning",
  description: "Plan your perfect trip with AI-powered itineraries, real-time flights, weather, and local discoveries.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getServerUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <ThemeProvider>
          <Navbar isLoggedIn={!!user} user={user!} />
          <main>{children}</main>
          <ChatWidget />
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
