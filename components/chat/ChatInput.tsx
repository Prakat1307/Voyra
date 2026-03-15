'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface ChatInputProps {
    onSend: (text: string) => void;
    disabled?: boolean;
    value?: string;
    onChange?: (text: string) => void;
    loading?: boolean;
    placeholder?: string;
}

export default function ChatInput({ onSend, disabled, value, onChange, loading, placeholder }: ChatInputProps) {
    const [internalText, setInternalText] = useState('');

    const text = value !== undefined ? value : internalText;

    const handleChange = (newText: string) => {
        if (onChange) {
            onChange(newText);
        } else {
            setInternalText(newText);
        }
    };

    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (text.trim() && !disabled) {
            onSend(text.trim());
            handleChange('');
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickPrompts = [
        "🏖️ Beach getaway",
        "🏔️ Adventure trip",
        "🍜 Food & culture",
        "💑 Romantic escape",
        "💰 Budget travel"
    ];

    return (
        <div className="border-t border-border bg-card/80 backdrop-blur px-4 py-3">
            {}
            {!text && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                    {quickPrompts.map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => onSend(prompt.replace(/^[^\s]+ /, ''))}
                            disabled={disabled}
                            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition border border-border"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex items-end gap-2">
                <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={placeholder || "Tell me about your dream trip..."}
                    className="flex-1 bg-secondary text-foreground placeholder-muted-foreground rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-32 min-h-[48px] border border-border"
                    rows={1}
                    style={{
                        height: 'auto',
                        minHeight: '48px'
                    }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={disabled || !text.trim()}
                    className="bg-primary hover:bg-primary/90 disabled:opacity-30 text-primary-foreground p-3 rounded-xl transition flex-shrink-0"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
