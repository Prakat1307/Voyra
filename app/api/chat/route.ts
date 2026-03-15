import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerUser } from '@/utils/users/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const user = await getServerUser();
        const body = await req.json();

        const { messages, context, itineraryData, isEditMode } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
        }

        
        let systemInstruction = "You are an expert AI Travel Assistant. Your goal is to help users plan trips, provide recommendations, answer travel queries, and edit itineraries if asked. Do NOT output markdown JSON unless explicitly creating a structured itinerary payload. Just speak conversationally like a helpful concierge.";

        if (isEditMode && itineraryData) {
            systemInstruction += `\n\nIMPORTANT CONTEXT: The user is currently viewing this itinerary: ${JSON.stringify(itineraryData)}.\nWhen they ask to "edit" or "change" something, acknowledge their request conversationally. If they ask you to return a full new JSON itinerary, you can do so, but generally just explain what changes you *would* make if not instructed otherwise.`;
        } else if (context) {
            systemInstruction += `\n\nContext: ${context}`;
        }

        const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction
        });

        
        const rawHistory: any[] = [];
        let lastUserParts: any[] = [];

        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const isLast = i === messages.length - 1;

            
            const parts: any[] = [];
            if (msg.content) parts.push({ text: msg.content });

            if (msg.attachments && Array.isArray(msg.attachments)) {
                for (const att of msg.attachments) {
                    if (att.data && att.mimeType) {
                        parts.push({
                            inlineData: {
                                data: att.data,
                                mimeType: att.mimeType
                            }
                        });
                    }
                }
            }

            const role = msg.role === 'assistant' ? 'model' : 'user';

            if (isLast && role === 'user') {
                lastUserParts = parts;
            } else {
                rawHistory.push({ role, parts });
            }
        }

        
        let historyContext = "PREVIOUS CONVERSATION HISTORY:\n\n";
        for (let i = 0; i < messages.length - 1; i++) {
            const msg = messages[i];
            const speaker = msg.role === 'assistant' ? "AI Assistant" : "User";
            historyContext += `[${speaker}]: ${msg.content || ""}\n\n`;
        }

        const finalParts: any[] = [{ text: historyContext + `[User]: ` }];

        
        for (const part of lastUserParts) {
            finalParts.push(part);
        }

        const result = await model.generateContent(finalParts);
        const text = result.response.text();

        return NextResponse.json({ reply: text });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat', details: error.message },
            { status: 500 }
        );
    }
}
