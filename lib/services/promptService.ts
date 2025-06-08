import fs from 'fs';
import path from 'path';
import { maleStyles, femaleStyles, StyleItem } from '@/lib/avatarStyles';

// A map to quickly find a style by its ID
const allStyles: { [key: string]: StyleItem } = {};
maleStyles.forEach(s => allStyles[s.id] = s);
femaleStyles.forEach(s => allStyles[s.id] = s);

// A type for our cached prompts
interface PromptCache {
    [archetype: string]: string;
}

let promptCache: PromptCache | null = null;

/**
 * Loads and caches prompts from the prompts.json file.
 * This is synchronous and should only run once on server startup.
 */
function getPrompts(): PromptCache {
    if (promptCache) {
        return promptCache;
    }

    try {
        const filePath = path.join(process.cwd(), 'lib', 'prompts.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);

        const prompts: PromptCache = {};
        for (const archetype in jsonData) {
            if (Object.prototype.hasOwnProperty.call(jsonData, archetype)) {
                // The service expects uppercase keys, so we transform them.
                prompts[archetype.toUpperCase()] = jsonData[archetype];
            }
        }
        
        promptCache = prompts;
        console.log(`✅ Successfully loaded and cached ${Object.keys(prompts).length} prompts from prompts.json.`);
        return promptCache;
    } catch (error) {
        console.error("❌ Failed to read or parse prompts.json:", error);
        // In a real production scenario, you might want to throw here
        // to prevent the server from starting in a bad state.
        return {};
    }
}

// Initialize prompts on load
getPrompts();

/**
 * Gets the detailed prompt and archetype for a given style ID.
 * @param styleId The ID of the style (e.g., "m1", "f4").
 * @returns An object containing the archetype name and the full prompt text.
 * @throws An error if the style or a corresponding prompt is not found.
 */
export function getPromptForStyle(styleId: string): { archetype: string, prompt: string } {
    const style = allStyles[styleId];
    if (!style) {
        throw new Error(`Style with ID "${styleId}" not found.`);
    }

    // Extract archetype from alt text, e.g., "Male Creator Style" -> "CREATOR"
    const archetypeMatch = style.alt.match(/^(?:Male|Female) (\w+) Style$/);
    if (!archetypeMatch || !archetypeMatch[1]) {
        throw new Error(`Could not determine archetype from style alt text: "${style.alt}"`);
    }
    const archetype = archetypeMatch[1].toUpperCase();

    const prompts = getPrompts();
    const prompt = prompts[archetype];
    
    if (!prompt) {
        throw new Error(`Prompt for archetype "${archetype}" not found. Check prompts.json.`);
    }

    return { archetype, prompt };
} 