"use client";
import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { RequestCredits } from "../request-credits";

const formSchema = z
  .object({
    currentLocation: z.string().min(2, {
      message: "Current location must be at least 2 characters.",
    }),
    travelLocation: z.string().min(2, {
      message: "Travel location must be at least 2 characters.",
    }),
    startDate: z.date({
      required_error: "Start date is required.",
    }),
    endDate: z.date({
      required_error: "End date is required.",
    }),
    interests: z.string().min(2, {
      message: "Interests must be at least 2 characters.",
    }),
    budget: z.enum(["low", "medium", "high"], {
      required_error: "Please select a budget range.",
    }),
    adults: z.coerce.number().min(1, { message: "At least 1 adult required" }),
    children: z.coerce.number().min(0, { message: "Children cannot be negative" }),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after start date.",
    path: ["endDate"],
  });

const LoadingSpinner = () => (
  <motion.div
    className="flex items-center justify-center h-32"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </motion.div>
);

export default function TravelItineraryForm({
  email,
  initialCredits,
  setCredits,
}: {
  email: string;
  initialCredits: number;
  setCredits: (credits: number) => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentLocation: "",
      travelLocation: "",
      interests: "",
      budget: undefined,
      adults: 1,
      children: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentLocation: values.currentLocation,
          travelLocation: values.travelLocation,
          interests: values.interests,
          startDate: addDays(values.startDate, 1),
          endDate: addDays(values.endDate, 1),
          budget: values.budget,
          adults: values.adults,
          children: values.children,
        }),
      });
      setName(
        `${values.currentLocation} to ${values.travelLocation} itinerary`
      );
      const responseData = await response.json();
      if (!response.ok) {
        toast({
          title: typeof responseData.error === "string" ? responseData.error : "An error occurred",
          description: "Failed to generate itinerary. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const newTripId = responseData.id || responseData._id;
      if (!newTripId) {
        throw new Error("Missing trip ID in response.");
      }

      setCredits(initialCredits - 1);
      toast({
        title: "Success! 🎉",
        description: "Your perfect itinerary is ready. Redirecting...",
      });

      
      window.location.href = `/itinerary/${newTripId}`;

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-950 text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-full py-12 px-4"
      >
        <div className="w-full max-w-lg p-8 space-y-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Plan Your Trip
            </h2>
            <p className="text-slate-400">
              You have {initialCredits} credits remaining.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="currentLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Current Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. New York, USA"
                        {...field}
                        className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:bg-slate-900 transition-all rounded-xl"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="travelLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Destination</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Tokyo, Japan"
                        {...field}
                        className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:bg-slate-900 transition-all rounded-xl"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="adults"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Adults</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} className="bg-slate-900/50 border-white/10 text-white focus:border-indigo-500/50 rounded-xl" />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="children"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Children</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} className="bg-slate-900/50 border-white/10 text-white focus:border-indigo-500/50 rounded-xl" />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-slate-300">Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-slate-900/50 border-white/10 text-white hover:bg-slate-800 hover:text-white rounded-xl",
                                !field.value && "text-slate-500"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800 text-white" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            className="bg-slate-900 text-white rounded-xl border border-slate-800"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-slate-300">End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-slate-900/50 border-white/10 text-white hover:bg-slate-800 hover:text-white rounded-xl",
                                !field.value && "text-slate-500"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800 text-white" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            className="bg-slate-900 text-white rounded-xl border border-slate-800"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-slate-300">Budget</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="low" className="border-slate-500 text-indigo-500" />
                          </FormControl>
                          <FormLabel className="font-normal text-slate-300">Low</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="medium" className="border-slate-500 text-indigo-500" />
                          </FormControl>
                          <FormLabel className="font-normal text-slate-300">Medium</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="high" className="border-slate-500 text-indigo-500" />
                          </FormControl>
                          <FormLabel className="font-normal text-slate-300">High</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Interests</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. History, Food, Nature"
                        {...field}
                        className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:bg-slate-900 transition-all rounded-xl"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 transform hover:scale-[1.02]" disabled={loading}>
                {loading ? "Generating Magic..." : "Generate Itinerary ✨"}
              </Button>
            </form>
          </Form>
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <LoadingSpinner />
                <p className="text-center mt-4 text-slate-400 animate-pulse">
                  Crafting your personalized journey...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      {initialCredits ? <></> : <RequestCredits email={email} />}
    </main>
  );
}
