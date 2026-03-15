import Dashboard from "@/components/pages/dashboard";
import { getServerUser } from "@/utils/users/server";
import { redirect } from "next/navigation";
import React from "react";
import { getUserCredits } from "@/lib/db/supabase-db";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getUserHistory, getTripsByUserId } from "@/lib/db/supabase-db";

const page = async () => {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  
  let history: any[] = [];
  let trips: any[] = [];

  try {
    history = await getUserHistory(user.id, 20);
    trips = await getTripsByUserId(user.id);
  } catch (error) {
    console.error("Failed to fetch history/trips:", error);
  }

  const credits = await getUserCredits(user.id);

  
  const serializedHistory = JSON.parse(JSON.stringify(history));
  const serializedTrips = JSON.parse(JSON.stringify(trips));

  if ((!serializedHistory || serializedHistory.length === 0) && (!serializedTrips || serializedTrips.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
        <div className="text-center space-y-6 max-w-md p-8 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl">
          <div className="relative w-48 h-48 mx-auto opacity-80">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center animate-pulse">
              <PlusCircle className="w-16 h-16 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome to Your Dashboard</h1>
          <p className="text-lg text-slate-400">
            You haven&apos;t created any itineraries yet. Start planning your next adventure!
          </p>
          <Link href="/itinerary" className="mt-8 inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/20">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Your First Itinerary
          </Link>
        </div>
      </div>
    );
  }

  return <Dashboard email={user.user_metadata.email} history={serializedHistory} trips={serializedTrips} credits={credits} />;
};

export default page;
