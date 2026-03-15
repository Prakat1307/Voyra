import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Missing GOOGLE_API_KEY or GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(apiKey!);


async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries = 5,
    delay = 2000,
    factor = 2
): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0 && (
            error.message?.includes('429') ||
            error.status === 429 ||
            error.status === 503 ||
            error.message?.includes('Quota exceeded')
        )) {
            let waitTime = delay;

            
            const match = error.message?.match(/retry in (\d+(\.\d+)?)s/);
            if (match && match[1]) {
                waitTime = Math.ceil(parseFloat(match[1])) * 1000 + 1000; 

                
                if (waitTime > 15000) {
                    console.error(`⚠️ Gemini API requests a ${waitTime / 1000}s wait. Failing fast to prevent UI timeout.`);
                    throw new Error("The AI service is currently overwhelmed. Please wait a minute and try again.");
                }

                console.warn(`⚠️ Gemini API Quota Exceeded. Waiting ${waitTime / 1000}s as requested by API...`);
            } else {
                console.warn(`⚠️ Gemini API rate limit hit. Retrying in ${delay}ms... (${retries} attempts left)`);
            }

            await new Promise(resolve => setTimeout(resolve, waitTime));

            
            const nextDelay = match ? 2000 : delay * factor;

            return retryWithBackoff(fn, retries - 1, nextDelay, factor);
        }
        throw error;
    }
}


export function getGeminiModel(modelName = 'gemini-2.5-flash'): GenerativeModel {
    return genAI.getGenerativeModel({ model: modelName });
}


export function getGeminiVisionModel(): GenerativeModel {
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}


export async function geminiJSON(prompt: string, systemInstruction = ''): Promise<any> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
        },
        systemInstruction: systemInstruction || undefined,
    });

    
    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const text = result.response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini response", text);
        throw e;
    }
}

interface ChatMessage {
    role: 'user' | 'model' | 'assistant' | 'system';
    content: string;
}


export function createChatSession(systemInstruction: string, history: ChatMessage[] = []) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction,
        generationConfig: { temperature: 0.8 }
    });

    return model.startChat({
        history: history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : (msg.role as 'user' | 'model'),
            parts: [{ text: msg.content }]
        }))
    });
}


export async function analyzeImage(imageBase64: string, mimeType: string, prompt: string): Promise<string> {
    return analyzeImages([{ base64: imageBase64, mimeType }], prompt);
}

export async function analyzeImages(images: { base64: string, mimeType: string }[], prompt: string): Promise<string> {
    const model = getGeminiVisionModel();
    const parts: any[] = [prompt];
    for (const img of images) {
        parts.push({
            inlineData: {
                data: img.base64,
                mimeType: img.mimeType
            }
        });
    }
    const result = await retryWithBackoff(() => model.generateContent(parts));
    return result.response.text();
}


export async function generateItinerary(prompt: string): Promise<any> {
    
    return geminiJSON(prompt);
}


export async function generateChatResponse(systemPrompt: string, history: any[]): Promise<string> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemPrompt,
    });

    
    const lastMsg = history.pop();
    if (!lastMsg) return ""; 

    const chat = model.startChat({
        history: history,
        generationConfig: {
            maxOutputTokens: 2048,
        },
    });

    
    const result = await retryWithBackoff(() => chat.sendMessage(lastMsg.parts[0].text));
    return result.response.text();
}
