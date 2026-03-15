"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Calendar, MapPin, Image as ImageIcon, Book } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';

interface JournalEntry {
    _id: string;
    title: string;
    content: string;
    mood: string;
    date: string;
    location?: { name: string };
    tags: string[];
}

export default function TripJournal({ tripId }: { tripId: string }) {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        mood: 'neutral',
        locationName: '',
        tags: ''
    });

    const fetchEntries = async () => {
        try {
            const res = await fetch(`/api/journal?tripId=${tripId}`);
            if (res.ok) {
                setEntries(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch entries", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tripId) fetchEntries();
    }, [tripId]);

    const handleSubmit = async () => {
        if (!formData.title || !formData.content) {
            toast({ title: "Validation Error", description: "Title and content are required.", variant: "destructive" });
            return;
        }

        try {
            const res = await fetch('/api/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tripId,
                    location: { name: formData.locationName },
                    tags: formData.tags.split(',').map(t => t.trim())
                })
            });

            if (res.ok) {
                toast({ title: "Success", description: "Journal entry created!" });
                setIsOpen(false);
                setFormData({ title: '', content: '', mood: 'neutral', locationName: '', tags: '' });
                fetchEntries();
            } else {
                const data = await res.json();
                toast({ title: "Error", description: data.error || "Failed to create entry", variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading journal...</div>;

    return (
        <div className="bg-card/50 rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Book className="w-4 h-4 text-primary" /> Trip Details & Memories
                </h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-8">
                            <PlusCircle className="w-3 h-3 mr-1" /> Add Entry
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border text-foreground sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>New Journal Entry</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    placeholder="Day 1..."
                                    className="bg-secondary border-border"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Mood</label>
                                <Select onValueChange={(val: string) => setFormData({ ...formData, mood: val })} defaultValue={formData.mood}>
                                    <SelectTrigger className="bg-secondary border-border">
                                        <SelectValue placeholder="Select mood" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border text-foreground">
                                        <SelectItem value="excited">🤩 Excited</SelectItem>
                                        <SelectItem value="happy">😊 Happy</SelectItem>
                                        <SelectItem value="relaxed">😌 Relaxed</SelectItem>
                                        <SelectItem value="adventurous">🤠 Adventurous</SelectItem>
                                        <SelectItem value="tired">😴 Tired</SelectItem>
                                        <SelectItem value="neutral">😐 Neutral</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Location</label>
                                <Input
                                    placeholder="Location name"
                                    className="bg-secondary border-border"
                                    value={formData.locationName}
                                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Content</label>
                                <Textarea
                                    placeholder="Write your story..."
                                    className="bg-secondary border-border min-h-[100px]"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Photos</label>
                                <Button type="button" variant="outline" className="w-full border-dashed border-border hover:bg-secondary text-muted-foreground" onClick={() => toast({ title: "Coming Soon", description: "Image upload will be available in the next update." })}>
                                    <ImageIcon className="w-4 h-4 mr-2" /> Add Photos
                                </Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="p-4 space-y-4">
                {entries.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>No journal entries for this trip yet.</p>
                    </div>
                ) : (
                    entries.map(entry => (
                        <div key={entry._id} className="bg-secondary rounded-lg p-4 border border-border">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-foreground">{entry.title}</h4>
                                <span className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{entry.content}</p>
                            <div className="flex gap-2 text-xs">
                                <span className="px-2 py-0.5 bg-background rounded text-muted-foreground border border-border">
                                    {entry.mood}
                                </span>
                                {entry.location?.name && (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <MapPin className="w-3 h-3" /> {entry.location.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
