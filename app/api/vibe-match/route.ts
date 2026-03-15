import { NextResponse } from 'next/server';
import { analyzeImages, geminiJSON } from '@/lib/services/gemini';
import { VIBE_ANALYSIS_PROMPT } from '@/lib/constants/prompts';
import { getServerUser } from "@/utils/users/server";
import { createUserHistory } from "@/lib/db/supabase-db";
import { getMultipleDestinationImages } from "@/lib/services/unsplash";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const images = formData.getAll('images') as File[];
        const vibeText = formData.get('vibeText') as string || '';
        const textOnly = formData.get('textOnly') === 'true';

        let results;

        if (textOnly) {
            
            const prompt = `The user is looking for travel destinations matching this vibe: "${vibeText}"
      
${VIBE_ANALYSIS_PROMPT.replace('Analyze this image and describe its travel/place vibes.', 'Based on this description, suggest matching destinations.')}`;

            results = await geminiJSON(prompt, 'You are a travel destination matching AI. Return valid JSON only.');
        } else {
            if (!images || images.length === 0) {
                return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
            }

            
            const imagePayloads = await Promise.all(
                images.map(async (img) => {
                    const bytes = await img.arrayBuffer();
                    const base64 = Buffer.from(bytes).toString('base64');
                    const mimeType = img.type || 'image/jpeg';
                    return { base64, mimeType };
                })
            );

            let prompt = VIBE_ANALYSIS_PROMPT;
            if (vibeText) {
                prompt += `\n\nAdditional context from user: "${vibeText}"
        Factor this into your destination suggestions.`;
            }

            const analysisText = await analyzeImages(imagePayloads, prompt);

            
            try {
                const cleaned = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                results = JSON.parse(cleaned);
            } catch {
                
                results = await geminiJSON(
                    `Convert this analysis into the required JSON format:\n${analysisText}\n\nRequired format: ${VIBE_ANALYSIS_PROMPT}`,
                    'Return valid JSON only.'
                );
            }
        }

        
        if (results.top_candidates) {
            await Promise.all(results.top_candidates.map(async (dest: any, idx: number) => {
                try {
                    
                    const query = `${dest.name} ${dest.state || dest.city || ''} landmark`;

                    
                    const photoUrls = await getMultipleDestinationImages(query, 3);

                    dest.photos = photoUrls.map((url: string) => ({
                        url: url,
                        thumb: url,
                        credit: "Unsplash" 
                    }));
                } catch {
                    dest.photos = [];
                }
            }));
        }
        
        const user = await getServerUser();
        if (user) {
            try {
                await createUserHistory({
                    userId: user.id,
                    type: 'vibe',
                    query: vibeText || (textOnly ? 'Text Vibe Search' : 'Image Vibe Search'),
                    location: {
                        destination: results.top_candidates?.[0]?.name || 'Unknown'
                    },
                    metadata: {
                        theme_tags: results.overall_theme_tags,
                        top_candidates: results.top_candidates?.map((c: any) => c.name)
                    }
                });
            } catch (histError) {
                console.error("Failed to save vibe history", histError);
            }
        }

        return NextResponse.json(results);

    } catch (error: any) {
        console.error('Vibe match error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
