import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, organization: process.env.OPENAI_ORGANIZATION, project: process.env.OPENAI_PROJECT });

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

    const response = await openai.responses.create({
        model: "gpt-4.1",
        input: [
            {
                role: "user",
                content: [
                    { type: "input_text", text: prompt },
                    {
                        type: "input_image",
                        image_url: avatarUrl,
                        detail: 'auto', // required by OpenAI SDK
                    },
                ],
            },
        ],
        text: {
            format: {
                type: "json_object",
            },
        },
    });

    try {
        const result = JSON.parse(response.output_text);
        // Accept both array and object responses
        let candidates: string[] = [];
        if (Array.isArray(result)) {
            candidates = result;
        } else if (typeof result === 'object' && result !== null) {
            // If keys are numbers (1,2,3...), treat as array
            const keys = Object.keys(result);
            if (keys.every(k => /^\d+$/.test(k))) {
                candidates = keys.map(k => result[k]);
            } else if (Array.isArray(result.nicknames)) {
                candidates = result.nicknames;
            } else if (Array.isArray(result.candidates)) {
                candidates = result.candidates;
            }
        }
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
 * If a unique name isn't found in the first batch, it retries up to 3 times, excluding previous candidates.
 */
export async function generateUniqueNickname(params: Omit<NicknameGenerationParams, 'exclude'>): Promise<string> {
    let exclude: string[] = [];
    let available: string | undefined;
    let attempts = 0;
    while (attempts < 3 && !available) {
        const candidates = await getCandidates({ ...params, exclude });
        if (candidates.length === 0) {
            attempts++;
            continue;
        }
        const taken = await prisma.profile.findMany({
            where: { nickname: { in: candidates } },
            select: { nickname: true },
        });
        const takenSet = new Set(taken.map((p: { nickname: string | null }) => p.nickname!));
        available = candidates.find(n => !takenSet.has(n));
        exclude = [...exclude, ...candidates];
        attempts++;
    }
    if (!available) {
        console.warn(`Could not generate a unique nickname for archetype ${params.archetype} after 3 attempts. Using fallback.`);
        return `${params.archetype.toLowerCase()}_${Date.now().toString().slice(-6)}`;
    }
    return available;
} 