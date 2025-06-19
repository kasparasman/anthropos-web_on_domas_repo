import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface NicknameGenerationParams {
    avatarUrl: string;
    gender: 'male' | 'female';
    archetype: string;
    exclude?: string[];
}

async function getCandidates({ avatarUrl, gender, archetype, exclude = [] }: NicknameGenerationParams): Promise<string[]> {
    const prompt = `
        Suggest 10 unique, short nicknames (one word, no spaces) for the person in the attached profile image.
        
        CRITERIA:
        1.  The person's gender is ${gender}.
        2.  Their city archetype is "${archetype}". The nickname must reflect this archetype's theme (e.g., "Creator", "Sage", "Innovator").
        3.  Analyze the person's face, expression, and the overall theme of the image.
        4.  Names should sound dignified, aspirational, and fit for a "citizen of the future."
        5.  The main goal of the nickname is to allow the person to lead a new life, into the world of the future where you can make your own identity with a deep meaning and a purpose.
        5.  Avoid common or generic names. Focus on invented or semi-invented names inspired by ancient languages or high-concept terms, preferably something futuristic, wise, maybe a mix of ancient latin/greek. Do not make them sound ancient, make them unique and with a meaning as well.
        ${exclude.length > 0 ? `6. Do not use any of these nicknames: ${exclude.join(', ')}.` : ''}

        Respond with a JSON array of 10 nickname strings only.
    `.trim();

    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        response_format: { type: "json_object" },
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    {
                        type: "image_url",
                        image_url: {
                            url: avatarUrl,
                            detail: 'high',
                        },
                    },
                ],
            },
        ],
    });

    try {
        const result = JSON.parse(response.choices[0]?.message?.content || '{}');
        // The model might return {"nicknames": [...]}, so we check for that structure.
        const candidates = result.nicknames || result.candidates || (Array.isArray(result) ? result : []);
        
        if (!Array.isArray(candidates)) {
            console.warn("OpenAI did not return a valid array for nicknames.", result);
            return [];
        }

        // Clean up nicknames
        const cleanedCandidates = candidates
            .map(n => String(n).trim().replace(/[^a-z0-9_-]/gi, ''))
            .filter(Boolean);
            
        const RESERVED = new Set(['json', 'array', 'object', 'undefined', 'null', 'nickname', 'name', 'string', 'response']);
        return cleanedCandidates.filter(n => n && !RESERVED.has(n.toLowerCase()));

    } catch (e) {
        console.error("Failed to parse nicknames from OpenAI response:", e);
        return [];
    }
}

/**
 * Generates a unique nickname for a user profile.
 * It tries to generate candidates and checks for uniqueness in the database.
 * If a unique name isn't found in the first batch, it retries once.
 */
export async function generateUniqueNickname(params: Omit<NicknameGenerationParams, 'exclude'>): Promise<string> {
    // 1. Get first batch of candidates
    const candidates = await getCandidates(params);

    // 2. Check which are unique
    const taken = await prisma.profile.findMany({
        where: { nickname: { in: candidates } },
        select: { nickname: true },
    });
    const takenSet = new Set(taken.map((p: { nickname: string | null }) => p.nickname!));
    let available = candidates.find(n => !takenSet.has(n));

    // 3. If none are unique, retry once, excluding the first batch
    if (!available && candidates.length > 0) {
        console.log('No unique nickname in first batch, retrying...');
        const newCandidates = await getCandidates({ ...params, exclude: candidates });
        const newTaken = await prisma.profile.findMany({
            where: { nickname: { in: newCandidates } },
            select: { nickname: true },
        });
        const newTakenSet = new Set(newTaken.map((p: { nickname: string | null }) => p.nickname!));
        available = newCandidates.find(n => !newTakenSet.has(n));
    }

    // 4. If still no nickname, fallback to a default
    if (!available) {
        console.warn(`Could not generate a unique nickname for archetype ${params.archetype}. Using fallback.`);
        return `${params.archetype.toLowerCase()}_${Date.now().toString().slice(-6)}`;
    }

    return available;
} 