"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "assistant" | "user";
    content: string;
}

export const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(true);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hello! Need edits? Ask me — I'll edit your current plan (not re-create it unless you ask).",
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles].slice(0, 3)); 
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleSend = async () => {
        if (!inputValue.trim() && files.length === 0) return;

        const hasFiles = files.length > 0;
        const msgContent = hasFiles
            ? `${inputValue}\n[Attached ${files.length} file(s)]`
            : inputValue;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: msgContent,
        };

        
        const currentInput = inputValue;
        const currentFiles = [...files];
        const currentHistory = [...messages];

        setMessages((prev) => [...prev, newUserMsg]);
        setInputValue("");
        setFiles([]);

        
        const loadingId = (Date.now() + 1).toString();
        setMessages((prev) => [
            ...prev,
            { id: loadingId, role: "assistant", content: "..." }
        ]);

        try {
            
            const attachments = await Promise.all(
                currentFiles.map(async (file) => ({
                    data: await getBase64(file),
                    mimeType: file.type
                }))
            );

            
            const isItineraryPage = window.location.pathname.includes('/itinerary');

            const historyForApi = currentHistory.map(m => ({
                role: m.role,
                content: m.content
            }));

            historyForApi.push({
                role: 'user',
                content: currentInput,
                attachments: attachments
            } as any);

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: historyForApi,
                    isEditMode,
                    context: `User is on page: ${window.location.pathname}`,
                    itineraryData: isItineraryPage ? { note: "User is viewing an itinerary. You should help edit it." } : null
                })
            });

            if (!response.ok) throw new Error("API failed");
            const data = await response.json();

            setMessages((prev) => prev.map(m =>
                m.id === loadingId ? { ...m, content: data.reply } : m
            ));
        } catch (err) {
            console.error(err);
            setMessages((prev) => prev.map(m =>
                m.id === loadingId ? { ...m, content: "Oops, something went wrong connecting to the AI." } : m
            ));
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 w-[calc(100vw-48px)] sm:w-[420px]"
                        style={{ height: "550px", maxHeight: "calc(100vh - 120px)" }}
                    >
                        {}
                        <div className="flex items-center justify-between border-b border-border/50 bg-primary/10 px-4 py-3 dark:bg-primary/20">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <Bot size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm truncate">AI Travel Assistant</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <button
                                            onClick={() => setIsEditMode(true)}
                                            className={cn("text-[10px] px-2 py-0.5 rounded-full transition-colors", isEditMode ? "bg-primary text-white" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10")}
                                        >
                                            Edit Plan
                                        </button>
                                        <button
                                            onClick={() => setIsEditMode(false)}
                                            className={cn("text-[10px] px-2 py-0.5 rounded-full transition-colors", !isEditMode ? "bg-primary text-white" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10")}
                                        >
                                            New Plan
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={18} />
                            </Button>
                        </div>

                        {}
                        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                            <div className="flex flex-col gap-4">
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex max-w-[85%] flex-col gap-1 rounded-2xl px-4 py-2 text-sm",
                                            msg.role === "user"
                                                ? "self-end bg-primary text-primary-foreground rounded-tr-sm"
                                                : "self-start bg-muted rounded-tl-sm"
                                        )}
                                    >
                                        {msg.content}
                                    </motion.div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {}
                        <div className="border-t border-border/50 p-3 pt-2">
                            {files.length > 0 && (
                                <div className="flex gap-2 flex-wrap mb-2">
                                    {files.map((f, i) => (
                                        <div key={i} className="flex items-center gap-1 bg-secondary text-xs px-2 py-1 rounded-md border border-border">
                                            <span className="truncate max-w-[100px]">{f.name}</span>
                                            <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <form
                                className="flex items-end gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                            >
                                <div className="flex-1 relative">
                                    <Input
                                        className="h-10 pl-10 rounded-full border-border/50 bg-background/50 outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                                        placeholder={isEditMode ? "Ask for itinerary changes..." : "Where do you want to go?"}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        multiple
                                        accept="image/*,.pdf,.doc,.docx"
                                        onChange={handleFileSelect}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                                    </button>
                                </div>
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="h-10 w-10 shrink-0 rounded-full bg-primary transition-transform hover:scale-105"
                                    disabled={!inputValue.trim() && files.length === 0}
                                >
                                    <Send size={18} className="ml-[-2px] mt-[2px]" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 text-white"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </motion.button>
        </div>
    );
};
